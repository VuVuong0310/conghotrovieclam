import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';

function JobListAdvanced() {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: '', category: '', location: '', employmentType: '', sortBy: 'newest' });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    axios.get(`${API_BASE}/categories`).then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, [page, filters.sortBy]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.employmentType) params.append('employmentType', filters.employmentType);
      params.append('sort', filters.sortBy);
      params.append('page', page);
      params.append('size', 12);
      const res = await axios.get(`${API_BASE}/search/jobs?${params.toString()}`);
      setJobs(res.data.content || res.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      try {
        const res = await axios.get(`${API_BASE}/jobs`);
        setJobs(Array.isArray(res.data) ? res.data : res.data.content || []);
      } catch (e) { console.error(e); }
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchJobs();
  };

  const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: value }));

  const formatSalary = (s) => s ? Number(s).toLocaleString('vi-VN') + ' VND' : 'Thỏa thuận';

  return (
    <div>
      {/* Search Hero */}
      <div className="jp-search-hero">
        <div className="container">
          <h2 className="fw-bold text-white mb-3"><i className="bi bi-search me-2"></i>Tìm Kiếm Nâng Cao</h2>
          <form onSubmit={handleSearch}>
            <div className="row g-2">
              <div className="col-md-3">
                <input type="text" className="form-control" placeholder="Từ khóa..." value={filters.keyword} onChange={e => handleFilterChange('keyword', e.target.value)} />
              </div>
              <div className="col-md-2">
                <select className="form-select" value={filters.category} onChange={e => handleFilterChange('category', e.target.value)}>
                  <option value="">Tất cả danh mục</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <input type="text" className="form-control" placeholder="Địa điểm..." value={filters.location} onChange={e => handleFilterChange('location', e.target.value)} />
              </div>
              <div className="col-md-2">
                <select className="form-select" value={filters.employmentType} onChange={e => handleFilterChange('employmentType', e.target.value)}>
                  <option value="">Loại hình</option>
                  <option value="Full-time">Toàn thời gian</option>
                  <option value="Part-time">Bán thời gian</option>
                  <option value="Contract">Hợp đồng</option>
                </select>
              </div>
              <div className="col-md-2">
                <select className="form-select" value={filters.sortBy} onChange={e => handleFilterChange('sortBy', e.target.value)}>
                  <option value="newest">Mới nhất</option>
                  <option value="salary_desc">Lương cao nhất</option>
                  <option value="salary_asc">Lương thấp nhất</option>
                </select>
              </div>
              <div className="col-md-1">
                <button type="submit" className="btn btn-light w-100"><i className="bi bi-search"></i></button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="jp-container">
        {loading ? (
          <div className="jp-loading-page"><div className="jp-spinner"></div></div>
        ) : jobs.length === 0 ? (
          <div className="jp-empty-state">
            <i className="bi bi-inbox"></i>
            <h5>Không tìm thấy kết quả</h5>
            <p>Thử thay đổi bộ lọc để tìm kiếm</p>
          </div>
        ) : (
          <>
            <p className="text-muted mb-3">Tìm thấy <strong>{jobs.length}</strong> công việc phù hợp</p>
            <div className="row g-3">
              {jobs.map(job => (
                <div className="col-md-6 col-lg-4" key={job.id}>
                  <div className="jp-job-card h-100">
                    <h6 className="fw-bold mb-2">{job.title}</h6>
                    <div className="text-muted small mb-2">
                      <span className="me-3"><i className="bi bi-building me-1"></i>{job.employer?.companyName || 'N/A'}</span>
                      <span><i className="bi bi-geo-alt me-1"></i>{job.location || 'N/A'}</span>
                    </div>
                    <div className="mb-3">
                      <span className="jp-badge-primary me-2">{job.employmentType || 'Full-time'}</span>
                      <span className="text-success fw-semibold small"><i className="bi bi-cash-stack me-1"></i>{formatSalary(job.salary)}</span>
                    </div>
                    <Link to={`/jobs/${job.id}`} className="btn btn-outline-primary btn-sm w-100"><i className="bi bi-eye me-1"></i>Xem chi tiết</Link>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p => p - 1)}><i className="bi bi-chevron-left"></i></button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li className={`page-item ${page === i ? 'active' : ''}`} key={i}>
                      <button className="page-link" onClick={() => setPage(i)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p => p + 1)}><i className="bi bi-chevron-right"></i></button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default JobListAdvanced;
