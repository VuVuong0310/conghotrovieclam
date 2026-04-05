import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import JobService from '../services/JobService';
import axios from 'axios';
import API_BASE from '../config/api';

function JobList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: '',
    minSalary: '',
    employmentType: '',
    category: ''
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [currentPage]);

  useEffect(() => {
    const kw = searchParams.get('keyword');
    if (kw && kw !== filters.keyword) {
      const newFilters = { ...filters, keyword: kw };
      setFilters(newFilters);
      setCurrentPage(0);
      fetchJobs(newFilters);
    }
  }, [searchParams]);

  const loadCategories = async () => {
    try {
      const res = await axios.get(API_BASE + '/categories');
      setCategories(res.data || []);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const fetchJobs = async (searchFilters = filters) => {
    try {
      setSearching(true);
      const params = { page: currentPage, size: 10 };
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
        setTotalElements(data.totalElements || data.content.length);
      } else {
        setJobs(data);
        setTotalPages(1);
        setTotalElements(data.length);
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
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchJobs();
  };

  const handleCategoryClick = (categoryName) => {
    const newFilters = { ...filters, category: filters.category === categoryName ? '' : categoryName };
    setFilters(newFilters);
    setCurrentPage(0);
    fetchJobs(newFilters);
  };

  const handleTypeClick = (type) => {
    const newFilters = { ...filters, employmentType: filters.employmentType === type ? '' : type };
    setFilters(newFilters);
    setCurrentPage(0);
    fetchJobs(newFilters);
  };

  const clearAllFilters = () => {
    const cleared = { keyword: '', location: '', minSalary: '', employmentType: '', category: '' };
    setFilters(cleared);
    setCurrentPage(0);
    fetchJobs(cleared);
  };

  const handleViewDetails = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(salary);
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  const employmentTypes = [
    { value: 'Full-time', label: 'Toàn thời gian', icon: 'bi-clock-fill' },
    { value: 'Part-time', label: 'Bán thời gian', icon: 'bi-clock-history' },
    { value: 'Contract', label: 'Hợp đồng', icon: 'bi-file-earmark-text' },
    { value: 'Freelance', label: 'Freelance', icon: 'bi-laptop' }
  ];

  const hasActiveFilters = filters.keyword || filters.location || filters.minSalary || filters.employmentType || filters.category;

  if (loading) {
    return <div className="jp-loading-page"><div className="jp-spinner"></div><p>Đang tải danh sách công việc...</p></div>;
  }

  return (
    <div className="jp-container-wide">
      {/* Search Hero */}
      <div className="jp-search-hero">
        <h1><i className="bi bi-search me-2"></i>Tìm Việc Làm</h1>
        <p>Khám phá hàng nghìn cơ hội việc làm phù hợp với bạn</p>
        <form onSubmit={handleSearch} className="search-box">
          <div className="row g-2">
            <div className="col-md-5">
              <input type="text" name="keyword" placeholder="Tên công việc, kỹ năng, công ty..." value={filters.keyword} onChange={handleFilterChange} className="form-control" />
            </div>
            <div className="col-md-4">
              <input type="text" name="location" placeholder="Địa điểm làm việc" value={filters.location} onChange={handleFilterChange} className="form-control" />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-search w-100" disabled={searching}>
                {searching ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-search me-1"></i>}Tìm kiếm
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="jp-jobs-layout">
        {/* Sidebar Filters */}
        <aside className={`jp-jobs-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
          <div className="jp-sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={`bi ${sidebarOpen ? 'bi-funnel-fill' : 'bi-funnel'}`}></i>
            {sidebarOpen && <span>Bộ lọc</span>}
            {hasActiveFilters && <span className="jp-filter-count">{[filters.category, filters.employmentType, filters.minSalary].filter(Boolean).length}</span>}
          </div>

          {sidebarOpen && (
            <>
              {hasActiveFilters && (
                <button className="jp-clear-filters" onClick={clearAllFilters}>
                  <i className="bi bi-x-circle me-1"></i>Xóa tất cả bộ lọc
                </button>
              )}

              {/* Employment Type */}
              <div className="jp-filter-group">
                <h6><i className="bi bi-briefcase me-2"></i>Loại Hình</h6>
                <div className="jp-filter-options">
                  {employmentTypes.map(type => (
                    <label key={type.value} className={`jp-filter-option ${filters.employmentType === type.value ? 'active' : ''}`} onClick={() => handleTypeClick(type.value)}>
                      <i className={`bi ${type.icon}`}></i>
                      <span>{type.label}</span>
                      {filters.employmentType === type.value && <i className="bi bi-check-lg ms-auto"></i>}
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="jp-filter-group">
                  <h6><i className="bi bi-grid me-2"></i>Danh Mục</h6>
                  <div className="jp-filter-options jp-filter-scrollable">
                    {categories.map(cat => (
                      <label key={cat.id} className={`jp-filter-option ${filters.category === cat.name ? 'active' : ''}`} onClick={() => handleCategoryClick(cat.name)}>
                        <span>{cat.name}</span>
                        {filters.category === cat.name && <i className="bi bi-check-lg ms-auto"></i>}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Salary */}
              <div className="jp-filter-group">
                <h6><i className="bi bi-cash-stack me-2"></i>Mức Lương Tối Thiểu</h6>
                <input type="number" name="minSalary" placeholder="Triệu VNĐ" value={filters.minSalary} onChange={handleFilterChange} className="form-control form-control-sm" />
                <button className="btn btn-sm btn-outline-primary mt-2 w-100" onClick={handleSearch}>Áp dụng</button>
              </div>
            </>
          )}
        </aside>

        {/* Job Results */}
        <main className="jp-jobs-main">
          {/* Results Header */}
          <div className="jp-results-header">
            <div>
              <h5 className="fw-bold mb-0">
                {totalElements > 0 ? (
                  <><i className="bi bi-briefcase me-2"></i>Tìm thấy {totalElements} công việc</>
                ) : (
                  <><i className="bi bi-inbox me-2"></i>Không tìm thấy công việc nào</>
                )}
              </h5>
              {hasActiveFilters && (
                <div className="jp-active-filters">
                  {filters.keyword && <span className="jp-filter-tag">{filters.keyword} <i className="bi bi-x" onClick={() => { const f = {...filters, keyword: ''}; setFilters(f); fetchJobs(f); }}></i></span>}
                  {filters.employmentType && <span className="jp-filter-tag">{filters.employmentType} <i className="bi bi-x" onClick={() => { const f = {...filters, employmentType: ''}; setFilters(f); fetchJobs(f); }}></i></span>}
                  {filters.category && <span className="jp-filter-tag">{filters.category} <i className="bi bi-x" onClick={() => { const f = {...filters, category: ''}; setFilters(f); fetchJobs(f); }}></i></span>}
                </div>
              )}
            </div>
            {searching && <span className="spinner-border spinner-border-sm text-primary"></span>}
          </div>

          {/* Job Cards */}
          <div className="jp-jobs-list-v2">
            {jobs.map((job) => (
              <div key={job.id} className="jp-job-card-v2" onClick={() => handleViewDetails(job.id)}>
                <div className="jp-job-card-top">
                  <div className="jp-company-avatar">
                    {(job.companyName || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="jp-job-card-info">
                    <h6 className="jp-job-title-v2">{job.title}</h6>
                    <span className="jp-company-name"><i className="bi bi-building me-1"></i>{job.companyName || 'Công ty'}</span>
                  </div>
                  <span className="jp-badge jp-badge-success">{job.employmentType || 'Full-time'}</span>
                </div>
                <div className="jp-job-card-meta">
                  <span><i className="bi bi-geo-alt"></i> {job.location || 'Việt Nam'}</span>
                  <span><i className="bi bi-cash-stack"></i> {formatSalary(job.salary)}</span>
                  {job.category && <span><i className="bi bi-tag"></i> {job.category.name || job.category}</span>}
                </div>
                <p className="jp-job-card-desc">{job.description ? job.description.substring(0, 150) + '...' : 'Mô tả công việc sẽ được cập nhật...'}</p>
                <div className="jp-job-card-footer">
                  <span className="jp-time-ago"><i className="bi bi-clock"></i> {getTimeAgo(job.postedDate)}</span>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(job.id); }}>
                      <i className="bi bi-eye me-1"></i>Chi tiết
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(job.id); }}>
                      <i className="bi bi-send me-1"></i>Ứng tuyển
                    </button>
                  </div>
                </div>
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
        </main>
      </div>
    </div>
  );
}

export default JobList;
