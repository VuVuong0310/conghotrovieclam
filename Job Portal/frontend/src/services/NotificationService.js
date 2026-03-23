import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class NotificationService {
  getNotifications(page = 0, size = 10) {
    return axios.get(`${API_BASE_URL}/notifications?page=${page}&size=${size}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  getUnreadCount() {
    return axios.get(`${API_BASE_URL}/notifications/unread-count`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  markAsRead(notificationId) {
    return axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`, {}, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  markAllAsRead() {
    return axios.put(`${API_BASE_URL}/notifications/mark-all-read`, {}, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  deleteNotification(notificationId) {
    return axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  createNotification(notification) {
    return axios.post(`${API_BASE_URL}/notifications`, notification, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }
}

export default new NotificationService();