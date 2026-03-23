import axios from 'axios';
import AuthService from './AuthService';

const API_BASE_URL = 'http://localhost:8080/api';

class JobApplicationService {
  // Apply for a job
  applyForJob(jobId) {
    return axios.post(`${API_BASE_URL}/applications/apply/${jobId}`, {}, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      }
    });
  }

  // Check if user has applied for a job
  checkApplicationStatus(jobId) {
    return axios.get(`${API_BASE_URL}/applications/check/${jobId}`, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      }
    });
  }

  // Get user's applications
  getMyApplications(page = 0, size = 10) {
    return axios.get(`${API_BASE_URL}/applications/my-applications`, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      },
      params: { page, size }
    });
  }

  // Get applications for employer's jobs
  getApplicationsForMyJobs(page = 0, size = 10) {
    return axios.get(`${API_BASE_URL}/applications/employer`, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      },
      params: { page, size }
    });
  }

  // Update application status (employer only)
  updateApplicationStatus(applicationId, status, notes = '') {
    return axios.put(`${API_BASE_URL}/applications/${applicationId}/status`, {
      status,
      notes
    }, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      }
    });
  }

  // Get application by ID
  getApplicationById(applicationId) {
    return axios.get(`${API_BASE_URL}/applications/${applicationId}`, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      }
    });
  }

  // Withdraw application (candidate only)
  withdrawApplication(applicationId) {
    return axios.put(`${API_BASE_URL}/applications/${applicationId}/withdraw`, {}, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      }
    });
  }

  // Get application statistics
  getApplicationStats() {
    return axios.get(`${API_BASE_URL}/applications/stats`, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      }
    });
  }

  // Get applications by status
  getApplicationsByStatus(status, page = 0, size = 10) {
    return axios.get(`${API_BASE_URL}/applications/status/${status}`, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      },
      params: { page, size }
    });
  }

  // Schedule interview
  scheduleInterview(applicationId, interviewData) {
    return axios.post(`${API_BASE_URL}/applications/${applicationId}/interview`, interviewData, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      }
    });
  }

  // Get interview details
  getInterviewDetails(applicationId) {
    return axios.get(`${API_BASE_URL}/applications/${applicationId}/interview`, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      }
    });
  }
}

export default new JobApplicationService();