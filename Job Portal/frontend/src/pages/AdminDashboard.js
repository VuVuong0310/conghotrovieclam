import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import API_BASE from '../config/api';

/* ── tiny bar-chart (pure CSS) ── */
function MiniBarChart({ data, colors, height = 160 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="d-flex align-items-end gap-1" style={{ height, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} className="d-flex flex-column align-items-center gap-1" style={{ flex: 1 }}>
          <span className="fw-bold small">{d.value}</span>
          <div className="rounded" style={{ width: '100%', maxWidth: 48, height: `${Math.max((d.value / max) * (height - 30), 4)}px`, background: colors[i % colors.length], transition: 'height .4s ease' }} />
          <span className="text-muted" style={{ fontSize: 10, textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── donut chart (SVG) ── */
function DonutChart({ value, total, color = '#2563eb', size = 90 }) {
  const pct = total > 0 ? value / total : 0;
  const r = 36, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${c * pct} ${c * (1 - pct)}`}
        strokeLinecap="round" transform="rotate(-90 45 45)" style={{ transition: 'stroke-dasharray .6s ease' }} />
      <text x="45" y="49" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1f2937">{Math.round(pct * 100)}%</text>
    </svg>
  );
}

function AdminDashboard() {
  const [statistics, setStatistics] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [categories, setCategories] = useState([]);
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [editingCatId, setEditingCatId] = useState(null);
  const [users, setUsers] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [jobFilter, setJobFilter] = useState('ALL');
  const [editingJob, setEditingJob] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const authHeader = { headers: { Authorization: 'Bearer ' + AuthService.getToken() } };

  const fetchStatistics = useCallback(async () => {
    try { const res = await axios.get(`${API_BASE}/admin/statistics`, authHeader); setStatistics(res.data); }
    catch (e) { console.error('Failed to fetch statistics', e); }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchStatistics(); }, [fetchStatistics]);

  const fetchPendingJobs = async () => { try { const r = await axios.get(`${API_BASE}/admin/jobs/pending`, authHeader); setPendingJobs(r.data); } catch (e) { console.error(e); } };
  const handleApproveJob = async (jobId) => { try { await axios.post(`${API_BASE}/admin/jobs/${jobId}/approve`, {}, authHeader); fetchPendingJobs(); fetchStatistics(); } catch (e) { alert('Lỗi khi phê duyệt'); } };
  const handleRejectJob = async (jobId) => { const reason = prompt('Lý do từ chối:'); if (!reason) return; try { await axios.post(`${API_BASE}/admin/jobs/${jobId}/reject`, { reason }, authHeader); fetchPendingJobs(); fetchStatistics(); } catch (e) { alert('Lỗi khi từ chối'); } };
  const fetchCategories = async () => { try { const r = await axios.get(`${API_BASE}/admin/categories`, authHeader); setCategories(r.data); } catch (e) { console.error(e); } };
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCatId) { await axios.put(`${API_BASE}/admin/categories/${editingCatId}`, catForm, authHeader); setEditingCatId(null); }
      else { await axios.post(`${API_BASE}/admin/categories`, catForm, authHeader); }
      setCatForm({ name: '', description: '' }); fetchCategories();
    } catch (e) { alert('Lỗi khi lưu danh mục'); }
  };
  const handleEditCat = (cat) => { setEditingCatId(cat.id); setCatForm({ name: cat.name, description: cat.description || '' }); };
  const handleDeleteCat = async (id) => { if (!window.confirm('Xóa danh mục này?')) return; try { await axios.delete(`${API_BASE}/admin/categories/${id}`, authHeader); fetchCategories(); } catch (e) { alert('Lỗi khi xóa'); } };
  const fetchUsers = async () => { try { const r = await axios.get(`${API_BASE}/admin/users`, authHeader); setUsers(r.data); } catch (e) { console.error(e); } };
  const handleToggleLock = async (userId) => { try { await axios.put(`${API_BASE}/admin/users/${userId}/toggle-lock`, {}, authHeader); fetchUsers(); fetchStatistics(); } catch (e) { alert(e.response?.data?.message || 'Lỗi'); } };
  const handleDeleteUser = async (userId, username) => { if (!window.confirm(`Xóa tài khoản "${username}"?`)) return; try { await axios.delete(`${API_BASE}/admin/users/${userId}`, authHeader); fetchUsers(); fetchStatistics(); } catch (e) { alert(e.response?.data?.message || 'Lỗi'); } };
  const fetchAllJobs = async () => { try { const r = await axios.get(`${API_BASE}/admin/jobs`, authHeader); setAllJobs(r.data); } catch (e) { console.error(e); } };
  const handleDeleteJob = async (jobId) => { if (!window.confirm('Xóa tin tuyển dụng này?')) return; try { await axios.delete(`${API_BASE}/admin/jobs/${jobId}`, authHeader); fetchAllJobs(); fetchStatistics(); } catch (e) { alert(e.response?.data?.message || 'Lỗi'); } };
  const handleUpdateJob = async (jobId) => { if (!editingJob) return; try { await axios.put(`${API_BASE}/admin/jobs/${jobId}`, editingJob, authHeader); setEditingJob(null); fetchAllJobs(); fetchStatistics(); } catch (e) { alert(e.response?.data?.message || 'Lỗi'); } };
  const handleChangeJobStatus = async (jobId, newStatus) => { try { await axios.put(`${API_BASE}/admin/jobs/${jobId}`, { status: newStatus }, authHeader); fetchAllJobs(); fetchStatistics(); } catch (e) { alert(e.response?.data?.message || 'Lỗi'); } };
  const handleToggleActive = async (jobId) => { try { await axios.put(`${API_BASE}/admin/jobs/${jobId}/toggle-active`, {}, authHeader); fetchAllJobs(); } catch (e) { alert(e.response?.data?.message || 'Lỗi'); } };
  const filteredJobs = jobFilter === 'ALL' ? allJobs : allJobs.filter(j => j.status === jobFilter);

  const menuItems = [
    { key: 'dashboard', icon: 'bi-grid-1x2', label: 'Tổng quan' },
    { key: 'pending', icon: 'bi-hourglass-split', label: 'Duyệt tin' },
    { key: 'jobs', icon: 'bi-briefcase', label: 'Tin tuyển dụng' },
    { key: 'users', icon: 'bi-people', label: 'Người dùng' },
    { key: 'categories', icon: 'bi-folder', label: 'Danh mục' }
  ];

  const handleMenuClick = (key) => {
    setActiveSection(key);
    if (key === 'pending') fetchPendingJobs();
    if (key === 'jobs') fetchAllJobs();
    if (key === 'users') fetchUsers();
    if (key === 'categories') fetchCategories();
  };

  if (loading) return <div className="jp-loading-page"><div className="jp-spinner"></div></div>;

  /* ═══════════ RENDER sections ═══════════ */
  const renderDashboard = () => {
    if (!statistics) return null;
    const appTotal = statistics.totalApplications || 1;
    const chartData = [
      { label: 'Đã nộp', value: statistics.submittedApplications },
      { label: 'Xem xét', value: statistics.reviewingApplications },
      { label: 'PV', value: statistics.interviewApplications },
      { label: 'Nhận', value: statistics.acceptedApplications },
      { label: 'Từ chối', value: statistics.rejectedApplications }
    ];
    const chartColors = ['#6b7280', '#0891b2', '#eab308', '#16a34a', '#dc2626'];

    return (
      <>
        {/* KPI cards */}
        <div className="row g-3 mb-4">
          {[
            { gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', icon: 'bi-people', val: statistics.totalUsers, lbl: 'Tổng người dùng' },
            { gradient: 'linear-gradient(135deg, #10b981, #059669)', icon: 'bi-person', val: statistics.totalCandidates, lbl: 'Ứng viên' },
            { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: 'bi-building', val: statistics.totalEmployers, lbl: 'Nhà tuyển dụng' },
            { gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', icon: 'bi-briefcase', val: statistics.totalJobs, lbl: 'Tin tuyển dụng' },
            { gradient: 'linear-gradient(135deg, #ec4899, #db2777)', icon: 'bi-file-earmark-text', val: statistics.totalApplications, lbl: 'Tổng đơn ứng tuyển' }
          ].map((c, i) => (
            <div className="col" key={i}>
              <div className="jp-stat-card" style={{ background: c.gradient }}>
                <i className={`bi ${c.icon}`} style={{ fontSize: 28, opacity: 0.25, position: 'absolute', top: 14, right: 16 }}></i>
                <div className="fw-bold" style={{ fontSize: 28 }}>{c.val}</div>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>{c.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="row g-3 mb-4">
          <div className="col-lg-8">
            <div className="jp-card h-100">
              <div className="jp-card-body">
                <h6 className="jp-section-title"><i className="bi bi-bar-chart me-2"></i>Thống kê đơn ứng tuyển</h6>
                <MiniBarChart data={chartData} colors={chartColors} height={180} />
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="jp-card h-100">
              <div className="jp-card-body text-center">
                <h6 className="jp-section-title"><i className="bi bi-bullseye me-2"></i>Tỷ lệ chấp nhận</h6>
                <DonutChart value={statistics.acceptedApplications} total={appTotal} color="#16a34a" size={110} />
                <div className="fw-semibold mt-2">{statistics.acceptedApplications} / {statistics.totalApplications}</div>
                <small className="text-muted">Đã chấp nhận</small>
                <div className="d-flex flex-column gap-1 mt-3">
                  {chartData.map((d, i) => (
                    <div key={i} className="d-flex align-items-center gap-2 small">
                      <span className="rounded-circle" style={{ width: 10, height: 10, background: chartColors[i], flexShrink: 0 }}></span>
                      <span className="text-muted flex-grow-1">{d.label}</span>
                      <span className="fw-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="jp-card">
          <div className="jp-card-body">
            <h6 className="jp-section-title"><i className="bi bi-lightning me-2"></i>Thao tác nhanh</h6>
            <div className="row g-2">
              {menuItems.filter(m => m.key !== 'dashboard').map(m => (
                <div className="col-6 col-md-3" key={m.key}>
                  <button className="btn btn-outline-primary w-100 py-3 fw-semibold" onClick={() => handleMenuClick(m.key)}>
                    <i className={`bi ${m.icon} d-block fs-4 mb-1`}></i>{m.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderPendingJobs = () => (
    <div className="jp-card">
      <div className="jp-card-body">
        <h5 className="fw-bold mb-3"><i className="bi bi-hourglass-split me-2 text-warning"></i>Tin tuyển dụng chờ duyệt</h5>
        {pendingJobs.length === 0 ? (
          <div className="jp-empty-state">
            <i className="bi bi-check-circle"></i>
            <h6>Không có tin nào chờ duyệt!</h6>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {pendingJobs.map(job => (
              <div key={job.id} className="border rounded-3 p-3 bg-warning bg-opacity-10">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="fw-bold mb-1">{job.title}</h6>
                    <div className="text-muted small d-flex gap-3 flex-wrap">
                      <span><i className="bi bi-building me-1"></i>{job.employer?.username || 'N/A'}</span>
                      <span><i className="bi bi-geo-alt me-1"></i>{job.location}</span>
                      <span><i className="bi bi-folder me-1"></i>{job.category?.name || 'Chưa phân loại'}</span>
                      <span><i className="bi bi-calendar3 me-1"></i>{job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                    </div>
                    {job.description && <p className="text-muted small mt-1 mb-0">{job.description.substring(0, 120)}...</p>}
                  </div>
                  <div className="d-flex gap-2 flex-shrink-0">
                    <button className="btn btn-success btn-sm" onClick={() => handleApproveJob(job.id)}><i className="bi bi-check-lg me-1"></i>Duyệt</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRejectJob(job.id)}><i className="bi bi-x-lg me-1"></i>Từ chối</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderJobs = () => (
    <div className="jp-card">
      <div className="jp-card-body">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 className="fw-bold mb-0"><i className="bi bi-briefcase me-2 text-primary"></i>Quản lý tin tuyển dụng</h5>
          <div className="d-flex gap-1 flex-wrap">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
              <button key={f} className={`btn btn-sm ${jobFilter === f ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setJobFilter(f)}>
                {f === 'ALL' ? 'Tất cả' : f === 'PENDING' ? `Chờ (${allJobs.filter(j => j.status === 'PENDING').length})` : f === 'APPROVED' ? `Duyệt (${allJobs.filter(j => j.status === 'APPROVED').length})` : `Từ chối (${allJobs.filter(j => j.status === 'REJECTED').length})`}
              </button>
            ))}
          </div>
        </div>
        {filteredJobs.length === 0 ? <p className="text-muted text-center py-4">Không có tin nào.</p> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle jp-table">
              <thead><tr><th>ID</th><th>Tiêu đề</th><th>NTD</th><th>Địa điểm</th><th>Lương</th><th>Trạng thái</th><th>Hiển thị</th><th>Hành động</th></tr></thead>
              <tbody>
                {filteredJobs.map(job => (
                  <tr key={job.id}>
                    <td className="fw-semibold">#{job.id}</td>
                    <td>{editingJob?.id === job.id ? <input type="text" className="form-control form-control-sm" value={editingJob.title} onChange={e => setEditingJob({...editingJob, title: e.target.value})} /> : <span className="fw-semibold">{job.title}</span>}</td>
                    <td>{job.employer?.username || 'N/A'}</td>
                    <td>{editingJob?.id === job.id ? <input type="text" className="form-control form-control-sm" value={editingJob.location || ''} onChange={e => setEditingJob({...editingJob, location: e.target.value})} /> : job.location}</td>
                    <td>{editingJob?.id === job.id ? <input type="number" className="form-control form-control-sm" value={editingJob.salary || ''} onChange={e => setEditingJob({...editingJob, salary: parseFloat(e.target.value) || 0})} /> : job.salary ? `${job.salary.toLocaleString('vi-VN')}đ` : 'Thỏa thuận'}</td>
                    <td>
                      <span className={`badge ${job.status === 'APPROVED' ? 'bg-success' : job.status === 'PENDING' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                        <i className={`bi ${job.status === 'APPROVED' ? 'bi-check-circle' : job.status === 'PENDING' ? 'bi-hourglass-split' : 'bi-x-circle'} me-1`}></i>
                        {job.status === 'APPROVED' ? 'Đã duyệt' : job.status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </td>
                    <td>
                      <button className={`btn btn-sm ${job.active !== false ? 'btn-outline-success' : 'btn-outline-danger'}`} onClick={() => handleToggleActive(job.id)}>
                        <i className={`bi ${job.active !== false ? 'bi-toggle-on' : 'bi-toggle-off'} me-1`}></i>{job.active !== false ? 'Bật' : 'Tắt'}
                      </button>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {editingJob?.id === job.id ? (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleUpdateJob(job.id)}><i className="bi bi-check-lg"></i></button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingJob(null)}><i className="bi bi-x-lg"></i></button>
                          </>
                        ) : (
                          <>
                            {job.status !== 'APPROVED' && <button className="btn btn-outline-success btn-sm" onClick={() => handleChangeJobStatus(job.id, 'APPROVED')} title="Duyệt"><i className="bi bi-check-lg"></i></button>}
                            {job.status !== 'REJECTED' && <button className="btn btn-outline-warning btn-sm" onClick={() => handleChangeJobStatus(job.id, 'REJECTED')} title="Từ chối"><i className="bi bi-x-lg"></i></button>}
                            <button className="btn btn-outline-primary btn-sm" onClick={() => setEditingJob({ id: job.id, title: job.title, location: job.location, salary: job.salary, description: job.description })} title="Sửa"><i className="bi bi-pencil"></i></button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteJob(job.id)} title="Xóa"><i className="bi bi-trash"></i></button>
                          </>
                        )}
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
  );

  const renderUsers = () => (
    <div className="jp-card">
      <div className="jp-card-body">
        <h5 className="fw-bold mb-3"><i className="bi bi-people me-2 text-primary"></i>Quản lý người dùng</h5>
        {users.length === 0 ? <p className="text-muted">Không có người dùng.</p> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle jp-table">
              <thead><tr><th>ID</th><th>Username</th><th>Vai trò</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={!u.enabled ? 'table-danger' : ''}>
                    <td className="fw-semibold">#{u.id}</td>
                    <td className="fw-semibold">{u.username}</td>
                    <td>
                      {u.roles.map((r, i) => (
                        <span key={i} className={`badge me-1 ${r === 'ROLE_ADMIN' ? 'bg-purple' : r === 'ROLE_EMPLOYER' ? 'bg-primary' : 'bg-success'}`}
                          style={r === 'ROLE_ADMIN' ? { background: '#7c3aed' } : {}}>
                          <i className={`bi ${r === 'ROLE_ADMIN' ? 'bi-shield-lock' : r === 'ROLE_EMPLOYER' ? 'bi-building' : 'bi-person'} me-1`}></i>
                          {r === 'ROLE_ADMIN' ? 'Admin' : r === 'ROLE_EMPLOYER' ? 'Employer' : 'Candidate'}
                        </span>
                      ))}
                    </td>
                    <td>
                      <span className={`badge ${u.enabled ? 'bg-success' : 'bg-danger'}`}>
                        <i className={`bi ${u.enabled ? 'bi-check-circle' : 'bi-lock'} me-1`}></i>
                        {u.enabled ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td>
                      {!u.roles.includes('ROLE_ADMIN') ? (
                        <div className="d-flex gap-1">
                          <button className={`btn btn-sm ${u.enabled ? 'btn-outline-warning' : 'btn-outline-success'}`} onClick={() => handleToggleLock(u.id)}>
                            <i className={`bi ${u.enabled ? 'bi-lock' : 'bi-unlock'} me-1`}></i>{u.enabled ? 'Khóa' : 'Mở'}
                          </button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteUser(u.id, u.username)}>
                            <i className="bi bi-trash me-1"></i>Xóa
                          </button>
                        </div>
                      ) : <span className="text-muted small">Admin</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="jp-card">
      <div className="jp-card-body">
        <h5 className="fw-bold mb-3"><i className="bi bi-folder me-2 text-primary"></i>Quản lý danh mục</h5>
        <form onSubmit={handleCatSubmit} className="d-flex gap-2 align-items-end mb-4 p-3 bg-light rounded-3 flex-wrap">
          <div className="flex-grow-1">
            <label className="form-label small fw-semibold">Tên danh mục</label>
            <input type="text" className="form-control" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required />
          </div>
          <div style={{ flex: 2 }}>
            <label className="form-label small fw-semibold">Mô tả</label>
            <input type="text" className="form-control" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary"><i className={`bi ${editingCatId ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>{editingCatId ? 'Cập nhật' : 'Thêm'}</button>
          {editingCatId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingCatId(null); setCatForm({ name: '', description: '' }); }}>Hủy</button>}
        </form>
        <div className="table-responsive">
          <table className="table table-hover align-middle jp-table">
            <thead><tr><th>ID</th><th>Tên</th><th>Mô tả</th><th>Hành động</th></tr></thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td className="fw-semibold">#{cat.id}</td>
                  <td className="fw-semibold">{cat.name}</td>
                  <td>{cat.description}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-outline-warning btn-sm" onClick={() => handleEditCat(cat)}><i className="bi bi-pencil me-1"></i>Sửa</button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteCat(cat.id)}><i className="bi bi-trash me-1"></i>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const sectionRenderers = { dashboard: renderDashboard, pending: renderPendingJobs, jobs: renderJobs, users: renderUsers, categories: renderCategories };

  return (
    <div className="d-flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* Sidebar */}
      <aside className="jp-sidebar" style={{ width: sidebarOpen ? 240 : 64, transition: 'width .25s ease' }}>
        <div className="p-3 border-bottom border-white border-opacity-10 d-flex align-items-center gap-2">
          <div className="d-flex align-items-center justify-content-center rounded-3 bg-primary flex-shrink-0" style={{ width: 36, height: 36 }}>
            <i className="bi bi-gear-wide-connected text-white"></i>
          </div>
          {sidebarOpen && (
            <div>
              <div className="fw-bold" style={{ fontSize: 15 }}>Admin Panel</div>
              <div style={{ fontSize: 11 }} className="text-white text-opacity-50">{AuthService.getUsername()}</div>
            </div>
          )}
        </div>
        <div className="flex-grow-1 pt-2">
          {menuItems.map(m => (
            <div key={m.key}
              className={`d-flex align-items-center gap-2 px-3 py-2 ${activeSection === m.key ? 'bg-white bg-opacity-10 border-start border-3 border-primary text-white fw-semibold' : 'text-white text-opacity-50 border-start border-3 border-transparent'}`}
              style={{ cursor: 'pointer', fontSize: 14, transition: 'all .15s' }}
              onClick={() => handleMenuClick(m.key)}>
              <i className={`bi ${m.icon}`} style={{ fontSize: 18, flexShrink: 0 }}></i>
              {sidebarOpen && <span>{m.label}</span>}
            </div>
          ))}
        </div>
        <button className="btn btn-sm btn-outline-light mx-3 mb-3" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <i className={`bi ${sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-grow-1 p-4" style={{ background: 'var(--jp-body)', overflow: 'auto' }}>
        <h4 className="fw-bold mb-4">
          <i className={`bi ${menuItems.find(m => m.key === activeSection)?.icon} me-2`}></i>
          {menuItems.find(m => m.key === activeSection)?.label}
        </h4>
        {sectionRenderers[activeSection]?.()}
      </main>
    </div>
  );
}

export default AdminDashboard;
