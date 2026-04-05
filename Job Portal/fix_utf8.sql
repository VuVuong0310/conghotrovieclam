SET NAMES utf8mb4;

-- Fix category names
UPDATE job_categories SET name = 'Thiết kế', description = 'Thiết kế đồ họa, UI/UX, sáng tạo nội dung' WHERE id = 6;
UPDATE job_categories SET name = 'Giáo dục', description = 'Giảng dạy, đào tạo, nghiên cứu' WHERE id = 7;
UPDATE job_categories SET name = 'Y tế & Sức khỏe', description = 'Bác sĩ, y tá, dược sĩ, chăm sóc sức khỏe' WHERE id = 8;
UPDATE job_categories SET name = 'Xây dựng & BĐS', description = 'Kiến trúc, xây dựng, bất động sản' WHERE id = 9;
UPDATE job_categories SET name = 'Logistics & Vận tải', description = 'Kho vận, xuất nhập khẩu, vận chuyển' WHERE id = 10;
UPDATE job_categories SET name = 'Du lịch & Khách sạn', description = 'Nhà hàng, khách sạn, hướng dẫn viên' WHERE id = 11;
UPDATE job_categories SET name = 'Luật & Pháp lý', description = 'Luật sư, tư vấn pháp lý, công chứng' WHERE id = 12;
UPDATE job_categories SET name = 'Truyền thông & Báo chí', description = 'Biên tập, phóng viên, content creator' WHERE id = 13;

-- Fix employer industry
UPDATE employer_profiles SET industry = 'Công nghệ thông tin' WHERE id = 3;
UPDATE employer_profiles SET industry = 'Đa ngành' WHERE id = 4;
UPDATE employer_profiles SET industry = 'Công nghệ thông tin' WHERE id = 5;
UPDATE employer_profiles SET industry = 'Thương mại điện tử' WHERE id = 6;
UPDATE employer_profiles SET industry = 'Thương mại điện tử' WHERE id = 8;
UPDATE employer_profiles SET industry = 'Du lịch & Khách sạn' WHERE id = 10;
UPDATE employer_profiles SET industry = 'Giáo dục' WHERE id = 11;

-- Fix employer descriptions
UPDATE employer_profiles SET company_description = 'FPT Software là công ty phần mềm hàng đầu Việt Nam với hơn 30.000 nhân viên toàn cầu. Chuyên cung cấp giải pháp chuyển đổi số, AI và dịch vụ CNTT cho các tập đoàn đa quốc gia.' WHERE id = 3;
UPDATE employer_profiles SET company_description = 'Vingroup là tập đoàn kinh tế tư nhân lớn nhất Việt Nam hoạt động đa ngành: bất động sản, công nghệ, y tế, giáo dục, thương mại điện tử và sản xuất ô tô điện VinFast.' WHERE id = 4;
UPDATE employer_profiles SET company_description = 'VNG là công ty công nghệ hàng đầu Việt Nam, nổi tiếng với Zalo, ZaloPay và các sản phẩm game. VNG được định giá trên 1 tỷ USD (kỳ lân công nghệ).' WHERE id = 5;
UPDATE employer_profiles SET company_description = 'Tiki là nền tảng thương mại điện tử hàng đầu Việt Nam với hơn 50 triệu lượt truy cập mỗi tháng. Nổi tiếng với dịch vụ TikiNOW giao hàng trong 2 giờ.' WHERE id = 6;
UPDATE employer_profiles SET company_description = 'MoMo là ví điện tử số 1 Việt Nam với hơn 31 triệu người dùng. Cung cấp dịch vụ thanh toán, chuyển tiền, mua sắm trực tuyến và các dịch vụ tài chính.' WHERE id = 7;
UPDATE employer_profiles SET company_description = 'Shopee là nền tảng thương mại điện tử hàng đầu Đông Nam Á, thuộc tập đoàn Sea Group (Singapore). Tại Việt Nam, Shopee có hơn 5.000 nhân viên.' WHERE id = 8;
UPDATE employer_profiles SET company_description = 'VNPAY là công ty công nghệ tài chính hàng đầu Việt Nam, cung cấp giải pháp thanh toán điện tử QR code cho hơn 40 ngân hàng và tổ chức tài chính.' WHERE id = 9;
UPDATE employer_profiles SET company_description = 'Saigontourist là tổng công ty du lịch hàng đầu Việt Nam với hệ thống khách sạn 5 sao, công ty lữ hành và trung tâm hội nghị quốc tế.' WHERE id = 10;
UPDATE employer_profiles SET company_description = 'Vinschool là hệ thống giáo dục từ mầm non đến THPT thuộc Vingroup, áp dụng chương trình quốc tế Cambridge và IB với hơn 40 cơ sở trên toàn quốc.' WHERE id = 11;

