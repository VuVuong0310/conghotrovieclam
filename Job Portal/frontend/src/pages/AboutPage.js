import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CompanyService from '../services/CompanyService';

function AboutPage() {
  const [stats, setStats] = useState({ totalCompanies: 0, totalJobs: 0, totalUsers: 0 });

  useEffect(() => {
    CompanyService.getStats().then(res => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <div className="jp-about-page">
      {/* Hero */}
      <section className="jp-about-hero">
        <div className="jp-about-hero-content">
          <span className="jp-about-label"><i className="bi bi-info-circle me-1"></i>Về chúng tôi</span>
          <h1>Nền Tảng Tuyển Dụng <span className="text-highlight">Hàng Đầu</span></h1>
          <p>JobPortal kết nối ứng viên tài năng với các doanh nghiệp uy tín, tạo ra cơ hội nghề nghiệp tốt nhất cho cộng đồng.</p>
        </div>
      </section>

      {/* Mission */}
      <section className="jp-about-section">
        <div className="jp-about-grid">
          <div className="jp-about-card">
            <div className="jp-about-card-icon bg-blue"><i className="bi bi-bullseye"></i></div>
            <h5>Sứ Mệnh</h5>
            <p>Xây dựng cầu nối vững chắc giữa nhà tuyển dụng và ứng viên, tạo môi trường tuyển dụng minh bạch, hiệu quả và công bằng cho tất cả mọi người.</p>
          </div>
          <div className="jp-about-card">
            <div className="jp-about-card-icon bg-green"><i className="bi bi-eye"></i></div>
            <h5>Tầm Nhìn</h5>
            <p>Trở thành nền tảng tuyển dụng trực tuyến được tin cậy nhất Việt Nam, nơi mọi người đều có thể tìm thấy công việc phù hợp với năng lực và đam mê.</p>
          </div>
          <div className="jp-about-card">
            <div className="jp-about-card-icon bg-purple"><i className="bi bi-heart"></i></div>
            <h5>Giá Trị Cốt Lõi</h5>
            <p>Chúng tôi đề cao sự minh bạch, tôn trọng, đổi mới và cam kết mang lại trải nghiệm tốt nhất cho cả ứng viên và nhà tuyển dụng.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="jp-about-stats">
        <h2>Con Số Ấn Tượng</h2>
        <p className="jp-about-stats-desc">Những thành tựu chúng tôi đạt được nhờ sự tin tưởng của cộng đồng</p>
        <div className="jp-about-stats-grid">
          <div className="jp-about-stat">
            <div className="jp-about-stat-num">{stats.totalCompanies}+</div>
            <div className="jp-about-stat-label">Doanh nghiệp đối tác</div>
          </div>
          <div className="jp-about-stat">
            <div className="jp-about-stat-num">{stats.totalJobs}+</div>
            <div className="jp-about-stat-label">Vị trí tuyển dụng</div>
          </div>
          <div className="jp-about-stat">
            <div className="jp-about-stat-num">{stats.totalUsers}+</div>
            <div className="jp-about-stat-label">Ứng viên đăng ký</div>
          </div>
          <div className="jp-about-stat">
            <div className="jp-about-stat-num">24/7</div>
            <div className="jp-about-stat-label">Hỗ trợ trực tuyến</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="jp-about-section">
        <h2 className="text-center mb-2">Tính Năng Nổi Bật</h2>
        <p className="text-center text-muted mb-5">Hệ thống được thiết kế để mang lại trải nghiệm tốt nhất</p>
        <div className="jp-about-features">
          <div className="jp-about-feature">
            <i className="bi bi-search"></i>
            <h6>Tìm Kiếm Thông Minh</h6>
            <p>Bộ lọc nâng cao giúp tìm kiếm việc làm nhanh chóng theo vị trí, ngành nghề, mức lương.</p>
          </div>
          <div className="jp-about-feature">
            <i className="bi bi-stars"></i>
            <h6>Gợi Ý Việc Làm</h6>
            <p>Hệ thống đề xuất công việc phù hợp dựa trên hồ sơ và sở thích cá nhân.</p>
          </div>
          <div className="jp-about-feature">
            <i className="bi bi-file-earmark-person"></i>
            <h6>Quản Lý Hồ Sơ</h6>
            <p>Tạo và quản lý CV trực tuyến, theo dõi đơn ứng tuyển dễ dàng.</p>
          </div>
          <div className="jp-about-feature">
            <i className="bi bi-bell"></i>
            <h6>Thông Báo Tức Thì</h6>
            <p>Nhận thông báo ngay khi có phản hồi từ nhà tuyển dụng hoặc việc làm mới.</p>
          </div>
          <div className="jp-about-feature">
            <i className="bi bi-building"></i>
            <h6>Hồ Sơ Doanh Nghiệp</h6>
            <p>Xem thông tin chi tiết về công ty, ngành nghề và quy mô tuyển dụng.</p>
          </div>
          <div className="jp-about-feature">
            <i className="bi bi-shield-check"></i>
            <h6>Bảo Mật Thông Tin</h6>
            <p>Hệ thống bảo mật hiện đại, đảm bảo an toàn thông tin cá nhân.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="jp-about-cta">
        <h2>Bắt Đầu Ngay Hôm Nay!</h2>
        <p>Tham gia cộng đồng và khám phá cơ hội nghề nghiệp tuyệt vời</p>
        <div className="jp-about-cta-buttons">
          <Link to="/register" className="btn btn-light btn-lg"><i className="bi bi-person-plus me-2"></i>Đăng Ký Tài Khoản</Link>
          <Link to="/jobs" className="btn btn-outline-light btn-lg"><i className="bi bi-search me-2"></i>Tìm Việc Làm</Link>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
