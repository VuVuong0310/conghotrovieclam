import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../services/AuthService';
import API_BASE from '../config/api';

function EmployerDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);

  const [showCvModal, setShowCvModal] = useState(false);
  const [cvData, setCvData] = useState(null);
  const [cvEducations, setCvEducations] = useState([]);
  const [cvExperiences, setCvExperiences] = useState([]);
  const [cvLoading, setCvLoading] = useState(false);

  const [showCompanyProfile, setShowCompanyProfile] = useState(false);
  const [companyProfile, setCompanyProfile] = useState({
    companyName: '', companyDescription: '', industry: '', companySize: '', website: '', address: '', phone: '', logoUrl: ''
  });

  const getStatusLabel = (status) => {
    const map = { SUBMITTED: 'Đã Nộp', REVIEWING: 'Đang Xem Xét', INTERVIEW: 'Phỏng Vấn', ACCEPTED: 'Được Chấp Nhận', REJECTED: 'Từ Chối' };
    return map[status] || status;
  };

  const getStatusBadge = (status) => {
    const map = {
      SUBMITTED: { cls: 'jp-badge-info', icon: 'bi-send' },
      REVIEWING: { cls: 'jp-badge-warning', icon: 'bi-eye' },
      INTERVIEW: { cls: 'jp-badge-primary', icon: 'bi-mic' },
      ACCEPTED: { cls: 'jp-badge-success', icon: 'bi-check-circle' },
      REJECTED: { cls: 'jp-badge-danger', icon: 'bi-x-circle' }
    };
    const s = map[status] || { cls: 'jp-badge-secondary', icon: 'bi-circle' };
    return <span className={s.cls}><i className={`bi ${s.icon} me-1`}></i>{getStatusLabel(status)}</span>;
  };

  const headers = { headers: { Authorization: 'Bearer ' + AuthService.getToken() } };

  useEffect(() => { fetchDashboard(); fetchMyJobs(); }, []);

  const fetchDashboard = async () => {
    try { const res = await axios.get(`${API_BASE}/employer/dashboard`, headers); setDashboard(res.data); }
    catch (e) { console.error('Failed to fetch dashboard', e); }
  };

  const fetchMyJobs = async () => {
    try { const res = await axios.get(`${API_BASE}/employer/jobs`, headers); setJobs(res.data); }
    catch (e) { console.error('Failed to fetch jobs', e); }
    setLoading(false);
  };

  const handleViewApplications = async (jobId) => {
    setSelectedJobId(jobId);
    try { const res = await axios.get(`${API_BASE}/employer/jobs/${jobId}/applications`, headers); setJobApplications(res.data); }
    catch (e) { console.error('Failed to fetch applications', e); }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/applications/${applicationId}/status`, { status: newStatus }, {
        headers: { Authorization: 'Bearer ' + AuthService.getToken(), 'Content-Type': 'application/json' }
      });
      if (selectedJobId) handleViewApplications(selectedJobId);
      fetchDashboard();
    } catch (e) { console.error('Failed to update status', e); alert('Không thể cập nhật trạng thái'); }
  };

  const handleViewProfile = async (candidateId) => {
    setCvLoading(true); setShowCvModal(true); setCvData(null); setCvEducations([]); setCvExperiences([]);
    try {
      const [profileRes, eduRes, expRes] = await Promise.all([
        axios.get(`${API_BASE}/profile/${candidateId}`, headers),
        axios.get(`${API_BASE}/candidates/${candidateId}/educations`, headers),
        axios.get(`${API_BASE}/candidates/${candidateId}/experiences`, headers)
      ]);
      const data = profileRes.data || {};
      if (Array.isArray(data.skills)) data.skills = data.skills.join(', ');
      setCvData({ ...data, candidateId });
      setCvEducations(eduRes.data || []);
      setCvExperiences(expRes.data || []);
    } catch (e) { console.error(e); setCvData({ candidateId, error: true }); }
    setCvLoading(false);
  };

  const fetchCompanyProfile = async () => {
    try { const res = await axios.get(`${API_BASE}/employer/company-profile`, headers); setCompanyProfile(res.data || {}); }
    catch (e) { console.error(e); }
  };

  const handleSaveCompanyProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/employer/company-profile`, companyProfile, {
        headers: { Authorization: 'Bearer ' + AuthService.getToken(), 'Content-Type': 'application/json' }
      });
      alert('Cập nhật thông tin công ty thành công!');
    } catch (e) { alert('Lỗi khi cập nhật thông tin công ty'); }
  };

  if (loading) return <div className="jp-loading-page"><div className="jp-spinner"></div></div>;

  return (
    <div className="jp-container">
      {/* Header */}
      <div className="jp-page-header mb-4">
        <h1><i className="bi bi-grid-1x2 me-2"></i>Bảng Điều Khiển Nhà Tuyển Dụng</h1>
        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-outline-light" onClick={() => { setShowCompanyProfile(!showCompanyProfile); if (!showCompanyProfile) fetchCompanyProfile(); }}>
            <i className={`bi ${showCompanyProfile ? 'bi-chevron-up' : 'bi-building'} me-1`}></i>Thông Tin Công Ty
          </button>
          <button className="btn btn-light text-primary fw-semibold" onClick={() => navigate('/create-job')}>
            <i className="bi bi-plus-circle me-1"></i>Đăng Tin Tuyển Dụng
          </button>
        </div>
      </div>

      {/* Company Profile Collapse */}
      {showCompanyProfile && (
        <div className="jp-card mb-4" style={{ borderLeft: '4px solid var(--jp-primary)' }}>
          <div className="jp-card-body">
            <h5 className="fw-bold mb-3"><i className="bi bi-building me-2 text-primary"></i>Thông Tin Công Ty</h5>
            <form onSubmit={handleSaveCompanyProfile}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Tên công ty</label>
                  <input type="text" className="form-control" value={companyProfile.companyName || ''} onChange={e => setCompanyProfile({...companyProfile, companyName: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ngành nghề</label>
                  <input type="text" className="form-control" value={companyProfile.industry || ''} onChange={e => setCompanyProfile({...companyProfile, industry: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Quy mô</label>
                  <select className="form-select" value={companyProfile.companySize || ''} onChange={e => setCompanyProfile({...companyProfile, companySize: e.target.value})}>
                    <option value="">-- Chọn --</option>
                    <option value="1-10">1-10 nhân viên</option>
                    <option value="11-50">11-50 nhân viên</option>
                    <option value="51-200">51-200 nhân viên</option>
                    <option value="201-500">201-500 nhân viên</option>
                    <option value="500+">500+ nhân viên</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Website</label>
                  <input type="text" className="form-control" value={companyProfile.website || ''} onChange={e => setCompanyProfile({...companyProfile, website: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Số điện thoại</label>
                  <input type="text" className="form-control" value={companyProfile.phone || ''} onChange={e => setCompanyProfile({...companyProfile, phone: e.target.value})} />
                </div>
                <div className="col-12">
                  <label className="form-label">Địa chỉ</label>
                  <input type="text" className="form-control" value={companyProfile.address || ''} onChange={e => setCompanyProfile({...companyProfile, address: e.target.value})} />
                </div>
                <div className="col-12">
                  <label className="form-label">Mô tả công ty</label>
                  <textarea className="form-control" rows={3} value={companyProfile.companyDescription || ''} onChange={e => setCompanyProfile({...companyProfile, companyDescription: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary mt-3"><i className="bi bi-check-lg me-1"></i>Lưu Thông Tin</button>
            </form>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      {dashboard && (
        <div className="row g-3 mb-4">
          {[
            { icon: 'bi-briefcase', label: 'Tin Tuyển Dụng', val: dashboard.totalJobs, gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
            { icon: 'bi-people', label: 'Tổng Ứng Tuyển', val: dashboard.totalApplications, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
            { icon: 'bi-send', label: 'Đã Nộp', val: dashboard.submittedApplications, gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
            { icon: 'bi-eye', label: 'Đang Xem Xét', val: dashboard.reviewingApplications, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
            { icon: 'bi-mic', label: 'Mời Phỏng Vấn', val: dashboard.interviewApplications, gradient: 'linear-gradient(135deg, #ec4899, #db2777)' }
          ].map((s, i) => (
            <div className="col" key={i}>
              <div className="jp-stat-card" style={{ background: s.gradient }}>
                <i className={`bi ${s.icon}`} style={{ fontSize: 28, opacity: 0.3, position: 'absolute', top: 14, right: 16 }}></i>
                <div className="fw-bold" style={{ fontSize: 28 }}>{s.val}</div>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content: 2-column layout */}
      <div className="row g-4">
        {/* Left: Job List */}
        <div className="col-lg-5">
          <div className="jp-card">
            <div className="jp-card-body">
              <h5 className="fw-bold mb-3"><i className="bi bi-list-ul me-2 text-primary"></i>Tin Tuyển Dụng Của Tôi</h5>
              {jobs.length === 0 ? (
                <div className="jp-empty-state">
                  <i className="bi bi-inbox"></i>
                  <h6>Bạn chưa đăng tin nào</h6>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/create-job')}>
                    <i className="bi bi-plus-circle me-1"></i>Đăng tin ngay
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {jobs.map(job => (
                    <div key={job.id}
                      className={`jp-card p-3 ${selectedJobId === job.id ? 'border-primary' : ''}`}
                      style={{ cursor: 'pointer', transition: 'all .15s' }}
                      onClick={() => handleViewApplications(job.id)}>
                      <h6 className="fw-bold mb-1">{job.title}</h6>
                      <div className="text-muted small">
                        <i className="bi bi-geo-alt me-1"></i>{job.location}
                        <span className="ms-3"><i className="bi bi-calendar3 me-1"></i>{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Applications */}
        <div className="col-lg-7">
          <div className="jp-card">
            <div className="jp-card-body">
              {selectedJobId ? (
                <>
                  <h5 className="fw-bold mb-3"><i className="bi bi-people me-2 text-primary"></i>Ứng Viên Ứng Tuyển</h5>
                  {jobApplications.length === 0 ? (
                    <div className="jp-empty-state">
                      <i className="bi bi-person-x"></i>
                      <h6>Không có ứng viên nào</h6>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {jobApplications.map(app => (
                        <div key={app.id} className="border rounded-3 p-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="fw-bold mb-0">{app.candidate?.username || 'Anonymous'}</h6>
                            {getStatusBadge(app.status)}
                          </div>
                          <p className="text-muted small mb-2"><i className="bi bi-calendar3 me-1"></i>Ngày nộp: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}</p>
                          <div className="d-flex gap-2 align-items-center flex-wrap">
                            <button className="btn btn-outline-primary btn-sm" onClick={() => handleViewProfile(app.candidate?.id)}>
                              <i className="bi bi-person-badge me-1"></i>Xem Hồ Sơ
                            </button>
                            <select className="form-select form-select-sm" style={{ width: 'auto' }}
                              value={app.status} onChange={e => handleStatusChange(app.id, e.target.value)}>
                              <option value="SUBMITTED">Đã Nộp</option>
                              <option value="REVIEWING">Đang Xem Xét</option>
                              <option value="INTERVIEW">Mời Phỏng Vấn</option>
                              <option value="ACCEPTED">Chấp Nhận</option>
                              <option value="REJECTED">Từ Chối</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="jp-empty-state">
                  <i className="bi bi-hand-index"></i>
                  <h6>Chọn một tin tuyển dụng để xem ứng viên</h6>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CV Modal */}
      {showCvModal && (
        <div className="jp-modal-overlay" onClick={() => setShowCvModal(false)}>
          <div className="jp-modal" style={{ maxWidth: 750 }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom" style={{ background: 'var(--jp-dark)', borderRadius: '12px 12px 0 0', color: '#fff' }}>
              <h5 className="mb-0"><i className="bi bi-file-earmark-person me-2"></i>Hồ Sơ Ứng Viên</h5>
              <button className="btn-close btn-close-white" onClick={() => setShowCvModal(false)}></button>
            </div>
            <div className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {cvLoading && (
                <div className="text-center py-4"><div className="spinner-border text-primary"></div><p className="text-muted mt-2">Đang tải hồ sơ...</p></div>
              )}
              {!cvLoading && cvData && cvData.error && (
                <div className="alert alert-warning text-center"><i className="bi bi-exclamation-triangle me-2"></i>Ứng viên chưa tạo hồ sơ.</div>
              )}
              {!cvLoading && cvData && !cvData.error && (
                <>
                  {/* Profile Info */}
                  <div className="mb-4 pb-3 border-bottom">
                    <h4 className="fw-bold text-primary">{cvData.fullName || 'Chưa cập nhật tên'}</h4>
                    <div className="d-flex flex-column gap-1 text-muted">
                      {cvData.phone && <span><i className="bi bi-telephone me-2"></i>{cvData.phone}</span>}
                      {cvData.address && <span><i className="bi bi-geo-alt me-2"></i>{cvData.address}</span>}
                      {cvData.dateOfBirth && <span><i className="bi bi-calendar-heart me-2"></i>{cvData.dateOfBirth}</span>}
                    </div>
                    {cvData.bio && <p className="mt-2 text-body">{cvData.bio}</p>}
                    <div className="d-flex gap-3 mt-2">
                      {cvData.linkedinUrl && <a href={cvData.linkedinUrl} target="_blank" rel="noreferrer" className="text-decoration-none"><i className="bi bi-linkedin me-1"></i>LinkedIn</a>}
                      {cvData.githubUrl && <a href={cvData.githubUrl} target="_blank" rel="noreferrer" className="text-decoration-none"><i className="bi bi-github me-1"></i>GitHub</a>}
                      {cvData.portfolioUrl && <a href={cvData.portfolioUrl} target="_blank" rel="noreferrer" className="text-decoration-none"><i className="bi bi-globe me-1"></i>Portfolio</a>}
                    </div>
                  </div>

                  {/* Skills */}
                  {cvData.skills && (
                    <div className="mb-4">
                      <h6 className="jp-section-title"><i className="bi bi-tools me-2"></i>Kỹ Năng</h6>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {cvData.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                          <span key={i} className="badge bg-primary rounded-pill px-3 py-2">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {cvExperiences.length > 0 && (
                    <div className="mb-4">
                      <h6 className="jp-section-title"><i className="bi bi-briefcase me-2"></i>Kinh Nghiệm Làm Việc</h6>
                      {cvExperiences.map(exp => (
                        <div key={exp.id} className="border-start border-primary border-3 ps-3 my-3">
                          <strong>{exp.jobTitle}</strong> — {exp.companyName}
                          <br /><small className="text-muted">{exp.startDate} — {exp.endDate || 'Hiện tại'}</small>
                          {exp.description && <p className="mb-0 mt-1 small">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {cvEducations.length > 0 && (
                    <div className="mb-4">
                      <h6 className="jp-section-title"><i className="bi bi-mortarboard me-2"></i>Học Vấn</h6>
                      {cvEducations.map(edu => (
                        <div key={edu.id} className="border-start border-primary border-3 ps-3 my-3">
                          <strong>{edu.degree}</strong> — {edu.institution}
                          {edu.fieldOfStudy && <span> ({edu.fieldOfStudy})</span>}
                          <br /><small className="text-muted">{edu.startDate} — {edu.endDate || 'Hiện tại'}</small>
                          {edu.gpa && <span className="ms-2 badge bg-success">GPA: {edu.gpa}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="d-flex gap-2 pt-3 border-top">
                    <button className="btn btn-primary btn-sm" onClick={() => window.open(`${API_BASE}/profile/${cvData.candidateId}/cv`, '_blank')}>
                      <i className="bi bi-file-earmark-text me-1"></i>Xem CV đầy đủ
                    </button>
                    {cvData.resumePath && (
                      <button className="btn btn-outline-primary btn-sm" onClick={() => window.open(`${API_BASE}/profile/${cvData.candidateId}/resume`, '_blank')}>
                        <i className="bi bi-paperclip me-1"></i>Xem Resume PDF
                      </button>
                    )}
                    <button className="btn btn-outline-secondary btn-sm ms-auto" onClick={() => setShowCvModal(false)}>Đóng</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployerDashboard;
