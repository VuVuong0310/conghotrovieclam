import React, { useState, useEffect } from 'react';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    if (AuthService.isLoggedIn()) {
      navigate('/jobs');
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    const clientId = '459714649331-mnljcp99f4hsaep940toag14qdep8n0c.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/google-callback`;
    const scope = 'email profile';
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    window.location.href = googleAuthUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await AuthService.login(username, password);
      AuthService.saveToken(response.data.token);
      AuthService.saveUserInfo(response.data);

      // Trigger custom event to notify App.js of login status change
      window.dispatchEvent(new Event('authChanged'));

      // Slight delay to ensure state updates
      setTimeout(() => {
        navigate('/jobs');
      }, 100);
    } catch (err) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
      setLoading(false);
    }
  };

  return (
    <div className="jp-auth-wrapper">
      <div className="jp-auth-card">
        <div className="auth-logo">
          <i className="bi bi-briefcase-fill"></i>
          <h1>JobPortal</h1>
          <p>Đăng nhập để tiếp tục</p>
        </div>

        {error && <div className="alert alert-danger d-flex align-items-center gap-2"><i className="bi bi-exclamation-triangle"></i>{error}</div>}

        <form onSubmit={handleSubmit} className="mb-3">
          <div className="mb-3">
            <label className="form-label"><i className="bi bi-person me-1"></i>Tên đăng nhập</label>
            <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Nhập tên đăng nhập" />
          </div>
          <div className="mb-3">
            <label className="form-label"><i className="bi bi-lock me-1"></i>Mật khẩu</label>
            <div className="position-relative">
              <input type={showPassword ? 'text' : 'password'} className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Nhập mật khẩu" style={{ paddingRight: '2.8rem' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted pe-3" style={{ textDecoration: 'none' }}>
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 mb-2" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang đăng nhập...</> : <><i className="bi bi-box-arrow-in-right me-1"></i>Đăng Nhập</>}
          </button>

          <div className="text-end">
            <button type="button" onClick={() => navigate('/forgot-password')} className="btn btn-link p-0 text-decoration-none" style={{ fontSize: '.88rem' }}>Quên mật khẩu?</button>
          </div>
        </form>

        {/* Google Sign-In */}
        <div className="jp-auth-divider">Hoặc</div>
        <button type="button" onClick={handleGoogleLogin} disabled={loading} className="btn btn-outline-secondary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-3">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Đăng nhập bằng Google
        </button>

        <div className="text-center mt-3">
          <span className="text-muted">Chưa có tài khoản? </span>
          <button onClick={() => navigate('/register')} className="btn btn-link p-0 text-decoration-none fw-semibold"><i className="bi bi-person-plus me-1"></i>Đăng ký ngay</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
