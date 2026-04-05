import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import JobService from '../services/JobService';
import CompanyService from '../services/CompanyService';
import AuthService from '../services/AuthService';

function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalCompanies: 0, totalJobs: 0, totalUsers: 0 });
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [newJobs, setNewJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, trendingRes, newRes, companiesRes] = await Promise.all([
        CompanyService.getStats(),
        JobService.getTrendingJobs(6),
        JobService.getNewJobs(14, 6),
        CompanyService.getCompanies()
      ]);
      setStats(statsRes.data);
      setFeaturedJobs(trendingRes.data || []);
      setNewJobs(newRes.data || []);
      setCompanies(companiesRes.data || []);
    } catch (error) {
      console.error('Failed to load homepage data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?keyword=${encodeURIComponent(keyword)}`);
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(salary);
  };

  if (loading) {
    return <div className="jp-loading-page"><div className="jp-spinner"></div><p>Đang tải...</p></div>;
  }

  return (
    <div className="jp-homepage">
      {/* Hero Section */}
      <section className="jp-hero">
        <div className="jp-hero-content">
          <h1>Kết Nối <span className="text-highlight">Tài Năng</span> Với Cơ Hội</h1>
          <p className="jp-hero-subtitle">Nền tảng tuyển dụng hàng đầu giúp bạn tìm kiếm công việc mơ ước hoặc ứng viên tài năng</p>
          <form onSubmit={handleSearch} className="jp-hero-search">
            <div className="jp-hero-search-inner">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm vị trí, công ty, kỹ năng..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button type="submit">Tìm Kiếm</button>
            </div>
          </form>
          <div className="jp-hero-tags">
            <span>Phổ biến:</span>
            <Link to="/jobs?keyword=Developer">Developer</Link>
            <Link to="/jobs?keyword=Designer">Designer</Link>
            <Link to="/jobs?keyword=Marketing">Marketing</Link>
            <Link to="/jobs?keyword=Sales">Sales</Link>
          </div>
        </div>
        <div className="jp-hero-visual">
          <div className="jp-hero-blob"></div>
          <div className="jp-hero-float-card card-1">
            <i className="bi bi-briefcase-fill"></i>
            <div>
              <strong>{stats.totalJobs}+</strong>
              <span>Việc làm</span>
            </div>
          </div>
          <div className="jp-hero-float-card card-2">
            <i className="bi bi-building"></i>
            <div>
              <strong>{stats.totalCompanies}+</strong>
              <span>Công ty</span>
            </div>
          </div>
          <div className="jp-hero-float-card card-3">
            <i className="bi bi-people-fill"></i>
            <div>
              <strong>{stats.totalUsers}+</strong>
              <span>Ứng viên</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="jp-stats-section">
        <div className="jp-stats-grid">
          <div className="jp-stat-item">
            <div className="jp-stat-icon-lg bg-blue"><i className="bi bi-building"></i></div>
            <div className="jp-stat-number">{stats.totalCompanies}+</div>
            <div className="jp-stat-text">Doanh Nghiệp</div>
          </div>
          <div className="jp-stat-item">
            <div className="jp-stat-icon-lg bg-green"><i className="bi bi-briefcase-fill"></i></div>
            <div className="jp-stat-number">{stats.totalJobs}+</div>
            <div className="jp-stat-text">Vị Trí Tuyển Dụng</div>
          </div>
          <div className="jp-stat-item">
            <div className="jp-stat-icon-lg bg-purple"><i className="bi bi-people-fill"></i></div>
            <div className="jp-stat-number">{stats.totalUsers}+</div>
            <div className="jp-stat-text">Ứng Viên</div>
          </div>
          <div className="jp-stat-item">
            <div className="jp-stat-icon-lg bg-orange"><i className="bi bi-hand-thumbs-up-fill"></i></div>
            <div className="jp-stat-number">98%</div>
            <div className="jp-stat-text">Hài Lòng</div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="jp-section">
        <div className="jp-section-header">
          <div>
            <h2><i className="bi bi-fire me-2"></i>Việc Làm Nổi Bật</h2>
            <p>Các vị trí được quan tâm nhiều nhất</p>
          </div>
          <Link to="/jobs" className="btn btn-outline-primary">Xem tất cả <i className="bi bi-arrow-right"></i></Link>
        </div>
        <div className="jp-jobs-grid">
          {featuredJobs.slice(0, 6).map((job) => (
            <div key={job.id} className="jp-job-card-v2" onClick={() => navigate(`/job/${job.id}`)}>
              <div className="jp-job-card-top">
                <div className="jp-company-avatar">
                  {(job.companyName || 'C').charAt(0).toUpperCase()}
                </div>
                <div className="jp-job-card-info">
                  <h6 className="jp-job-title-v2">{job.title}</h6>
                  <span className="jp-company-name">{job.companyName || 'Công ty'}</span>
                </div>
                <span className="jp-badge jp-badge-success">{job.employmentType || 'Full-time'}</span>
              </div>
              <div className="jp-job-card-meta">
                <span><i className="bi bi-geo-alt"></i> {job.location || 'Việt Nam'}</span>
                <span><i className="bi bi-cash-stack"></i> {formatSalary(job.salary)}</span>
              </div>
              <p className="jp-job-card-desc">{job.description ? job.description.substring(0, 100) + '...' : ''}</p>
              <div className="jp-job-card-footer">
                <span className="jp-time-ago"><i className="bi bi-clock"></i> {new Date(job.postedDate).toLocaleDateString('vi-VN')}</span>
                <button className="btn btn-primary btn-sm">Ứng tuyển</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Jobs */}
      {newJobs.length > 0 && (
        <section className="jp-section jp-section-alt">
          <div className="jp-section-header">
            <div>
              <h2><i className="bi bi-lightning-fill me-2"></i>Việc Làm Mới Nhất</h2>
              <p>Cập nhật trong 14 ngày gần đây</p>
            </div>
            <Link to="/jobs" className="btn btn-outline-primary">Xem tất cả <i className="bi bi-arrow-right"></i></Link>
          </div>
          <div className="jp-new-jobs-list">
            {newJobs.slice(0, 6).map((job) => (
              <div key={job.id} className="jp-new-job-item" onClick={() => navigate(`/job/${job.id}`)}>
                <div className="jp-company-avatar-sm">
                  {(job.companyName || 'C').charAt(0).toUpperCase()}
                </div>
                <div className="jp-new-job-info">
                  <h6>{job.title}</h6>
                  <div className="jp-new-job-meta">
                    <span><i className="bi bi-building"></i> {job.companyName || 'Công ty'}</span>
                    <span><i className="bi bi-geo-alt"></i> {job.location || 'VN'}</span>
                    <span><i className="bi bi-cash-stack"></i> {formatSalary(job.salary)}</span>
                  </div>
                </div>
                <span className="jp-badge jp-badge-info">{job.employmentType || 'Full-time'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Companies Section */}
      {companies.length > 0 && (
        <section className="jp-section">
          <div className="jp-section-header">
            <div>
              <h2><i className="bi bi-building me-2"></i>Doanh Nghiệp Đồng Hành</h2>
              <p>Các công ty hàng đầu đang tuyển dụng</p>
            </div>
            <Link to="/companies" className="btn btn-outline-primary">Xem tất cả <i className="bi bi-arrow-right"></i></Link>
          </div>
          <div className="jp-companies-grid">
            {companies.slice(0, 8).map((company) => (
              <div key={company.id} className="jp-company-card" onClick={() => navigate(`/companies/${company.id}`)}>
                <div className="jp-company-logo-lg">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.companyName} />
                  ) : (
                    <span>{(company.companyName || 'C').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <h6>{company.companyName || 'Chưa cập nhật'}</h6>
                <span className="jp-company-industry">{company.industry || 'Đang cập nhật'}</span>
                {company.companySize && <span className="jp-badge jp-badge-secondary">{company.companySize}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="jp-cta-section">
        <div className="jp-cta-content">
          <h2>Sẵn Sàng Bắt Đầu Hành Trình?</h2>
          <p>Đăng ký ngay để khám phá hàng nghìn cơ hội việc làm hoặc tìm kiếm ứng viên tài năng</p>
          <div className="jp-cta-buttons">
            {!AuthService.isLoggedIn() ? (
              <>
                <Link to="/register" className="btn btn-light btn-lg"><i className="bi bi-person-plus me-2"></i>Đăng Ký Ngay</Link>
                <Link to="/login" className="btn btn-outline-light btn-lg"><i className="bi bi-box-arrow-in-right me-2"></i>Đăng Nhập</Link>
              </>
            ) : (
              <Link to="/jobs" className="btn btn-light btn-lg"><i className="bi bi-search me-2"></i>Tìm Việc Ngay</Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="jp-footer">
        <div className="jp-footer-content">
          <div className="jp-footer-brand">
            <h5><i className="bi bi-briefcase-fill me-2"></i>JobPortal</h5>
            <p>Nền tảng kết nối nhà tuyển dụng và ứng viên hàng đầu Việt Nam</p>
          </div>
          <div className="jp-footer-links">
            <div className="jp-footer-col">
              <h6>Ứng Viên</h6>
              <Link to="/jobs">Tìm việc làm</Link>
              <Link to="/companies">Danh sách công ty</Link>
              <Link to="/recommendations">Việc làm đề xuất</Link>
            </div>
            <div className="jp-footer-col">
              <h6>Nhà Tuyển Dụng</h6>
              <Link to="/create-job">Đăng tuyển</Link>
              <Link to="/employer-dashboard">Quản lý</Link>
            </div>
            <div className="jp-footer-col">
              <h6>Về Chúng Tôi</h6>
              <Link to="/">Giới thiệu</Link>
              <Link to="/">Liên hệ</Link>
            </div>
          </div>
        </div>
        <div className="jp-footer-bottom">
          <p>&copy; 2025 JobPortal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
