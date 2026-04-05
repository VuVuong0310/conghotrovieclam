-- ============================================================
-- SEED DATA: Thêm nhiều công ty, danh mục, và việc làm
-- ============================================================

SET NAMES utf8mb4;

-- ==================== THÊM DANH MỤC ====================
INSERT IGNORE INTO job_categories (name, description) VALUES
('Thiết kế', 'Thiết kế đồ họa, UI/UX, sáng tạo nội dung'),
('Giáo dục', 'Giảng dạy, đào tạo, nghiên cứu'),
('Y tế & Sức khỏe', 'Bác sĩ, y tá, dược sĩ, chăm sóc sức khỏe'),
('Xây dựng & BĐS', 'Kiến trúc, xây dựng, bất động sản'),
('Logistics & Vận tải', 'Kho vận, xuất nhập khẩu, vận chuyển'),
('Du lịch & Khách sạn', 'Nhà hàng, khách sạn, hướng dẫn viên'),
('Luật & Pháp lý', 'Luật sư, tư vấn pháp lý, công chứng'),
('Truyền thông & Báo chí', 'Biên tập, phóng viên, content creator');

-- ==================== TẠO TÀI KHOẢN EMPLOYER ====================
-- Password: 123456 (BCrypt encoded)
INSERT INTO users (username, password, enabled) VALUES
('hr@fptsoft.com.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4G0VYvzOmuJhJcaa3bNgXoDOBmFe', true),
('hr@vingroup.net', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4G0VYvzOmuJhJcaa3bNgXoDOBmFe', true),
('hr@vng.com.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4G0VYvzOmuJhJcaa3bNgXoDOBmFe', true),
('hr@tiki.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4G0VYvzOmuJhJcaa3bNgXoDOBmFe', true),
('hr@momo.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4G0VYvzOmuJhJcaa3bNgXoDOBmFe', true),
('hr@shopee.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4G0VYvzOmuJhJcaa3bNgXoDOBmFe', true),
('hr@vnpay.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4G0VYvzOmuJhJcaa3bNgXoDOBmFe', true),
('hr@saigontourist.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4G0VYvzOmuJhJcaa3bNgXoDOBmFe', true),
('hr@vinschool.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4G0VYvzOmuJhJcaa3bNgXoDOBmFe', true);

-- Gán role EMPLOYER
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username IN ('hr@fptsoft.com.vn','hr@vingroup.net','hr@vng.com.vn','hr@tiki.vn','hr@momo.vn','hr@shopee.vn','hr@vnpay.vn','hr@saigontourist.vn','hr@vinschool.edu.vn')
AND r.name = 'ROLE_EMPLOYER';

-- ==================== TẠO COMPANY PROFILES ====================
INSERT INTO employer_profiles (user_id, company_name, company_description, industry, company_size, website, address, phone, logo_url) VALUES
((SELECT id FROM users WHERE username='hr@fptsoft.com.vn'),
 'FPT Software', 'FPT Software la cong ty phan mem hang dau Viet Nam voi hon 30.000 nhan vien toan cau. Chuyen cung cap giai phap chuyen doi so, AI va dich vu CNTT cho cac tap doan da quoc gia.', 'Công nghệ thông tin', '10000+', 'https://fpt-software.com', 'Toa nha FPT, Pho Duy Tan, Cau Giay, Ha Noi', '024-7300-7300', NULL),

((SELECT id FROM users WHERE username='hr@vingroup.net'),
 'Vingroup', 'Vingroup la tap doan kinh te tu nhan lon nhat Viet Nam hoat dong da nganh: bat dong san, cong nghe, y te, giao duc, thuong mai dien tu va san xuat oto dien VinFast.', 'Đa ngành', '50000+', 'https://vingroup.net', '7 Bang Lang 1, Vinhomes Riverside, Long Bien, Ha Noi', '024-3974-9999', NULL),

((SELECT id FROM users WHERE username='hr@vng.com.vn'),
 'VNG Corporation', 'VNG la cong ty cong nghe hang dau Viet Nam, noi tieng voi Zalo, ZaloPay va cac san pham game. VNG duoc dinh gia tren 1 ty USD (ky lan cong nghe).', 'Công nghệ thông tin', '3000-5000', 'https://vng.com.vn', '182 Le Dai Hanh, P.15, Q.11, TP. Ho Chi Minh', '028-3899-6696', NULL),

((SELECT id FROM users WHERE username='hr@tiki.vn'),
 'Tiki Corporation', 'Tiki la nen tang thuong mai dien tu hang dau Viet Nam voi hon 50 trieu luot truy cap moi thang. Noi tieng voi dich vu TikiNOW giao hang trong 2 gio.', 'Thương mại điện tử', '3000-5000', 'https://tiki.vn', '52 Ut Tich, P.4, Q. Tan Binh, TP. Ho Chi Minh', '1900-6035', NULL),

((SELECT id FROM users WHERE username='hr@momo.vn'),
 'MoMo', 'MoMo la vi dien tu so 1 Viet Nam voi hon 31 trieu nguoi dung. Cung cap dich vu thanh toan, chuyen tien, mua sam truc tuyen va cac dich vu tai chinh.', 'Fintech', '1000-3000', 'https://momo.vn', 'Tang 7, Toa nha Centec, 72-74 Nguyen Thi Minh Khai, Q.3, TP. Ho Chi Minh', '1900-5454', NULL),

((SELECT id FROM users WHERE username='hr@shopee.vn'),
 'Shopee Vietnam', 'Shopee la nen tang thuong mai dien tu hang dau Dong Nam A, thuoc tap doan Sea Group (Singapore). Tai Viet Nam, Shopee co hon 5.000 nhan vien.', 'Thương mại điện tử', '5000-10000', 'https://shopee.vn', 'Toa nha Etown Central, 11 Doan Van Bo, Q.4, TP. Ho Chi Minh', '028-7108-1081', NULL),

((SELECT id FROM users WHERE username='hr@vnpay.vn'),
 'VNPAY', 'VNPAY la cong ty cong nghe tai chinh hang dau Viet Nam, cung cap giai phap thanh toan dien tu QR code cho hon 40 ngan hang va to chuc tai chinh.', 'Fintech', '1000-3000', 'https://vnpay.vn', 'Tang 8, 22 Lang Ha, Ba Dinh, Ha Noi', '024-6259-9966', NULL),

((SELECT id FROM users WHERE username='hr@saigontourist.vn'),
 'Saigontourist', 'Saigontourist la tong cong ty du lich hang dau Viet Nam voi he thong khach san 5 sao, cong ty lu hanh va trung tam hoi nghi quoc te.', 'Du lịch & Khách sạn', '5000-10000', 'https://saigontourist.net', '23 Le Loi, Q.1, TP. Ho Chi Minh', '028-3829-5914', NULL),

((SELECT id FROM users WHERE username='hr@vinschool.edu.vn'),
 'Vinschool', 'Vinschool la he thong giao duc tu mam non den THPT thuoc Vingroup, ap dung chuong trinh quoc te Cambridge va IB voi hon 40 co so tren toan quoc.', 'Giáo dục', '3000-5000', 'https://vinschool.edu.vn', 'Ocean Park, Gia Lam, Ha Noi', '024-3200-1188', NULL);

-- ==================== THÊM VIỆC LÀM ====================
-- Lấy category IDs
SET @cat_it = (SELECT id FROM job_categories WHERE name = 'IT & Phần mềm');
SET @cat_marketing = (SELECT id FROM job_categories WHERE name = 'Marketing');
SET @cat_hr = (SELECT id FROM job_categories WHERE name = 'Nhân sự');
SET @cat_finance = (SELECT id FROM job_categories WHERE name = 'Tài chính');
SET @cat_business = (SELECT id FROM job_categories WHERE name = 'Kinh doanh');
SET @cat_design = (SELECT id FROM job_categories WHERE name = 'Thiết kế');
SET @cat_edu = (SELECT id FROM job_categories WHERE name = 'Giáo dục');
SET @cat_health = (SELECT id FROM job_categories WHERE name = 'Y tế & Sức khỏe');
SET @cat_construction = (SELECT id FROM job_categories WHERE name = 'Xây dựng & BĐS');
SET @cat_logistics = (SELECT id FROM job_categories WHERE name = 'Logistics & Vận tải');
SET @cat_tourism = (SELECT id FROM job_categories WHERE name = 'Du lịch & Khách sạn');
SET @cat_legal = (SELECT id FROM job_categories WHERE name = 'Luật & Pháp lý');
SET @cat_media = (SELECT id FROM job_categories WHERE name = 'Truyền thông & Báo chí');

-- Lấy employer IDs
SET @emp_fpt = (SELECT id FROM users WHERE username='hr@fptsoft.com.vn');
SET @emp_vin = (SELECT id FROM users WHERE username='hr@vingroup.net');
SET @emp_vng = (SELECT id FROM users WHERE username='hr@vng.com.vn');
SET @emp_tiki = (SELECT id FROM users WHERE username='hr@tiki.vn');
SET @emp_momo = (SELECT id FROM users WHERE username='hr@momo.vn');
SET @emp_shopee = (SELECT id FROM users WHERE username='hr@shopee.vn');
SET @emp_vnpay = (SELECT id FROM users WHERE username='hr@vnpay.vn');
SET @emp_tour = (SELECT id FROM users WHERE username='hr@saigontourist.vn');
SET @emp_school = (SELECT id FROM users WHERE username='hr@vinschool.edu.vn');

-- ====== IT & Phần mềm ======
INSERT INTO job_posts (title, description, location, employment_type, salary, status, category_id, employer_id, created_at, deadline, requirements, active) VALUES
('Backend Developer (Java/Spring)', 'Phat trien API va microservices cho cac du an chuyen doi so cua khach hang quoc te. Lam viec voi Java 17+, Spring Boot, Docker, Kubernetes.', 'Ha Noi', 'FULL_TIME', 25000000, 'APPROVED', @cat_it, @emp_fpt, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 'Java, Spring Boot, SQL, Docker, Kubernetes, 2+ nam kinh nghiem', true),
('Mobile Developer (Flutter)', 'Xay dung ung dung di dong da nen tang (iOS & Android) bang Flutter cho cac san pham noi bo va khach hang.', 'TP. Ho Chi Minh', 'FULL_TIME', 22000000, 'APPROVED', @cat_it, @emp_vng, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'Flutter, Dart, Firebase, REST API, 1+ nam kinh nghiem', true),
('DevOps Engineer', 'Quan ly ha tang cloud (AWS/GCP), CI/CD pipelines, monitoring va dam bao uptime 99.9% cho he thong thanh toan.', 'TP. Ho Chi Minh', 'FULL_TIME', 30000000, 'APPROVED', @cat_it, @emp_momo, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'AWS/GCP, Docker, Kubernetes, Jenkins, Terraform, 3+ nam', true),
('Frontend Developer (React)', 'Phat trien giao dien nguoi dung cho nen tang thuong mai dien tu voi hon 50 trieu luot truy cap/thang.', 'TP. Ho Chi Minh', 'FULL_TIME', 20000000, 'APPROVED', @cat_it, @emp_tiki, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'React, TypeScript, Redux, CSS/SCSS, 2+ nam kinh nghiem', true),
('Data Engineer', 'Xay dung va van hanh data pipeline phuc vu phan tich kinh doanh va machine learning. Xu ly du lieu quy mo lon.', 'TP. Ho Chi Minh', 'FULL_TIME', 28000000, 'APPROVED', @cat_it, @emp_shopee, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 'Python, Spark, Airflow, SQL, BigQuery, 2+ nam', true),
('QA/QC Engineer', 'Dam bao chat luong phan mem qua kiem thu tu dong va thu cong. Xay dung test framework cho API va UI.', 'Ha Noi', 'FULL_TIME', 18000000, 'APPROVED', @cat_it, @emp_fpt, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Selenium, Postman, Jira, SQL, Java/Python, 1+ nam', true),
('AI/ML Engineer', 'Nghien cuu va trien khai cac mo hinh AI/ML cho san pham Zalo va ZaloPay. Xu ly NLP va Computer Vision.', 'TP. Ho Chi Minh', 'FULL_TIME', 35000000, 'APPROVED', @cat_it, @emp_vng, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'Python, TensorFlow/PyTorch, NLP, Computer Vision, 2+ nam', true),
('Blockchain Developer', 'Phat trien smart contract va ung dung phi tap trung (DApp) tren Ethereum va Solana.', 'Ha Noi', 'FULL_TIME', 32000000, 'APPROVED', @cat_it, @emp_vnpay, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'Solidity, Web3.js, Rust, Ethereum, 2+ nam', true),
('Intern Software Engineer', 'Thuc tap phat trien phan mem tai FPT Software. Duoc mentor huong dan va co co hoi nhan vien chinh thuc.', 'Ha Noi', 'INTERNSHIP', 5000000, 'APPROVED', @cat_it, @emp_fpt, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 'Sinh vien nam 3-4 nganh CNTT, biet Java hoac Python', true),
('System Administrator', 'Quan ly he thong may chu, mang va bao mat cho toan bo ha tang cong nghe cua Vingroup.', 'Ha Noi', 'FULL_TIME', 20000000, 'APPROVED', @cat_it, @emp_vin, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Linux, Windows Server, Networking, Security, 2+ nam', true),

-- ====== Marketing ======
('Digital Marketing Manager', 'Quan ly chien dich marketing so tren Facebook, Google, TikTok. Toi uu hoa chi phi quang cao va tang doanh thu.', 'TP. Ho Chi Minh', 'FULL_TIME', 25000000, 'APPROVED', @cat_marketing, @emp_shopee, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'Facebook Ads, Google Ads, TikTok Ads, Analytics, 3+ nam', true),
('Content Marketing Specialist', 'Sang tao noi dung cho blog, social media va email marketing. Xay dung thuong hieu truc tuyen cho Tiki.', 'TP. Ho Chi Minh', 'FULL_TIME', 15000000, 'APPROVED', @cat_marketing, @emp_tiki, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Content writing, SEO, Social Media, Canva, 1+ nam', true),
('SEO Specialist', 'Toi uu hoa website cho cong cu tim kiem, tang organic traffic va cai thien thu hang tu khoa.', 'TP. Ho Chi Minh', 'FULL_TIME', 18000000, 'APPROVED', @cat_marketing, @emp_tiki, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'SEO, Google Search Console, Ahrefs, Analytics, 2+ nam', true),
('Social Media Executive', 'Quan ly kenh MXH (Facebook, Instagram, TikTok, YouTube) cho cac thuong hieu du lich.', 'TP. Ho Chi Minh', 'FULL_TIME', 12000000, 'APPROVED', @cat_marketing, @emp_tour, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Social Media, Content Creation, Video Editing, 1+ nam', true),
('Brand Manager', 'Xay dung va quan ly thuong hieu MoMo tren thi truong tai chinh so Viet Nam.', 'TP. Ho Chi Minh', 'FULL_TIME', 30000000, 'APPROVED', @cat_marketing, @emp_momo, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 'Brand Strategy, Marketing, Communication, 5+ nam', true),

-- ====== Nhân sự ======
('HR Business Partner', 'Dong hanh cung lanh dao phong ban de xay dung chien luoc nhan su, quan ly hieu suat va van hoa doanh nghiep.', 'Ha Noi', 'FULL_TIME', 22000000, 'APPROVED', @cat_hr, @emp_vin, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'HR Strategy, Performance Management, 3+ nam kinh nghiem HR', true),
('Talent Acquisition Specialist', 'Tuyen dung cac vi tri IT cao cap cho FPT Software. Quan ly quy trinh tuyen dung tu A-Z.', 'Ha Noi', 'FULL_TIME', 18000000, 'APPROVED', @cat_hr, @emp_fpt, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'IT Recruitment, LinkedIn, Headhunting, 2+ nam', true),
('Training & Development Manager', 'Xay dung chuong trinh dao tao noi bo, phat trien nang luc nhan vien va lanh dao.', 'TP. Ho Chi Minh', 'FULL_TIME', 25000000, 'APPROVED', @cat_hr, @emp_shopee, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'L&D, Instructional Design, Leadership Training, 4+ nam', true),
('C&B Specialist', 'Quan ly luong thuong, bao hiem va phuc loi cho hon 3.000 nhan vien tai VNG.', 'TP. Ho Chi Minh', 'FULL_TIME', 16000000, 'APPROVED', @cat_hr, @emp_vng, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Payroll, Insurance, Tax, Excel, 2+ nam', true),

-- ====== Tài chính ======
('Financial Analyst', 'Phan tich tai chinh, lap bao cao va du bao doanh thu cho ban lanh dao Tiki.', 'TP. Ho Chi Minh', 'FULL_TIME', 20000000, 'APPROVED', @cat_finance, @emp_tiki, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'Financial Modeling, Excel, SQL, Power BI, 2+ nam', true),
('Risk Management Officer', 'Danh gia va quan ly rui ro tin dung, rui ro hoat dong cho he thong thanh toan MoMo.', 'TP. Ho Chi Minh', 'FULL_TIME', 25000000, 'APPROVED', @cat_finance, @emp_momo, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Risk Assessment, Compliance, Finance, 3+ nam', true),
('Ke toan truong', 'Quan ly toan bo hoat dong ke toan cho VNPAY, bao gom ke toan tong hop, thue va bao cao tai chinh.', 'Ha Noi', 'FULL_TIME', 28000000, 'APPROVED', @cat_finance, @emp_vnpay, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'Chief Accountant Certificate, VAS, Tax, 5+ nam', true),
('Internal Auditor', 'Kiem toan noi bo cac quy trinh hoat dong, tai chinh va tuan thu cua Vingroup.', 'Ha Noi', 'FULL_TIME', 22000000, 'APPROVED', @cat_finance, @emp_vin, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Audit, IFRS, VAS, Data Analytics, 3+ nam', true),

-- ====== Kinh doanh ======
('Business Development Manager', 'Mo rong thi truong va phat trien doi tac chien luoc cho san pham thanh toan VNPAY-QR.', 'Ha Noi', 'FULL_TIME', 25000000, 'APPROVED', @cat_business, @emp_vnpay, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'B2B Sales, Partnership, Fintech, 3+ nam', true),
('Account Executive', 'Quan ly va phat trien khach hang doanh nghiep cho dich vu IT outsourcing cua FPT Software.', 'Ha Noi', 'FULL_TIME', 20000000, 'APPROVED', @cat_business, @emp_fpt, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'B2B Sales, IT Services, Upselling, 2+ nam', true),
('E-commerce Operations', 'Van hanh gian hang tren nen tang Shopee, quan ly san pham, khuyen mai va dich vu khach hang.', 'TP. Ho Chi Minh', 'FULL_TIME', 15000000, 'APPROVED', @cat_business, @emp_shopee, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'E-commerce, Excel, Customer Service, 1+ nam', true),
('Sales Executive', 'Ban cac goi du lich trong nuoc va quoc te cho khach hang ca nhan va doanh nghiep.', 'TP. Ho Chi Minh', 'FULL_TIME', 12000000, 'APPROVED', @cat_business, @emp_tour, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Sales, Travel Industry, Communication, 1+ nam', true),

-- ====== Thiết kế ======
('UI/UX Designer (Senior)', 'Thiet ke trai nghiem nguoi dung cho ung dung Zalo voi hon 70 trieu nguoi dung.', 'TP. Ho Chi Minh', 'FULL_TIME', 25000000, 'APPROVED', @cat_design, @emp_vng, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'Figma, User Research, Prototyping, Design System, 3+ nam', true),
('Graphic Designer', 'Thiet ke do hoa cho cac chien dich marketing: banner, poster, video ngan va an pham truyen thong.', 'TP. Ho Chi Minh', 'FULL_TIME', 14000000, 'APPROVED', @cat_design, @emp_tiki, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Photoshop, Illustrator, After Effects, 1+ nam', true),
('Product Designer', 'Thiet ke san pham so tu y tuong den trien khai cho ung dung thanh toan MoMo.', 'TP. Ho Chi Minh', 'FULL_TIME', 28000000, 'APPROVED', @cat_design, @emp_momo, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'Product Design, Figma, Design Thinking, 3+ nam', true),
('Interior Designer', 'Thiet ke noi that cho cac du an Vinhomes va khu do thi cua Vingroup.', 'Ha Noi', 'FULL_TIME', 18000000, 'APPROVED', @cat_design, @emp_vin, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), '3ds Max, AutoCAD, SketchUp, 2+ nam', true),

-- ====== Giáo dục ======
('Giao vien Tieng Anh', 'Giang day Tieng Anh theo chuong trinh Cambridge cho hoc sinh cap 2-3 tai Vinschool.', 'Ha Noi', 'FULL_TIME', 20000000, 'APPROVED', @cat_edu, @emp_school, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 'IELTS 7.0+, TESOL/CELTA, 2+ nam kinh nghiem giang day', true),
('Giao vien Toan', 'Giang day Toan hoc bang Tieng Anh theo chuong trinh quoc te IB/Cambridge.', 'TP. Ho Chi Minh', 'FULL_TIME', 18000000, 'APPROVED', @cat_edu, @emp_school, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'Bang Tot nghiep Su pham Toan, Tieng Anh giao tiep tot', true),
('Quan ly Dao tao IT', 'Xay dung chuong trinh dao tao ky thuat cho doi ngu 30.000 ky su FPT Software.', 'Ha Noi', 'FULL_TIME', 25000000, 'APPROVED', @cat_edu, @emp_fpt, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'L&D, IT Training, LMS, 3+ nam', true),

-- ====== Y tế & Sức khỏe ======
('Bac si Da khoa', 'Kham va dieu tri benh nhan tai benh vien Vinmec, he thong y te tieu chuan quoc te JCI.', 'Ha Noi', 'FULL_TIME', 35000000, 'APPROVED', @cat_health, @emp_vin, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 'Bang Tot nghiep Y khoa, Chung chi hanh nghe, 3+ nam', true),
('Duoc si Lam sang', 'Tu van su dung thuoc va theo doi phan ung thuoc cho benh nhan noi tru tai Vinmec.', 'TP. Ho Chi Minh', 'FULL_TIME', 18000000, 'APPROVED', @cat_health, @emp_vin, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'Bang tot nghiep Duoc, Chung chi Duoc si, 2+ nam', true),

-- ====== Xây dựng & BĐS ======
('Ky su Xay dung', 'Giam sat thi cong cac du an bat dong san cao cap Vinhomes tren toan quoc.', 'Ha Noi', 'FULL_TIME', 20000000, 'APPROVED', @cat_construction, @emp_vin, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 'Bang ky su Xay dung, AutoCAD, MS Project, 2+ nam', true),
('Chuyen vien Kinh doanh BDS', 'Tu van va ban cac can ho Vinhomes, biet thu va shophouse cho khach hang.', 'TP. Ho Chi Minh', 'FULL_TIME', 12000000, 'APPROVED', @cat_construction, @emp_vin, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Sales, BDS, Giao tiep, 1+ nam kinh nghiem', true),

-- ====== Logistics & Vận tải ======
('Logistics Coordinator', 'Dieu phoi van chuyen va kho hang cho he thong fulfillment cua Shopee.', 'TP. Ho Chi Minh', 'FULL_TIME', 15000000, 'APPROVED', @cat_logistics, @emp_shopee, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Logistics, WMS, Excel, 1+ nam kinh nghiem', true),
('Supply Chain Analyst', 'Phan tich va toi uu hoa chuoi cung ung cho cac san pham tren Tiki.', 'TP. Ho Chi Minh', 'FULL_TIME', 18000000, 'APPROVED', @cat_logistics, @emp_tiki, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'Supply Chain, Data Analysis, SQL, Excel, 2+ nam', true),
('Import/Export Specialist', 'Quan ly thu tuc xuat nhap khau cho cac san pham dien tu cua VinFast.', 'Ha Noi', 'FULL_TIME', 16000000, 'APPROVED', @cat_logistics, @emp_vin, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'XNK, Customs, Logistics, English, 2+ nam', true),

-- ====== Du lịch & Khách sạn ======
('Quan ly Khach san', 'Quan ly van hanh khach san 5 sao thuoc he thong Saigontourist.', 'TP. Ho Chi Minh', 'FULL_TIME', 25000000, 'APPROVED', @cat_tourism, @emp_tour, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 'Hotel Management, English, 5+ nam kinh nghiem', true),
('Huong dan vien Du lich', 'Dan doan khach du lich trong nuoc va quoc te tai cac diem den noi tieng Viet Nam.', 'TP. Ho Chi Minh', 'FULL_TIME', 12000000, 'APPROVED', @cat_tourism, @emp_tour, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'The huong dan vien, Tieng Anh/Trung, 1+ nam', true),
('Reception / Le tan', 'Don tiep va ho tro khach hang tai khach san 5 sao. Lam viec theo ca.', 'Da Nang', 'FULL_TIME', 10000000, 'APPROVED', @cat_tourism, @emp_tour, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'Tieng Anh, Ngoai hinh, Giao tiep, Hotel Management', true),

-- ====== Luật & Pháp lý ======
('Legal Counsel', 'Tu van phap ly cho cac hoat dong kinh doanh, hop dong va tuan thu phap luat cua Shopee tai Viet Nam.', 'TP. Ho Chi Minh', 'FULL_TIME', 30000000, 'APPROVED', @cat_legal, @emp_shopee, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'Bang cu nhan Luat, The luat su, Thuong mai dien tu, 3+ nam', true),
('Compliance Officer', 'Dam bao tuan thu cac quy dinh phap luat ve tai chinh va thanh toan dien tu.', 'TP. Ho Chi Minh', 'FULL_TIME', 25000000, 'APPROVED', @cat_legal, @emp_momo, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Compliance, Fintech Regulations, 3+ nam', true),

-- ====== Truyền thông & Báo chí ======
('Content Creator (Video)', 'San xuat video ngan cho TikTok va YouTube Shorts quang ba thuong hieu Shopee.', 'TP. Ho Chi Minh', 'FULL_TIME', 14000000, 'APPROVED', @cat_media, @emp_shopee, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Video Editing, Premiere Pro, TikTok, 1+ nam', true),
('PR Specialist', 'Quan ly truyen thong va quan he bao chi cho Vingroup va cac cong ty thanh vien.', 'Ha Noi', 'FULL_TIME', 20000000, 'APPROVED', @cat_media, @emp_vin, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'PR, Media Relations, Crisis Communication, 3+ nam', true),
('Copywriter', 'Viet noi dung sang tao cho website, ung dung va cac chien dich quang cao cua MoMo.', 'TP. Ho Chi Minh', 'FULL_TIME', 14000000, 'APPROVED', @cat_media, @emp_momo, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Copywriting, Content Strategy, Creativity, 1+ nam', true),

-- ====== Part-time & Remote ======
('Part-time Content Writer', 'Viet bai SEO cho blog Tiki ve cong nghe, lifestyle va mua sam thong minh.', 'Remote', 'PART_TIME', 8000000, 'APPROVED', @cat_media, @emp_tiki, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 'Content Writing, SEO, Tieng Viet tot', true),
('Freelance UI Designer', 'Thiet ke giao dien cho cac du an noi bo cua FPT Software (lam viec tu xa).', 'Remote', 'CONTRACT', 20000000, 'APPROVED', @cat_design, @emp_fpt, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Figma, UI Design, Responsive Design, 2+ nam', true);

SELECT CONCAT('Da them ', COUNT(*), ' viec lam moi') as result FROM job_posts WHERE employer_id != 3;
SELECT CONCAT('Tong cong ', COUNT(*), ' viec lam') as result FROM job_posts;
SELECT CONCAT('Tong cong ', COUNT(*), ' cong ty') as result FROM employer_profiles;
SELECT CONCAT('Tong cong ', COUNT(*), ' danh muc') as result FROM job_categories;
