-- 1. EMPLOYER PROFILE
INSERT IGNORE INTO employer_profiles (user_id, company_name, company_description, industry, company_size, website, address, phone, logo_url)
VALUES (3, 'TechViet Solutions', 
'TechViet Solutions la cong ty cong nghe hang dau Viet Nam, chuyen phat trien phan mem va giai phap chuyen doi so. Chung toi co hon 10 nam kinh nghiem trong linh vuc IT.',
'Cong nghe thong tin', '500-1000', 'https://techviet.com.vn', 'Tang 15, Toa nha Landmark 81, TP. Ho Chi Minh', '028-3333-1234', '');

-- 2. CANDIDATE USERS
INSERT IGNORE INTO users (id, username, password, enabled) VALUES
(10, 'nguyenvan.an@gmail.com', '$2a$10$QlohpGVhZpnSJvrPQTlBfuzm5Binrp1MwSmCRPmyHPPtfp12y4R/2', 1),
(11, 'tranthithu@gmail.com', '$2a$10$QlohpGVhZpnSJvrPQTlBfuzm5Binrp1MwSmCRPmyHPPtfp12y4R/2', 1),
(12, 'phamquochuy@gmail.com', '$2a$10$QlohpGVhZpnSJvrPQTlBfuzm5Binrp1MwSmCRPmyHPPtfp12y4R/2', 1),
(13, 'lethanhnam@gmail.com', '$2a$10$QlohpGVhZpnSJvrPQTlBfuzm5Binrp1MwSmCRPmyHPPtfp12y4R/2', 1),
(14, 'hoangminhtu@gmail.com', '$2a$10$QlohpGVhZpnSJvrPQTlBfuzm5Binrp1MwSmCRPmyHPPtfp12y4R/2', 1);

INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (10,1),(11,1),(12,1),(13,1),(14,1);

-- 3. CANDIDATE PROFILES
INSERT IGNORE INTO candidate_profiles (id, full_name, email, phone, address, bio, soft_skills)
VALUES
(10, 'Nguyen Van An', 'nguyenvan.an@gmail.com', '0901234567', 'Quan 1, TP. Ho Chi Minh', 
'Java Developer 3 nam kinh nghiem, dam me lap trinh backend va microservices.',
'Teamwork, Problem Solving, Communication'),
(11, 'Tran Thi Thu', 'tranthithu@gmail.com', '0912345678', 'Quan 3, TP. Ho Chi Minh',
'Frontend Developer chuyen React, co kinh nghiem lam viec trong moi truong Agile.',
'Creativity, Attention to Detail, Teamwork'),
(12, 'Pham Quoc Huy', 'phamquochuy@gmail.com', '0923456789', 'Binh Thanh, TP. Ho Chi Minh',
'Full Stack Developer voi 4 nam kinh nghiem, thanh thao Node.js, React va AWS.',
'Leadership, Communication, Fast Learning'),
(13, 'Le Thanh Nam', 'lethanhnam@gmail.com', '0934567890', 'Quan 7, TP. Ho Chi Minh',
'Digital Marketing Specialist chuyen mon SEO, Google Ads va Social Media.',
'Analytical Thinking, Creativity, Data-driven'),
(14, 'Hoang Minh Tu', 'hoangminhtu@gmail.com', '0945678901', 'Quan 2, TP. Ho Chi Minh',
'HR Manager 5 nam kinh nghiem tuyen dung va quan ly nhan su.',
'Empathy, Negotiation, Organization');

-- Skills
INSERT IGNORE INTO candidate_skills (candidate_id, skill) VALUES
(10,'Java'),(10,'Spring Boot'),(10,'MySQL'),(10,'Docker'),(10,'REST API'),
(11,'React'),(11,'JavaScript'),(11,'CSS'),(11,'HTML'),(11,'TypeScript'),
(12,'Node.js'),(12,'React'),(12,'AWS'),(12,'MongoDB'),(12,'Docker'),
(13,'SEO'),(13,'Google Ads'),(13,'Facebook Ads'),(13,'Content Marketing'),(13,'Analytics'),
(14,'Recruitment'),(14,'HR Management'),(14,'Training'),(14,'Labor Law'),(14,'HRIS');

