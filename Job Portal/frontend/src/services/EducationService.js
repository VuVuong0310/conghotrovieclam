import axios from 'axios';
import API_BASE from '../config/api';

const API_BASE_URL = API_BASE;

class EducationService {
  getEducationsByCandidate(candidateId) {
    return axios.get(`${API_BASE_URL}/candidates/${candidateId}/educations`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  addEducation(candidateId, education) {
    return axios.post(`${API_BASE_URL}/candidates/${candidateId}/educations`, education, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  updateEducation(candidateId, educationId, education) {
    return axios.put(`${API_BASE_URL}/candidates/${candidateId}/educations/${educationId}`, education, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  deleteEducation(candidateId, educationId) {
    return axios.delete(`${API_BASE_URL}/candidates/${candidateId}/educations/${educationId}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }
}

export default new EducationService();