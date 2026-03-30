import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: 'danger', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'danger', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/reset-password`, { token, newPassword });
      setMessage({ type: 'success', text: 'Đặt lại mật khẩu thành công!' });
      setDone(true);
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!' });
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="jp-auth-wrapper">
        <div className="jp-auth-card text-center" style={{ maxWidth: 440 }}>
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 mb-3" style={{ width: 64, height: 64 }}>
            <i className="bi bi-exclamation-triangle fs-2 text-danger"></i>
          </div>
          <h4 className="fw-bold">Link Không Hợp Lệ</h4>
          <p className="text-muted mb-3">Token đặt lại mật khẩu không tồn tại.</p>
          <Link to="/forgot-password" className="btn btn-primary"><i className="bi bi-arrow-right me-1"></i>Quên mật khẩu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="jp-auth-wrapper">
      <div className="jp-auth-card" style={{ maxWidth: 440 }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3" style={{ width: 64, height: 64 }}>
            <i className="bi bi-arrow-repeat fs-2 text-primary"></i>
          </div>
          <h3 className="fw-bold">Đặt Lại Mật Khẩu</h3>
          <p className="text-muted">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {message.text && <div className={`alert alert-${message.type}`}><i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>{message.text}</div>}

        {!done ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Mật khẩu mới</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                <input type={showPassword ? 'text' : 'password'} className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Tối thiểu 6 ký tự" />
                <button type="button" className="input-group-text" onClick={() => setShowPassword(!showPassword)}><i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i></button>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label">Xác nhận mật khẩu</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-shield-check"></i></span>
                <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Nhập lại mật khẩu mới" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-check-lg me-1"></i>}Đặt Lại Mật Khẩu
            </button>
          </form>
        ) : (
          <div className="text-center">
            <Link to="/login" className="btn btn-primary"><i className="bi bi-box-arrow-in-right me-1"></i>Đăng Nhập Ngay</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
