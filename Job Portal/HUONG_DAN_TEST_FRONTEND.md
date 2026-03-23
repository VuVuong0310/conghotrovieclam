# HƯỚNG DẪN TEST FRONTEND - JOB PORTAL

## Yêu cầu trước khi test

1. **XAMPP** đang chạy (Apache + MySQL)
2. **Backend** đang chạy trên `http://localhost:8080`
3. **Frontend** đã được build và deploy vào `C:\xampp\htdocs\jobportal\`
4. Mở trình duyệt truy cập: **http://localhost/jobportal/**

---

## Tài khoản demo có sẵn

| Vai trò | Tên đăng nhập | Mật khẩu |
|---------|---------------|-----------|
| Ứng viên (Candidate) | `candidate` | `candidate123` |
| Nhà tuyển dụng (Employer) | `employer` | `employer123` |
| Quản trị viên (Admin) | `admin` | `admin123` |

---

## PHẦN 1: TEST CHỨC NĂNG CHUNG (Không cần đăng nhập)

### 1.1. Trang danh sách công việc
- Truy cập: `http://localhost/jobportal/jobs`
- **Kiểm tra:**
  - [ ] Trang hiển thị danh sách công việc (5 công việc mẫu)
  - [ ] Mỗi công việc hiển thị: Tiêu đề, Địa điểm, Mức lương, Loại hình
  - [ ] Bộ lọc tìm kiếm hoạt động:
    - Nhập từ khóa (vd: "Java") → Nhấn Tìm kiếm → Chỉ hiện các việc liên quan
    - Chọn địa điểm (vd: "Ho Chi Minh") → Tìm kiếm → Lọc theo địa điểm
    - Chọn loại hình (Full-time / Part-time) → Lọc theo loại
    - Nhập mức lương tối thiểu → Lọc theo lương
  - [ ] Xóa bộ lọc và tìm lại → Hiện tất cả công việc
  - [ ] Phân trang hoạt động (nếu có nhiều hơn 10 công việc)

### 1.2. Trang chi tiết công việc
- Từ danh sách công việc, nhấn **"Xem chi tiết"** vào bất kỳ công việc nào
- **Kiểm tra:**
  - [ ] Hiển thị đầy đủ: Tiêu đề, Mô tả, Địa điểm, Mức lương, Loại hình
  - [ ] Nút "Quay lại danh sách" hoạt động
  - [ ] Nút "Ứng tuyển" hiển thị (nếu chưa đăng nhập → chuyển đến trang đăng nhập)

---

## PHẦN 2: TEST ĐĂNG NHẬP / ĐĂNG KÝ

### 2.1. Đăng nhập thủ công
- Truy cập: `http://localhost/jobportal/login`
- **Kiểm tra:**
  - [ ] Nhập username: `candidate`, password: `candidate123` → Nhấn **Đăng Nhập**
  - [ ] Đăng nhập thành công → Chuyển đến trang danh sách công việc
  - [ ] Thanh điều hướng hiện các mục: Tìm Việc, Đề Xuất, Đơn Ứng Tuyển, Hồ Sơ, Đăng Xuất
  - [ ] Nhập sai mật khẩu → Hiện thông báo lỗi "Tên đăng nhập hoặc mật khẩu không đúng"

### 2.2. Đăng nhập nhanh (Demo)
- Tại trang đăng nhập, phía dưới có 3 nút đăng nhập nhanh
- **Kiểm tra:**
  - [ ] Nhấn nút **"👨‍💼 Ứng viên"** → Đăng nhập thành công với tài khoản candidate
  - [ ] Đăng xuất, rồi nhấn **"🏢 Nhà tuyển dụng"** → Đăng nhập với tài khoản employer
  - [ ] Đăng xuất, rồi nhấn **"👑 Admin"** → Đăng nhập với tài khoản admin

### 2.3. Đăng ký tài khoản mới
- Truy cập: `http://localhost/jobportal/register` (hoặc nhấn "Đăng ký ngay" ở trang đăng nhập)
- **Kiểm tra:**
  - [ ] Nhập email, mật khẩu (≥6 ký tự), xác nhận mật khẩu
  - [ ] Chọn vai trò: Ứng viên hoặc Nhà tuyển dụng
  - [ ] Nhấn **Đăng Ký** → Hiện thông báo thành công → Chuyển về trang đăng nhập
  - [ ] Nhập mật khẩu không khớp → Hiện lỗi "Mật khẩu không trùng khớp"
  - [ ] Nhập mật khẩu < 6 ký tự → Hiện lỗi

