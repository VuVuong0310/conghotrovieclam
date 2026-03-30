import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_BASE from '../config/api';

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email });
      setStep(2);
      setMessage({ type: 'success', text: 'Email hợp lệ! Hãy nhập mật khẩu mới.' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Email không tồn tại trong hệ thống!' });
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
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
      await axios.post(`${API_BASE}/auth/reset-password-direct`, { email, newPassword });
      setMessage({ type: 'success', text: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập.' });
      setStep(3);
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Có lỗi xảy ra!' });
    }
    setLoading(false);
  };

  return (
    <div className="jp-auth-wrapper">
      <div className="jp-auth-card" style={{ maxWidth: 440 }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 mb-3" style={{ width: 64, height: 64 }}>
            <i className="bi bi-key fs-2 text-warning"></i>
          </div>
          <h3 className="fw-bold">Quên Mật Khẩu</h3>
          <p className="text-muted">{step === 1 ? 'Nhập email để xác minh tài khoản' : step === 2 ? 'Đặt mật khẩu mới cho tài khoản' : 'Hoàn tất!'}</p>
        </div>

        {/* Progress indicator */}
        <div className="d-flex justify-content-center gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <div key={s} className={`rounded-circle ${step >= s ? 'bg-primary' : 'bg-secondary bg-opacity-25'}`} style={{ width: 10, height: 10 }}></div>
          ))}
        </div>

        {message.text && <div className={`alert alert-${message.type}`}><i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>{message.text}</div>}

        {step === 1 && (
          <form onSubmit={handleCheckEmail}>
            <div className="mb-4">
              <label className="form-label">Địa chỉ email</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Nhập email đã đăng ký" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-arrow-right me-1"></i>}Tiếp tục
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
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
        )}

        {step === 3 && (
          <div className="text-center">
            <Link to="/login" className="btn btn-primary"><i className="bi bi-box-arrow-in-right me-1"></i>Đăng Nhập Ngay</Link>
          </div>
        )}

        <div className="text-center mt-3">
          <Link to="/login" className="text-decoration-none"><i className="bi bi-arrow-left me-1"></i>Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
