import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class ProjectService {
  getProjectsByCandidate(candidateId) {
    return axios.get(`${API_BASE_URL}/candidates/${candidateId}/projects`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
  }

  addProject(candidateId, project) {
    return axios.post(`${API_BASE_URL}/candidates/${candidateId}/projects`, project, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
  }

  updateProject(candidateId, projectId, project) {
    return axios.put(`${API_BASE_URL}/candidates/${candidateId}/projects/${projectId}`, project, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
  }

  deleteProject(candidateId, projectId) {
    return axios.delete(`${API_BASE_URL}/candidates/${candidateId}/projects/${projectId}`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
  }
}

export default new ProjectService();
