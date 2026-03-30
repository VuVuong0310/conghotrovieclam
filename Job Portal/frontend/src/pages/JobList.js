import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JobService from '../services/JobService';

function JobList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    minSalary: '',
    employmentType: '',
    category: ''
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchJobs();
  }, [currentPage]);

  const fetchJobs = async (searchFilters = filters) => {
    try {
      setSearching(true);
      const params = {
        page: currentPage,
        size: 10
      };

      if (searchFilters.keyword) params.keyword = searchFilters.keyword;
      if (searchFilters.location) params.location = searchFilters.location;
      if (searchFilters.minSalary) params.minSalary = parseFloat(searchFilters.minSalary) * 1000000;
      if (searchFilters.employmentType) params.employmentType = searchFilters.employmentType;
      if (searchFilters.category) params.category = searchFilters.category;

      const response = await JobService.searchJobs(params);
      const data = response.data;

      if (data.content) {
        setJobs(data.content);
        setTotalPages(data.totalPages || 0);
      } else {
        setJobs(data);
        setTotalPages(1);
      }

      setLoading(false);
      setSearching(false);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
      setLoading(false);
      setSearching(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchJobs();
  };

  const handleViewDetails = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(salary);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <div className="jp-loading-page"><div className="jp-spinner"></div><p>Đang tải danh sách công việc...</p></div>;
  }

  return (
    <div className="jp-container">
      {/* Search Hero */}
      <div className="jp-search-hero">
        <h1><i className="bi bi-search me-2"></i>Tìm Việc Làm</h1>
        <p>Khám phá hàng nghìn cơ hội việc làm phù hợp với bạn</p>
        <form onSubmit={handleSearch} className="search-box">
          <div className="row g-2">
            <div className="col-md-3">
              <input type="text" name="keyword" placeholder="Tên công việc, kỹ năng..." value={filters.keyword} onChange={handleFilterChange} className="form-control" />
            </div>
            <div className="col-md-3">
              <input type="text" name="location" placeholder="Địa điểm" value={filters.location} onChange={handleFilterChange} className="form-control" />
            </div>
            <div className="col-md-2">
              <select name="employmentType" value={filters.employmentType} onChange={handleFilterChange} className="form-select">
                <option value="">Loại hình</option>
                <option value="Full-time">Toàn thời gian</option>
                <option value="Part-time">Bán thời gian</option>
                <option value="Contract">Hợp đồng</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div className="col-md-2">
              <input type="number" name="minSalary" placeholder="Lương tối thiểu (tr)" value={filters.minSalary} onChange={handleFilterChange} className="form-control" />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-search w-100" disabled={searching}>
                {searching ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-search me-1"></i>}Tìm kiếm
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">
          {jobs.length > 0 ? <><i className="bi bi-briefcase me-2"></i>Tìm thấy {jobs.length} công việc</> : <><i className="bi bi-inbox me-2"></i>Không tìm thấy công việc nào</>}
        </h5>
        {searching && <span className="spinner-border spinner-border-sm text-primary"></span>}
      </div>

      {/* Job Cards */}
      <div className="d-flex flex-column gap-3">
        {jobs.map((job) => (
          <div key={job.id} className="jp-job-card">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="job-title mb-1">{job.title}</h6>
                <div className="d-flex flex-wrap gap-3 text-muted" style={{ fontSize: '.85rem' }}>
                  <span><i className="bi bi-building me-1"></i>{job.companyName || 'Công ty'}</span>
                  <span><i className="bi bi-geo-alt me-1"></i>{job.location || 'Việt Nam'}</span>
                  <span><i className="bi bi-cash-stack me-1"></i>{formatSalary(job.salary)}</span>
                </div>
              </div>
              <div className="text-end">
                <span className="jp-badge jp-badge-success">{job.employmentType || 'Full-time'}</span>
                <div className="text-muted mt-1" style={{ fontSize: '.8rem' }}><i className="bi bi-calendar3 me-1"></i>{formatDate(job.postedDate)}</div>
              </div>
            </div>
            <p className="text-muted mb-3" style={{ fontSize: '.88rem' }}>{job.description ? job.description.substring(0, 200) + '...' : 'Mô tả công việc sẽ được cập nhật...'}</p>
            <button onClick={() => handleViewDetails(job.id)} className="btn btn-primary btn-sm"><i className="bi bi-eye me-1"></i>Xem chi tiết</button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-4">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}><i className="bi bi-chevron-left"></i></button>
            </li>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(totalPages - 1, currentPage - 2 + i));
              return (
                <li key={pageNum} className={`page-item ${pageNum === currentPage ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(pageNum)}>{pageNum + 1}</button>
                </li>
              );
            })}
            <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}><i className="bi bi-chevron-right"></i></button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default JobList;
