import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import JobListAdvanced from './pages/JobListAdvanced';
import JobRecommendations from './pages/JobRecommendations';
import JobDetails from './pages/JobDetails';
import CreateJob from './pages/CreateJob';
import CandidateProfile from './pages/CandidateProfile';
import MyApplications from './pages/MyApplications';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthService from './services/AuthService';
import NotificationService from './services/NotificationService';
import './App.css';

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { clearInterval(interval); document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const loadUnreadCount = () => {
    NotificationService.getUnreadCount()
      .then(res => setUnreadCount(res.data))
      .catch(() => {});
  };

  const toggleDropdown = () => {
    if (!showDropdown) {
      NotificationService.getNotifications(0, 10)
        .then(res => setNotifications(res.data.content || res.data || []))
        .catch(() => {});
    }
    setShowDropdown(!showDropdown);
  };

  const handleMarkRead = (id) => {
    NotificationService.markAsRead(id).then(() => { loadUnreadCount(); toggleDropdown(); });
  };

  const handleMarkAllRead = () => {
    NotificationService.markAllAsRead().then(() => { setUnreadCount(0); loadUnreadCount(); });
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={toggleDropdown} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'white', position: 'relative', padding: '4px 8px' }}>
        🔔
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -6, background: '#dc2626', color: 'white', borderRadius: '50%', padding: '1px 6px', fontSize: 11, fontWeight: 'bold' }}>
            {unreadCount}
          </span>
        )}
      </button>
      {showDropdown && (
        <div style={{ position: 'absolute', right: 0, top: 35, width: 320, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 1000, maxHeight: 400, overflowY: 'auto' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff' }}>
            <strong style={{ color: '#1f2937', fontSize: 14 }}>Thông báo</strong>
            {unreadCount > 0 && <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Đọc tất cả</button>}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>Không có thông báo</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} onClick={() => !n.read && handleMarkRead(n.id)}
                style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: n.read ? '#fff' : '#eff6ff' }}>
                <div style={{ fontSize: 13, color: '#1f2937', lineHeight: 1.5 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(AuthService.isLoggedIn());
  const [userRoles, setUserRoles] = useState(AuthService.getRoles());
  const [userId, setUserId] = useState(AuthService.getUserId());

  useEffect(() => {
    // Check login status when custom auth event is triggered
    const checkLoginStatus = () => {
      setIsLoggedIn(AuthService.isLoggedIn());
      setUserRoles(AuthService.getRoles());
      setUserId(AuthService.getUserId());
    };
    
    // Listen for custom auth events
    window.addEventListener('authChanged', checkLoginStatus);
    
    return () => {
      window.removeEventListener('authChanged', checkLoginStatus);
    };
  }, []);

  const isCandidate = userRoles.includes('ROLE_CANDIDATE');
  const isEmployer = userRoles.includes('ROLE_EMPLOYER');
  const isAdmin = userRoles.includes('ROLE_ADMIN');

  return (
    <Router basename="/jobportal">
      <div className="App">
        <nav className="navbar">
          <h1>Job Portal</h1>
          <div className="navbar-links">
            {isLoggedIn && (
              <>
                <Link to="/jobs">🔍 Tìm Việc</Link>
                {isCandidate && <Link to="/recommendations">⭐ Đề Xuất</Link>}
                {isCandidate && <Link to="/my-applications">📋 Đơn Ứng Tuyển</Link>}
                {(isEmployer || isAdmin) && <Link to="/create-job">➕ Đăng Tuyển</Link>}
                {isEmployer && <Link to="/employer-dashboard">💼 Dashboard</Link>}
                {isAdmin && <Link to="/admin-dashboard">⚙️ Admin</Link>}
                {isCandidate && <Link to={`/profile/${userId || 1}`}>👤 Hồ Sơ</Link>}
                <NotificationBell />
                <button onClick={() => {
                  AuthService.logout();
                  window.location.href = '/jobportal/login';
                }}>
                  🚪 Đăng Xuất
                </button>
              </>
            )}
            {!isLoggedIn && (
              <>
                <Link to="/login">🔑 Đăng Nhập</Link>
                <Link to="/register">📝 Đăng Ký</Link>
              </>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs-advanced" element={<JobListAdvanced />} />
          <Route path="/recommendations" element={isLoggedIn ? <JobRecommendations /> : <Navigate to="/login" />} />
          <Route path="/job/:id" element={<JobDetails />} />
          <Route path="/create-job" element={isLoggedIn ? <CreateJob /> : <Navigate to="/login" />} />
          <Route path="/profile/:userId" element={isLoggedIn ? <CandidateProfile /> : <Navigate to="/login" />} />
          <Route path="/my-applications" element={isLoggedIn ? <MyApplications /> : <Navigate to="/login" />} />
          <Route path="/employer-dashboard" element={isLoggedIn ? <EmployerDashboard /> : <Navigate to="/login" />} />
          <Route path="/admin-dashboard" element={isLoggedIn ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/jobs" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
