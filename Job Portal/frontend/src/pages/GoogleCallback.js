import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../services/AuthService';

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('Không nhận được mã xác thực từ Google.');
      setLoading(false);
      return;
    }

    const exchangeCode = async () => {
      try {
        const res = await axios.post('http://localhost:8080/api/auth/google', {
          credential: code
        });
        AuthService.saveToken(res.data.token);
        AuthService.saveUserInfo(res.data);
        window.dispatchEvent(new Event('authChanged'));
        navigate('/jobs');
      } catch (err) {
        console.error('Google login error:', err);
        setError(err.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
        setLoading(false);
      }
    };

    exchangeCode();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Đang xử lý đăng nhập Google...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem'
      }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={() => navigate('/login')}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Quay lại trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default GoogleCallback;
