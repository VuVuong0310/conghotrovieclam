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
        </form>

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
