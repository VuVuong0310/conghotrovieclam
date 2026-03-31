#!/bin/bash
# =============================================================
# Script deploy Job Portal lên Linux Server
# Yêu cầu: Docker, Docker Compose, domain đã trỏ về server IP
# Sử dụng: bash deploy.sh yourdomain.com your@email.com
# =============================================================

set -e

DOMAIN=$1
EMAIL=$2
PROJECT_DIR=$(pwd)

# --- Kiểm tra tham số ---
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Cách dùng: bash deploy.sh <domain> <email>"
    echo "Ví dụ:     bash deploy.sh conghotrovieclam.com admin@gmail.com"
    exit 1
fi

echo "=========================================="
echo "  DEPLOY JOB PORTAL"
echo "  Domain: $DOMAIN"
echo "  Email:  $EMAIL"
echo "=========================================="

# --- Bước 1: Cập nhật .env ---
echo "[1/6] Cập nhật domain trong .env..."
sed -i "s/DOMAIN_NAME=.*/DOMAIN_NAME=$DOMAIN/" .env

# --- Bước 2: Lần đầu - dùng nginx HTTP để lấy cert ---
echo "[2/6] Khởi động với cấu hình HTTP (để lấy SSL cert)..."
cp frontend/nginx.http-only.conf frontend/nginx.conf

# Thay biến domain trong nginx.conf
sed -i "s/\${DOMAIN_NAME}/$DOMAIN/g" frontend/nginx.conf

docker compose up -d --build mysql backend frontend

# Chờ services khởi động
echo "   Chờ services khởi động..."
sleep 15

# --- Bước 3: Lấy SSL Certificate từ Let's Encrypt ---
echo "[3/6] Lấy SSL certificate (Let's Encrypt)..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

# --- Bước 4: Chuyển sang nginx HTTPS ---
echo "[4/6] Cập nhật cấu hình nginx với HTTPS..."
cp frontend/nginx.conf frontend/nginx.conf.bak

# Ghi nginx.conf với HTTPS (thay biến domain)
cat > frontend/nginx.conf << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name $DOMAIN www.$DOMAIN;
    root /usr/share/nginx/html;
    index index.html;

    ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location = / {
        return 301 /jobportal/;
    }
    location /jobportal {
        try_files \$uri \$uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://jobportal-backend:8080/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        client_max_body_size 10M;
    }
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 256;
}
NGINXEOF

# --- Bước 5: Rebuild và restart với HTTPS ---
echo "[5/6] Rebuild với HTTPS..."
docker compose up -d --build frontend

# Khởi động certbot auto-renew
docker compose up -d certbot

# --- Bước 6: Kiểm tra ---
echo "[6/6] Kiểm tra services..."
sleep 10
docker compose ps

echo ""
echo "=========================================="
echo "  DEPLOY THÀNH CÔNG!"
echo "  Website: https://$DOMAIN"
echo "  API:     https://$DOMAIN/api"
echo "=========================================="