-- 4. JOB POSTS MOI
INSERT IGNORE INTO job_posts (id, title, description, location, employment_type, salary, status, employer_id, category_id, created_at, deadline, requirements, active)
VALUES
(6, 'DevOps Engineer', 
'Tim kiem DevOps Engineer co kinh nghiem voi CI/CD, Docker, Kubernetes de xay dung va duy tri ha tang cloud.',
'TP. Ho Chi Minh', 'Full-time', 35000000, 'APPROVED', 3, 1, NOW(), '2026-06-30', 
'Kinh nghiem 2+ nam voi Docker/Kubernetes; Thanh thao CI/CD; Kien thuc AWS/GCP', 1),
(7, 'UI/UX Designer', 
'Tim kiem UI/UX Designer tai nang de thiet ke giao dien san pham web/mobile hap dan.',
'TP. Ho Chi Minh', 'Full-time', 22000000, 'APPROVED', 3, 2, NOW(), '2026-05-31',
'Thanh thao Figma, Adobe XD; Portfolio san pham da thiet ke; Hieu biet UX Research', 1),
(8, 'Business Analyst', 
'Business Analyst lam viec voi khach hang, thu thap yeu cau va chuyen doi thanh tech spec.',
'Ha Noi', 'Full-time', 25000000, 'PENDING', 3, 5, NOW(), '2026-06-15',
'Kinh nghiem 2+ nam BA trong IT; Thanh thao UML, BPMN; Tieng Anh tot', 1),
(9, 'Data Analyst', 
'Phan tich du lieu kinh doanh, xay dung dashboard va bao cao ho tro ra quyet dinh.',
'TP. Ho Chi Minh', 'Part-time', 18000000, 'APPROVED', 3, 4, NOW(), '2026-05-20',
'Thanh thao SQL, Python; Kinh nghiem Power BI hoac Tableau; Tu duy phan tich tot', 1);

-- 5. JOB APPLICATIONS
INSERT IGNORE INTO job_applications (job_post_id, candidate_id, applied_at, status) VALUES
(1, 10, DATE_SUB(NOW(), INTERVAL 5 DAY), 'REVIEWING'),
(1, 12, DATE_SUB(NOW(), INTERVAL 3 DAY), 'INTERVIEW'),
(1, 11, DATE_SUB(NOW(), INTERVAL 1 DAY), 'SUBMITTED'),
(2, 11, DATE_SUB(NOW(), INTERVAL 7 DAY), 'ACCEPTED'),
(2, 12, DATE_SUB(NOW(), INTERVAL 4 DAY), 'REVIEWING'),
(3, 13, DATE_SUB(NOW(), INTERVAL 6 DAY), 'INTERVIEW'),
(3, 14, DATE_SUB(NOW(), INTERVAL 2 DAY), 'SUBMITTED'),
(4, 14, DATE_SUB(NOW(), INTERVAL 8 DAY), 'ACCEPTED'),
(4, 13, DATE_SUB(NOW(), INTERVAL 5 DAY), 'REJECTED'),
(5, 12, DATE_SUB(NOW(), INTERVAL 4 DAY), 'REVIEWING'),
(5, 10, DATE_SUB(NOW(), INTERVAL 2 DAY), 'SUBMITTED'),
(6, 10, DATE_SUB(NOW(), INTERVAL 3 DAY), 'SUBMITTED'),
(6, 12, DATE_SUB(NOW(), INTERVAL 1 DAY), 'REVIEWING'),
(9, 13, DATE_SUB(NOW(), INTERVAL 2 DAY), 'SUBMITTED');
