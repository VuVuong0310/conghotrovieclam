import axios from 'axios';
import API_BASE from '../config/api';

const API_BASE_URL = API_BASE;

class ExperienceService {
  getExperiencesByCandidate(candidateId) {
    return axios.get(`${API_BASE_URL}/candidates/${candidateId}/experiences`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  addExperience(candidateId, experience) {
    return axios.post(`${API_BASE_URL}/candidates/${candidateId}/experiences`, experience, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  updateExperience(candidateId, experienceId, experience) {
    return axios.put(`${API_BASE_URL}/candidates/${candidateId}/experiences/${experienceId}`, experience, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  deleteExperience(candidateId, experienceId) {
    return axios.delete(`${API_BASE_URL}/candidates/${candidateId}/experiences/${experienceId}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }
}

export default new ExperienceService();