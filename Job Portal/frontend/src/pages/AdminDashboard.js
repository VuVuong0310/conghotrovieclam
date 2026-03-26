import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import API_BASE from '../config/api';

/* ── tiny bar-chart (pure CSS, no library needed) ── */
function MiniBarChart({ data, colors, height = 160 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{d.value}</span>
          <div style={{
            width: '100%', maxWidth: 48, borderRadius: 6,
            height: `${Math.max((d.value / max) * (height - 30), 4)}px`,
            background: colors[i % colors.length],
            transition: 'height .4s ease'
          }} />
          <span style={{ fontSize: 10, color: '#6b7280', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
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
      <text x="45" y="49" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1f2937">
        {Math.round(pct * 100)}%
      </text>
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

  const authHeader = { headers: { 'Authorization': 'Bearer ' + AuthService.getToken() } };

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/statistics`, authHeader);
      setStatistics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch statistics', error);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchStatistics(); }, [fetchStatistics]);

  const fetchPendingJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/jobs/pending`, authHeader);
      setPendingJobs(res.data);
    } catch (e) { console.error(e); }
  };

  const handleApproveJob = async (jobId) => {
    try {
      await axios.post(`${API_BASE}/admin/jobs/${jobId}/approve`, {}, authHeader);
      fetchPendingJobs(); fetchStatistics();
    } catch (e) { alert('Lỗi khi phê duyệt'); }
  };

  const handleRejectJob = async (jobId) => {
    const reason = prompt('Lý do từ chối:');
    if (!reason) return;
    try {
      await axios.post(`${API_BASE}/admin/jobs/${jobId}/reject`, { reason }, authHeader);
      fetchPendingJobs(); fetchStatistics();
    } catch (e) { alert('Lỗi khi từ chối'); }
  };

  const fetchCategories = async () => {
    try { const r = await axios.get(`${API_BASE}/admin/categories`, authHeader); setCategories(r.data); }
    catch (e) { console.error(e); }
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCatId) {
        await axios.put(`${API_BASE}/admin/categories/${editingCatId}`, catForm, authHeader);
        setEditingCatId(null);
      } else {
        await axios.post(`${API_BASE}/admin/categories`, catForm, authHeader);
      }
      setCatForm({ name: '', description: '' }); fetchCategories();
    } catch (e) { alert('Lỗi khi lưu danh mục'); }
  };

  const handleEditCat = (cat) => { setEditingCatId(cat.id); setCatForm({ name: cat.name, description: cat.description || '' }); };

  const handleDeleteCat = async (id) => {
    if (!window.confirm('Xóa danh mục này?')) return;
    try { await axios.delete(`${API_BASE}/admin/categories/${id}`, authHeader); fetchCategories(); }
    catch (e) { alert('Lỗi khi xóa'); }
  };

  const fetchUsers = async () => {
    try { const r = await axios.get(`${API_BASE}/admin/users`, authHeader); setUsers(r.data); }
    catch (e) { console.error(e); }
  };

  const handleToggleLock = async (userId) => {
    try { await axios.put(`${API_BASE}/admin/users/${userId}/toggle-lock`, {}, authHeader); fetchUsers(); fetchStatistics(); }
    catch (e) { alert(e.response?.data?.message || 'Lỗi'); }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Xóa tài khoản "${username}"?`)) return;
    try { await axios.delete(`${API_BASE}/admin/users/${userId}`, authHeader); fetchUsers(); fetchStatistics(); }
    catch (e) { alert(e.response?.data?.message || 'Lỗi'); }
  };

  const fetchAllJobs = async () => {
    try { const r = await axios.get(`${API_BASE}/admin/jobs`, authHeader); setAllJobs(r.data); }
    catch (e) { console.error(e); }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Xóa tin tuyển dụng này?')) return;
    try { await axios.delete(`${API_BASE}/admin/jobs/${jobId}`, authHeader); fetchAllJobs(); fetchStatistics(); }
    catch (e) { alert(e.response?.data?.message || 'Lỗi'); }
  };

  const handleUpdateJob = async (jobId) => {
    if (!editingJob) return;
    try {
      await axios.put(`${API_BASE}/admin/jobs/${jobId}`, editingJob, authHeader);
      setEditingJob(null); fetchAllJobs(); fetchStatistics();
    } catch (e) { alert(e.response?.data?.message || 'Lỗi'); }
  };

  const handleChangeJobStatus = async (jobId, newStatus) => {
    try { await axios.put(`${API_BASE}/admin/jobs/${jobId}`, { status: newStatus }, authHeader); fetchAllJobs(); fetchStatistics(); }
    catch (e) { alert(e.response?.data?.message || 'Lỗi'); }
  };

  const handleToggleActive = async (jobId) => {
    try { await axios.put(`${API_BASE}/admin/jobs/${jobId}/toggle-active`, {}, authHeader); fetchAllJobs(); }
    catch (e) { alert(e.response?.data?.message || 'Lỗi'); }
  };

  const filteredJobs = jobFilter === 'ALL' ? allJobs : allJobs.filter(j => j.status === jobFilter);

  // sidebar navigation items
  const menuItems = [
    { key: 'dashboard', icon: '📊', label: 'Tổng quan' },
    { key: 'pending',   icon: '⏳', label: 'Duyệt tin' },
    { key: 'jobs',      icon: '💼', label: 'Tin tuyển dụng' },
    { key: 'users',     icon: '👥', label: 'Người dùng' },
    { key: 'categories',icon: '📁', label: 'Danh mục' },
  ];

  const handleMenuClick = (key) => {
    setActiveSection(key);
    if (key === 'pending') fetchPendingJobs();
    if (key === 'jobs') fetchAllJobs();
    if (key === 'users') fetchUsers();
    if (key === 'categories') fetchCategories();
  };

  /* ═══════════ styles ═══════════ */
  const S = {
    wrapper: { display: 'flex', minHeight: 'calc(100vh - 52px)', background: '#f0f2f5' },
    sidebar: {
      width: sidebarOpen ? 240 : 64, background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      color: '#fff', transition: 'width .25s ease', overflow: 'hidden', flexShrink: 0,
      display: 'flex', flexDirection: 'column', position: 'sticky', top: 52, height: 'calc(100vh - 52px)'
    },
    sidebarHeader: {
      padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,.08)',
      display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap'
    },
    sidebarLogo: { width: 36, height: 36, borderRadius: 10, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
    menuItem: (active) => ({
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer',
      background: active ? 'rgba(59,130,246,.2)' : 'transparent', borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent',
      color: active ? '#93c5fd' : '#94a3b8', fontWeight: active ? 600 : 400, fontSize: 14,
      transition: 'all .15s', whiteSpace: 'nowrap'
    }),
    toggleBtn: {
      margin: '8px 16px', padding: '6px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
      color: '#94a3b8', borderRadius: 6, cursor: 'pointer', fontSize: 16, textAlign: 'center'
    },
    main: { flex: 1, padding: '24px 28px', overflow: 'auto' },
    pageTitle: { fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 24 },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 },
    statCard: (gradient) => ({
      background: gradient, borderRadius: 14, padding: '22px 20px', color: '#fff', position: 'relative', overflow: 'hidden',
      boxShadow: '0 4px 14px rgba(0,0,0,.1)'
    }),
    statIcon: { position: 'absolute', top: 14, right: 16, fontSize: 32, opacity: 0.25 },
    statVal: { fontSize: 28, fontWeight: 800, lineHeight: 1 },
    statLbl: { fontSize: 13, marginTop: 6, opacity: 0.9 },
    card: { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.06)', marginBottom: 20, border: '1px solid #e5e7eb' },
    cardTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
    badge: (bg, color) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: bg, color }),
    tblAction: { display: 'flex', gap: 6, flexWrap: 'wrap' },
    actionBtn: (bg) => ({ padding: '5px 10px', borderRadius: 6, border: 'none', background: bg, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }),
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280' }}>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  /* ═══════════ RENDER sections ═══════════ */
  const renderDashboard = () => {
    if (!statistics) return null;
    const appTotal = statistics.totalApplications || 1;
    const chartData = [
      { label: 'Đã nộp', value: statistics.submittedApplications },
      { label: 'Xem xét', value: statistics.reviewingApplications },
      { label: 'PV', value: statistics.interviewApplications },
      { label: 'Nhận', value: statistics.acceptedApplications },
      { label: 'Từ chối', value: statistics.rejectedApplications },
    ];
    const chartColors = ['#6b7280', '#0891b2', '#eab308', '#16a34a', '#dc2626'];

    return (
      <>
        {/* KPI cards */}
        <div style={S.grid4}>
          {[
            { gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', icon: '👥', val: statistics.totalUsers, lbl: 'Tổng người dùng' },
            { gradient: 'linear-gradient(135deg, #10b981, #059669)', icon: '👤', val: statistics.totalCandidates, lbl: 'Ứng viên' },
            { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: '🏢', val: statistics.totalEmployers, lbl: 'Nhà tuyển dụng' },
            { gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', icon: '💼', val: statistics.totalJobs, lbl: 'Tin tuyển dụng' },
            { gradient: 'linear-gradient(135deg, #ec4899, #db2777)', icon: '📄', val: statistics.totalApplications, lbl: 'Tổng đơn ứng tuyển' },
          ].map((c, i) => (
            <div key={i} style={S.statCard(c.gradient)}>
              <span style={S.statIcon}>{c.icon}</span>
              <div style={S.statVal}>{c.val}</div>
              <div style={S.statLbl}>{c.lbl}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={S.card}>
            <div style={S.cardTitle}>📊 Thống kê đơn ứng tuyển</div>
            <MiniBarChart data={chartData} colors={chartColors} height={180} />
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>🎯 Tỷ lệ chấp nhận</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 8 }}>
              <DonutChart value={statistics.acceptedApplications} total={appTotal} color="#16a34a" size={110} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{statistics.acceptedApplications} / {statistics.totalApplications}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Đã chấp nhận</div>
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {chartData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: chartColors[i], flexShrink: 0 }} />
                    <span style={{ flex: 1, color: '#6b7280' }}>{d.label}</span>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={S.card}>
          <div style={S.cardTitle}>⚡ Thao tác nhanh</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {menuItems.filter(m => m.key !== 'dashboard').map(m => (
              <button key={m.key} onClick={() => handleMenuClick(m.key)}
                style={{ padding: '14px 16px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#374151', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#eff6ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}>
                <span style={{ fontSize: 20 }}>{m.icon}</span> {m.label}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  };

  const renderPendingJobs = () => (
    <div style={S.card}>
      <div style={S.cardTitle}>⏳ Tin tuyển dụng chờ duyệt</div>
      {pendingJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ fontSize: 16, fontWeight: 600 }}>Không có tin nào chờ duyệt!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pendingJobs.map(job => (
            <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 10, border: '1px solid #e5e7eb', background: '#fefce8' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', marginBottom: 4 }}>{job.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span>🏢 {job.employer?.username || 'N/A'}</span>
                  <span>📍 {job.location}</span>
                  <span>📁 {job.category?.name || 'Chưa phân loại'}</span>
                  <span>📅 {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                </div>
                {job.description && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>{job.description.substring(0, 120)}...</div>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => handleApproveJob(job.id)} style={{ ...S.actionBtn('#16a34a'), padding: '8px 16px', fontSize: 13 }}>✅ Duyệt</button>
                <button onClick={() => handleRejectJob(job.id)} style={{ ...S.actionBtn('#dc2626'), padding: '8px 16px', fontSize: 13 }}>❌ Từ chối</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderJobs = () => (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={S.cardTitle}>💼 Quản lý tin tuyển dụng</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <button key={f} onClick={() => setJobFilter(f)}
              style={{ padding: '6px 14px', borderRadius: 20, border: jobFilter === f ? 'none' : '1px solid #d1d5db', background: jobFilter === f ? '#2563eb' : '#fff', color: jobFilter === f ? '#fff' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {f === 'ALL' ? 'Tất cả' : f === 'PENDING' ? `Chờ (${allJobs.filter(j => j.status === 'PENDING').length})` : f === 'APPROVED' ? `Duyệt (${allJobs.filter(j => j.status === 'APPROVED').length})` : `Từ chối (${allJobs.filter(j => j.status === 'REJECTED').length})`}
            </button>
          ))}
        </div>
      </div>
      {filteredJobs.length === 0 ? <p style={{ color: '#6b7280', textAlign: 'center', padding: 30 }}>Không có tin nào.</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ minWidth: 800 }}>
            <thead>
              <tr><th>ID</th><th>Tiêu đề</th><th>Nhà tuyển dụng</th><th>Địa điểm</th><th>Lương</th><th>Trạng thái</th><th>Hiển thị</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id}>
                  <td style={{ fontWeight: 600 }}>#{job.id}</td>
                  <td>{editingJob?.id === job.id ? <input type="text" className="form-control" value={editingJob.title} onChange={e => setEditingJob({...editingJob, title: e.target.value})} /> : <span style={{ fontWeight: 600 }}>{job.title}</span>}</td>
                  <td>{job.employer?.username || 'N/A'}</td>
                  <td>{editingJob?.id === job.id ? <input type="text" className="form-control" value={editingJob.location || ''} onChange={e => setEditingJob({...editingJob, location: e.target.value})} /> : job.location}</td>
                  <td>{editingJob?.id === job.id ? <input type="number" className="form-control" value={editingJob.salary || ''} onChange={e => setEditingJob({...editingJob, salary: parseFloat(e.target.value) || 0})} /> : job.salary ? `${job.salary.toLocaleString('vi-VN')}đ` : 'Thỏa thuận'}</td>
                  <td>
                    <span style={S.badge(
                      job.status === 'APPROVED' ? '#dcfce7' : job.status === 'PENDING' ? '#fef9c3' : '#fee2e2',
                      job.status === 'APPROVED' ? '#166534' : job.status === 'PENDING' ? '#854d0e' : '#991b1b'
                    )}>
                      {job.status === 'APPROVED' ? '✅ Đã duyệt' : job.status === 'PENDING' ? '⏳ Chờ duyệt' : '❌ Từ chối'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(job.id)}
                      style={{
                        padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        background: job.active !== false ? '#dcfce7' : '#fee2e2',
                        color: job.active !== false ? '#166534' : '#991b1b'
                      }}>
                      {job.active !== false ? '🟢 Bật' : '🔴 Tắt'}
                    </button>
                  </td>
                  <td>
                    <div style={S.tblAction}>
                      {editingJob?.id === job.id ? (
                        <>
                          <button style={S.actionBtn('#16a34a')} onClick={() => handleUpdateJob(job.id)}>💾 Lưu</button>
                          <button style={S.actionBtn('#6b7280')} onClick={() => setEditingJob(null)}>Hủy</button>
                        </>
                      ) : (
                        <>
                          {job.status !== 'APPROVED' && <button style={S.actionBtn('#16a34a')} onClick={() => handleChangeJobStatus(job.id, 'APPROVED')}>✅</button>}
                          {job.status !== 'REJECTED' && <button style={S.actionBtn('#f59e0b')} onClick={() => handleChangeJobStatus(job.id, 'REJECTED')}>❌</button>}
                          <button style={S.actionBtn('#3b82f6')} onClick={() => setEditingJob({ id: job.id, title: job.title, location: job.location, salary: job.salary, description: job.description })}>✏️</button>
                          <button style={S.actionBtn('#dc2626')} onClick={() => handleDeleteJob(job.id)}>🗑️</button>
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
  );

  const renderUsers = () => (
    <div style={S.card}>
      <div style={S.cardTitle}>👥 Quản lý người dùng</div>
      {users.length === 0 ? <p style={{ color: '#6b7280' }}>Không có người dùng.</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Username</th><th>Vai trò</th><th>Trạng thái</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ background: u.enabled ? '' : '#fef2f2' }}>
                  <td style={{ fontWeight: 600 }}>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td>
                    {u.roles.map((r, i) => (
                      <span key={i} style={S.badge(
                        r === 'ROLE_ADMIN' ? '#ede9fe' : r === 'ROLE_EMPLOYER' ? '#dbeafe' : '#dcfce7',
                        r === 'ROLE_ADMIN' ? '#6d28d9' : r === 'ROLE_EMPLOYER' ? '#1d4ed8' : '#166534'
                      )}>
                        {r === 'ROLE_ADMIN' ? '🛡️ Admin' : r === 'ROLE_EMPLOYER' ? '🏢 Employer' : '👤 Candidate'}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span style={S.badge(u.enabled ? '#dcfce7' : '#fee2e2', u.enabled ? '#166534' : '#991b1b')}>
                      {u.enabled ? '🟢 Hoạt động' : '🔴 Đã khóa'}
                    </span>
                  </td>
                  <td>
                    <div style={S.tblAction}>
                      {!u.roles.includes('ROLE_ADMIN') ? (
                        <>
                          <button style={S.actionBtn(u.enabled ? '#f59e0b' : '#16a34a')} onClick={() => handleToggleLock(u.id)}>
                            {u.enabled ? '🔒 Khóa' : '🔓 Mở'}
                          </button>
                          <button style={S.actionBtn('#dc2626')} onClick={() => handleDeleteUser(u.id, u.username)}>🗑️ Xóa</button>
                        </>
                      ) : <span style={{ fontSize: 12, color: '#6b7280' }}>Admin</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCategories = () => (
    <div style={S.card}>
      <div style={S.cardTitle}>📁 Quản lý danh mục</div>
      <form onSubmit={handleCatSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 20, padding: 16, background: '#f9fafb', borderRadius: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Tên danh mục</label>
          <input type="text" className="form-control" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required />
        </div>
        <div style={{ flex: 2 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Mô tả</label>
          <input type="text" className="form-control" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} />
        </div>
        <button type="submit" style={{ ...S.actionBtn('#2563eb'), padding: '10px 20px', fontSize: 14 }}>{editingCatId ? '💾 Cập nhật' : '➕ Thêm'}</button>
        {editingCatId && <button type="button" style={{ ...S.actionBtn('#6b7280'), padding: '10px 20px', fontSize: 14 }} onClick={() => { setEditingCatId(null); setCatForm({ name: '', description: '' }); }}>Hủy</button>}
      </form>
      <table className="table">
        <thead><tr><th>ID</th><th>Tên</th><th>Mô tả</th><th>Hành động</th></tr></thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td style={{ fontWeight: 600 }}>#{cat.id}</td>
              <td style={{ fontWeight: 600 }}>{cat.name}</td>
              <td>{cat.description}</td>
              <td>
                <div style={S.tblAction}>
                  <button style={S.actionBtn('#f59e0b')} onClick={() => handleEditCat(cat)}>✏️ Sửa</button>
                  <button style={S.actionBtn('#dc2626')} onClick={() => handleDeleteCat(cat.id)}>🗑️ Xóa</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const sectionRenderers = {
    dashboard: renderDashboard,
    pending: renderPendingJobs,
    jobs: renderJobs,
    users: renderUsers,
    categories: renderCategories,
  };

  return (
    <div style={S.wrapper}>
      {/* ─── Sidebar ─── */}
      <aside style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <div style={S.sidebarLogo}>⚙️</div>
          {sidebarOpen && <div><div style={{ fontWeight: 700, fontSize: 16 }}>Admin Panel</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{AuthService.getUsername()}</div></div>}
        </div>
        <div style={{ flex: 1, paddingTop: 8 }}>
          {menuItems.map(m => (
            <div key={m.key} style={S.menuItem(activeSection === m.key)}
              onClick={() => handleMenuClick(m.key)}
              onMouseEnter={e => { if (activeSection !== m.key) e.currentTarget.style.background = 'rgba(255,255,255,.05)'; }}
              onMouseLeave={e => { if (activeSection !== m.key) e.currentTarget.style.background = 'transparent'; }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{m.icon}</span>
              {sidebarOpen && <span>{m.label}</span>}
            </div>
          ))}
        </div>
        <button style={S.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* ─── Main content ─── */}
      <main style={S.main}>
        <div style={S.pageTitle}>
          {menuItems.find(m => m.key === activeSection)?.icon}{' '}
          {menuItems.find(m => m.key === activeSection)?.label}
        </div>
        {sectionRenderers[activeSection]?.()}
      </main>
    </div>
  );
}

export default AdminDashboard;
