import React, { useState, useEffect } from 'react';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ROLE_CANDIDATE');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    setSuccess('');
    setLoading(true);

    // Validation
    if (!username || !password || !confirmPassword) {
      setError('Tất cả các trường là bắt buộc');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu không trùng khớp');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      await AuthService.register(username, password, role);
      setSuccess('Đăng ký thành công! Chuyển hướng đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
      setLoading(false);
    }
  };

  const getRoleDescription = (selectedRole) => {
    return selectedRole === 'ROLE_CANDIDATE'
      ? '📋 Tìm kiếm công việc và quản lý hồ sơ ứng tuyển'
      : '💼 Đăng tin tuyển dụng và quản lý ứng viên';
  };

  const getRoleIcon = (selectedRole) => {
    return selectedRole === 'ROLE_CANDIDATE' ? '👨‍💼' : '🏢';
  };

  return (
    <div className="container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
    }}>
      <div className="register-card" style={{
        backgroundColor: '#fff',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            color: '#2563eb',
            marginBottom: '0.5rem',
            fontSize: '2.5rem',
            fontWeight: '700'
          }}>
            🎯 JobPortal
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Tạo tài khoản để bắt đầu hành trình nghề nghiệp
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{
            marginBottom: '1.5rem'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#1f2937',
              fontWeight: '500'
            }}>
              📧 Email / Tên đăng nhập
            </label>
            <input
              type="email"
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
              placeholder="Nhập email của bạn"
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
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
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

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#1f2937',
              fontWeight: '500'
            }}>
              🔄 Xác nhận mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                placeholder="Xác nhận mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#1f2937',
              fontWeight: '500'
            }}>
              🎭 Loại tài khoản
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div
                onClick={() => setRole('ROLE_CANDIDATE')}
                style={{
                  padding: '1rem',
                  border: `2px solid ${role === 'ROLE_CANDIDATE' ? '#2563eb' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  backgroundColor: role === 'ROLE_CANDIDATE' ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (role !== 'ROLE_CANDIDATE') {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.backgroundColor = '#f0f7ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (role !== 'ROLE_CANDIDATE') {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#fff';
                  }
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍💼</div>
                <div style={{ fontWeight: '600', color: '#2563eb' }}>Ứng Viên</div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Tìm việc làm
                </div>
              </div>

              <div
                onClick={() => setRole('ROLE_EMPLOYER')}
                style={{
                  padding: '1rem',
                  border: `2px solid ${role === 'ROLE_EMPLOYER' ? '#2563eb' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  backgroundColor: role === 'ROLE_EMPLOYER' ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (role !== 'ROLE_EMPLOYER') {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.backgroundColor = '#f0f7ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (role !== 'ROLE_EMPLOYER') {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#fff';
                  }
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏢</div>
                <div style={{ fontWeight: '600', color: '#2563eb' }}>Nhà Tuyển Dụng</div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Đăng tin tuyển dụng
                </div>
              </div>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: '#eff6ff',
              borderRadius: '12px',
              border: '1px solid #bfdbfe',
              fontSize: '0.9rem',
              color: '#1f2937'
            }}>
              <strong>{getRoleIcon(role)} {role === 'ROLE_CANDIDATE' ? 'Ứng Viên' : 'Nhà Tuyển Dụng'}:</strong><br />
              {getRoleDescription(role)}
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
              marginBottom: '1.5rem'
            }}
          >
            {loading ? (
              <>
                <div className="loading" style={{ width: '20px', height: '20px', marginRight: '10px' }}></div>
                Đang đăng ký...
              </>
            ) : (
              '🎯 Tạo Tài Khoản'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Đã có tài khoản?
          </p>
          <button
            onClick={() => navigate('/login')}
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
            🔑 Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
