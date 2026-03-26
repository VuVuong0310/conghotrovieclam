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
    fullName: '',
    email: '',
    phone: '',
    address: '',
    skills: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);

  // Education state
  const [educations, setEducations] = useState([]);
  const [eduForm, setEduForm] = useState({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' });
  const [editingEduId, setEditingEduId] = useState(null);

  // Experience state
  const [experiences, setExperiences] = useState([]);
  const [expForm, setExpForm] = useState({ companyName: '', jobTitle: '', startDate: '', endDate: '', description: '' });
  const [editingExpId, setEditingExpId] = useState(null);

  // Project state
  const [projects, setProjects] = useState([]);
  const [projForm, setProjForm] = useState({ projectName: '', technology: '', description: '', role: '' });
  const [editingProjId, setEditingProjId] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/profile/${userId}`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => {
        if (res.data) {
          const data = res.data;
          // Convert skills array to comma string for the input
          if (Array.isArray(data.skills)) {
            data.skills = data.skills.join(', ');
          }
          // Ensure no null values for controlled inputs
          setProfile({
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            skills: data.skills || '',
            bio: data.bio || '',
            dateOfBirth: data.dateOfBirth || '',
            linkedinUrl: data.linkedinUrl || '',
            githubUrl: data.githubUrl || '',
            portfolioUrl: data.portfolioUrl || '',
            resumePath: data.resumePath || '',
            softSkills: data.softSkills || '',
            awards: data.awards || ''
          });
        }
      })
      .catch(err => console.error(err));

    loadEducations();
    loadExperiences();
    loadProjects();
    // Load profile photo
    setPhotoPreview(`${API_BASE}/profile/${userId}/photo`);
  }, [userId]);

  const loadEducations = () => {
    EducationService.getEducationsByCandidate(userId)
      .then(res => setEducations(res.data))
      .catch(err => console.error(err));
  };

  const loadExperiences = () => {
    ExperienceService.getExperiencesByCandidate(userId)
      .then(res => setExperiences(res.data))
      .catch(err => console.error(err));
  };

  const loadProjects = () => {
    ProjectService.getProjectsByCandidate(userId)
      .then(res => setProjects(res.data))
      .catch(err => console.error(err));
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`${API_BASE}/profile/${userId}/resume`, formData, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'multipart/form-data' }
      });
      alert('Resume uploaded successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload resume');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`${API_BASE}/profile/${userId}/photo`, formData, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'multipart/form-data' }
      });
      setPhotoPreview(`${API_BASE}/profile/${userId}/photo?t=${Date.now()}`);
      alert('Photo uploaded successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload photo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert skills string to array for backend
      const payload = { ...profile };
      if (typeof payload.skills === 'string') {
        payload.skills = payload.skills.split(',').map(s => s.trim()).filter(s => s);
      }
      await axios.put(`${API_BASE}/profile/${userId}`, payload, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  // Education handlers
  const handleEduChange = (e) => setEduForm({ ...eduForm, [e.target.name]: e.target.value });

  const handleEduSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEduId) {
        await EducationService.updateEducation(userId, editingEduId, eduForm);
        setEditingEduId(null);
      } else {
        await EducationService.addEducation(userId, eduForm);
      }
      setEduForm({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' });
      loadEducations();
    } catch (error) {
      alert('Failed to save education');
    }
  };

  const handleEditEdu = (edu) => {
    setEditingEduId(edu.id);
    setEduForm({
      institution: edu.institution || '',
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || ''
    });
  };

  const handleDeleteEdu = async (id) => {
    if (!window.confirm('Delete this education?')) return;
    try {
      await EducationService.deleteEducation(userId, id);
      loadEducations();
    } catch (error) {
      alert('Failed to delete education');
    }
  };

  // Experience handlers
  const handleExpChange = (e) => setExpForm({ ...expForm, [e.target.name]: e.target.value });

  const handleExpSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpId) {
        await ExperienceService.updateExperience(userId, editingExpId, expForm);
        setEditingExpId(null);
      } else {
        await ExperienceService.addExperience(userId, expForm);
      }
      setExpForm({ companyName: '', jobTitle: '', startDate: '', endDate: '', description: '' });
      loadExperiences();
    } catch (error) {
      alert('Failed to save experience');
    }
  };

  const handleEditExp = (exp) => {
    setEditingExpId(exp.id);
    setExpForm({
      companyName: exp.companyName || '',
      jobTitle: exp.jobTitle || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      description: exp.description || ''
    });
  };

  const handleDeleteExp = async (id) => {
    if (!window.confirm('Delete this experience?')) return;
    try {
      await ExperienceService.deleteExperience(userId, id);
      loadExperiences();
    } catch (error) {
      alert('Failed to delete experience');
    }
  };

  // Project handlers
  const handleProjChange = (e) => setProjForm({ ...projForm, [e.target.name]: e.target.value });

  const handleProjSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProjId) {
        await ProjectService.updateProject(userId, editingProjId, projForm);
        setEditingProjId(null);
      } else {
        await ProjectService.addProject(userId, projForm);
      }
      setProjForm({ projectName: '', technology: '', description: '', role: '' });
      loadProjects();
    } catch (error) {
      alert('Failed to save project');
    }
  };

  const handleEditProj = (proj) => {
    setEditingProjId(proj.id);
    setProjForm({
      projectName: proj.projectName || '',
      technology: proj.technology || '',
      description: proj.description || '',
      role: proj.role || ''
    });
  };

  const handleDeleteProj = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await ProjectService.deleteProject(userId, id);
      loadProjects();
    } catch (error) {
      alert('Failed to delete project');
    }
  };

  const viewCV = () => {
    window.open(`${API_BASE}/profile/${userId}/cv`, '_blank');
  };

  const viewResume = () => {
    window.open(`${API_BASE}/profile/${userId}/resume`, '_blank');
  };

  return (
    <div className="container">
      <h2>My Profile</h2>

      {/* Tab Navigation */}
      <ul style={{ display: 'flex', listStyle: 'none', padding: 0, borderBottom: '2px solid #dbeafe', marginBottom: 20 }}>
        {[{key:'profile',label:'Hồ sơ'},{key:'education',label:'Học vấn'},{key:'experience',label:'Kinh nghiệm'},{key:'project',label:'Dự án'}].map(tab => (
          <li key={tab.key} style={{ marginRight: 4 }}>
            <button
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 24px', border: '1px solid #dbeafe', borderBottom: activeTab === tab.key ? '2px solid white' : 'none',
                background: activeTab === tab.key ? '#2563eb' : '#fff', color: activeTab === tab.key ? '#fff' : '#1f2937',
                cursor: 'pointer', borderRadius: '6px 6px 0 0', fontWeight: 600, fontSize: '0.95rem',
                transition: 'background 0.2s'
              }}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <div>
              <img
                src={photoPreview}
                alt="Profile"
                onError={(e) => { e.target.style.display = 'none'; }}
                style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 600 }}>Ảnh đại diện</label><br/>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ marginTop: 5 }} />
            </div>
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="fullName" className="form-control" value={profile.fullName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email (Gmail)</label>
            <input type="email" name="email" className="form-control" value={profile.email} onChange={handleChange} placeholder="example@gmail.com" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" name="phone" className="form-control" value={profile.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" className="form-control" value={profile.address} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input type="text" name="skills" className="form-control" value={profile.skills} onChange={handleChange} placeholder="Java, Python, React" />
          </div>
          <div className="form-group">
            <label>Kỹ năng mềm (mỗi dòng 1 kỹ năng)</label>
            <textarea name="softSkills" className="form-control" rows="4" value={profile.softSkills || ''} onChange={handleChange}
              placeholder="Làm việc nhóm&#10;Quản lý dự án&#10;Tư duy logic" />
          </div>
          <div className="form-group">
            <label>Danh hiệu / Giải thưởng (mỗi dòng 1 danh hiệu)</label>
            <textarea name="awards" className="form-control" rows="4" value={profile.awards || ''} onChange={handleChange}
              placeholder="Sinh viên xuất sắc 2024&#10;Giải nhất Hackathon HUTECH 2023" />
          </div>
          <div className="form-group">
            <label>Upload Resume (PDF)</label>
            <input type="file" accept=".pdf" className="form-control" onChange={handleResumeUpload} />
          </div>
          <div style={{ marginTop: 15, display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary">Save Profile</button>
            <button type="button" className="btn btn-success" onClick={viewCV}>View CV</button>
            <button type="button" className="btn btn-info" onClick={viewResume}>View Resume</button>
          </div>
        </form>
      )}

      {/* Education Tab */}
      {activeTab === 'education' && (
        <div>
          <h4>{editingEduId ? 'Edit Education' : 'Add Education'}</h4>
          <form onSubmit={handleEduSubmit} style={{ marginBottom: 20, padding: 16, background: '#eff6ff', borderRadius: 8, border: '1px solid #dbeafe' }}>
            <div className="form-group">
              <label>School Name</label>
              <input type="text" name="institution" className="form-control" value={eduForm.institution} onChange={handleEduChange} required />
            </div>
            <div className="form-group">
              <label>Degree</label>
              <input type="text" name="degree" className="form-control" value={eduForm.degree} onChange={handleEduChange} />
            </div>
            <div className="form-group">
              <label>Field of Study</label>
              <input type="text" name="fieldOfStudy" className="form-control" value={eduForm.fieldOfStudy} onChange={handleEduChange} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Start Date</label>
                <input type="date" name="startDate" className="form-control" value={eduForm.startDate} onChange={handleEduChange} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>End Date</label>
                <input type="date" name="endDate" className="form-control" value={eduForm.endDate} onChange={handleEduChange} />
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <button type="submit" className="btn btn-primary">{editingEduId ? 'Update' : 'Add'}</button>
              {editingEduId && (
                <button type="button" className="btn btn-secondary" style={{ marginLeft: 10 }}
                  onClick={() => { setEditingEduId(null); setEduForm({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' }); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h4>Education List</h4>
          {educations.length === 0 ? <p>No education records yet.</p> : (
            <table className="table">
              <thead><tr><th>School</th><th>Degree</th><th>Field</th><th>Start</th><th>End</th><th>Actions</th></tr></thead>
              <tbody>
                {educations.map(edu => (
                  <tr key={edu.id}>
                    <td>{edu.institution}</td><td>{edu.degree}</td><td>{edu.fieldOfStudy}</td>
                    <td>{edu.startDate}</td><td>{edu.endDate}</td>
                    <td>
                      <button className="btn btn-sm btn-warning" onClick={() => handleEditEdu(edu)}>Edit</button>{' '}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteEdu(edu.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Experience Tab */}
      {activeTab === 'experience' && (
        <div>
          <h4>{editingExpId ? 'Edit Experience' : 'Add Experience'}</h4>
          <form onSubmit={handleExpSubmit} style={{ marginBottom: 20, padding: 16, background: '#eff6ff', borderRadius: 8, border: '1px solid #dbeafe' }}>
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" name="companyName" className="form-control" value={expForm.companyName} onChange={handleExpChange} required />
            </div>
            <div className="form-group">
              <label>Position</label>
              <input type="text" name="jobTitle" className="form-control" value={expForm.jobTitle} onChange={handleExpChange} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Start Date</label>
                <input type="date" name="startDate" className="form-control" value={expForm.startDate} onChange={handleExpChange} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>End Date</label>
                <input type="date" name="endDate" className="form-control" value={expForm.endDate} onChange={handleExpChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" className="form-control" rows="3" value={expForm.description} onChange={handleExpChange}></textarea>
            </div>
            <div style={{ marginTop: 10 }}>
              <button type="submit" className="btn btn-primary">{editingExpId ? 'Update' : 'Add'}</button>
              {editingExpId && (
                <button type="button" className="btn btn-secondary" style={{ marginLeft: 10 }}
                  onClick={() => { setEditingExpId(null); setExpForm({ companyName: '', jobTitle: '', startDate: '', endDate: '', description: '' }); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h4>Experience List</h4>
          {experiences.length === 0 ? <p>No experience records yet.</p> : (
            <table className="table">
              <thead><tr><th>Company</th><th>Position</th><th>Start</th><th>End</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {experiences.map(exp => (
                  <tr key={exp.id}>
                    <td>{exp.companyName}</td><td>{exp.jobTitle}</td>
                    <td>{exp.startDate}</td><td>{exp.endDate}</td><td>{exp.description}</td>
                    <td>
                      <button className="btn btn-sm btn-warning" onClick={() => handleEditExp(exp)}>Edit</button>{' '}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteExp(exp.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Project Tab */}
      {activeTab === 'project' && (
        <div>
          <h4>{editingProjId ? 'Sửa dự án' : 'Thêm dự án'}</h4>
          <form onSubmit={handleProjSubmit} style={{ marginBottom: 20, padding: 16, background: '#eff6ff', borderRadius: 8, border: '1px solid #dbeafe' }}>
            <div className="form-group">
              <label>Tên dự án</label>
              <input type="text" name="projectName" className="form-control" value={projForm.projectName} onChange={handleProjChange} required />
            </div>
            <div className="form-group">
              <label>Công nghệ</label>
              <input type="text" name="technology" className="form-control" value={projForm.technology} onChange={handleProjChange} placeholder="React, Spring Boot, MySQL..." />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea name="description" className="form-control" rows="3" value={projForm.description} onChange={handleProjChange}></textarea>
            </div>
            <div className="form-group">
              <label>Vai trò</label>
              <textarea name="role" className="form-control" rows="3" value={projForm.role} onChange={handleProjChange}></textarea>
            </div>
            <div style={{ marginTop: 10 }}>
              <button type="submit" className="btn btn-primary">{editingProjId ? 'Cập nhật' : 'Thêm'}</button>
              {editingProjId && (
                <button type="button" className="btn btn-secondary" style={{ marginLeft: 10 }}
                  onClick={() => { setEditingProjId(null); setProjForm({ projectName: '', technology: '', description: '', role: '' }); }}>
                  Hủy
                </button>
              )}
            </div>
          </form>

          <h4>Danh sách dự án</h4>
          {projects.length === 0 ? <p>Chưa có dự án nào.</p> : (
            <table className="table">
              <thead><tr><th>Tên dự án</th><th>Công nghệ</th><th>Mô tả</th><th>Vai trò</th><th>Actions</th></tr></thead>
              <tbody>
                {projects.map(proj => (
                  <tr key={proj.id}>
                    <td>{proj.projectName}</td><td>{proj.technology}</td>
                    <td>{proj.description}</td><td>{proj.role}</td>
                    <td>
                      <button className="btn btn-sm btn-warning" onClick={() => handleEditProj(proj)}>Edit</button>{' '}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteProj(proj.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default CandidateProfile;
