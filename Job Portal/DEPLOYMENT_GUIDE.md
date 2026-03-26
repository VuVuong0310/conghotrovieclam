# 🚀 Job Portal Deployment Guide

## Deploy với Docker Compose (Recommended)

### Kiến trúc hệ thống

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Browser    │────▶│  Nginx (port 80)  │────▶│  Backend    │
│              │     │  - /jobportal/*   │     │  (port 8080)│
│              │     │  - /api/* proxy   │     │             │
└──────────────┘     └──────────────────┘     └──────┬──────┘
                                                      │
                                                ┌─────▼──────┐
                                                │   MySQL 8   │
                                                │ (port 3306) │
                                                └─────────────┘
```

### Prerequisites
1. **Docker Desktop**: Download tại https://www.docker.com/products/docker-desktop/
2. **Docker Compose**: Đã đi kèm Docker Desktop

### Step 1: Khởi động toàn bộ hệ thống

```bash
# Di chuyển đến thư mục project
cd "Job Portal"

# Build và chạy tất cả containers
docker-compose up --build -d

# Xem logs
docker-compose logs -f
```

Quá trình build lần đầu mất khoảng 5-10 phút (tải dependencies Maven + npm).

### Step 2: Truy cập ứng dụng

| Service | URL | Mô tả |
|---------|-----|--------|
| Frontend | http://localhost/jobportal/ | Giao diện web React |
| Backend API | http://localhost/api/ | API qua nginx proxy |
| Backend trực tiếp | http://localhost:8080 | Spring Boot (debug) |
| MySQL | localhost:3307 | Database (port 3307 tránh xung đột) |

### Step 3: Tài khoản mặc định

| Vai trò | Username | Password |
|---------|----------|----------|
| Admin | admin | admin123 |
| Employer | employer | employer123 |
| Candidate | candidate | candidate123 |

---

## Cấu trúc Docker Files

### 1. `docker-compose.yml` - Orchestration

```
docker-compose.yml
├── mysql          (MySQL 8.0, port 3307:3306, healthcheck)
├── backend        (Spring Boot, port 8080, depends_on mysql)
└── frontend       (Nginx, port 80, depends_on backend)
```

- **MySQL**: Sử dụng volume `mysql_data` để persist data
- **Backend**: Env vars override `application.properties`, volume `backend_uploads` cho file upload
- **Frontend**: Build arg `REACT_APP_API_URL=/api` để API calls đi qua nginx proxy

### 2. `backend/Dockerfile` - Multi-stage build

```
Stage 1 (build): eclipse-temurin:19-jdk → mvn clean package
Stage 2 (run):   eclipse-temurin:19-jre → java -jar app.jar
```

### 3. `frontend/Dockerfile` - Multi-stage build

```
Stage 1 (build): node:18-alpine → npm run build (with REACT_APP_API_URL)
Stage 2 (run):   nginx:alpine → serve static files + reverse proxy
```

### 4. `frontend/nginx.conf` - Reverse Proxy

```
/ → redirect to /jobportal/
/jobportal/* → React SPA (try_files → index.html)
/api/* → proxy_pass to backend:8080
/static/* → cache 1 year
+ gzip compression
```

---

## Quản lý Docker

### Các lệnh thường dùng

```bash
# Khởi động
docker-compose up -d

# Dừng
docker-compose down

# Dừng + xóa data (reset database)
docker-compose down -v

# Rebuild 1 service
docker-compose up --build backend -d

# Xem logs backend
docker-compose logs -f backend

# Xem logs frontend
docker-compose logs -f frontend

# Vào MySQL shell
docker exec -it jobportal-mysql mysql -uroot -proot123 jobportal_db

# Xem trạng thái containers
docker-compose ps
```

### Restart khi thay đổi code

```bash
# Backend thay đổi
docker-compose up --build backend -d

# Frontend thay đổi
docker-compose up --build frontend -d

# Cả hai
docker-compose up --build -d
```

---

## Deploy lên Linux Server (VPS)

### 1. Cài Docker trên Ubuntu/Debian

```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 2. Upload project lên server

```bash
scp -r "Job Portal" user@your-server-ip:/home/user/
```

### 3. Chạy trên server

```bash
ssh user@your-server-ip
cd "Job Portal"
docker-compose up --build -d
```

### 4. Cấu hình domain (tùy chọn)

Nếu có domain, sửa `nginx.conf`:
```nginx
server_name yourdomain.com;
```

Và thêm SSL với Let's Encrypt (nếu cần).

---

## Troubleshooting

### 1. Backend không connect được MySQL

```bash
# Kiểm tra MySQL đã ready chưa
docker-compose logs mysql

# Restart backend sau khi MySQL ready
docker-compose restart backend
```

### 2. Frontend trắng trang

```bash
# Kiểm tra nginx config
docker exec -it jobportal-frontend cat /etc/nginx/conf.d/default.conf

# Kiểm tra files trong container
docker exec -it jobportal-frontend ls /usr/share/nginx/html/
```

### 3. API 502 Bad Gateway

```bash
# Backend có đang chạy không?
docker-compose ps
docker-compose logs backend
```

### 4. Port đã bị chiếm

```bash
# Đổi port trong docker-compose.yml
# Ví dụ: "8081:80" thay vì "80:80"
```

### 5. Reset toàn bộ

```bash
docker-compose down -v
docker system prune -a
docker-compose up --build -d
```

---

## Chế độ Development (không dùng Docker)

```bash
# Terminal 1: MySQL (cần cài sẵn)
# Đảm bảo MySQL chạy trên port 3306

# Terminal 2: Backend
cd backend
mvn spring-boot:run

# Terminal 3: Frontend
cd frontend
npm start
```

Frontend sẽ dùng `.env` file: `REACT_APP_API_URL=http://localhost:8080/api`