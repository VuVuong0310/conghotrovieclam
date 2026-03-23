import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JobService from '../services/JobService';
import AuthService from '../services/AuthService';
import axios from 'axios';

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await JobService.getJobById(id);
      setJob(response.data);
      setLoading(false);
      // Check if user already applied
      checkIfApplied();
    } catch (err) {
      setError('Không thể tải thông tin công việc');
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/applications/check/${id}`, {
        headers: {
          'Authorization': 'Bearer ' + AuthService.getToken()
        }
      });
      setApplied(response.data.applied);
    } catch (err) {
      // Not applied yet or error
    }
  };

  const handleApply = async () => {
    if (!AuthService.isLoggedIn()) {
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      await axios.post(
        `http://localhost:8080/api/applications/apply/${id}`,
        {},
        {
          headers: {
            'Authorization': 'Bearer ' + AuthService.getToken()
          }
        }
      );
      setApplied(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi ứng tuyển');
    } finally {
      setApplying(false);
    }
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
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center" style={{ padding: '4rem 0' }}>
          <div className="loading" style={{ width: '60px', height: '60px', margin: '0 auto 1rem' }}></div>
          <p>Đang tải thông tin công việc...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger" style={{
          animation: 'slideInScale 0.5s ease-out',
          marginTop: '2rem'
        }}>
          {error}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container">
        <div className="alert alert-warning" style={{
          animation: 'slideInScale 0.5s ease-out',
          marginTop: '2rem'
        }}>
          Không tìm thấy công việc này
        </div>
      </div>
    );
  }

  return (
    <div className="container job-details-page" style={{
      animation: 'fadeIn 0.6s ease-out'
    }}>
      {/* Success notification */}
      {showSuccess && (
        <div className="alert alert-success" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          animation: 'slideInRight 0.5s ease-out',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          ✓ Ứng tuyển thành công! Hãy kiểm tra trang "Đơn ứng tuyển của tôi"
        </div>
      )}

      {/* Back button */}
      <button
        className="btn btn-secondary"
        onClick={() => navigate('/jobs')}
        style={{
          marginBottom: '2rem',
          animation: 'slideInLeft 0.5s ease-out'
        }}
      >
        ← Quay lại danh sách
      </button>

      {/* Job header */}
      <div className="job-header-card" style={{
        background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
        color: 'white',
        padding: '2rem',
        borderRadius: 'var(--border-radius)',
        marginBottom: '2rem',
        animation: 'slideInScale 0.6s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>{job.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.1rem' }}>🏢 {job.companyName || 'Công ty'}</span>
              <span>📍 {job.location || 'Việt Nam'}</span>
              <span>💰 {formatSalary(job.salary)}</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            {applied ? (
              <button className="btn btn-success" disabled style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontSize: '1.1rem',
                padding: '0.75rem 1.5rem'
              }}>
                ✓ Đã ứng tuyển
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleApply}
                disabled={applying}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontSize: '1.1rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                {applying ? (
                  <>
                    <div className="loading" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                    Đang xử lý...
                  </>
                ) : (
                  '🚀 Ứng Tuyển Ngay'
                )}
              </button>
            )}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div className="job-meta-item">
            <strong>💼 Loại hình:</strong> {job.employmentType || 'Toàn thời gian'}
          </div>
          <div className="job-meta-item">
            <strong>📅 Đăng ngày:</strong> {formatDate(job.postedDate || job.createdAt)}
          </div>
          {job.deadline && (
            <div className="job-meta-item">
              <strong>⏰ Hạn nộp:</strong> {formatDate(job.deadline)}
              {new Date(job.deadline) < new Date() && <span style={{ color: '#ff6b6b', marginLeft: 8, fontWeight: 600 }}>( Đã hết hạn)</span>}
            </div>
          )}
          <div className="job-meta-item">
            <strong>🏷️ Danh mục:</strong> {job.category?.name || 'Chưa phân loại'}
          </div>
        </div>
      </div>

      {/* Job content */}
      <div className="job-content-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '2rem',
        animation: 'fadeInUp 0.8s ease-out'
      }}>
        {/* Main content */}
        <div>
          {/* Job description */}
          <div className="job-section" style={{
            backgroundColor: 'var(--card-bg)',
            padding: '2rem',
            borderRadius: 'var(--border-radius)',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow)',
            animation: 'slideInLeft 0.7s ease-out'
          }}>
            <h2 style={{
              color: 'var(--primary-color)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📋 Mô Tả Công Việc
            </h2>
            <div style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
              {job.description ? (
                job.description.split('\n').map((line, index) => (
                  <p key={index} style={{ marginBottom: '1rem' }}>{line}</p>
                ))
              ) : (
                <p>Mô tả công việc sẽ được cập nhật sớm...</p>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div className="job-section" style={{
            backgroundColor: 'var(--card-bg)',
            padding: '2rem',
            borderRadius: 'var(--border-radius)',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow)',
            animation: 'slideInLeft 0.8s ease-out'
          }}>
            <h2 style={{
              color: 'var(--primary-color)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🎯 Yêu Cầu Công Việc
            </h2>
            <div style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
              {job.requirements ? (
                job.requirements.split('\n').map((line, index) => (
                  <p key={index} style={{ marginBottom: '0.5rem' }}>• {line}</p>
                ))
              ) : (
                <p style={{ color: '#6b7280' }}>Chưa có yêu cầu cụ thể</p>
              )}
            </div>
          </div>

          {/* Benefits */}
          <div className="job-section" style={{
            backgroundColor: 'var(--card-bg)',
            padding: '2rem',
            borderRadius: 'var(--border-radius)',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow)',
            animation: 'slideInLeft 0.9s ease-out'
          }}>
            <h2 style={{
              color: 'var(--primary-color)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🎁 Quyền Lợi
            </h2>
            <div style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Mức lương cạnh tranh theo năng lực</li>
                <li>Thưởng hiệu suất hàng tháng/quý</li>
                <li>Bảo hiểm đầy đủ theo quy định</li>
                <li>Nghỉ phép 12 ngày/năm + nghỉ lễ tết</li>
                <li>Môi trường làm việc chuyên nghiệp, thân thiện</li>
                <li>Cơ hội thăng tiến và phát triển bản thân</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Company info */}
          <div className="job-section" style={{
            backgroundColor: 'var(--card-bg)',
            padding: '1.5rem',
            borderRadius: 'var(--border-radius)',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow)',
            animation: 'slideInRight 0.7s ease-out'
          }}>
            <h3 style={{
              color: 'var(--primary-color)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🏢 Thông Tin Công Ty
            </h3>
            <div style={{ lineHeight: '1.6' }}>
              <p><strong>Tên công ty:</strong> {job.companyName || 'Đang cập nhật'}</p>
              <p><strong>Quy mô:</strong> 50-100 nhân viên</p>
              <p><strong>Lĩnh vực:</strong> Công nghệ thông tin</p>
              <p><strong>Địa chỉ:</strong> {job.location || 'Hà Nội, Việt Nam'}</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="job-section" style={{
            backgroundColor: 'var(--card-bg)',
            padding: '1.5rem',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--shadow)',
            animation: 'slideInRight 0.8s ease-out'
          }}>
            <h3 style={{
              color: 'var(--primary-color)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⚡ Hành Động Nhanh
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                className="btn"
                style={{
                  backgroundColor: 'var(--info-color)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: 'var(--border-radius)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                💾 Lưu công việc
              </button>
              <button
                className="btn"
                style={{
                  backgroundColor: 'var(--warning-color)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: 'var(--border-radius)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                📤 Chia sẻ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Apply section */}
      {!applied && (
        <div className="apply-section" style={{
          backgroundColor: 'var(--success-color)',
          color: 'white',
          padding: '2rem',
          borderRadius: 'var(--border-radius)',
          textAlign: 'center',
          marginTop: '2rem',
          animation: 'slideInUp 1s ease-out'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>🚀 Sẵn sàng ứng tuyển?</h3>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            Hãy nộp hồ sơ của bạn ngay bây giờ để có cơ hội được làm việc tại công ty này!
          </p>
          <button
            className="btn btn-primary"
            onClick={handleApply}
            disabled={applying}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontSize: '1.2rem',
              padding: '1rem 2rem',
              fontWeight: '600'
            }}
          >
            {applying ? (
              <>
                <div className="loading" style={{ width: '20px', height: '20px', marginRight: '10px' }}></div>
                Đang ứng tuyển...
              </>
            ) : (
              '📝 Ứng Tuyển Ngay'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default JobDetails;