-- Fix employer addresses
UPDATE employer_profiles SET address = 'Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội' WHERE id = 3;
UPDATE employer_profiles SET address = '7 Bằng Lăng 1, Vinhomes Riverside, Long Biên, Hà Nội' WHERE id = 4;
UPDATE employer_profiles SET address = '182 Lê Đại Hành, P.15, Q.11, TP. Hồ Chí Minh' WHERE id = 5;
UPDATE employer_profiles SET address = '52 Út Tịch, P.4, Q. Tân Bình, TP. Hồ Chí Minh' WHERE id = 6;
UPDATE employer_profiles SET address = 'Tầng 7, Tòa nhà Centec, 72-74 Nguyễn Thị Minh Khai, Q.3, TP. Hồ Chí Minh' WHERE id = 7;
UPDATE employer_profiles SET address = 'Tòa nhà Etown Central, 11 Đoàn Văn Bơ, Q.4, TP. Hồ Chí Minh' WHERE id = 8;
UPDATE employer_profiles SET address = 'Tầng 8, 22 Láng Hạ, Ba Đình, Hà Nội' WHERE id = 9;
UPDATE employer_profiles SET address = '23 Lê Lợi, Q.1, TP. Hồ Chí Minh' WHERE id = 10;
UPDATE employer_profiles SET address = 'Ocean Park, Gia Lâm, Hà Nội' WHERE id = 11;

-- Fix job posts - titles and descriptions with Vietnamese
UPDATE job_posts SET title = 'Phát triển Backend (Java/Spring)', description = 'Phát triển API và microservices cho các dự án chuyển đổi số của khách hàng quốc tế. Làm việc với Java 17+, Spring Boot, Docker, Kubernetes.', location = 'Hà Nội', requirements = 'Java, Spring Boot, SQL, Docker, Kubernetes, 2+ năm kinh nghiệm' WHERE title LIKE 'Backend Developer%' AND employer_id = (SELECT id FROM users WHERE username='hr@fptsoft.com.vn');

UPDATE job_posts SET title = 'Lập trình Mobile (Flutter)', description = 'Xây dựng ứng dụng di động đa nền tảng (iOS & Android) bằng Flutter cho các sản phẩm nội bộ và khách hàng.', location = 'TP. Hồ Chí Minh', requirements = 'Flutter, Dart, Firebase, REST API, 1+ năm kinh nghiệm' WHERE title LIKE 'Mobile Developer%' AND employer_id = (SELECT id FROM users WHERE username='hr@vng.com.vn');

UPDATE job_posts SET title = 'Kỹ sư DevOps', description = 'Quản lý hạ tầng cloud (AWS/GCP), CI/CD pipelines, monitoring và đảm bảo uptime 99.9% cho hệ thống thanh toán.', location = 'TP. Hồ Chí Minh', requirements = 'AWS/GCP, Docker, Kubernetes, Jenkins, Terraform, 3+ năm' WHERE title LIKE 'DevOps Engineer%';

UPDATE job_posts SET title = 'Lập trình Frontend (React)', description = 'Phát triển giao diện người dùng cho nền tảng thương mại điện tử với hơn 50 triệu lượt truy cập/tháng.', location = 'TP. Hồ Chí Minh', requirements = 'React, TypeScript, Redux, CSS/SCSS, 2+ năm kinh nghiệm' WHERE title LIKE 'Frontend Developer%';

UPDATE job_posts SET title = 'Kỹ sư Dữ liệu', description = 'Xây dựng và vận hành data pipeline phục vụ phân tích kinh doanh và machine learning. Xử lý dữ liệu quy mô lớn.', location = 'TP. Hồ Chí Minh', requirements = 'Python, Spark, Airflow, SQL, BigQuery, 2+ năm' WHERE title LIKE 'Data Engineer%';

