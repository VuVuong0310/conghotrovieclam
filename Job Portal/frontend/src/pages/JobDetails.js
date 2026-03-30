import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JobService from '../services/JobService';
import AuthService from '../services/AuthService';
import axios from 'axios';
import API_BASE from '../config/api';

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
      const response = await axios.get(`${API_BASE}/applications/check/${id}`, {
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
        `${API_BASE}/applications/apply/${id}`,
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
    return <div className="jp-loading-page"><div className="jp-spinner"></div><p>Đang tải thông tin công việc...</p></div>;
  }

  if (error) {
    return <div className="jp-container"><div className="alert alert-danger mt-3"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div></div>;
  }

  if (!job) {
    return <div className="jp-container"><div className="alert alert-warning mt-3"><i className="bi bi-info-circle me-2"></i>Không tìm thấy công việc này</div></div>;
  }

  return (
    <div className="jp-container">
      {showSuccess && (
        <div className="alert alert-success position-fixed top-0 end-0 m-3" style={{ zIndex: 1080 }}>
          <i className="bi bi-check-circle me-2"></i>Ứng tuyển thành công! Hãy kiểm tra trang "Đơn ứng tuyển"
        </div>
      )}

      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate('/jobs')}>
        <i className="bi bi-arrow-left me-1"></i>Quay lại danh sách
      </button>

      {/* Job Header */}
      <div className="jp-page-header mb-4" style={{ padding: '28px' }}>
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h1 className="h3 fw-bold mb-2">{job.title}</h1>
            <div className="d-flex flex-wrap gap-3" style={{ fontSize: '.92rem', opacity: .9 }}>
              <span><i className="bi bi-building me-1"></i>{job.companyName || 'Công ty'}</span>
              <span><i className="bi bi-geo-alt me-1"></i>{job.location || 'Việt Nam'}</span>
              <span><i className="bi bi-cash-stack me-1"></i>{formatSalary(job.salary)}</span>
            </div>
          </div>
          <div>
            {applied ? (
              <button className="btn btn-light" disabled><i className="bi bi-check-circle me-1"></i>Đã ứng tuyển</button>
            ) : (
              <button className="btn btn-light fw-semibold" onClick={handleApply} disabled={applying}>
                {applying ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</> : <><i className="bi bi-send me-1"></i>Ứng Tuyển Ngay</>}
              </button>
            )}
          </div>
        </div>
        <div className="row g-3 mt-3">
          <div className="col-auto"><i className="bi bi-briefcase me-1"></i><strong>Loại hình:</strong> {job.employmentType || 'Toàn thời gian'}</div>
          <div className="col-auto"><i className="bi bi-calendar3 me-1"></i><strong>Đăng ngày:</strong> {formatDate(job.postedDate || job.createdAt)}</div>
          {job.deadline && <div className="col-auto"><i className="bi bi-clock me-1"></i><strong>Hạn nộp:</strong> {formatDate(job.deadline)} {new Date(job.deadline) < new Date() && <span className="text-warning fw-bold ms-1">(Đã hết hạn)</span>}</div>}
          <div className="col-auto"><i className="bi bi-tag me-1"></i><strong>Danh mục:</strong> {job.category?.name || 'Chưa phân loại'}</div>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Content */}
        <div className="col-lg-8">
          <div className="jp-card mb-3">
            <div className="jp-card-body">
              <h5 className="jp-section-title"><i className="bi bi-file-earmark-text"></i>Mô Tả Công Việc</h5>
              <div style={{ lineHeight: 1.7 }}>
                {job.description ? job.description.split('\n').map((line, i) => <p key={i}>{line}</p>) : <p className="text-muted">Mô tả công việc sẽ được cập nhật sớm...</p>}
              </div>
            </div>
          </div>

          <div className="jp-card mb-3">
            <div className="jp-card-body">
              <h5 className="jp-section-title"><i className="bi bi-check2-square"></i>Yêu Cầu Công Việc</h5>
              <div style={{ lineHeight: 1.7 }}>
                {job.requirements ? job.requirements.split('\n').map((line, i) => <p key={i} className="mb-1"><i className="bi bi-dot"></i>{line}</p>) : <p className="text-muted">Chưa có yêu cầu cụ thể</p>}
              </div>
            </div>
          </div>

          <div className="jp-card mb-3">
            <div className="jp-card-body">
              <h5 className="jp-section-title"><i className="bi bi-gift"></i>Quyền Lợi</h5>
              <ul className="list-unstyled" style={{ lineHeight: 2 }}>
                <li><i className="bi bi-check-circle text-success me-2"></i>Mức lương cạnh tranh theo năng lực</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Thưởng hiệu suất hàng tháng/quý</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Bảo hiểm đầy đủ theo quy định</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Nghỉ phép 12 ngày/năm + nghỉ lễ tết</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Môi trường làm việc chuyên nghiệp, thân thiện</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Cơ hội thăng tiến và phát triển bản thân</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="jp-card mb-3">
            <div className="jp-card-body">
              <h6 className="jp-section-title"><i className="bi bi-building"></i>Thông Tin Công Ty</h6>
              <div style={{ lineHeight: 2, fontSize: '.9rem' }}>
                <p className="mb-1"><strong>Tên công ty:</strong> {job.companyName || 'Đang cập nhật'}</p>
                <p className="mb-1"><strong>Quy mô:</strong> 50-100 nhân viên</p>
                <p className="mb-1"><strong>Lĩnh vực:</strong> Công nghệ thông tin</p>
                <p className="mb-0"><strong>Địa chỉ:</strong> {job.location || 'Hà Nội, Việt Nam'}</p>
              </div>
            </div>
          </div>

          <div className="jp-card">
            <div className="jp-card-body">
              <h6 className="jp-section-title"><i className="bi bi-lightning"></i>Hành Động Nhanh</h6>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary"><i className="bi bi-bookmark me-1"></i>Lưu công việc</button>
                <button className="btn btn-outline-secondary"><i className="bi bi-share me-1"></i>Chia sẻ</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      {!applied && (
        <div className="jp-card mt-4 text-center" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none' }}>
          <div className="jp-card-body text-white py-4">
            <h5 className="fw-bold mb-2"><i className="bi bi-rocket-takeoff me-2"></i>Sẵn sàng ứng tuyển?</h5>
            <p className="mb-3" style={{ opacity: .9 }}>Hãy nộp hồ sơ ngay để có cơ hội làm việc tại công ty này!</p>
            <button className="btn btn-light fw-semibold px-4" onClick={handleApply} disabled={applying}>
              {applying ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang ứng tuyển...</> : <><i className="bi bi-send me-1"></i>Ứng Tuyển Ngay</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetails;
