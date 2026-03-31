# Job Portal

## 1. Giới thiệu dự án
Job Portal là nền tảng hỗ trợ kết nối giữa nhà tuyển dụng và ứng viên, giúp đăng tin tuyển dụng, tìm kiếm việc làm, quản lý hồ sơ và ứng tuyển trực tuyến.

## 2. Tính năng chính
- Đăng ký, đăng nhập cho ứng viên và nhà tuyển dụng
- Quản lý hồ sơ cá nhân, CV, ảnh đại diện
- Đăng tin tuyển dụng, tìm kiếm việc làm
- Ứng tuyển, quản lý trạng thái ứng tuyển
- Quản trị viên quản lý hệ thống
- Tìm kiếm nâng cao, gợi ý việc làm phù hợp

## 3. Kiến trúc tổng quan
- **Frontend:** ReactJS, giao tiếp API với backend
- **Backend:** Spring Boot (Java), RESTful API
- **Database:** MySQL
- **Triển khai:** Docker, Docker Compose

## 4. Hướng dẫn cài đặt & chạy dự án
### Yêu cầu
- Docker & Docker Compose
- Node.js (nếu muốn chạy frontend dev)
- JDK 17+ (nếu muốn chạy backend dev)

### Chạy bằng Docker Compose
```bash
docker-compose up --build
```

### Chạy thủ công
#### Backend
```bash
cd backend
./mvnw spring-boot:run
```
#### Frontend
```bash
cd frontend
npm install
npm start
```

## 5. Hướng dẫn sử dụng
- Truy cập frontend tại: http://localhost:3000
- Đăng ký tài khoản ứng viên hoặc nhà tuyển dụng
- Đăng nhập và sử dụng các chức năng theo vai trò

## 6. Công nghệ sử dụng
- ReactJS, Java Spring Boot, MySQL, Docker

## 7. Đóng góp & liên hệ
- Đóng góp qua pull request hoặc liên hệ qua email nhóm phát triển.