UPDATE job_posts SET title = 'Kiểm thử Phần mềm (QA/QC)', description = 'Đảm bảo chất lượng phần mềm qua kiểm thử tự động và thủ công. Xây dựng test framework cho API và UI.', location = 'Hà Nội', requirements = 'Selenium, Postman, Jira, SQL, Java/Python, 1+ năm' WHERE title LIKE 'QA/QC%';

UPDATE job_posts SET title = 'Kỹ sư AI/ML', description = 'Nghiên cứu và triển khai các mô hình AI/ML cho sản phẩm Zalo và ZaloPay. Xử lý NLP và Computer Vision.', location = 'TP. Hồ Chí Minh', requirements = 'Python, TensorFlow/PyTorch, NLP, Computer Vision, 2+ năm' WHERE title LIKE 'AI/ML%';

UPDATE job_posts SET title = 'Lập trình Blockchain', description = 'Phát triển smart contract và ứng dụng phi tập trung (DApp) trên Ethereum và Solana.', location = 'Hà Nội', requirements = 'Solidity, Web3.js, Rust, Ethereum, 2+ năm' WHERE title LIKE 'Blockchain%';

UPDATE job_posts SET title = 'Thực tập sinh Lập trình', description = 'Thực tập phát triển phần mềm tại FPT Software. Được mentor hướng dẫn và có cơ hội nhân viên chính thức.', location = 'Hà Nội', requirements = 'Sinh viên năm 3-4 ngành CNTT, biết Java hoặc Python' WHERE title LIKE 'Intern%';

UPDATE job_posts SET title = 'Quản trị Hệ thống', description = 'Quản lý hệ thống máy chủ, mạng và bảo mật cho toàn bộ hạ tầng công nghệ của Vingroup.', location = 'Hà Nội', requirements = 'Linux, Windows Server, Networking, Security, 2+ năm' WHERE title LIKE 'System Admin%';

UPDATE job_posts SET title = 'Quản lý Marketing số', description = 'Quản lý chiến dịch marketing số trên Facebook, Google, TikTok. Tối ưu hóa chi phí quảng cáo và tăng doanh thu.', location = 'TP. Hồ Chí Minh', requirements = 'Facebook Ads, Google Ads, TikTok Ads, Analytics, 3+ năm' WHERE title LIKE 'Digital Marketing%';

UPDATE job_posts SET title = 'Chuyên viên Content Marketing', description = 'Sáng tạo nội dung cho blog, social media và email marketing. Xây dựng thương hiệu trực tuyến cho Tiki.', location = 'TP. Hồ Chí Minh', requirements = 'Content writing, SEO, Social Media, Canva, 1+ năm' WHERE title LIKE 'Content Marketing%';

UPDATE job_posts SET title = 'Chuyên viên SEO', description = 'Tối ưu hóa website cho công cụ tìm kiếm, tăng organic traffic và cải thiện thứ hạng từ khóa.', location = 'TP. Hồ Chí Minh', requirements = 'SEO, Google Search Console, Ahrefs, Analytics, 2+ năm' WHERE title LIKE 'SEO%';

UPDATE job_posts SET title = 'Nhân viên Social Media', description = 'Quản lý kênh MXH (Facebook, Instagram, TikTok, YouTube) cho các thương hiệu du lịch.', location = 'TP. Hồ Chí Minh', requirements = 'Social Media, Content Creation, Video Editing, 1+ năm' WHERE title LIKE 'Social Media%';

UPDATE job_posts SET title = 'Quản lý Thương hiệu', description = 'Xây dựng và quản lý thương hiệu MoMo trên thị trường tài chính số Việt Nam.', location = 'TP. Hồ Chí Minh', requirements = 'Brand Strategy, Marketing, Communication, 5+ năm' WHERE title LIKE 'Brand Manager%';

UPDATE job_posts SET title = 'HR Business Partner', description = 'Đồng hành cùng lãnh đạo phòng ban để xây dựng chiến lược nhân sự, quản lý hiệu suất và văn hóa doanh nghiệp.', location = 'Hà Nội', requirements = 'HR Strategy, Performance Management, 3+ năm kinh nghiệm HR' WHERE title LIKE 'HR Business%';