### 2.4. Đăng xuất
- **Kiểm tra:**
  - [ ] Nhấn nút **"🚪 Đăng Xuất"** trên thanh điều hướng
  - [ ] Chuyển về trang đăng nhập
  - [ ] Thanh điều hướng chỉ còn: Đăng Nhập, Đăng Ký

---

## PHẦN 3: TEST VAI TRÒ ỨNG VIÊN (CANDIDATE)

> Đăng nhập bằng: `candidate` / `candidate123` (hoặc nhấn nút demo "Ứng viên")

### 3.1. Thanh điều hướng
- **Kiểm tra:**
  - [ ] Hiển thị các mục: 🔍 Tìm Việc, ⭐ Đề Xuất, 📋 Đơn Ứng Tuyển, 👤 Hồ Sơ, 🚪 Đăng Xuất
  - [ ] **KHÔNG** hiển thị: Đăng Tuyển, Dashboard (của employer), Admin

### 3.2. Ứng tuyển công việc
- Vào trang **Tìm Việc** → Nhấn vào một công việc bất kỳ
- **Kiểm tra:**
  - [ ] Ở trang chi tiết, nhấn nút **"Ứng Tuyển Ngay"**
  - [ ] Hiện thông báo thành công: "Ứng tuyển thành công!"
  - [ ] Nút đổi thành **"✓ Đã ứng tuyển"** (bị disable)
  - [ ] Ứng tuyển lại cùng công việc → Hiện lỗi "Already applied"

### 3.3. Xem đơn ứng tuyển
- Nhấn **📋 Đơn Ứng Tuyển** trên thanh điều hướng
- **Kiểm tra:**
  - [ ] Hiển thị danh sách các công việc đã ứng tuyển
  - [ ] Mỗi đơn hiển thị: Tên công việc, Trạng thái (Đã nộp / Đang xem xét / ...)
  - [ ] Có thể nhấn **"Rút lại"** để rút đơn ứng tuyển
  - [ ] Nhấn Rút lại → Xác nhận → Đơn bị xóa khỏi danh sách

### 3.4. Trang đề xuất công việc
- Nhấn **⭐ Đề Xuất** trên thanh điều hướng
- **Kiểm tra:**
  - [ ] Có 3 tab: "Đề Xuất Cho Bạn", "Xu Hướng", "Mới Nhất"
  - [ ] Tab "Xu Hướng" → Hiện danh sách công việc phổ biến
  - [ ] Tab "Mới Nhất" → Hiện danh sách công việc mới đăng
  - [ ] Nhấn "Xem chi tiết" → Chuyển đến trang chi tiết công việc

### 3.5. Hồ sơ cá nhân
- Nhấn **👤 Hồ Sơ** trên thanh điều hướng
- **Kiểm tra:**
  - [ ] Hiển thị form hồ sơ: Họ tên, Số điện thoại, Địa chỉ, Kỹ năng
  - [ ] Nhập thông tin → Nhấn **Save Profile** → Hiện "Profile updated successfully!"
  - [ ] Tải lên file CV (PDF) → Hiện "Resume uploaded successfully!"
  - [ ] Tải lại trang → Thông tin vẫn còn (đã lưu thành công)

---

## PHẦN 4: TEST VAI TRÒ NHÀ TUYỂN DỤNG (EMPLOYER)

> Đăng xuất trước, rồi đăng nhập bằng: `employer` / `employer123` (hoặc nút demo "Nhà tuyển dụng")

### 4.1. Thanh điều hướng
- **Kiểm tra:**
  - [ ] Hiển thị: 🔍 Tìm Việc, ➕ Đăng Tuyển, 💼 Dashboard, 🚪 Đăng Xuất
  - [ ] **KHÔNG** hiển thị: Đề Xuất, Đơn Ứng Tuyển, Hồ Sơ, Admin

