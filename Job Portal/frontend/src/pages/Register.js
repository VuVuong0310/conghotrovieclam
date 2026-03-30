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
      ? 'Tìm kiếm công việc và quản lý hồ sơ ứng tuyển'
      : 'Đăng tin tuyển dụng và quản lý ứng viên';
  };

  return (
    <div className="jp-auth-wrapper">
      <div className="jp-auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">
          <i className="bi bi-person-plus-fill"></i>
          <h1>Tạo Tài Khoản</h1>
          <p>Bắt đầu hành trình nghề nghiệp của bạn</p>
        </div>

        {error && <div className="alert alert-danger d-flex align-items-center gap-2"><i className="bi bi-exclamation-triangle"></i>{error}</div>}
        {success && <div className="alert alert-success d-flex align-items-center gap-2"><i className="bi bi-check-circle"></i>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label"><i className="bi bi-envelope me-1"></i>Email / Tên đăng nhập</label>
            <input type="email" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Nhập email của bạn" />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-lock me-1"></i>Mật khẩu</label>
            <div className="position-relative">
              <input type={showPassword ? 'text' : 'password'} className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Tối thiểu 6 ký tự" style={{ paddingRight: '2.8rem' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted pe-3" style={{ textDecoration: 'none' }}>
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-shield-lock me-1"></i>Xác nhận mật khẩu</label>
            <div className="position-relative">
              <input type={showConfirmPassword ? 'text' : 'password'} className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Nhập lại mật khẩu" style={{ paddingRight: '2.8rem' }} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted pe-3" style={{ textDecoration: 'none' }}>
                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label"><i className="bi bi-people me-1"></i>Loại tài khoản</label>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <div onClick={() => setRole('ROLE_CANDIDATE')} className={`jp-card text-center p-3 ${role === 'ROLE_CANDIDATE' ? 'border-primary bg-primary bg-opacity-10' : ''}`} style={{ cursor: 'pointer', borderWidth: 2 }}>
                  <i className="bi bi-person-badge d-block mb-1" style={{ fontSize: '1.8rem', color: 'var(--jp-primary)' }}></i>
                  <div className="fw-bold" style={{ color: 'var(--jp-primary)' }}>Ứng Viên</div>
                  <small className="text-muted">Tìm việc làm</small>
                </div>
              </div>
              <div className="col-6">
                <div onClick={() => setRole('ROLE_EMPLOYER')} className={`jp-card text-center p-3 ${role === 'ROLE_EMPLOYER' ? 'border-primary bg-primary bg-opacity-10' : ''}`} style={{ cursor: 'pointer', borderWidth: 2 }}>
                  <i className="bi bi-building d-block mb-1" style={{ fontSize: '1.8rem', color: 'var(--jp-primary)' }}></i>
                  <div className="fw-bold" style={{ color: 'var(--jp-primary)' }}>Nhà Tuyển Dụng</div>
                  <small className="text-muted">Đăng tuyển</small>
                </div>
              </div>
            </div>
            <div className="alert alert-info py-2 d-flex align-items-center gap-2" style={{ fontSize: '.88rem' }}>
              <i className={`bi ${role === 'ROLE_CANDIDATE' ? 'bi-person-badge' : 'bi-building'}`}></i>
              <span><strong>{role === 'ROLE_CANDIDATE' ? 'Ứng Viên' : 'Nhà Tuyển Dụng'}:</strong> {getRoleDescription(role)}</span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 mb-3" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang đăng ký...</> : <><i className="bi bi-check-circle me-1"></i>Tạo Tài Khoản</>}
          </button>
        </form>

        <div className="text-center">
          <span className="text-muted">Đã có tài khoản? </span>
          <button onClick={() => navigate('/login')} className="btn btn-link p-0 text-decoration-none fw-semibold"><i className="bi bi-box-arrow-in-right me-1"></i>Đăng nhập ngay</button>
        </div>
      </div>
    </div>
  );
}

export default Register;