UPDATE job_posts SET title = 'Chuyên viên Tuyển dụng IT', description = 'Tuyển dụng các vị trí IT cao cấp cho FPT Software. Quản lý quy trình tuyển dụng từ A-Z.', location = 'Hà Nội', requirements = 'IT Recruitment, LinkedIn, Headhunting, 2+ năm' WHERE title LIKE 'Talent Acquisition%';

UPDATE job_posts SET title = 'Quản lý Đào tạo & Phát triển', description = 'Xây dựng chương trình đào tạo nội bộ, phát triển năng lực nhân viên và lãnh đạo.', location = 'TP. Hồ Chí Minh', requirements = 'L&D, Instructional Design, Leadership Training, 4+ năm' WHERE title LIKE 'Training%';

UPDATE job_posts SET title = 'Chuyên viên Lương & Phúc lợi', description = 'Quản lý lương thưởng, bảo hiểm và phúc lợi cho hơn 3.000 nhân viên tại VNG.', location = 'TP. Hồ Chí Minh', requirements = 'Payroll, Insurance, Tax, Excel, 2+ năm' WHERE title LIKE 'C&B%';

UPDATE job_posts SET title = 'Chuyên viên Phân tích Tài chính', description = 'Phân tích tài chính, lập báo cáo và dự báo doanh thu cho ban lãnh đạo Tiki.', location = 'TP. Hồ Chí Minh', requirements = 'Financial Modeling, Excel, SQL, Power BI, 2+ năm' WHERE title LIKE 'Financial Analyst%';

UPDATE job_posts SET title = 'Chuyên viên Quản lý Rủi ro', description = 'Đánh giá và quản lý rủi ro tín dụng, rủi ro hoạt động cho hệ thống thanh toán MoMo.', location = 'TP. Hồ Chí Minh', requirements = 'Risk Assessment, Compliance, Finance, 3+ năm' WHERE title LIKE 'Risk Management%';

UPDATE job_posts SET title = 'Kế toán trưởng', description = 'Quản lý toàn bộ hoạt động kế toán cho VNPAY, bao gồm kế toán tổng hợp, thuế và báo cáo tài chính.', location = 'Hà Nội', requirements = 'Chứng chỉ Kế toán trưởng, VAS, Thuế, 5+ năm' WHERE title LIKE 'Ke toan%';

UPDATE job_posts SET title = 'Kiểm toán Nội bộ', description = 'Kiểm toán nội bộ các quy trình hoạt động, tài chính và tuân thủ của Vingroup.', location = 'Hà Nội', requirements = 'Audit, IFRS, VAS, Data Analytics, 3+ năm' WHERE title LIKE 'Internal Auditor%';

UPDATE job_posts SET title = 'Quản lý Phát triển Kinh doanh', description = 'Mở rộng thị trường và phát triển đối tác chiến lược cho sản phẩm thanh toán VNPAY-QR.', location = 'Hà Nội', requirements = 'B2B Sales, Partnership, Fintech, 3+ năm' WHERE title LIKE 'Business Development%';

UPDATE job_posts SET title = 'Chuyên viên Kinh doanh', description = 'Quản lý và phát triển khách hàng doanh nghiệp cho dịch vụ IT outsourcing của FPT Software.', location = 'Hà Nội', requirements = 'B2B Sales, IT Services, Upselling, 2+ năm' WHERE title LIKE 'Account Executive%';

UPDATE job_posts SET title = 'Vận hành Thương mại Điện tử', description = 'Vận hành gian hàng trên nền tảng Shopee, quản lý sản phẩm, khuyến mại và dịch vụ khách hàng.', location = 'TP. Hồ Chí Minh', requirements = 'E-commerce, Excel, Customer Service, 1+ năm' WHERE title LIKE 'E-commerce%';

UPDATE job_posts SET title = 'Nhân viên Kinh doanh Du lịch', description = 'Bán các gói du lịch trong nước và quốc tế cho khách hàng cá nhân và doanh nghiệp.', location = 'TP. Hồ Chí Minh', requirements = 'Sales, Travel Industry, Communication, 1+ năm' WHERE title LIKE 'Sales Executive%';

UPDATE job_posts SET title = 'Thiết kế UI/UX (Senior)', description = 'Thiết kế trải nghiệm người dùng cho ứng dụng Zalo với hơn 70 triệu người dùng.', location = 'TP. Hồ Chí Minh', requirements = 'Figma, User Research, Prototyping, Design System, 3+ năm' WHERE title LIKE 'UI/UX%';

