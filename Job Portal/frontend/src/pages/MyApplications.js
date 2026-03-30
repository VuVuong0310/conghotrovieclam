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
      if (data.content) { setApplications(data.content); setTotalPages(data.totalPages || 0); }
      else { setApplications(data); setTotalPages(1); }
      setLoading(false);
    } catch (err) { setError('Không thể tải danh sách ứng tuyển'); setLoading(false); }
  };

  const fetchStats = async () => {
    try { const response = await JobApplicationService.getApplicationStats(); setStats(response.data); } catch (err) {}
  };

  const getStatusBadge = (status) => {
    const map = {
      'SUBMITTED': { cls: 'jp-badge-info', icon: 'bi-send', label: 'Đã nộp' },
      'REVIEWING': { cls: 'jp-badge-warning', icon: 'bi-eye', label: 'Đang xem xét' },
      'INTERVIEW': { cls: 'jp-badge-primary', icon: 'bi-mic', label: 'Mời phỏng vấn' },
      'ACCEPTED': { cls: 'jp-badge-success', icon: 'bi-check-circle', label: 'Chấp nhận' },
      'REJECTED': { cls: 'jp-badge-danger', icon: 'bi-x-circle', label: 'Từ chối' },
      'WITHDRAWN': { cls: 'jp-badge-secondary', icon: 'bi-arrow-counterclockwise', label: 'Đã rút lại' },
    };
    const s = map[status] || { cls: 'jp-badge-secondary', icon: 'bi-circle', label: status };
    return <span className={`jp-badge ${s.cls}`}><i className={`bi ${s.icon}`}></i> {s.label}</span>;
  };

  const filteredApplications = filter === 'ALL' ? applications : applications.filter(app => app.status === filter);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatSalary = (salary) => {
    if (!salary) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(salary);
  };

  const handleWithdraw = async (applicationId) => {
    if (window.confirm('Bạn có chắc muốn rút lại đơn ứng tuyển này?')) {
      try { await JobApplicationService.withdrawApplication(applicationId); fetchApplications(); } catch (err) { alert('Không thể rút lại đơn ứng tuyển'); }
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);

  if (loading) return <div className="jp-loading-page"><div className="jp-spinner"></div><p>Đang tải danh sách ứng tuyển...</p></div>;

  return (
    <div className="jp-container">
      <div className="jp-page-header">
        <h1><i className="bi bi-file-earmark-text me-2"></i>Đơn Ứng Tuyển Của Tôi</h1>
        <p>Theo dõi trạng thái các đơn ứng tuyển của bạn</p>
      </div>

      {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>}

      {/* Stats */}
      {stats && (
        <div className="row g-3 mb-4">
          {[
            { icon: 'bi-send', label: 'Tổng đơn', value: stats.totalApplications || 0, bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
            { icon: 'bi-mic', label: 'Mời phỏng vấn', value: stats.interviewCount || 0, bg: 'linear-gradient(135deg,#f59e0b,#d97706)' },
            { icon: 'bi-check-circle', label: 'Được chấp nhận', value: stats.acceptedCount || 0, bg: 'linear-gradient(135deg,#10b981,#059669)' },
            { icon: 'bi-graph-up', label: 'Tỷ lệ thành công', value: `${stats.successRate ? Math.round(stats.successRate * 100) : 0}%`, bg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
          ].map((s, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className="jp-stat-card" style={{ background: s.bg }}>
                <div className="stat-icon"><i className={`bi ${s.icon}`}></i></div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="jp-card mb-4">
        <div className="jp-card-body d-flex align-items-center gap-3 flex-wrap py-3">
          <label className="fw-semibold text-nowrap"><i className="bi bi-funnel me-1"></i>Lọc trạng thái:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="form-select" style={{ maxWidth: 220 }}>
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SUBMITTED">Đã nộp</option>
            <option value="REVIEWING">Đang xem xét</option>
            <option value="INTERVIEW">Mời phỏng vấn</option>
            <option value="ACCEPTED">Chấp nhận</option>
            <option value="REJECTED">Từ chối</option>
            <option value="WITHDRAWN">Đã rút lại</option>
          </select>
        </div>
      </div>

      {/* Applications */}
      {filteredApplications.length === 0 ? (
        <div className="jp-card">
          <div className="jp-empty-state">
            <i className="bi bi-inbox"></i>
            <h3>{filter === 'ALL' ? 'Bạn chưa ứng tuyển công việc nào' : 'Không có đơn với trạng thái này'}</h3>
            <p>Hãy bắt đầu tìm kiếm và ứng tuyển các công việc phù hợp!</p>
            <button onClick={() => navigate('/jobs')} className="btn btn-primary"><i className="bi bi-search me-1"></i>Tìm việc ngay</button>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredApplications.map((app) => (
            <div key={app.id} className="jp-card" style={{ borderLeft: '4px solid' }}>
              <div className="jp-card-body">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: 'var(--jp-primary)' }}>{app.jobPost?.title || 'Công việc'}</h6>
                    <div className="d-flex flex-wrap gap-3 text-muted" style={{ fontSize: '.85rem' }}>
                      <span><i className="bi bi-building me-1"></i>{app.jobPost?.companyName || app.jobPost?.employer?.username || 'Công ty'}</span>
                      <span><i className="bi bi-geo-alt me-1"></i>{app.jobPost?.location || 'Việt Nam'}</span>
                      <span><i className="bi bi-cash-stack me-1"></i>{formatSalary(app.jobPost?.salary)}</span>
                    </div>
                  </div>
                  <div className="text-end">
                    {getStatusBadge(app.status)}
                    <div className="text-muted mt-1" style={{ fontSize: '.78rem' }}><i className="bi bi-calendar3 me-1"></i>{formatDate(app.appliedAt)}</div>
                  </div>
                </div>

                <p className="text-muted mb-3" style={{ fontSize: '.88rem' }}>
                  {app.jobPost?.description?.substring(0, 200) || 'Mô tả công việc sẽ được cập nhật...'}{app.jobPost?.description?.length > 200 && '...'}
                </p>

                {app.status === 'INTERVIEW' && <div className="alert alert-success py-2 mb-3"><i className="bi bi-trophy me-2"></i><strong>Chúc mừng!</strong> Bạn được mời phỏng vấn. Kiểm tra email để biết chi tiết.</div>}
                {app.status === 'ACCEPTED' && <div className="alert alert-success py-2 mb-3"><i className="bi bi-stars me-2"></i><strong>Xin chúc mừng!</strong> Bạn đã được chấp nhận.</div>}
                {app.status === 'REJECTED' && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-info-circle me-2"></i>Rất tiếc, đơn ứng tuyển không được chấp nhận. Hãy thử các công việc khác.</div>}

                <div className="d-flex gap-2">
                  <button onClick={() => navigate(`/job/${app.jobPost?.id}`)} className="btn btn-primary btn-sm"><i className="bi bi-eye me-1"></i>Xem chi tiết</button>
                  {(app.status === 'SUBMITTED' || app.status === 'REVIEWING') && (
                    <button onClick={() => handleWithdraw(app.id)} className="btn btn-outline-danger btn-sm"><i className="bi bi-arrow-counterclockwise me-1"></i>Rút lại</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-4">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}><button className="page-link" onClick={() => handlePageChange(currentPage - 1)}><i className="bi bi-chevron-left"></i></button></li>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(totalPages - 1, currentPage - 2 + i));
              return <li key={pageNum} className={`page-item ${pageNum === currentPage ? 'active' : ''}`}><button className="page-link" onClick={() => handlePageChange(pageNum)}>{pageNum + 1}</button></li>;
            })}
            <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => handlePageChange(currentPage + 1)}><i className="bi bi-chevron-right"></i></button></li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default MyApplications;
