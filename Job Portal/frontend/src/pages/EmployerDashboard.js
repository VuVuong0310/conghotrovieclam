import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../services/AuthService';

function EmployerDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);

  // CV Modal state
  const [showCvModal, setShowCvModal] = useState(false);
  const [cvData, setCvData] = useState(null);
  const [cvEducations, setCvEducations] = useState([]);
  const [cvExperiences, setCvExperiences] = useState([]);
  const [cvLoading, setCvLoading] = useState(false);

  // Company Profile state
  const [showCompanyProfile, setShowCompanyProfile] = useState(false);
  const [companyProfile, setCompanyProfile] = useState({
    companyName: '', companyDescription: '', industry: '', companySize: '', website: '', address: '', phone: '', logoUrl: ''
  });

  // Function to get status label in Vietnamese
  const getStatusLabel = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 'Đã Nộp';
      case 'REVIEWING':
        return 'Đang Xem Xét';
      case 'INTERVIEW':
        return 'Phỏng Vấn';
      case 'ACCEPTED':
        return 'Được Chấp Nhận';
      case 'REJECTED':
        return 'Từ Chối';
      default:
        return status;
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchMyJobs();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/employer/dashboard',
        {
          headers: {
            'Authorization': 'Bearer ' + AuthService.getToken()
          }
        }
      );
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    }
  };

  const fetchMyJobs = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/employer/jobs',
        {
          headers: {
            'Authorization': 'Bearer ' + AuthService.getToken()
          }
        }
      );
      setJobs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
      setLoading(false);
    }
  };

  const handleViewApplications = async (jobId) => {
    setSelectedJobId(jobId);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/employer/jobs/${jobId}/applications`,
        {
          headers: {
            'Authorization': 'Bearer ' + AuthService.getToken()
          }
        }
      );
      setJobApplications(response.data);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:8080/api/applications/${applicationId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': 'Bearer ' + AuthService.getToken(),
            'Content-Type': 'application/json'
          }
        }
      );
      // Refresh applications list
      if (selectedJobId) {
        handleViewApplications(selectedJobId);
      }
      // Refresh dashboard stats
      fetchDashboard();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Không thể cập nhật trạng thái');
    }
  };

  const handleViewProfile = async (candidateId) => {
    setCvLoading(true);
    setShowCvModal(true);
    setCvData(null);
    setCvEducations([]);
    setCvExperiences([]);
    const headers = { 'Authorization': 'Bearer ' + AuthService.getToken() };
    try {
      const [profileRes, eduRes, expRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/profile/${candidateId}`, { headers }),
        axios.get(`http://localhost:8080/api/candidates/${candidateId}/educations`, { headers }),
        axios.get(`http://localhost:8080/api/candidates/${candidateId}/experiences`, { headers })
      ]);
      const data = profileRes.data || {};
      if (Array.isArray(data.skills)) {
        data.skills = data.skills.join(', ');
      }
      setCvData({ ...data, candidateId });
      setCvEducations(eduRes.data || []);
      setCvExperiences(expRes.data || []);
    } catch (error) {
      console.error('Failed to fetch candidate profile', error);
      setCvData({ candidateId, error: true });
    }
    setCvLoading(false);
  };

  const fetchCompanyProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/employer/company-profile', {
        headers: { 'Authorization': 'Bearer ' + AuthService.getToken() }
      });
      setCompanyProfile(response.data || {});
    } catch (error) {
      console.error('Failed to fetch company profile', error);
    }
  };

  const handleSaveCompanyProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:8080/api/employer/company-profile', companyProfile, {
        headers: { 'Authorization': 'Bearer ' + AuthService.getToken(), 'Content-Type': 'application/json' }
      });
      alert('Cập nhật thông tin công ty thành công!');
    } catch (error) {
      alert('Lỗi khi cập nhật thông tin công ty');
    }
  };

  if (loading) {
    return <div className="container"><p>Đang tải...</p></div>;
  }

  return (
    <div className="container employer-dashboard">
      <div className="dashboard-header">
        <h2>Bảng Điều Khiển Nhà Tuyển Dụng</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => {
            setShowCompanyProfile(!showCompanyProfile);
            if (!showCompanyProfile) fetchCompanyProfile();
          }}>
            {showCompanyProfile ? 'Ẩn' : '🏢'} Thông Tin Công Ty
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/create-job')}
          >
            + Đăng Tin Tuyển Dụng Mới
          </button>
        </div>
      </div>

      {showCompanyProfile && (
        <div style={{ marginBottom: 20, padding: 24, background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd' }}>
          <h3 style={{ marginTop: 0, color: '#0369a1' }}>🏢 Thông Tin Công Ty</h3>
          <form onSubmit={handleSaveCompanyProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Tên công ty</label>
                <input type="text" className="form-control" value={companyProfile.companyName || ''}
                  onChange={e => setCompanyProfile({...companyProfile, companyName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Ngành nghề</label>
                <input type="text" className="form-control" value={companyProfile.industry || ''}
                  onChange={e => setCompanyProfile({...companyProfile, industry: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Quy mô</label>
                <select className="form-control" value={companyProfile.companySize || ''}
                  onChange={e => setCompanyProfile({...companyProfile, companySize: e.target.value})}>
                  <option value="">-- Chọn --</option>
                  <option value="1-10">1-10 nhân viên</option>
                  <option value="11-50">11-50 nhân viên</option>
                  <option value="51-200">51-200 nhân viên</option>
                  <option value="201-500">201-500 nhân viên</option>
                  <option value="500+">500+ nhân viên</option>
                </select>
              </div>
              <div className="form-group">
                <label>Website</label>
                <input type="text" className="form-control" value={companyProfile.website || ''}
                  onChange={e => setCompanyProfile({...companyProfile, website: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <input type="text" className="form-control" value={companyProfile.address || ''}
                  onChange={e => setCompanyProfile({...companyProfile, address: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input type="text" className="form-control" value={companyProfile.phone || ''}
                  onChange={e => setCompanyProfile({...companyProfile, phone: e.target.value})} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Mô tả công ty</label>
              <textarea className="form-control" rows={4} value={companyProfile.companyDescription || ''}
                onChange={e => setCompanyProfile({...companyProfile, companyDescription: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-success" style={{ marginTop: 12 }}>💾 Lưu Thông Tin</button>
          </form>
        </div>
      )}

      {dashboard && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{dashboard.totalJobs}</h3>
            <p>Tin Tuyển Dụng</p>
          </div>
          <div className="stat-card">
            <h3>{dashboard.totalApplications}</h3>
            <p>Tổng Ứng Tuyển</p>
          </div>
          <div className="stat-card">
            <h3>{dashboard.submittedApplications}</h3>
            <p>Đã Nộp</p>
          </div>
          <div className="stat-card">
            <h3>{dashboard.reviewingApplications}</h3>
            <p>Đang Xem Xét</p>
          </div>
          <div className="stat-card">
            <h3>{dashboard.interviewApplications}</h3>
            <p>Mời Phỏng Vấn</p>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <div className="left-panel">
          <h3>Tin Tuyển Dụng Của Tôi</h3>
          {jobs.length === 0 ? (
            <p>Bạn chưa đăng tin nào</p>
          ) : (
            <div className="jobs-list">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`job-item ${selectedJobId === job.id ? 'active' : ''}`}
                  onClick={() => handleViewApplications(job.id)}
                >
                  <h4>{job.title}</h4>
                  <p>{job.location}</p>
                  <small>Đăng: {new Date(job.createdAt).toLocaleDateString('vi-VN')}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="right-panel">
          {selectedJobId ? (
            <>
              <h3>Ứng Viên Ứng Tuyển</h3>
              {jobApplications.length === 0 ? (
                <p>Không có ứng viên nào ứng tuyển</p>
              ) : (
                <div className="applications-list">
                  {jobApplications.map((app) => (
                    <div key={app.id} className="application-item">
                      <div className="application-header">
                        <h4>{app.candidate?.username || 'Anonymous'}</h4>
                        <span className={`status ${app.status.toLowerCase()}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </div>
                      <p>Ngày nộp: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}</p>
                      <div className="action-buttons">
                        <button className="btn btn-sm btn-info" onClick={() => handleViewProfile(app.candidate?.id)}>Xem Hồ Sơ</button>
                        <select 
                          className="btn-status"
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        >
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
            <p className="empty-message">Chọn một tin tuyển dụng để xem ứng viên</p>
          )}
        </div>
      </div>

      {/* CV Modal */}
      {showCvModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '90%', maxWidth: 750, maxHeight: '90vh', overflow: 'auto', padding: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '2px solid #e5e7eb', background: '#1e3a5f', borderRadius: '12px 12px 0 0', color: '#fff' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>📄 Hồ Sơ Ứng Viên</h3>
              <button onClick={() => setShowCvModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#fff', fontWeight: 'bold' }}>&times;</button>
            </div>

            <div style={{ padding: 24 }}>
              {cvLoading && <p style={{ textAlign: 'center', color: '#6b7280' }}>Đang tải hồ sơ...</p>}

              {!cvLoading && cvData && cvData.error && (
                <p style={{ textAlign: 'center', color: '#ef4444' }}>Ứng viên chưa tạo hồ sơ.</p>
              )}

              {!cvLoading && cvData && !cvData.error && (
                <>
                  {/* Profile Info */}
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ color: '#1e3a5f', borderBottom: '3px solid #3b82f6', paddingBottom: 8, marginBottom: 16 }}>
                      {cvData.fullName || 'Chưa cập nhật tên'}
                    </h2>
                    {cvData.phone && <p style={{ margin: '4px 0' }}>📞 {cvData.phone}</p>}
                    {cvData.address && <p style={{ margin: '4px 0' }}>📍 {cvData.address}</p>}
                    {cvData.dateOfBirth && <p style={{ margin: '4px 0' }}>🎂 {cvData.dateOfBirth}</p>}
                    {cvData.bio && <p style={{ margin: '8px 0', color: '#374151', lineHeight: 1.6 }}>{cvData.bio}</p>}
                    {cvData.linkedinUrl && <p style={{ margin: '4px 0' }}>🔗 LinkedIn: <a href={cvData.linkedinUrl} target="_blank" rel="noreferrer">{cvData.linkedinUrl}</a></p>}
                    {cvData.githubUrl && <p style={{ margin: '4px 0' }}>💻 GitHub: <a href={cvData.githubUrl} target="_blank" rel="noreferrer">{cvData.githubUrl}</a></p>}
                    {cvData.portfolioUrl && <p style={{ margin: '4px 0' }}>🌐 Portfolio: <a href={cvData.portfolioUrl} target="_blank" rel="noreferrer">{cvData.portfolioUrl}</a></p>}
                  </div>

                  {/* Skills */}
                  {cvData.skills && (
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ color: '#2563eb', borderBottom: '1px solid #dbeafe', paddingBottom: 6 }}>Kỹ Năng</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        {cvData.skills.split(',').map((s, i) => s.trim()).filter(Boolean).map((skill, i) => (
                          <span key={i} style={{ background: '#3b82f6', color: '#fff', padding: '4px 14px', borderRadius: 20, fontSize: 13 }}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {cvExperiences.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ color: '#2563eb', borderBottom: '1px solid #dbeafe', paddingBottom: 6 }}>Kinh Nghiệm Làm Việc</h4>
                      {cvExperiences.map(exp => (
                        <div key={exp.id} style={{ borderLeft: '3px solid #3b82f6', paddingLeft: 14, margin: '10px 0' }}>
                          <strong>{exp.jobTitle}</strong> — {exp.companyName}
                          <br /><small style={{ color: '#6b7280' }}>{exp.startDate} — {exp.endDate || 'Hiện tại'}</small>
                          {exp.description && <p style={{ margin: '4px 0', color: '#374151', fontSize: 14 }}>{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {cvEducations.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ color: '#2563eb', borderBottom: '1px solid #dbeafe', paddingBottom: 6 }}>Học Vấn</h4>
                      {cvEducations.map(edu => (
                        <div key={edu.id} style={{ borderLeft: '3px solid #3b82f6', paddingLeft: 14, margin: '10px 0' }}>
                          <strong>{edu.degree}</strong> — {edu.institution}
                          {edu.fieldOfStudy && <span> ({edu.fieldOfStudy})</span>}
                          <br /><small style={{ color: '#6b7280' }}>{edu.startDate} — {edu.endDate || 'Hiện tại'}</small>
                          {edu.gpa && <span style={{ marginLeft: 10, fontSize: 13, color: '#059669' }}>GPA: {edu.gpa}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 20, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                    <button className="btn btn-success" onClick={() => window.open(`http://localhost:8080/api/profile/${cvData.candidateId}/cv`, '_blank')}>
                      📋 Xem CV đầy đủ
                    </button>
                    {cvData.resumePath && (
                      <button className="btn btn-info" onClick={() => window.open(`http://localhost:8080/api/profile/${cvData.candidateId}/resume`, '_blank')}>
                        📎 Xem Resume PDF
                      </button>
                    )}
                    <button className="btn btn-secondary" onClick={() => setShowCvModal(false)}>
                      Đóng
                    </button>
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
