import axios from 'axios';
import AuthService from './AuthService';
import API_BASE from '../config/api';

const API_URL = API_BASE + '/jobs';
const SEARCH_API_URL = API_BASE + '/search';
const RECOMMENDATIONS_API_URL = API_BASE + '/recommendations';

class JobService {
  getJobs() {
    return axios.get(API_URL, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      }
    });
  }

  getJobById(id) {
    return axios.get(API_URL + '/' + id, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      }
    });
  }

  createJob(job) {
    return axios.post(API_URL, job, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      }
    });
  }

  updateJob(id, job) {
    return axios.put(API_URL + '/' + id, job, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      }
    });
  }

  deleteJob(id) {
    return axios.delete(API_URL + '/' + id, {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      }
    });
  }

  // Advanced Search
  searchJobs(params) {
    return axios.get(SEARCH_API_URL + '/jobs', {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      },
      params: params
    });
  }

  searchByCategory(category, params = {}) {
    return axios.get(SEARCH_API_URL + '/category', {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      },
      params: { category, ...params }
    });
  }

  getRelatedJobs(jobId, limit = 5) {
    return axios.get(SEARCH_API_URL + '/related/' + jobId, {
      params: { limit }
    });
  }

  // Recommendations
  getRecommendedJobs(params) {
    return axios.get(RECOMMENDATIONS_API_URL + '/jobs', {
      headers: {
        'Authorization': 'Bearer ' + AuthService.getToken()
      },
      params: params
    });
  }

  getTrendingJobs(limit = 10) {
    return axios.get(RECOMMENDATIONS_API_URL + '/trending', {
      params: { limit }
    });
  }

  getNewJobs(limitDays = 7, limit = 10) {
    return axios.get(RECOMMENDATIONS_API_URL + '/new', {
      params: { limitDays, limit }
    });
  }

  getSimilarJobs(jobId, limit = 5) {
    return axios.get(RECOMMENDATIONS_API_URL + '/similar/' + jobId, {
      params: { limit }
    });
  }
}

export default new JobService();