### 4.2. Đăng tin tuyển dụng mới
- Nhấn **➕ Đăng Tuyển** trên thanh điều hướng
- **Kiểm tra:**
  - [ ] Hiển thị form tạo công việc: Tiêu đề, Mô tả, Địa điểm, Loại hình, Mức lương
  - [ ] Nhập đầy đủ thông tin:
    - Job Title: `Lập trình viên React`
    - Description: `Cần tuyển lập trình viên React có kinh nghiệm`
    - Location: `Ha Noi`
    - Employment Type: `Full-time`
    - Salary: `25000000`
  - [ ] Nhấn **Post Job** → Hiện "Job posted successfully!"
  - [ ] Quay lại trang Tìm Việc → Công việc mới xuất hiện trong danh sách

### 4.3. Dashboard nhà tuyển dụng
- Nhấn **💼 Dashboard** trên thanh điều hướng
- **Kiểm tra:**
  - [ ] Hiển thị thống kê: Tin tuyển dụng, Tổng ứng tuyển, Đã nộp, Đang xem xét, Phỏng vấn
  - [ ] Hiển thị danh sách các tin tuyển dụng đã đăng
  - [ ] Nhấn **"Xem đơn ứng tuyển"** vào 1 tin → Hiển thị danh sách ứng viên
  - [ ] Nút **"+ Đăng Tin Tuyển Dụng Mới"** → Chuyển đến trang tạo công việc

### 4.4. Quản lý đơn ứng tuyển
- Ở Dashboard, nhấn "Xem đơn ứng tuyển" vào tin có ứng viên
- **Kiểm tra:**
  - [ ] Hiển thị danh sách ứng viên đã nộp đơn
  - [ ] Mỗi ứng viên có dropdown chọn trạng thái: Đang Xem Xét, Phỏng Vấn, Chấp Nhận, Từ Chối
  - [ ] Chọn trạng thái mới → Trạng thái được cập nhật
  - [ ] Thống kê Dashboard thay đổi theo

---

## PHẦN 5: TEST VAI TRÒ QUẢN TRỊ VIÊN (ADMIN)

> Đăng xuất trước, rồi đăng nhập bằng: `admin` / `admin123` (hoặc nút demo "Admin")

### 5.1. Thanh điều hướng
- **Kiểm tra:**
  - [ ] Hiển thị: 🔍 Tìm Việc, ⚙️ Admin, 🚪 Đăng Xuất
  - [ ] **KHÔNG** hiển thị: Đề Xuất, Đơn Ứng Tuyển, Dashboard, Hồ Sơ, Đăng Tuyển

### 5.2. Bảng điều khiển Admin
- Nhấn **⚙️ Admin** trên thanh điều hướng
- **Kiểm tra:**
  - [ ] Hiển thị thống kê hệ thống:
    - Tổng người dùng
    - Số ứng viên
    - Số nhà tuyển dụng
    - Tổng tin tuyển dụng
    - Tổng đơn ứng tuyển
    - Thống kê theo trạng thái (Đã nộp, Đang xem xét, Phỏng vấn, Chấp nhận, Từ chối)
  - [ ] Nhấn "Xem danh sách Job chờ duyệt" → Hiện danh sách job pending
  - [ ] Nhấn **"Phê duyệt"** → Hiện thông báo "Job đã được phê duyệt!"
  - [ ] Nhấn **"Từ chối"** → Hỏi lý do → Nhập lý do → Xác nhận

---

## PHẦN 6: TEST LUỒNG HOÀN CHỈNH (End-to-End)

Thực hiện theo thứ tự sau để test toàn bộ luồng:

### Bước 1: Nhà tuyển dụng đăng tin
1. Đăng nhập bằng `employer` / `employer123`
2. Nhấn **➕ Đăng Tuyển**
3. Điền thông tin:
   - Title: `Kỹ sư phần mềm`
   - Description: `Tuyển kỹ sư phần mềm 3 năm kinh nghiệm`
   - Location: `Da Nang`
   - Type: `Full-time`
   - Salary: `30000000`
4. Nhấn **Post Job**
5. Kiểm tra: Hiện "Job posted successfully!"
6. **Đăng xuất**

