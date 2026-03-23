import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JobApplicationService from '../services/JobApplicationService';

function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [currentPage]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await JobApplicationService.getMyApplications(currentPage, 10);
      const data = response.data;

      if (data.content) {
        setApplications(data.content);
        setTotalPages(data.totalPages || 0);
      } else {
        setApplications(data);
        setTotalPages(1);
      }

      setLoading(false);
    } catch (err) {
      setError('Không thể tải danh sách ứng tuyển');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await JobApplicationService.getApplicationStats();
      setStats(response.data);
    } catch (err) {
      // Stats not critical, ignore error
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 'var(--info-color)';
      case 'REVIEWING':
        return 'var(--warning-color)';
      case 'INTERVIEW':
        return 'var(--primary-color)';
      case 'ACCEPTED':
        return 'var(--success-color)';
      case 'REJECTED':
        return 'var(--error-color)';
      case 'WITHDRAWN':
        return 'var(--text-secondary)';
      default:
        return 'var(--border-color)';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'SUBMITTED': '📝 Đã nộp',
      'REVIEWING': '👁️ Đang xem xét',
      'INTERVIEW': '🎤 Mời phỏng vấn',
      'ACCEPTED': '✅ Chấp nhận',
      'REJECTED': '❌ Từ chối',
      'WITHDRAWN': '🔙 Đã rút lại'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return '📝';
      case 'REVIEWING':
        return '👁️';
      case 'INTERVIEW':
        return '🎤';
      case 'ACCEPTED':
        return '🎉';
      case 'REJECTED':
        return '😔';
      case 'WITHDRAWN':
        return '🔙';
      default:
        return '📄';
    }
  };

  const filteredApplications = filter === 'ALL'
    ? applications
    : applications.filter(app => app.status === filter);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(salary);
  };

  const handleWithdraw = async (applicationId) => {
    if (window.confirm('Bạn có chắc muốn rút lại đơn ứng tuyển này?')) {
      try {
        await JobApplicationService.withdrawApplication(applicationId);
        fetchApplications(); // Refresh list
        alert('Đã rút lại đơn ứng tuyển thành công');
      } catch (err) {
        alert('Không thể rút lại đơn ứng tuyển');
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center" style={{ padding: '4rem 0' }}>
          <div className="loading" style={{ width: '60px', height: '60px', margin: '0 auto 1rem' }}></div>
          <p>Đang tải danh sách ứng tuyển...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{
      animation: 'fadeIn 0.6s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
        color: 'white',
        padding: '2rem',
        borderRadius: 'var(--border-radius)',
        marginBottom: '2rem',
        animation: 'slideInScale 0.6s ease-out'
      }}>
        <h1 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
          📋 Đơn Ứng Tuyển Của Tôi
        </h1>
        <p style={{ textAlign: 'center', opacity: 0.9 }}>
          Theo dõi trạng thái các đơn ứng tuyển của bạn
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{
          animation: 'shake 0.5s ease-in-out',
          marginBottom: '2rem'
        }}>
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          animation: 'slideInUp 0.8s ease-out'
        }}>
          <div className="stat-card" style={{
            backgroundColor: 'var(--card-bg)',
            padding: '1.5rem',
            borderRadius: 'var(--border-radius)',
            textAlign: 'center',
            boxShadow: 'var(--shadow)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {stats.totalApplications || 0}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Tổng đơn
            </div>
          </div>

          <div className="stat-card" style={{
            backgroundColor: 'var(--card-bg)',
            padding: '1.5rem',
            borderRadius: 'var(--border-radius)',
            textAlign: 'center',
            boxShadow: 'var(--shadow)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎤</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>
              {stats.interviewCount || 0}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Mời phỏng vấn
            </div>
          </div>

          <div className="stat-card" style={{
            backgroundColor: 'var(--card-bg)',
            padding: '1.5rem',
            borderRadius: 'var(--border-radius)',
            textAlign: 'center',
            boxShadow: 'var(--shadow)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
              {stats.acceptedCount || 0}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Được chấp nhận
            </div>
          </div>

          <div className="stat-card" style={{
            backgroundColor: 'var(--card-bg)',
            padding: '1.5rem',
            borderRadius: 'var(--border-radius)',
            textAlign: 'center',
            boxShadow: 'var(--shadow)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--info-color)' }}>
              {stats.successRate ? Math.round(stats.successRate * 100) : 0}%
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Tỷ lệ thành công
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="filter-section" style={{
        backgroundColor: 'var(--card-bg)',
        padding: '1.5rem',
        borderRadius: 'var(--border-radius)',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow)',
        animation: 'slideInLeft 0.7s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
            🔍 Lọc theo trạng thái:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-control"
            style={{
              padding: '0.5rem 1rem',
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--bg-color)',
              minWidth: '200px'
            }}
          >
            <option value="ALL">🎯 Tất cả trạng thái</option>
            <option value="SUBMITTED">📝 Đã nộp</option>
            <option value="REVIEWING">👁️ Đang xem xét</option>
            <option value="INTERVIEW">🎤 Mời phỏng vấn</option>
            <option value="ACCEPTED">✅ Chấp nhận</option>
            <option value="REJECTED">❌ Từ chối</option>
            <option value="WITHDRAWN">🔙 Đã rút lại</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="empty-state" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow)',
          animation: 'slideInScale 0.6s ease-out'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {filter === 'ALL' ? 'Bạn chưa ứng tuyển công việc nào' : 'Không có đơn ứng tuyển nào với trạng thái này'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Hãy bắt đầu tìm kiếm và ứng tuyển các công việc phù hợp với bạn!
          </p>
          <button
            onClick={() => navigate('/jobs')}
            className="btn btn-primary"
            style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
          >
            🔍 Tìm việc ngay
          </button>
        </div>
      ) : (
        <div className="applications-list" style={{
          display: 'grid',
          gap: '1.5rem',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          {filteredApplications.map((app, index) => (
            <div
              key={app.id}
              className="application-card"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow)',
                overflow: 'hidden',
                animationDelay: `${index * 0.1}s`,
                borderLeft: `4px solid ${getStatusColor(app.status)}`
              }}
            >
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-color)',
                background: `linear-gradient(90deg, ${getStatusColor(app.status)}15, transparent)`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{
                      marginBottom: '0.5rem',
                      color: 'var(--primary-color)',
                      fontSize: '1.3rem'
                    }}>
                      {app.jobPost?.title || 'Công việc'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>🏢 {app.jobPost?.companyName || app.jobPost?.employer?.username || 'Công ty'}</span>
                      <span>📍 {app.jobPost?.location || 'Việt Nam'}</span>
                      <span>💰 {formatSalary(app.jobPost?.salary)}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: getStatusColor(app.status),
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      <span>{getStatusIcon(app.status)}</span>
                      <span>{getStatusLabel(app.status)}</span>
                    </div>
                    <p style={{
                      margin: '0.5rem 0 0',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)'
                    }}>
                      📅 {formatDate(app.appliedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    marginBottom: '1rem'
                  }}>
                    {app.jobPost?.description?.substring(0, 200) || 'Mô tả công việc sẽ được cập nhật...'}
                    {app.jobPost?.description?.length > 200 && '...'}
                  </p>
                </div>

                {/* Status-specific messages */}
                {app.status === 'INTERVIEW' && (
                  <div className="alert alert-success" style={{
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    border: '1px solid var(--success-color)',
                    color: 'var(--success-color)',
                    borderRadius: 'var(--border-radius)',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    🎉 <strong>Chúc mừng!</strong> Bạn được mời phỏng vấn. Vui lòng kiểm tra email để biết chi tiết lịch phỏng vấn.
                  </div>
                )}

                {app.status === 'ACCEPTED' && (
                  <div className="alert alert-success" style={{
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    border: '1px solid var(--success-color)',
                    color: 'var(--success-color)',
                    borderRadius: 'var(--border-radius)',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    🎊 <strong>Xin chúc mừng!</strong> Bạn đã được chấp nhận. Hãy liên hệ công ty để làm các thủ tục tiếp theo.
                  </div>
                )}

                {app.status === 'REJECTED' && (
                  <div className="alert alert-danger" style={{
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    border: '1px solid var(--error-color)',
                    color: 'var(--error-color)',
                    borderRadius: 'var(--border-radius)',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    😔 Rất tiếc, đơn ứng tuyển của bạn không được chấp nhận. Hãy thử ứng tuyển các công việc khác phù hợp hơn.
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate(`/job/${app.jobPost?.id}`)}
                    className="btn"
                    style={{
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--border-radius)',
                      fontSize: '0.9rem'
                    }}
                  >
                    👁️ Xem chi tiết
                  </button>

                  {(app.status === 'SUBMITTED' || app.status === 'REVIEWING') && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="btn"
                      style={{
                        backgroundColor: 'var(--error-color)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--border-radius)',
                        fontSize: '0.9rem'
                      }}
                    >
                      🔙 Rút lại
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
              backgroundColor: currentPage === 0 ? 'var(--border-color)' : 'var(--primary-color)',
              color: currentPage === 0 ? 'var(--text-secondary)' : 'white'
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
                  backgroundColor: pageNum === currentPage ? 'var(--primary-color)' : 'var(--border-color)',
                  color: pageNum === currentPage ? 'white' : 'var(--text-primary)',
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
              backgroundColor: currentPage >= totalPages - 1 ? 'var(--border-color)' : 'var(--primary-color)',
              color: currentPage >= totalPages - 1 ? 'var(--text-secondary)' : 'white'
            }}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}

export default MyApplications;