UPDATE job_posts SET title = 'Thiết kế Đồ họa', description = 'Thiết kế đồ họa cho các chiến dịch marketing: banner, poster, video ngắn và ấn phẩm truyền thông.', location = 'TP. Hồ Chí Minh', requirements = 'Photoshop, Illustrator, After Effects, 1+ năm' WHERE title LIKE 'Graphic%';

UPDATE job_posts SET title = 'Thiết kế Sản phẩm', description = 'Thiết kế sản phẩm số từ ý tưởng đến triển khai cho ứng dụng thanh toán MoMo.', location = 'TP. Hồ Chí Minh', requirements = 'Product Design, Figma, Design Thinking, 3+ năm' WHERE title LIKE 'Product Designer%';

UPDATE job_posts SET title = 'Thiết kế Nội thất', description = 'Thiết kế nội thất cho các dự án Vinhomes và khu đô thị của Vingroup.', location = 'Hà Nội', requirements = '3ds Max, AutoCAD, SketchUp, 2+ năm' WHERE title LIKE 'Interior%';

UPDATE job_posts SET title = 'Giáo viên Tiếng Anh', description = 'Giảng dạy Tiếng Anh theo chương trình Cambridge cho học sinh cấp 2-3 tại Vinschool.', location = 'Hà Nội', requirements = 'IELTS 7.0+, TESOL/CELTA, 2+ năm kinh nghiệm giảng dạy' WHERE title LIKE 'Giao vien Tieng Anh%';

UPDATE job_posts SET title = 'Giáo viên Toán', description = 'Giảng dạy Toán học bằng Tiếng Anh theo chương trình quốc tế IB/Cambridge.', location = 'TP. Hồ Chí Minh', requirements = 'Bằng Tốt nghiệp Sư phạm Toán, Tiếng Anh giao tiếp tốt' WHERE title LIKE 'Giao vien Toan%';

UPDATE job_posts SET title = 'Quản lý Đào tạo IT', description = 'Xây dựng chương trình đào tạo kỹ thuật cho đội ngũ 30.000 kỹ sư FPT Software.', location = 'Hà Nội', requirements = 'L&D, IT Training, LMS, 3+ năm' WHERE title LIKE 'Quan ly Dao tao%';

UPDATE job_posts SET title = 'Bác sĩ Đa khoa', description = 'Khám và điều trị bệnh nhân tại bệnh viện Vinmec, hệ thống y tế tiêu chuẩn quốc tế JCI.', location = 'Hà Nội', requirements = 'Bằng Tốt nghiệp Y khoa, Chứng chỉ hành nghề, 3+ năm' WHERE title LIKE 'Bac si%';

UPDATE job_posts SET title = 'Dược sĩ Lâm sàng', description = 'Tư vấn sử dụng thuốc và theo dõi phản ứng thuốc cho bệnh nhân nội trú tại Vinmec.', location = 'TP. Hồ Chí Minh', requirements = 'Bằng tốt nghiệp Dược, Chứng chỉ Dược sĩ, 2+ năm' WHERE title LIKE 'Duoc si%';

UPDATE job_posts SET title = 'Kỹ sư Xây dựng', description = 'Giám sát thi công các dự án bất động sản cao cấp Vinhomes trên toàn quốc.', location = 'Hà Nội', requirements = 'Bằng kỹ sư Xây dựng, AutoCAD, MS Project, 2+ năm' WHERE title LIKE 'Ky su Xay dung%';

UPDATE job_posts SET title = 'Chuyên viên Kinh doanh BĐS', description = 'Tư vấn và bán các căn hộ Vinhomes, biệt thự và shophouse cho khách hàng.', location = 'TP. Hồ Chí Minh', requirements = 'Sales, BĐS, Giao tiếp, 1+ năm kinh nghiệm' WHERE title LIKE 'Chuyen vien Kinh doanh BDS%';

UPDATE job_posts SET title = 'Điều phối Logistics', description = 'Điều phối vận chuyển và kho hàng cho hệ thống fulfillment của Shopee.', location = 'TP. Hồ Chí Minh', requirements = 'Logistics, WMS, Excel, 1+ năm kinh nghiệm' WHERE title LIKE 'Logistics Coordinator%';

