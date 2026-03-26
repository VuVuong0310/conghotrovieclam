import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/reset-password`, {
        token,
        newPassword
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
      }}>
        <div style={{ backgroundColor: '#fff', padding: '3rem', borderRadius: '12px', textAlign: 'center', maxWidth: '450px' }}>
          <h2 style={{ color: '#dc2626' }}>❌ Link không hợp lệ</h2>
          <p style={{ color: '#6b7280' }}>Token đặt lại mật khẩu không được tìm thấy.</p>
          <button onClick={() => navigate('/forgot-password')}
            style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Yêu cầu link mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '3rem', borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#2563eb', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '700' }}>
            🔑 Đặt Lại Mật Khẩu
          </h1>
          <p style={{ color: '#6b7280' }}>Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {message && (
          <div style={{
            padding: '12px 16px', marginBottom: '1.5rem', borderRadius: '8px',
            background: '#dcfce7', color: '#166534', fontSize: '14px'
          }}>
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '500' }}>
              🔒 Mật khẩu mới
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="form-control"
                style={{
                  width: '100%', padding: '1rem', paddingRight: '3rem',
                  border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem'
                }}
                placeholder="Nhập mật khẩu mới"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '500' }}>
              🔒 Xác nhận mật khẩu
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-control"
              style={{
                width: '100%', padding: '1rem', border: '2px solid #e5e7eb',
                borderRadius: '12px', fontSize: '1rem'
              }}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: '600',
              border: 'none', borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white', cursor: loading ? 'not-allowed' : 'pointer'
            }}>
            {loading ? 'Đang xử lý...' : '🔑 Đặt Lại Mật Khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
