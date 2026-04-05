import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyService from '../services/CompanyService';

function CompanyList() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const res = await CompanyService.getCompanies();
      setCompanies(res.data || []);
    } catch (error) {
      console.error('Failed to load companies', error);
    } finally {
      setLoading(false);
    }
  };

  const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))];

  const filteredCompanies = companies.filter(c => {
    const matchSearch = !searchTerm || 
      (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchIndustry = !filterIndustry || c.industry === filterIndustry;
    return matchSearch && matchIndustry;
  });

  if (loading) {
    return <div className="jp-loading-page"><div className="jp-spinner"></div><p>Đang tải danh sách công ty...</p></div>;
  }

  return (
    <div className="jp-container">
      {/* Header */}
      <div className="jp-page-header">
        <h1><i className="bi bi-building me-2"></i>Doanh Nghiệp Tuyển Dụng</h1>
        <p>Khám phá các công ty hàng đầu đang tìm kiếm nhân tài</p>
      </div>

      {/* Search & Filter */}
      <div className="jp-filter-bar">
        <div className="jp-filter-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm công ty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)} className="form-select" style={{ maxWidth: '250px' }}>
          <option value="">Tất cả ngành nghề</option>
          {industries.map(ind => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <div className="mb-3">
        <span className="text-muted" style={{ fontSize: '.9rem' }}>
          Hiển thị {filteredCompanies.length} công ty
        </span>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="jp-empty-state">
          <i className="bi bi-building"></i>
          <h3>Không tìm thấy công ty nào</h3>
          <p>Thử thay đổi từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="jp-companies-list-grid">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="jp-company-card-lg">
              <div className="jp-company-card-header">
                <div className="jp-company-logo-xl">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.companyName} />
                  ) : (
                    <span>{(company.companyName || 'C').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="jp-company-card-info">
                  <h5>{company.companyName || 'Chưa cập nhật'}</h5>
                  <div className="jp-company-card-badges">
                    {company.industry && <span className="jp-badge jp-badge-primary">{company.industry}</span>}
                    {company.companySize && <span className="jp-badge jp-badge-secondary">{company.companySize}</span>}
                  </div>
                </div>
              </div>
              {company.companyDescription && (
                <p className="jp-company-desc">{company.companyDescription.substring(0, 150)}{company.companyDescription.length > 150 ? '...' : ''}</p>
              )}
              <div className="jp-company-card-details">
                {company.address && <span><i className="bi bi-geo-alt"></i> {company.address}</span>}
                {company.website && <span><i className="bi bi-globe"></i> {company.website}</span>}
                {company.phone && <span><i className="bi bi-telephone"></i> {company.phone}</span>}
              </div>
              <div className="jp-company-card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(company.companyName || '')}`)}>
                  <i className="bi bi-briefcase me-1"></i>Xem việc làm
                </button>
                {company.website && (
                  <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-box-arrow-up-right me-1"></i>Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanyList;
