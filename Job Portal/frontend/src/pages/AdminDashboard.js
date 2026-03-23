import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';

function AdminDashboard() {
  const [statistics, setStatistics] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPendingJobs, setShowPendingJobs] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [editingCatId, setEditingCatId] = useState(null);
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [allJobs, setAllJobs] = useState([]);
  const [jobFilter, setJobFilter] = useState('ALL');
  const [editingJob, setEditingJob] = useState(null);

  const authHeader = { headers: { 'Authorization': 'Bearer ' + AuthService.getToken() } };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/statistics', authHeader);
      setStatistics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch statistics', error);
      setLoading(false);
    }
  };

  const fetchPendingJobs = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/jobs/pending', authHeader);
      setPendingJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch pending jobs', error);
    }
  };

  const handleApproveJob = async (jobId) => {
    try {
      await axios.post(`http://localhost:8080/api/admin/jobs/${jobId}/approve`, {}, authHeader);
      alert('Job đã được phê duyệt!');
      fetchPendingJobs();
      fetchStatistics();
    } catch (error) {
      console.error('Failed to approve job', error);
      alert('Lỗi khi phê duyệt job');
    }
  };

  const handleRejectJob = async (jobId) => {
    const reason = prompt('Lý do từ chối:');
    if (!reason) return;
    try {
      await axios.post(`http://localhost:8080/api/admin/jobs/${jobId}/reject`, { reason }, authHeader);
      alert('Job đã bị từ chối!');
      fetchPendingJobs();
      fetchStatistics();
    } catch (error) {
      console.error('Failed to reject job', error);
      alert('Lỗi khi từ chối job');
    }
  };

  // Category management
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/categories', authHeader);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCatId) {
        await axios.put(`http://localhost:8080/api/admin/categories/${editingCatId}`, catForm, authHeader);
        setEditingCatId(null);
      } else {
        await axios.post('http://localhost:8080/api/admin/categories', catForm, authHeader);
      }
      setCatForm({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      alert('Failed to save category');
    }
  };

  const handleEditCat = (cat) => {
    setEditingCatId(cat.id);
    setCatForm({ name: cat.name, description: cat.description || '' });
  };

  const handleDeleteCat = async (id) => {
    if (!window.confirm('Xóa danh mục này?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/admin/categories/${id}`, authHeader);
      fetchCategories();
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  // User management
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/users', authHeader);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleToggleLock = async (userId) => {
    try {
      await axios.put(`http://localhost:8080/api/admin/users/${userId}/toggle-lock`, {}, authHeader);
      fetchUsers();
      fetchStatistics();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi thay đổi trạng thái tài khoản');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Xóa tài khoản "${username}"? Hành động này không thể hoàn tác!`)) return;
    try {
      await axios.delete(`http://localhost:8080/api/admin/users/${userId}`, authHeader);
      fetchUsers();
      fetchStatistics();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi xóa tài khoản');
    }
  };

  // All Jobs management
  const fetchAllJobs = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/jobs', authHeader);
      setAllJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch all jobs', error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Xóa tin tuyển dụng này? Hành động không thể hoàn tác!')) return;
    try {
      await axios.delete(`http://localhost:8080/api/admin/jobs/${jobId}`, authHeader);
      fetchAllJobs();
      fetchStatistics();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi xóa tin tuyển dụng');
    }
  };

  const handleUpdateJob = async (jobId) => {
    if (!editingJob) return;
    try {
      await axios.put(`http://localhost:8080/api/admin/jobs/${jobId}`, editingJob, authHeader);
      setEditingJob(null);
      fetchAllJobs();
      fetchStatistics();
      alert('Cập nhật thành công!');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi cập nhật');
    }
  };

  const handleChangeJobStatus = async (jobId, newStatus) => {
    try {
      await axios.put(`http://localhost:8080/api/admin/jobs/${jobId}`, { status: newStatus }, authHeader);
      fetchAllJobs();
      fetchStatistics();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi thay đổi trạng thái');
    }
  };

  const filteredJobs = jobFilter === 'ALL' ? allJobs : allJobs.filter(j => j.status === jobFilter);

  if (loading) {
    return <div className="container"><p>Đang tải...</p></div>;
  }

  return (
    <div className="container admin-dashboard">
      <h2>Bảng Điều Khiển Quản Trị Viên</h2>

      {statistics && (
        <>
          <div className="statistics-grid">
            <div className="stat-box">
              <div className="stat-number">{statistics.totalUsers}</div>
              <div className="stat-label">Tổng Người Dùng</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{statistics.totalCandidates}</div>
              <div className="stat-label">Ứng Viên</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{statistics.totalEmployers}</div>
              <div className="stat-label">Nhà Tuyển Dụng</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{statistics.totalJobs}</div>
              <div className="stat-label">Tin Tuyển Dụng</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{statistics.totalApplications}</div>
              <div className="stat-label">Tổng Ứng Tuyển</div>
            </div>
          </div>

          <div className="applications-breakdown">
            <h3>Thống Kê Ứng Tuyển</h3>
            <div className="breakdown-grid">
              <div className="breakdown-item submitted">
                <h4>{statistics.submittedApplications}</h4>
                <p>Đã Nộp</p>
              </div>
              <div className="breakdown-item reviewing">
                <h4>{statistics.reviewingApplications}</h4>
                <p>Đang Xem Xét</p>
              </div>
              <div className="breakdown-item interview">
                <h4>{statistics.interviewApplications}</h4>
                <p>Mời Phỏng Vấn</p>
              </div>
              <div className="breakdown-item accepted">
                <h4>{statistics.acceptedApplications}</h4>
                <p>Chấp Nhận</p>
              </div>
              <div className="breakdown-item rejected">
                <h4>{statistics.rejectedApplications}</h4>
                <p>Từ Chối</p>
              </div>
            </div>
          </div>

          <div className="admin-actions">
            <h3>Quản Trị</h3>
            <div className="action-buttons">
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setShowPendingJobs(!showPendingJobs);
                  if (!showPendingJobs) fetchPendingJobs();
                }}
              >
                {showPendingJobs ? 'Ẩn' : 'Duyệt'} Tin Tuyển Dụng
              </button>
              <button className="btn btn-primary" onClick={() => {
                setShowUsers(!showUsers);
                if (!showUsers) fetchUsers();
              }}>
                {showUsers ? 'Ẩn' : 'Quản Lý'} Người Dùng
              </button>
              <button className="btn btn-primary" onClick={() => {
                setShowAllJobs(!showAllJobs);
                if (!showAllJobs) fetchAllJobs();
              }}>
                {showAllJobs ? 'Ẩn' : 'Quản Lý'} Tất Cả Tin Tuyển Dụng
              </button>
              <button className="btn btn-primary" onClick={() => {
                setShowCategories(!showCategories);
                if (!showCategories) fetchCategories();
              }}>
                {showCategories ? 'Ẩn' : 'Quản Lý'} Danh Mục
              </button>
              <button className="btn btn-primary">Xem Báo Cáo</button>
            </div>
          </div>

          {showPendingJobs && (
            <div className="pending-jobs-section">
              <h3>Tin Tuyển Dụng Chờ Duyệt</h3>
              {pendingJobs.length === 0 ? (
                <p>Không có tin tuyển dụng nào chờ duyệt</p>
              ) : (
                <div className="pending-jobs-list">
                  {pendingJobs.map((job) => (
                    <div key={job.id} className="pending-job-item">
                      <div className="job-info">
                        <h4>{job.title}</h4>
                        <p><strong>Công ty:</strong> {job.employer?.username || 'N/A'}</p>
                        <p><strong>Địa điểm:</strong> {job.location}</p>
                        <p><strong>Danh mục:</strong> {job.category?.name || 'Chưa phân loại'}</p>
                        <p><strong>Mô tả:</strong> {job.description.substring(0, 100)}...</p>
                        <p><strong>Ngày đăng:</strong> {new Date(job.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div className="job-actions">
                        <button 
                          className="btn btn-success btn-sm" 
                          onClick={() => handleApproveJob(job.id)}
                        >
                          Phê Duyệt
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleRejectJob(job.id)}
                        >
                          Từ Chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showUsers && (
            <div style={{ marginTop: 20, padding: 20, background: '#eff6ff', borderRadius: 8, border: '1px solid #dbeafe' }}>
              <h3>Quản Lý Tài Khoản Người Dùng</h3>
              {users.length === 0 ? <p>Không có người dùng nào.</p> : (
                <table className="table">
                  <thead>
                    <tr><th>ID</th><th>Username</th><th>Vai trò</th><th>Trạng thái</th><th>Hành động</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ background: u.enabled ? '#fff' : '#fee2e2' }}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td>{u.roles.map(r => {
                          if (r === 'ROLE_ADMIN') return '🛡️ Admin';
                          if (r === 'ROLE_EMPLOYER') return '🏢 Employer';
                          if (r === 'ROLE_CANDIDATE') return '👤 Candidate';
                          return r;
                        }).join(', ')}</td>
                        <td>
                          <span style={{
                            padding: '2px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                            background: u.enabled ? '#dcfce7' : '#fee2e2',
                            color: u.enabled ? '#166534' : '#991b1b'
                          }}>
                            {u.enabled ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td>
                          {!u.roles.includes('ROLE_ADMIN') && (
                            <>
                              <button className={`btn btn-sm ${u.enabled ? 'btn-warning' : 'btn-success'}`}
                                onClick={() => handleToggleLock(u.id)} style={{ marginRight: 5 }}>
                                {u.enabled ? '🔒 Khóa' : '🔓 Mở khóa'}
                              </button>
                              <button className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteUser(u.id, u.username)}>
                                🗑️ Xóa
                              </button>
                            </>
                          )}
                          {u.roles.includes('ROLE_ADMIN') && <span style={{ color: '#6b7280', fontSize: 13 }}>Admin (không thể sửa)</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {showAllJobs && (
            <div style={{ marginTop: 20, padding: 20, background: '#fefce8', borderRadius: 8, border: '1px solid #fef08a' }}>
              <h3>Quản Lý Tất Cả Tin Tuyển Dụng</h3>
              <div style={{ marginBottom: 15, display: 'flex', gap: 8 }}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                  <button key={f} className={`btn btn-sm ${jobFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setJobFilter(f)}>
                    {f === 'ALL' ? 'Tất cả' : f === 'PENDING' ? 'Chờ duyệt' : f === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                    {f !== 'ALL' && ` (${allJobs.filter(j => j.status === f).length})`}
                  </button>
                ))}
              </div>
              {filteredJobs.length === 0 ? <p>Không có tin tuyển dụng nào.</p> : (
                <table className="table">
                  <thead>
                    <tr><th>ID</th><th>Tiêu đề</th><th>Nhà tuyển dụng</th><th>Địa điểm</th><th>Lương</th><th>Trạng thái</th><th>Hành động</th></tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map(job => (
                      <tr key={job.id}>
                        <td>{job.id}</td>
                        <td>
                          {editingJob && editingJob.id === job.id ? (
                            <input type="text" className="form-control" value={editingJob.title}
                              onChange={e => setEditingJob({...editingJob, title: e.target.value})} />
                          ) : job.title}
                        </td>
                        <td>{job.employer?.username || 'N/A'}</td>
                        <td>
                          {editingJob && editingJob.id === job.id ? (
                            <input type="text" className="form-control" value={editingJob.location || ''}
                              onChange={e => setEditingJob({...editingJob, location: e.target.value})} />
                          ) : job.location}
                        </td>
                        <td>
                          {editingJob && editingJob.id === job.id ? (
                            <input type="number" className="form-control" value={editingJob.salary || ''}
                              onChange={e => setEditingJob({...editingJob, salary: parseFloat(e.target.value) || 0})} />
                          ) : job.salary ? `${job.salary.toLocaleString('vi-VN')}đ` : 'Thỏa thuận'}
                        </td>
                        <td>
                          <span style={{
                            padding: '2px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                            background: job.status === 'APPROVED' ? '#dcfce7' : job.status === 'PENDING' ? '#fef9c3' : '#fee2e2',
                            color: job.status === 'APPROVED' ? '#166534' : job.status === 'PENDING' ? '#854d0e' : '#991b1b'
                          }}>
                            {job.status === 'APPROVED' ? '✅ Đã duyệt' : job.status === 'PENDING' ? '⏳ Chờ duyệt' : '❌ Từ chối'}
                          </span>
                        </td>
                        <td>
                          {editingJob && editingJob.id === job.id ? (
                            <>
                              <button className="btn btn-sm btn-success" onClick={() => handleUpdateJob(job.id)} style={{ marginRight: 4 }}>💾 Lưu</button>
                              <button className="btn btn-sm btn-secondary" onClick={() => setEditingJob(null)}>Hủy</button>
                            </>
                          ) : (
                            <>
                              {job.status !== 'APPROVED' && (
                                <button className="btn btn-sm btn-success" onClick={() => handleChangeJobStatus(job.id, 'APPROVED')} style={{ marginRight: 4 }}>✅</button>
                              )}
                              {job.status !== 'REJECTED' && (
                                <button className="btn btn-sm btn-warning" onClick={() => handleChangeJobStatus(job.id, 'REJECTED')} style={{ marginRight: 4 }}>❌</button>
                              )}
                              <button className="btn btn-sm btn-info" onClick={() => setEditingJob({id: job.id, title: job.title, location: job.location, salary: job.salary, description: job.description})} style={{ marginRight: 4 }}>✏️ Sửa</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteJob(job.id)}>🗑️ Xóa</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {showCategories && (
            <div style={{ marginTop: 20, padding: 20, background: '#eff6ff', borderRadius: 8, border: '1px solid #dbeafe' }}>
              <h3>Quản Lý Danh Mục</h3>
              <form onSubmit={handleCatSubmit} style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label>Tên danh mục</label>
                  <input type="text" className="form-control" value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required />
                </div>
                <div className="form-group" style={{ flex: 2, margin: 0 }}>
                  <label>Mô tả</label>
                  <input type="text" className="form-control" value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary">{editingCatId ? 'Cập nhật' : 'Thêm'}</button>
                {editingCatId && (
                  <button type="button" className="btn btn-secondary" onClick={() => { setEditingCatId(null); setCatForm({ name: '', description: '' }); }}>
                    Hủy
                  </button>
                )}
              </form>
              <table className="table">
                <thead><tr><th>ID</th><th>Tên</th><th>Mô tả</th><th>Hành động</th></tr></thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td>{cat.id}</td><td>{cat.name}</td><td>{cat.description}</td>
                      <td>
                        <button className="btn btn-sm btn-warning" onClick={() => handleEditCat(cat)}>Sửa</button>{' '}
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteCat(cat.id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
