import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập mật khẩu
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await axios.post('http://localhost:8080/api/auth/check-email', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Email không tồn tại trong hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/api/auth/verify-and-change-password', {
        email,
        oldPassword,
        newPassword
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '1rem', border: '2px solid #e5e7eb',
    borderRadius: '12px', fontSize: '1rem', outline: 'none',
    transition: 'border-color 0.3s', boxSizing: 'border-box'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#2563eb', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '700' }}>
            🔐 {step === 1 ? 'Quên Mật Khẩu' : 'Đổi Mật Khẩu'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>
            {step === 1 ? 'Nhập email để xác minh tài khoản' : `Tài khoản: ${email}`}
          </p>
          {step === 2 && (
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem'
            }}>
              <span style={{
                width: '30px', height: '4px', borderRadius: '2px',
                backgroundColor: '#2563eb'
              }} />
              <span style={{
                width: '30px', height: '4px', borderRadius: '2px',
                backgroundColor: '#2563eb'
              }} />
            </div>
          )}
          {step === 1 && (
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem'
            }}>
              <span style={{
                width: '30px', height: '4px', borderRadius: '2px',
                backgroundColor: '#2563eb'
              }} />
              <span style={{
                width: '30px', height: '4px', borderRadius: '2px',
                backgroundColor: '#e5e7eb'
              }} />
            </div>
          )}
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
          <div style={{
            padding: '12px 16px', marginBottom: '1.5rem', borderRadius: '8px',
            background: '#fef2f2', color: '#dc2626', fontSize: '14px',
            border: '1px solid #fecaca'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Step 1: Nhập email */}
        {step === 1 && (
          <form onSubmit={handleCheckEmail}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
                📧 Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                placeholder="Nhập email của bạn"
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '1rem', fontSize: '1.05rem', fontWeight: '600',
                border: 'none', borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '⏳ Đang kiểm tra...' : '🔍 Kiểm Tra Email'}
            </button>
          </form>
        )}

        {/* Step 2: Nhập mật khẩu cũ + mới */}
        {step === 2 && !message && (
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
                🔑 Mật khẩu cũ
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Nhập mật khẩu hiện tại"
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button type="button" onClick={() => setShowOld(!showOld)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem'
                  }}>
                  {showOld ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
                🆕 Mật khẩu mới
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem'
                  }}>
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>
              {newPassword && newPassword.length < 6 && (
                <p style={{ color: '#f59e0b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  ⚠️ Mật khẩu phải có ít nhất 6 ký tự
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
                ✅ Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={inputStyle}
                placeholder="Nhập lại mật khẩu mới"
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  ❌ Mật khẩu xác nhận không khớp
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '1rem', fontSize: '1.05rem', fontWeight: '600',
                border: 'none', borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, marginBottom: '0.75rem'
              }}
            >
              {loading ? '⏳ Đang xử lý...' : '🔄 Đổi Mật Khẩu'}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setError(''); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); }}
              style={{
                width: '100%', padding: '0.75rem', fontSize: '0.95rem',
                border: '2px solid #e5e7eb', borderRadius: '12px',
                background: 'white', color: '#6b7280', cursor: 'pointer'
              }}
            >
              ← Quay lại nhập email
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none', border: 'none', color: '#2563eb',
              cursor: 'pointer', fontWeight: '500', fontSize: '14px'
            }}
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
