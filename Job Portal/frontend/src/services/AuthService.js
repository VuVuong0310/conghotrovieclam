import axios from 'axios';
import API_BASE from '../config/api';

const API_URL = API_BASE + '/auth';

class AuthService {
  login(username, password) {
    return axios.post(API_URL + '/login', {
      username,
      password
    });
  }

  register(username, password, role) {
    return axios.post(API_URL + '/register', {
      username,
      password,
      role: role ? [role] : ['ROLE_CANDIDATE']
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  saveToken(token) {
    localStorage.setItem('token', token);
  }

  saveUserInfo(data) {
    if (data.id) localStorage.setItem('userId', data.id);
    if (data.username) localStorage.setItem('username', data.username);
    if (data.roles) localStorage.setItem('roles', JSON.stringify(data.roles));
  }

  getUserId() {
    return localStorage.getItem('userId');
  }

  getUsername() {
    return localStorage.getItem('username');
  }

  getRoles() {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.roles && Array.isArray(payload.roles)) {
          return payload.roles;
        }
      } catch (e) {
        // fallback if token decode fails
      }
    }
    // Fallback to localStorage for old tokens without roles claim
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

  hasRole(role) {
    return this.getRoles().includes(role);
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}

export default new AuthService();
