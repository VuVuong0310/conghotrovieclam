import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import AuthService from '../services/AuthService';

function AccountInfo() {
  const userId = AuthService.getUserId();
  const username = AuthService.getUsername();
  const roles = AuthService.getRoles();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ email: '', phone: '', address: '' });
  const [photoPreview, setPhotoPreview] = useState(null);

  const isCandidate = roles.includes('ROLE_CANDIDATE');
  const isEmployer = roles.includes('ROLE_EMPLOYER');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (isCandidate) {
        const res = await axios.get(`${API_BASE}/profile/${userId}`, {
          headers: { Authorization: 'Bearer ' + AuthService.getToken() }
        });
        setProfile(res.data);
        setForm({
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || ''
        });
        setPhotoPreview(`${API_BASE}/profile/${userId}/photo`);
      } else if (isEmployer) {
        const res = await axios.get(`${API_BASE}/employer/company-profile`, {
          headers: { Authorization: 'Bearer ' + AuthService.getToken() }
        });
        setProfile(res.data);
        setForm({
          email: username || '',
          phone: res.data.phone || '',
          address: res.data.address || ''
        });
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (isCandidate) {
        const payload = { ...profile, email: form.email, phone: form.phone, address: form.address };
        if (Array.isArray(payload.skills)) payload.skills = payload.skills;
        else if (typeof payload.skills === 'string') payload.skills = payload.skills.split(',').map(s => s.trim()).filter(s => s);
        await axios.put(`${API_BASE}/profile/${userId}`, payload, {
          headers: { Authorization: 'Bearer ' + AuthService.getToken() }
        });
      } else if (isEmployer) {
        const payload = { ...profile, phone: form.phone, address: form.address };
        await axios.put(`${API_BASE}/employer/company-profile`, payload, {
          headers: { Authorization: 'Bearer ' + AuthService.getToken() }
        });
      }
      setEditing(false);
      loadProfile();
      alert('Cập nhật thành công!');
    } catch (e) {
      alert('Cập nhật thất bại!');
    }
  };

  const getRoleName = () => {
    if (roles.includes('ROLE_ADMIN')) return 'Quản trị viên';
    if (roles.includes('ROLE_EMPLOYER')) return 'Nhà tuyển dụng';
    if (roles.includes('ROLE_CANDIDATE')) return 'Ứng viên';
    return 'Người dùng';
  };

  const getRoleBadgeClass = () => {
    if (roles.includes('ROLE_ADMIN')) return 'jp-badge-danger';
    if (roles.includes('ROLE_EMPLOYER')) return 'jp-badge-warning';
    return 'jp-badge-primary';
  };

  if (loading) {
    return <div className="jp-loading-page"><div className="jp-spinner"></div><p>Đang tải thông tin...</p></div>;
  }

  return (
    <div className="jp-container" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="jp-account-header">
        <div className="jp-account-header-content">
          <h1><i className="bi bi-person-circle me-2"></i>Thông Tin Tài Khoản</h1>
          <p>Cập nhật thông tin liên lạc của bạn</p>
        </div>
        <div className="jp-account-header-actions">
          {isCandidate && (
            <Link to={`/profile/${userId}`} className="btn btn-light">
              <i className="bi bi-file-earmark-text me-1"></i>Quản lý CV
            </Link>
          )}
          <Link to="/change-password" className="btn btn-outline-light">
            <i className="bi bi-shield-lock me-1"></i>Đổi mật khẩu
          </Link>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="jp-card mt-4">
        <div className="jp-card-body">
          {/* Avatar & Role */}
          <div className="jp-account-top">
            <div className="jp-account-avatar">
              {photoPreview && isCandidate ? (
                <img src={photoPreview} alt="Avatar" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              ) : null}
              <div className="jp-account-avatar-fallback" style={{ display: photoPreview && isCandidate ? 'none' : 'flex' }}>
                <i className="bi bi-person-fill"></i>
              </div>
            </div>
            <div className="jp-account-identity">
              <h4>{isCandidate ? (profile?.fullName || username) : (profile?.companyName || username)}</h4>
              <div className="jp-account-meta">
                <span className={`jp-badge ${getRoleBadgeClass()}`}><i className="bi bi-shield-check me-1"></i>{getRoleName()}</span>
                <span className="text-muted"><i className="bi bi-at me-1"></i>{username}</span>
              </div>
            </div>
            {!editing && (
              <button className="btn btn-primary ms-auto" onClick={() => setEditing(true)}>
                <i className="bi bi-pencil me-1"></i>Chỉnh sửa
              </button>
            )}
          </div>

          <hr />

          {/* Info Rows */}
          <div className="jp-account-info">
            <div className="jp-info-row">
              <div className="jp-info-label">
                <i className="bi bi-person"></i>
                <span>Tài khoản</span>
              </div>
              <div className="jp-info-value">
                <strong>{username}</strong>
              </div>
            </div>

            <div className="jp-info-row">
              <div className="jp-info-label">
                <i className="bi bi-shield-check"></i>
                <span>Vai trò</span>
              </div>
              <div className="jp-info-value">
                <span className={`jp-badge ${getRoleBadgeClass()}`}>{getRoleName()}</span>
              </div>
            </div>

            {isCandidate && (
              <div className="jp-info-row">
                <div className="jp-info-label">
                  <i className="bi bi-person-vcard"></i>
                  <span>Họ và tên</span>
                </div>
                <div className="jp-info-value">
                  <strong>{profile?.fullName || <span className="text-muted fst-italic">Chưa cập nhật</span>}</strong>
                </div>
              </div>
            )}

            {isEmployer && (
              <div className="jp-info-row">
                <div className="jp-info-label">
                  <i className="bi bi-building"></i>
                  <span>Công ty</span>
                </div>
                <div className="jp-info-value">
                  <strong>{profile?.companyName || <span className="text-muted fst-italic">Chưa cập nhật</span>}</strong>
                </div>
              </div>
            )}

            <div className="jp-info-row">
              <div className="jp-info-label">
                <i className="bi bi-envelope"></i>
                <span>Email liên hệ</span>
              </div>
              <div className="jp-info-value">
                {editing ? (
                  <input type="email" name="email" className="form-control" value={form.email} onChange={handleFormChange} placeholder="example@gmail.com" />
                ) : (
                  <strong>{form.email || <span className="text-muted fst-italic">Chưa cập nhật</span>}</strong>
                )}
              </div>
            </div>

            <div className="jp-info-row">
              <div className="jp-info-label">
                <i className="bi bi-telephone"></i>
                <span>Số điện thoại</span>
              </div>
              <div className="jp-info-value">
                {editing ? (
                  <input type="text" name="phone" className="form-control" value={form.phone} onChange={handleFormChange} placeholder="0912 345 678" />
                ) : (
                  <strong>{form.phone || <span className="text-muted fst-italic">Chưa cập nhật</span>}</strong>
                )}
              </div>
            </div>

            <div className="jp-info-row">
              <div className="jp-info-label">
                <i className="bi bi-geo-alt"></i>
                <span>Địa chỉ</span>
              </div>
              <div className="jp-info-value">
                {editing ? (
                  <input type="text" name="address" className="form-control" value={form.address} onChange={handleFormChange} placeholder="Quận 1, TP. Hồ Chí Minh" />
                ) : (
                  <strong>{form.address || <span className="text-muted fst-italic">Chưa cập nhật</span>}</strong>
                )}
              </div>
            </div>

            {isCandidate && profile?.dateOfBirth && (
              <div className="jp-info-row">
                <div className="jp-info-label">
                  <i className="bi bi-calendar-heart"></i>
                  <span>Ngày sinh</span>
                </div>
                <div className="jp-info-value">
                  <strong>{new Date(profile.dateOfBirth).toLocaleDateString('vi-VN')}</strong>
                </div>
              </div>
            )}

            {isCandidate && profile?.skills && (
              <div className="jp-info-row">
                <div className="jp-info-label">
                  <i className="bi bi-tools"></i>
                  <span>Kỹ năng</span>
                </div>
                <div className="jp-info-value">
                  <div className="d-flex flex-wrap gap-2">
                    {(Array.isArray(profile.skills) ? profile.skills : String(profile.skills).split(',')).map((skill, i) => (
                      <span key={i} className="jp-badge jp-badge-info">{String(skill).trim()}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isEmployer && profile?.industry && (
              <div className="jp-info-row">
                <div className="jp-info-label">
                  <i className="bi bi-briefcase"></i>
                  <span>Ngành nghề</span>
                </div>
                <div className="jp-info-value">
                  <span className="jp-badge jp-badge-info">{profile.industry}</span>
                </div>
              </div>
            )}

            {isEmployer && profile?.companySize && (
              <div className="jp-info-row">
                <div className="jp-info-label">
                  <i className="bi bi-people"></i>
                  <span>Quy mô</span>
                </div>
                <div className="jp-info-value">
                  <strong>{profile.companySize}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Save / Cancel */}
          {editing && (
            <div className="d-flex gap-2 mt-4 pt-3 border-top">
              <button className="btn btn-primary" onClick={handleSave}>
                <i className="bi bi-check-lg me-1"></i>Lưu thay đổi
              </button>
              <button className="btn btn-outline-secondary" onClick={() => { setEditing(false); loadProfile(); }}>
                <i className="bi bi-x-lg me-1"></i>Hủy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="jp-account-links mt-4">
        <h6 className="jp-section-title"><i className="bi bi-link-45deg"></i>Liên kết nhanh</h6>
        <div className="jp-account-links-grid">
          {isCandidate && (
            <>
              <Link to={`/profile/${userId}`} className="jp-quick-link">
                <i className="bi bi-file-earmark-person"></i>
                <span>Quản lý CV</span>
              </Link>
              <Link to="/my-applications" className="jp-quick-link">
                <i className="bi bi-send"></i>
                <span>Đơn ứng tuyển</span>
              </Link>
              <Link to="/recommendations" className="jp-quick-link">
                <i className="bi bi-stars"></i>
                <span>Việc làm đề xuất</span>
              </Link>
            </>
          )}
          {isEmployer && (
            <>
              <Link to="/employer-dashboard" className="jp-quick-link">
                <i className="bi bi-grid-1x2"></i>
                <span>Dashboard</span>
              </Link>
              <Link to="/create-job" className="jp-quick-link">
                <i className="bi bi-plus-circle"></i>
                <span>Đăng tuyển</span>
              </Link>
            </>
          )}
          <Link to="/change-password" className="jp-quick-link">
            <i className="bi bi-shield-lock"></i>
            <span>Đổi mật khẩu</span>
          </Link>
          <Link to="/jobs" className="jp-quick-link">
            <i className="bi bi-search"></i>
            <span>Tìm việc làm</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AccountInfo;