### Bước 2: Ứng viên ứng tuyển
1. Đăng nhập bằng `candidate` / `candidate123`
2. Nhấn **🔍 Tìm Việc**
3. Tìm công việc "Kỹ sư phần mềm" vừa đăng
4. Nhấn vào để xem chi tiết
5. Nhấn **"Ứng Tuyển Ngay"**
6. Kiểm tra: Hiện thông báo thành công, nút đổi thành "Đã ứng tuyển"
7. Nhấn **📋 Đơn Ứng Tuyển** → Kiểm tra đơn mới xuất hiện
8. **Đăng xuất**

### Bước 3: Nhà tuyển dụng xem và xử lý đơn
1. Đăng nhập bằng `employer` / `employer123`
2. Nhấn **💼 Dashboard**
3. Kiểm tra: Thống kê tổng ứng tuyển tăng lên
4. Nhấn **"Xem đơn ứng tuyển"** vào "Kỹ sư phần mềm"
5. Thấy ứng viên `candidate` trong danh sách
6. Đổi trạng thái sang **"Phỏng Vấn"** hoặc **"Chấp Nhận"**
7. **Đăng xuất**

### Bước 4: Ứng viên kiểm tra trạng thái
1. Đăng nhập bằng `candidate` / `candidate123`
2. Nhấn **📋 Đơn Ứng Tuyển**
3. Kiểm tra: Trạng thái đơn ứng tuyển đã thay đổi theo employer cập nhật

---

## PHẦN 7: BẢNG TỔNG KẾT KẾT QUẢ TEST

| STT | Chức năng | Kết quả | Ghi chú |
|-----|-----------|---------|---------|
| 1 | Xem danh sách công việc | ☐ Đạt / ☐ Lỗi | |
| 2 | Tìm kiếm & lọc công việc | ☐ Đạt / ☐ Lỗi | |
| 3 | Xem chi tiết công việc | ☐ Đạt / ☐ Lỗi | |
| 4 | Đăng nhập thủ công | ☐ Đạt / ☐ Lỗi | |
| 5 | Đăng nhập nhanh (demo) | ☐ Đạt / ☐ Lỗi | |
| 6 | Đăng ký tài khoản | ☐ Đạt / ☐ Lỗi | |
| 7 | Đăng xuất | ☐ Đạt / ☐ Lỗi | |
| 8 | Thanh điều hướng theo vai trò | ☐ Đạt / ☐ Lỗi | |
| 9 | Ứng tuyển công việc | ☐ Đạt / ☐ Lỗi | |
| 10 | Xem đơn ứng tuyển | ☐ Đạt / ☐ Lỗi | |
| 11 | Rút đơn ứng tuyển | ☐ Đạt / ☐ Lỗi | |
| 12 | Trang đề xuất công việc | ☐ Đạt / ☐ Lỗi | |
| 13 | Cập nhật hồ sơ cá nhân | ☐ Đạt / ☐ Lỗi | |
| 14 | Tải CV (PDF) | ☐ Đạt / ☐ Lỗi | |
| 15 | Đăng tin tuyển dụng | ☐ Đạt / ☐ Lỗi | |
| 16 | Dashboard nhà tuyển dụng | ☐ Đạt / ☐ Lỗi | |
| 17 | Quản lý đơn ứng tuyển (employer) | ☐ Đạt / ☐ Lỗi | |
| 18 | Bảng điều khiển Admin | ☐ Đạt / ☐ Lỗi | |
| 19 | Phê duyệt / Từ chối job (Admin) | ☐ Đạt / ☐ Lỗi | |
| 20 | Luồng End-to-End hoàn chỉnh | ☐ Đạt / ☐ Lỗi | |

---

## Lưu ý khi test

- **Xóa cache trình duyệt** trước khi bắt đầu test (Ctrl + Shift + Delete)
- Hoặc sử dụng **chế độ ẩn danh** (Ctrl + Shift + N) để tránh dữ liệu cũ
- Khi chuyển giữa các vai trò, luôn **đăng xuất trước** rồi đăng nhập lại
- Nếu gặp lỗi 403/401, hãy đăng xuất và đăng nhập lại
- Mở **Developer Tools** (F12) → tab **Console** để xem lỗi chi tiết nếu có
