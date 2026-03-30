import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../services/AuthService';
import API_BASE from '../config/api';

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
        const res = await axios.post(`${API_BASE}/auth/google`, {
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
      <div className="jp-loading-page">
        <div className="jp-spinner"></div>
        <p className="text-muted mt-3">Đang xử lý đăng nhập Google...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jp-auth-wrapper">
        <div className="jp-auth-card text-center" style={{ maxWidth: 400 }}>
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 mb-3" style={{ width: 64, height: 64 }}>
            <i className="bi bi-exclamation-triangle fs-2 text-danger"></i>
          </div>
          <p className="text-danger fw-semibold mb-3">{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            <i className="bi bi-arrow-left me-1"></i>Quay lại trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default GoogleCallback;
