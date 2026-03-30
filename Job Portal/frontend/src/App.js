import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import JobList from './pages/JobList';
import JobListAdvanced from './pages/JobListAdvanced';
import JobRecommendations from './pages/JobRecommendations';
import JobDetails from './pages/JobDetails';
import CreateJob from './pages/CreateJob';
import CandidateProfile from './pages/CandidateProfile';
import MyApplications from './pages/MyApplications';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GoogleCallback from './pages/GoogleCallback';
import ChangePassword from './pages/ChangePassword';
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
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button onClick={toggleDropdown} className="jp-notif-btn">
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && <span className="jp-notif-badge">{unreadCount}</span>}
      </button>
      {showDropdown && (
        <div className="jp-notif-dropdown">
          <div className="jp-notif-header">
            <strong>Thông báo</strong>
            {unreadCount > 0 && <button onClick={handleMarkAllRead} className="btn btn-link btn-sm p-0 text-decoration-none" style={{ fontSize: 12 }}>Đọc tất cả</button>}
          </div>
          {notifications.length === 0 ? (
            <div className="text-center text-muted py-4" style={{ fontSize: 14 }}>Không có thông báo</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} onClick={() => !n.read && handleMarkRead(n.id)}
                className={`jp-notif-item ${!n.read ? 'unread' : ''}`}>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>{n.message}</div>
                <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
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
        <nav className="navbar navbar-expand-lg jp-navbar">
          <div className="container-fluid px-3">
            <Link to="/jobs" className="navbar-brand">
              <i className="bi bi-briefcase-fill"></i> JobPortal
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navMain">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                {isLoggedIn && (
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/jobs"><i className="bi bi-search"></i> Tìm Việc</Link></li>
                    {isCandidate && <li className="nav-item"><Link className="nav-link" to="/recommendations"><i className="bi bi-star"></i> Đề Xuất</Link></li>}
                    {isCandidate && <li className="nav-item"><Link className="nav-link" to="/my-applications"><i className="bi bi-file-earmark-text"></i> Đơn Ứng Tuyển</Link></li>}
                    {(isEmployer || isAdmin) && <li className="nav-item"><Link className="nav-link" to="/create-job"><i className="bi bi-plus-circle"></i> Đăng Tuyển</Link></li>}
                    {isEmployer && <li className="nav-item"><Link className="nav-link" to="/employer-dashboard"><i className="bi bi-grid-1x2"></i> Dashboard</Link></li>}
                    {isAdmin && <li className="nav-item"><Link className="nav-link" to="/admin-dashboard"><i className="bi bi-gear"></i> Admin</Link></li>}
                  </>
                )}
              </ul>
              <div className="d-flex align-items-center gap-1">
                {isLoggedIn ? (
                  <>
                    {isCandidate && <Link className="nav-link" to={`/profile/${userId || 1}`}><i className="bi bi-person-circle"></i> Hồ Sơ</Link>}
                    <Link className="nav-link" to="/change-password"><i className="bi bi-shield-lock"></i></Link>
                    <NotificationBell />
                    <button className="nav-link btn-logout ms-1" onClick={() => { AuthService.logout(); window.location.href = '/jobportal/login'; }}>
                      <i className="bi bi-box-arrow-right"></i> Đăng Xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link className="nav-link" to="/login"><i className="bi bi-box-arrow-in-right"></i> Đăng Nhập</Link>
                    <Link className="nav-link btn-auth ms-1" to="/register"><i className="bi bi-person-plus"></i> Đăng Ký</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/google-callback" element={<GoogleCallback />} />
          <Route path="/change-password" element={isLoggedIn ? <ChangePassword /> : <Navigate to="/login" />} />
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
