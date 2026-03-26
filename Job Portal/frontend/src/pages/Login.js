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
    const redirectUri = 'http://localhost:3000/jobportal/google-callback';
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

  const handleDemoLogin = async (role) => {
    setError('');
    setLoading(true);

    const demoCredentials = {
      candidate: { username: 'candidate', password: 'password123' },
      employer: { username: 'employer', password: 'password123' },
      admin: { username: 'vuvanvuong2004@gmail.com', password: 'admin123' }
    };

    try {
      const creds = demoCredentials[role];
      const response = await AuthService.login(creds.username, creds.password);
      AuthService.saveToken(response.data.token);
      AuthService.saveUserInfo(response.data);

      window.dispatchEvent(new Event('authChanged'));
      setTimeout(() => {
        navigate('/jobs');
      }, 100);
    } catch (err) {
      setError('Không thể đăng nhập với tài khoản demo');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
    }}>
      <div className="login-card" style={{
        backgroundColor: '#fff',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            color: '#2563eb',
            marginBottom: '0.5rem',
            fontSize: '2.5rem',
            fontWeight: '700'
          }}>
            🚀 JobPortal
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Đăng nhập để tiếp tục
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#1f2937',
              fontWeight: '500'
            }}>
              👤 Tên đăng nhập
            </label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#fff'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#1f2937',
              fontWeight: '500'
            }}>
              🔒 Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  paddingRight: '3rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fff'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '1rem'
            }}
          >
            {loading ? (
              <>
                <div className="loading" style={{ width: '20px', height: '20px', marginRight: '10px' }}></div>
                Đang đăng nhập...
              </>
            ) : (
              '🚀 Đăng Nhập'
            )}
          </button>

          <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
            <button type="button" onClick={() => navigate('/forgot-password')}
              style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
              Quên mật khẩu?
            </button>
          </div>
        </form>

        {/* Google Sign-In */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ textAlign: 'center', color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>
            ────── Hoặc ──────
          </div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#fff',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              color: '#374151',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#4285f4';
              e.target.style.boxShadow = '0 2px 8px rgba(66,133,244,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Đăng nhập bằng Google
          </button>
        </div>

        {/* Demo login buttons */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            ────── Đăng nhập nhanh ──────
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.5rem'
          }}>
            <button
              onClick={() => handleDemoLogin('candidate')}
              disabled={loading}
              className="btn"
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              👨‍💼 Ứng viên
            </button>
            <button
              onClick={() => handleDemoLogin('employer')}
              disabled={loading}
              className="btn"
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              🏢 Nhà tuyển dụng
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="btn"
              style={{
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              👑 Admin
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Chưa có tài khoản?
          </p>
          <button
            onClick={() => navigate('/register')}
            className="btn btn-secondary"
            style={{
              backgroundColor: 'transparent',
              border: '2px solid #2563eb',
              color: '#2563eb',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#2563eb';
            }}
          >
            📝 Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
