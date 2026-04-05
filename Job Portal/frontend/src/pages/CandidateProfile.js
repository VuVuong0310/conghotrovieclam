import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import EducationService from '../services/EducationService';
import ExperienceService from '../services/ExperienceService';
import ProjectService from '../services/ProjectService';

function CandidateProfile() {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    fullName: '', email: '', phone: '', address: '', skills: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);

  const [educations, setEducations] = useState([]);
  const [eduForm, setEduForm] = useState({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' });
  const [editingEduId, setEditingEduId] = useState(null);

  const [experiences, setExperiences] = useState([]);
  const [expForm, setExpForm] = useState({ companyName: '', jobTitle: '', startDate: '', endDate: '', description: '' });
  const [editingExpId, setEditingExpId] = useState(null);

  const [projects, setProjects] = useState([]);
  const [projForm, setProjForm] = useState({ projectName: '', technology: '', description: '', role: '' });
  const [editingProjId, setEditingProjId] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/profile/${userId}`, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    }).then(res => {
      if (res.data) {
        const data = res.data;
        if (Array.isArray(data.skills)) data.skills = data.skills.join(', ');
        setProfile({
          fullName: data.fullName || '', email: data.email || '', phone: data.phone || '',
          address: data.address || '', skills: data.skills || '', bio: data.bio || '',
          dateOfBirth: data.dateOfBirth || '', linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '', portfolioUrl: data.portfolioUrl || '',
          resumePath: data.resumePath || '', softSkills: data.softSkills || '', awards: data.awards || ''
        });
      }
    }).catch(err => console.error(err));
    loadEducations(); loadExperiences(); loadProjects();
    setPhotoPreview(`${API_BASE}/profile/${userId}/photo`);
  }, [userId]);

  const loadEducations = () => { EducationService.getEducationsByCandidate(userId).then(r => setEducations(r.data)).catch(e => console.error(e)); };
  const loadExperiences = () => { ExperienceService.getExperiencesByCandidate(userId).then(r => setExperiences(r.data)).catch(e => console.error(e)); };
  const loadProjects = () => { ProjectService.getProjectsByCandidate(userId).then(r => setProjects(r.data)).catch(e => console.error(e)); };

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append('file', file);
    try {
      await axios.post(`${API_BASE}/profile/${userId}/resume`, formData, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'multipart/form-data' }
      });
      alert('Upload resume thành công!');
    } catch (e) { alert(e.response?.data?.message || 'Upload thất bại'); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append('file', file);
    try {
      await axios.post(`${API_BASE}/profile/${userId}/photo`, formData, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'multipart/form-data' }
      });
      setPhotoPreview(`${API_BASE}/profile/${userId}/photo?t=${Date.now()}`);
      alert('Upload ảnh thành công!');
    } catch (e) { alert(e.response?.data?.message || 'Upload thất bại'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...profile };
      if (typeof payload.skills === 'string') payload.skills = payload.skills.split(',').map(s => s.trim()).filter(s => s);
      await axios.put(`${API_BASE}/profile/${userId}`, payload, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      alert('Cập nhật hồ sơ thành công!');
    } catch (e) { console.error('Failed to update profile', e); }
  };

  // Education handlers
  const handleEduChange = (e) => setEduForm({ ...eduForm, [e.target.name]: e.target.value });
  const handleEduSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEduId) { await EducationService.updateEducation(userId, editingEduId, eduForm); setEditingEduId(null); }
      else { await EducationService.addEducation(userId, eduForm); }
      setEduForm({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' }); loadEducations();
    } catch (e) { alert('Lỗi khi lưu học vấn'); }
  };
  const handleEditEdu = (edu) => { setEditingEduId(edu.id); setEduForm({ institution: edu.institution || '', degree: edu.degree || '', fieldOfStudy: edu.fieldOfStudy || '', startDate: edu.startDate || '', endDate: edu.endDate || '' }); };
  const handleDeleteEdu = async (id) => { if (!window.confirm('Xóa học vấn này?')) return; try { await EducationService.deleteEducation(userId, id); loadEducations(); } catch (e) { alert('Lỗi khi xóa'); } };

  // Experience handlers
  const handleExpChange = (e) => setExpForm({ ...expForm, [e.target.name]: e.target.value });
  const handleExpSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpId) { await ExperienceService.updateExperience(userId, editingExpId, expForm); setEditingExpId(null); }
      else { await ExperienceService.addExperience(userId, expForm); }
      setExpForm({ companyName: '', jobTitle: '', startDate: '', endDate: '', description: '' }); loadExperiences();
    } catch (e) { alert('Lỗi khi lưu kinh nghiệm'); }
  };
  const handleEditExp = (exp) => { setEditingExpId(exp.id); setExpForm({ companyName: exp.companyName || '', jobTitle: exp.jobTitle || '', startDate: exp.startDate || '', endDate: exp.endDate || '', description: exp.description || '' }); };
  const handleDeleteExp = async (id) => { if (!window.confirm('Xóa kinh nghiệm này?')) return; try { await ExperienceService.deleteExperience(userId, id); loadExperiences(); } catch (e) { alert('Lỗi khi xóa'); } };

  // Project handlers
  const handleProjChange = (e) => setProjForm({ ...projForm, [e.target.name]: e.target.value });
  const handleProjSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProjId) { await ProjectService.updateProject(userId, editingProjId, projForm); setEditingProjId(null); }
      else { await ProjectService.addProject(userId, projForm); }
      setProjForm({ projectName: '', technology: '', description: '', role: '' }); loadProjects();
    } catch (e) { alert('Lỗi khi lưu dự án'); }
  };
  const handleEditProj = (proj) => { setEditingProjId(proj.id); setProjForm({ projectName: proj.projectName || '', technology: proj.technology || '', description: proj.description || '', role: proj.role || '' }); };
  const handleDeleteProj = async (id) => { if (!window.confirm('Xóa dự án này?')) return; try { await ProjectService.deleteProject(userId, id); loadProjects(); } catch (e) { alert('Lỗi khi xóa'); } };

  const [cvTemplate, setCvTemplate] = useState('classic');
  const viewCV = () => window.open(`${API_BASE}/profile/${userId}/cv?template=${cvTemplate}`, '_blank');
  const viewResume = () => window.open(`${API_BASE}/profile/${userId}/resume`, '_blank');

  const cvTemplates = [
    { key: 'classic', label: 'Classic', desc: 'Sidebar xanh đậm, 2 cột truyền thống', color: '#2c3e50' },
    { key: 'modern', label: 'Modern', desc: 'Header gradient tím, bo tròn hiện đại', color: '#764ba2' },
    { key: 'minimal', label: 'Minimal', desc: 'Đơn giản, 1 cột, font serif thanh lịch', color: '#222' },
    { key: 'elegant', label: 'Elegant', desc: 'Xanh navy + vàng gold sang trọng', color: '#0c2340' },
    { key: 'creative', label: 'Creative', desc: 'Đỏ nổi bật, 2 cột grid sáng tạo', color: '#e74c3c' },
    { key: 'executive', label: 'Executive', desc: 'Cổ điển sang trọng, font serif cao cấp', color: '#8b7355' },
    { key: 'developer', label: 'Developer', desc: 'Dark theme phong cách VS Code', color: '#007acc' },
    { key: 'academic', label: 'Academic', desc: 'Học thuật, giáo dục ưu tiên đầu', color: '#2c5282' },
  ];

  const tabs = [
    { key: 'profile', label: 'Hồ sơ', icon: 'bi-person' },
    { key: 'education', label: 'Học vấn', icon: 'bi-mortarboard' },
    { key: 'experience', label: 'Kinh nghiệm', icon: 'bi-briefcase' },
    { key: 'project', label: 'Dự án', icon: 'bi-code-square' }
  ];

  return (
    <div className="jp-container" style={{ maxWidth: 900 }}>
      <div className="jp-page-header mb-4">
        <h1><i className="bi bi-person-circle me-2"></i>Hồ Sơ Của Tôi</h1>
        <p>Quản lý thông tin cá nhân và hồ sơ ứng tuyển</p>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {tabs.map(tab => (
          <li className="nav-item" key={tab.key}>
            <button className={`nav-link ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              <i className={`bi ${tab.icon} me-1`}></i>{tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="jp-card">
          <div className="jp-card-body">
            <form onSubmit={handleSubmit}>
              {/* Photo upload */}
              <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
                <div>
                  <img src={photoPreview} alt="Profile" onError={e => { e.target.style.display = 'none'; }}
                    className="rounded-circle border border-3 border-primary" style={{ width: 100, height: 100, objectFit: 'cover' }} />
                </div>
                <div>
                  <label className="form-label fw-semibold"><i className="bi bi-camera me-1"></i>Ảnh đại diện</label>
                  <input type="file" accept="image/*" className="form-control form-control-sm" onChange={handlePhotoUpload} />
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label"><i className="bi bi-person me-1"></i>Họ và tên</label>
                  <input type="text" name="fullName" className="form-control" value={profile.fullName} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label"><i className="bi bi-envelope me-1"></i>Email</label>
                  <input type="email" name="email" className="form-control" value={profile.email} onChange={handleChange} placeholder="example@gmail.com" />
                </div>
                <div className="col-md-6">
                  <label className="form-label"><i className="bi bi-telephone me-1"></i>Số điện thoại</label>
                  <input type="text" name="phone" className="form-control" value={profile.phone} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label"><i className="bi bi-geo-alt me-1"></i>Địa chỉ</label>
                  <input type="text" name="address" className="form-control" value={profile.address} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label"><i className="bi bi-calendar-heart me-1"></i>Ngày sinh</label>
                  <input type="date" name="dateOfBirth" className="form-control" value={profile.dateOfBirth || ''} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label"><i className="bi bi-tools me-1"></i>Kỹ năng (phân cách bằng dấu phẩy)</label>
                  <input type="text" name="skills" className="form-control" value={profile.skills} onChange={handleChange} placeholder="Java, Python, React" />
                </div>
                <div className="col-12">
                  <label className="form-label"><i className="bi bi-chat-text me-1"></i>Giới thiệu bản thân</label>
                  <textarea name="bio" className="form-control" rows="3" value={profile.bio || ''} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label"><i className="bi bi-linkedin me-1"></i>LinkedIn</label>
                  <input type="text" name="linkedinUrl" className="form-control" value={profile.linkedinUrl || ''} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label"><i className="bi bi-github me-1"></i>GitHub</label>
                  <input type="text" name="githubUrl" className="form-control" value={profile.githubUrl || ''} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label"><i className="bi bi-globe me-1"></i>Portfolio</label>
                  <input type="text" name="portfolioUrl" className="form-control" value={profile.portfolioUrl || ''} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label"><i className="bi bi-heart me-1"></i>Kỹ năng mềm</label>
                  <textarea name="softSkills" className="form-control" rows="3" value={profile.softSkills || ''} onChange={handleChange}
                    placeholder="Làm việc nhóm&#10;Quản lý dự án&#10;Tư duy logic" />
                </div>
                <div className="col-md-6">
                  <label className="form-label"><i className="bi bi-trophy me-1"></i>Danh hiệu / Giải thưởng</label>
                  <textarea name="awards" className="form-control" rows="3" value={profile.awards || ''} onChange={handleChange}
                    placeholder="Sinh viên xuất sắc 2024&#10;Giải nhất Hackathon 2023" />
                </div>
                <div className="col-12">
                  <label className="form-label"><i className="bi bi-file-earmark-pdf me-1"></i>Upload Resume (PDF)</label>
                  <input type="file" accept=".pdf" className="form-control" onChange={handleResumeUpload} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <div className="d-flex gap-2 mb-3">
                  <button type="submit" className="btn btn-primary"><i className="bi bi-check-lg me-1"></i>Lưu Hồ Sơ</button>
                  <button type="button" className="btn btn-outline-primary" onClick={viewCV}><i className="bi bi-file-earmark-text me-1"></i>Xem CV</button>
                  <button type="button" className="btn btn-outline-secondary" onClick={viewResume}><i className="bi bi-paperclip me-1"></i>Xem Resume</button>
                </div>
                <div>
                  <label className="form-label fw-semibold"><i className="bi bi-palette me-1"></i>Chọn mẫu CV</label>
                  <div className="row g-2">
                    {cvTemplates.map(t => (
                      <div className="col-md-3 col-6" key={t.key}>
                        <div onClick={() => setCvTemplate(t.key)}
                          className="p-3 rounded-3 text-center border"
                          style={{
                            cursor: 'pointer',
                            borderColor: cvTemplate === t.key ? t.color : '#e5e7eb',
                            borderWidth: cvTemplate === t.key ? 2 : 1,
                            background: cvTemplate === t.key ? t.color + '0d' : '#fff',
                            transition: 'all .2s'
                          }}>
                          <div className="rounded-2 mx-auto mb-2" style={{ width: 40, height: 40, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-file-earmark-text" style={{ color: '#fff', fontSize: 18 }}></i>
                          </div>
                          <div className="fw-semibold" style={{ fontSize: 13 }}>{t.label}</div>
                          <div className="text-muted" style={{ fontSize: 11 }}>{t.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Education Tab */}
      {activeTab === 'education' && (
        <div>
          <div className="jp-card mb-4">
            <div className="jp-card-body">
              <h5 className="fw-bold mb-3"><i className="bi bi-mortarboard me-2 text-primary"></i>{editingEduId ? 'Sửa Học Vấn' : 'Thêm Học Vấn'}</h5>
              <form onSubmit={handleEduSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Trường học</label>
                    <input type="text" name="institution" className="form-control" value={eduForm.institution} onChange={handleEduChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Bằng cấp</label>
                    <input type="text" name="degree" className="form-control" value={eduForm.degree} onChange={handleEduChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Chuyên ngành</label>
                    <input type="text" name="fieldOfStudy" className="form-control" value={eduForm.fieldOfStudy} onChange={handleEduChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Ngày bắt đầu</label>
                    <input type="date" name="startDate" className="form-control" value={eduForm.startDate} onChange={handleEduChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Ngày kết thúc</label>
                    <input type="date" name="endDate" className="form-control" value={eduForm.endDate} onChange={handleEduChange} />
                  </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-primary"><i className={`bi ${editingEduId ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>{editingEduId ? 'Cập nhật' : 'Thêm'}</button>
                  {editingEduId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingEduId(null); setEduForm({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' }); }}>Hủy</button>}
                </div>
              </form>
            </div>
          </div>

          <div className="jp-card">
            <div className="jp-card-body">
              <h5 className="fw-bold mb-3"><i className="bi bi-list-ul me-2"></i>Danh Sách Học Vấn</h5>
              {educations.length === 0 ? (
                <div className="jp-empty-state"><i className="bi bi-mortarboard"></i><h6>Chưa có thông tin học vấn</h6></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle jp-table">
                    <thead><tr><th>Trường</th><th>Bằng cấp</th><th>Chuyên ngành</th><th>Bắt đầu</th><th>Kết thúc</th><th>Thao tác</th></tr></thead>
                    <tbody>
                      {educations.map(edu => (
                        <tr key={edu.id}>
                          <td className="fw-semibold">{edu.institution}</td><td>{edu.degree}</td><td>{edu.fieldOfStudy}</td>
                          <td>{edu.startDate}</td><td>{edu.endDate}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <button className="btn btn-outline-warning btn-sm" onClick={() => handleEditEdu(edu)}><i className="bi bi-pencil"></i></button>
                              <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteEdu(edu.id)}><i className="bi bi-trash"></i></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Experience Tab */}
      {activeTab === 'experience' && (
        <div>
          <div className="jp-card mb-4">
            <div className="jp-card-body">
              <h5 className="fw-bold mb-3"><i className="bi bi-briefcase me-2 text-primary"></i>{editingExpId ? 'Sửa Kinh Nghiệm' : 'Thêm Kinh Nghiệm'}</h5>
              <form onSubmit={handleExpSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Tên công ty</label>
                    <input type="text" name="companyName" className="form-control" value={expForm.companyName} onChange={handleExpChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Vị trí</label>
                    <input type="text" name="jobTitle" className="form-control" value={expForm.jobTitle} onChange={handleExpChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Ngày bắt đầu</label>
                    <input type="date" name="startDate" className="form-control" value={expForm.startDate} onChange={handleExpChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Ngày kết thúc</label>
                    <input type="date" name="endDate" className="form-control" value={expForm.endDate} onChange={handleExpChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Mô tả công việc</label>
                    <textarea name="description" className="form-control" rows="3" value={expForm.description} onChange={handleExpChange}></textarea>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-primary"><i className={`bi ${editingExpId ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>{editingExpId ? 'Cập nhật' : 'Thêm'}</button>
                  {editingExpId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingExpId(null); setExpForm({ companyName: '', jobTitle: '', startDate: '', endDate: '', description: '' }); }}>Hủy</button>}
                </div>
              </form>
            </div>
          </div>

          <div className="jp-card">
            <div className="jp-card-body">
              <h5 className="fw-bold mb-3"><i className="bi bi-list-ul me-2"></i>Danh Sách Kinh Nghiệm</h5>
              {experiences.length === 0 ? (
                <div className="jp-empty-state"><i className="bi bi-briefcase"></i><h6>Chưa có kinh nghiệm làm việc</h6></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle jp-table">
                    <thead><tr><th>Công ty</th><th>Vị trí</th><th>Bắt đầu</th><th>Kết thúc</th><th>Mô tả</th><th>Thao tác</th></tr></thead>
                    <tbody>
                      {experiences.map(exp => (
                        <tr key={exp.id}>
                          <td className="fw-semibold">{exp.companyName}</td><td>{exp.jobTitle}</td>
                          <td>{exp.startDate}</td><td>{exp.endDate}</td><td className="text-truncate" style={{maxWidth:150}}>{exp.description}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <button className="btn btn-outline-warning btn-sm" onClick={() => handleEditExp(exp)}><i className="bi bi-pencil"></i></button>
                              <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteExp(exp.id)}><i className="bi bi-trash"></i></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project Tab */}
      {activeTab === 'project' && (
        <div>
          <div className="jp-card mb-4">
            <div className="jp-card-body">
              <h5 className="fw-bold mb-3"><i className="bi bi-code-square me-2 text-primary"></i>{editingProjId ? 'Sửa Dự Án' : 'Thêm Dự Án'}</h5>
              <form onSubmit={handleProjSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Tên dự án</label>
                    <input type="text" name="projectName" className="form-control" value={projForm.projectName} onChange={handleProjChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Công nghệ</label>
                    <input type="text" name="technology" className="form-control" value={projForm.technology} onChange={handleProjChange} placeholder="React, Spring Boot, MySQL..." />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mô tả</label>
                    <textarea name="description" className="form-control" rows="3" value={projForm.description} onChange={handleProjChange}></textarea>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Vai trò</label>
                    <textarea name="role" className="form-control" rows="3" value={projForm.role} onChange={handleProjChange}></textarea>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-primary"><i className={`bi ${editingProjId ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>{editingProjId ? 'Cập nhật' : 'Thêm'}</button>
                  {editingProjId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingProjId(null); setProjForm({ projectName: '', technology: '', description: '', role: '' }); }}>Hủy</button>}
                </div>
              </form>
            </div>
          </div>

          <div className="jp-card">
            <div className="jp-card-body">
              <h5 className="fw-bold mb-3"><i className="bi bi-list-ul me-2"></i>Danh Sách Dự Án</h5>
              {projects.length === 0 ? (
                <div className="jp-empty-state"><i className="bi bi-code-square"></i><h6>Chưa có dự án nào</h6></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle jp-table">
                    <thead><tr><th>Tên dự án</th><th>Công nghệ</th><th>Mô tả</th><th>Vai trò</th><th>Thao tác</th></tr></thead>
                    <tbody>
                      {projects.map(proj => (
                        <tr key={proj.id}>
                          <td className="fw-semibold">{proj.projectName}</td><td>{proj.technology}</td>
                          <td className="text-truncate" style={{maxWidth:150}}>{proj.description}</td><td>{proj.role}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <button className="btn btn-outline-warning btn-sm" onClick={() => handleEditProj(proj)}><i className="bi bi-pencil"></i></button>
                              <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteProj(proj.id)}><i className="bi bi-trash"></i></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateProfile;
