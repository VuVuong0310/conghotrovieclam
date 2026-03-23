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
    return (
      <div className="container">
        <div className="text-center" style={{ padding: '4rem 0' }}>
          <div className="loading" style={{ width: '60px', height: '60px', margin: '0 auto 1rem' }}></div>
          <p>Đang tải danh sách công việc...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="job-search-section" style={{
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        color: 'white'
      }}>
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>🔍 Tìm Việc Làm</h1>

        <form onSubmit={handleSearch} className="search-form" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div className="form-group">
            <input
              type="text"
              name="keyword"
              placeholder="Tên công việc, kỹ năng..."
              value={filters.keyword}
              onChange={handleFilterChange}
              className="form-control"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                color: '#1f2937'
              }}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="location"
              placeholder="Địa điểm"
              value={filters.location}
              onChange={handleFilterChange}
              className="form-control"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                color: '#1f2937'
              }}
            />
          </div>

          <div className="form-group">
            <select
              name="employmentType"
              value={filters.employmentType}
              onChange={handleFilterChange}
              className="form-control"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                color: '#1f2937'
              }}
            >
              <option value="">Loại hình</option>
              <option value="Full-time">Toàn thời gian</option>
              <option value="Part-time">Bán thời gian</option>
              <option value="Contract">Hợp đồng</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>

          <div className="form-group">
            <input
              type="number"
              name="minSalary"
              placeholder="Lương tối thiểu (triệu VND)"
              value={filters.minSalary}
              onChange={handleFilterChange}
              className="form-control"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                color: '#1f2937'
              }}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={searching}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: '600'
              }}
            >
              {searching ? (
                <>
                  <div className="loading" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                  Đang tìm...
                </>
              ) : (
                '🔍 Tìm kiếm'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="jobs-results">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>
            {jobs.length > 0 ? `Tìm thấy ${jobs.length} công việc` : 'Không tìm thấy công việc nào'}
          </h2>
          {searching && <div className="loading" style={{ width: '24px', height: '24px' }}></div>}
        </div>

        <div className="jobs-grid" style={{
          display: 'grid',
          gap: '1rem'
        }}>
          {jobs.map((job, index) => (
            <div
              key={job.id}
              className="job-card"
              style={{}}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem', color: '#2563eb' }}>
                    {job.title}
                  </h3>
                  <div className="job-meta">
                    <span>🏢 {job.companyName || 'Công ty'}</span>
                    <span>📍 {job.location || 'Việt Nam'}</span>
                    <span>💰 {formatSalary(job.salary)}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    backgroundColor: '#22c55e',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>
                    {job.employmentType || 'Full-time'}
                  </span>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#6b7280' }}>
                    📅 {formatDate(job.postedDate)}
                  </p>
                </div>
              </div>

              <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                {job.description ? job.description.substring(0, 200) + '...' : 'Mô tả công việc sẽ được cập nhật...'}
              </p>

              <div className="job-actions">
                <button
                  onClick={() => handleViewDetails(job.id)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.9rem' }}
                >
                  📋 Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="btn"
              style={{
                backgroundColor: currentPage === 0 ? '#e5e7eb' : '#2563eb',
                color: currentPage === 0 ? '#6b7280' : 'white'
              }}
            >
              ← Trước
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(totalPages - 1, currentPage - 2 + i));
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className="btn"
                  style={{
                    backgroundColor: pageNum === currentPage ? '#2563eb' : '#e5e7eb',
                    color: pageNum === currentPage ? 'white' : '#1f2937',
                    minWidth: '40px'
                  }}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="btn"
              style={{
                backgroundColor: currentPage >= totalPages - 1 ? '#e5e7eb' : '#2563eb',
                color: currentPage >= totalPages - 1 ? '#6b7280' : 'white'
              }}
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobList;