UPDATE job_posts SET title = 'Phân tích Chuỗi cung ứng', description = 'Phân tích và tối ưu hóa chuỗi cung ứng cho các sản phẩm trên Tiki.', location = 'TP. Hồ Chí Minh', requirements = 'Supply Chain, Data Analysis, SQL, Excel, 2+ năm' WHERE title LIKE 'Supply Chain%';

UPDATE job_posts SET title = 'Chuyên viên Xuất nhập khẩu', description = 'Quản lý thủ tục xuất nhập khẩu cho các sản phẩm điện tử của VinFast.', location = 'Hà Nội', requirements = 'XNK, Customs, Logistics, English, 2+ năm' WHERE title LIKE 'Import/Export%';

UPDATE job_posts SET title = 'Quản lý Khách sạn', description = 'Quản lý vận hành khách sạn 5 sao thuộc hệ thống Saigontourist.', location = 'TP. Hồ Chí Minh', requirements = 'Hotel Management, English, 5+ năm kinh nghiệm' WHERE title LIKE 'Quan ly Khach san%';

UPDATE job_posts SET title = 'Hướng dẫn viên Du lịch', description = 'Dẫn đoàn khách du lịch trong nước và quốc tế tại các điểm đến nổi tiếng Việt Nam.', location = 'TP. Hồ Chí Minh', requirements = 'Thẻ hướng dẫn viên, Tiếng Anh/Trung, 1+ năm' WHERE title LIKE 'Huong dan vien%';

UPDATE job_posts SET title = 'Lễ tân Khách sạn', description = 'Đón tiếp và hỗ trợ khách hàng tại khách sạn 5 sao. Làm việc theo ca.', location = 'Đà Nẵng', requirements = 'Tiếng Anh, Ngoại hình, Giao tiếp, Hotel Management' WHERE title LIKE 'Reception%';

UPDATE job_posts SET title = 'Tư vấn Pháp lý', description = 'Tư vấn pháp lý cho các hoạt động kinh doanh, hợp đồng và tuân thủ pháp luật của Shopee tại Việt Nam.', location = 'TP. Hồ Chí Minh', requirements = 'Bằng cử nhân Luật, Thẻ luật sư, Thương mại điện tử, 3+ năm' WHERE title LIKE 'Legal Counsel%';

UPDATE job_posts SET title = 'Chuyên viên Tuân thủ', description = 'Đảm bảo tuân thủ các quy định pháp luật về tài chính và thanh toán điện tử.', location = 'TP. Hồ Chí Minh', requirements = 'Compliance, Fintech Regulations, 3+ năm' WHERE title LIKE 'Compliance%';

UPDATE job_posts SET title = 'Content Creator (Video)', description = 'Sản xuất video ngắn cho TikTok và YouTube Shorts quảng bá thương hiệu Shopee.', location = 'TP. Hồ Chí Minh', requirements = 'Video Editing, Premiere Pro, TikTok, 1+ năm' WHERE title LIKE 'Content Creator%';

UPDATE job_posts SET title = 'Chuyên viên PR', description = 'Quản lý truyền thông và quan hệ báo chí cho Vingroup và các công ty thành viên.', location = 'Hà Nội', requirements = 'PR, Media Relations, Crisis Communication, 3+ năm' WHERE title LIKE 'PR Specialist%';

UPDATE job_posts SET title = 'Biên tập viên Nội dung', description = 'Viết nội dung sáng tạo cho website, ứng dụng và các chiến dịch quảng cáo của MoMo.', location = 'TP. Hồ Chí Minh', requirements = 'Copywriting, Content Strategy, Creativity, 1+ năm' WHERE title LIKE 'Copywriter%';

UPDATE job_posts SET title = 'Cộng tác viên Viết bài (Part-time)', description = 'Viết bài SEO cho blog Tiki về công nghệ, lifestyle và mua sắm thông minh.', location = 'Remote', requirements = 'Content Writing, SEO, Tiếng Việt tốt' WHERE title LIKE 'Part-time%';

UPDATE job_posts SET title = 'Freelance Thiết kế UI', description = 'Thiết kế giao diện cho các dự án nội bộ của FPT Software (làm việc từ xa).', location = 'Remote', requirements = 'Figma, UI Design, Responsive Design, 2+ năm' WHERE title LIKE 'Freelance%';

SELECT 'Done! Fixed all Vietnamese encoding.' as result;
