import React, { useState } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import API_BASE from '../config/api';

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
    try {
      await axios.post(`${API_BASE}/auth/change-password`, { currentPassword, newPassword }, {
        headers: { Authorization: `Bearer ${AuthService.getToken()}` }
      });
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Mật khẩu hiện tại không đúng!' });
    }
  };

  return (
    <div className="jp-auth-wrapper">
      <div className="jp-auth-card" style={{ maxWidth: 460 }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3" style={{ width: 64, height: 64 }}>
            <i className="bi bi-shield-lock fs-2 text-primary"></i>
          </div>
          <h3 className="fw-bold">Đổi Mật Khẩu</h3>
          <p className="text-muted">Cập nhật mật khẩu để bảo mật tài khoản</p>
        </div>

        {message.text && <div className={`alert alert-${message.type}`}><i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>{message.text}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Mật khẩu hiện tại</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock"></i></span>
              <input type={showCurrent ? 'text' : 'password'} className="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required placeholder="Nhập mật khẩu hiện tại" />
              <button type="button" className="input-group-text" onClick={() => setShowCurrent(!showCurrent)}><i className={`bi ${showCurrent ? 'bi-eye-slash' : 'bi-eye'}`}></i></button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Mật khẩu mới</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
              <input type={showNew ? 'text' : 'password'} className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" />
              <button type="button" className="input-group-text" onClick={() => setShowNew(!showNew)}><i className={`bi ${showNew ? 'bi-eye-slash' : 'bi-eye'}`}></i></button>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Xác nhận mật khẩu mới</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-shield-check"></i></span>
              <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Nhập lại mật khẩu mới" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100"><i className="bi bi-check-lg me-1"></i>Cập Nhật Mật Khẩu</button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
