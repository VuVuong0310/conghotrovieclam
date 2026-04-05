import axios from 'axios';
import API_BASE from '../config/api';

const API_URL = API_BASE + '/public';

class CompanyService {
  getCompanies() {
    return axios.get(API_URL + '/companies');
  }

  getCompanyById(id) {
    return axios.get(API_URL + '/companies/' + id);
  }

  getStats() {
    return axios.get(API_URL + '/stats');
  }
}

export default new CompanyService();
