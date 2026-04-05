# Hướng Dẫn Chạy Job Portal

## Mục Lục
- [1. Chạy Local (Development)](#1-chạy-local-development)
- [2. Deploy Production (Cloudflare Tunnel)](#2-deploy-production-cloudflare-tunnel)
- [3. Cập Nhật Code Production](#3-cập-nhật-code-production)
- [4. Xử Lý Sự Cố](#4-xử-lý-sự-cố)

---

## 1. Chạy Local (Development)

### Yêu cầu
- Java 17+ (đã test với Java 22)
- Maven 3.8+
- Node.js 16+ (đã test với Node 24)
- MySQL 8.0 chạy local (port 3306, user `root`, password trống)

### Bước 1: Chạy Backend
```bash
cd "Job Portal/backend"
mvn spring-boot:run
```
Backend chạy tại: `http://localhost:8080`

### Bước 2: Chạy Frontend
```bash
cd "Job Portal/frontend"
npm install    # lần đầu
npm start
```
Frontend chạy tại: `http://localhost:3000`

> **Lưu ý**: Local không cần Docker, không cần Cloudflare. Frontend gọi API qua `/api` (proxy bởi React dev server).

---

## 2. Deploy Production (Cloudflare Tunnel)

### Kiến trúc
```
Browser → conghotrovieclam.online/jobportal/
    → Cloudflare Edge (HTTPS)
    → Cloudflare Tunnel (cloudflared container)
    → Nginx (frontend container, port 80)
        → /jobportal/*  : rewrite → serve React SPA
        → /api/*        : proxy → Spring Boot backend (port 8080)
        → Backend       : MySQL (port 3306)
```

### Yêu cầu
- Docker + Docker Compose
- File `.env` đã cấu hình đúng (xem mẫu bên dưới)

### Cấu hình `.env`
```env
# Database
MYSQL_ROOT_PASSWORD=root123
MYSQL_DATABASE=jobportal_db
DB_USERNAME=root
DB_PASSWORD=root123

# JWT
JWT_SECRET=<secret-key-dài>
JWT_EXPIRATION_MS=86400000

# Email (Gmail App Password)
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx

# Google OAuth2
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>

# Cloudflare Tunnel Token
TUNNEL_TOKEN=<tunnel-token-từ-cloudflare-dashboard>
```

### Bước chạy

#### Lần đầu tiên:
```bash
cd "Job Portal"
docker compose -f docker-compose.cloudflare.yml up -d --build
```

#### Kiểm tra trạng thái:
```bash
docker compose -f docker-compose.cloudflare.yml ps
```
Phải thấy 4 containers đều running:
| Container | Mô tả |
|---|---|
| `jobportal-mysql` | Database MySQL 8.0 |
| `jobportal-backend` | Spring Boot API (port 8080 nội bộ) |
| `jobportal-frontend` | Nginx serve React + proxy API (port 80 nội bộ) |
| `jobportal-cloudflared` | Cloudflare Tunnel kết nối ra internet |

#### Kiểm tra logs:
```bash
# Backend đã khởi động chưa
docker logs jobportal-backend --tail 5

# Tunnel đã kết nối chưa
docker logs jobportal-cloudflared --tail 10
```

#### Dừng:
```bash
docker compose -f docker-compose.cloudflare.yml down
```

### URL Production
- Trang chính: `https://conghotrovieclam.online/jobportal/jobs`
- API: `https://conghotrovieclam.online/jobportal/api/search/jobs`

---

## 3. Cập Nhật Code Production

### Khi sửa Frontend:
```bash
cd "Job Portal"
docker compose -f docker-compose.cloudflare.yml down
docker compose -f docker-compose.cloudflare.yml build --no-cache frontend
docker compose -f docker-compose.cloudflare.yml up -d --force-recreate
```

### Khi sửa Backend:
```bash
cd "Job Portal"
docker compose -f docker-compose.cloudflare.yml down
docker compose -f docker-compose.cloudflare.yml build --no-cache backend
docker compose -f docker-compose.cloudflare.yml up -d --force-recreate
```

### Khi sửa cả hai:
```bash
cd "Job Portal"
docker compose -f docker-compose.cloudflare.yml down
docker compose -f docker-compose.cloudflare.yml build --no-cache
docker compose -f docker-compose.cloudflare.yml up -d --force-recreate
```

> **QUAN TRỌNG**: Luôn `down` trước → `build --no-cache` → `up --force-recreate`. Nếu chỉ rebuild frontend mà không restart cloudflared, tunnel sẽ mất kết nối vì dùng `network_mode: "service:frontend"`.

---

## 4. Xử Lý Sự Cố

### Trang trắng hoặc hiển thị nội dung cũ

**Nguyên nhân 1: Cloudflared Windows Service cũ đang chạy**

Nếu trước đó đã cài cloudflared trực tiếp trên Windows (không qua Docker), service cũ sẽ tạo thêm 1 replica → traffic bị chia ngẫu nhiên giữa bản cũ và mới.

Kiểm tra:
```powershell
Get-Service Cloudflared
```

Nếu Status = Running → tắt ngay:
```powershell
# Chạy PowerShell với quyền Administrator
Stop-Service Cloudflared -Force
Set-Service Cloudflared -StartupType Disabled
```

**Nguyên nhân 2: Docker cache cũ**

```bash
docker compose -f docker-compose.cloudflare.yml down
docker compose -f docker-compose.cloudflare.yml build --no-cache frontend
docker compose -f docker-compose.cloudflare.yml up -d --force-recreate
```

**Nguyên nhân 3: Browser cache**

Nhấn `Ctrl+Shift+R` hoặc mở DevTools (F12) → Network tab → check "Disable cache" → reload.

### API trả 404 hoặc không có dữ liệu

Kiểm tra backend đã khởi động xong chưa:
```bash
docker logs jobportal-backend --tail 5
# Phải thấy: "Started JobPortalApplication in X seconds"
```

Kiểm tra database có dữ liệu:
```bash
docker exec jobportal-mysql mysql -uroot -proot123 jobportal_db -e "SELECT COUNT(*) FROM job_posts;"
```

Test API nội bộ:
```bash
docker exec jobportal-frontend curl -s http://jobportal-backend:8080/api/search/jobs | head -c 200
```

### Cloudflare Tunnel mất kết nối

```bash
docker logs jobportal-cloudflared --tail 20
```

Nếu thấy "ERR" liên tục → restart:
```bash
docker compose -f docker-compose.cloudflare.yml restart cloudflared
```

### Path `/jobportal/` trả 404 (Apache)

Nếu vào `conghotrovieclam.online/jobs` (không có `/jobportal/`) mà thấy Apache 404 → đúng rồi. Domain root `/` do hosting Apache quản lý. Chỉ path `/jobportal/` mới đi qua Cloudflare Tunnel.

---

## Cấu trúc Deployment

```
docker-compose.cloudflare.yml    ← File chạy production
frontend/
├── Dockerfile.cloudflare        ← Build React + Nginx cho production
├── nginx-cloudflare.conf        ← Nginx config (rewrite /jobportal/, proxy API)
├── src/
│   ├── config/api.js            ← API_BASE = process.env.REACT_APP_API_URL
│   └── App.js                   ← Router basename = REACT_APP_BASE_PATH
backend/
├── Dockerfile                   ← Build Spring Boot JAR
.env                             ← Biến môi trường (KHÔNG commit)
```

### Biến môi trường quan trọng (build time)
| Biến | Giá trị Production | Mô tả |
|---|---|---|
| `REACT_APP_API_URL` | `/jobportal/api` | Base URL cho API calls |
| `REACT_APP_BASE_PATH` | `/jobportal` | React Router basename |
| `PUBLIC_URL` | `/jobportal` | Đường dẫn static assets (JS, CSS) |
