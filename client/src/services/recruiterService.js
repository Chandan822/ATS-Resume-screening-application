import apiClient from './api';

export const recruiterService = {
  async getDashboardStats() {
    const response = await apiClient.get('/recruiter/dashboard/stats');
    return response.data;
  },

  async getJobs() {
    const response = await apiClient.get('/recruiter/jobs');
    return response.data;
  },

  async createJob(jobData) {
    const response = await apiClient.post('/recruiter/jobs', jobData);
    return response.data;
  },

  async getApplications() {
    const response = await apiClient.get('/recruiter/applications');
    return response.data;
  },

  async updateApplicationStatus(id, status) {
    const response = await apiClient.put(`/recruiter/applications/${id}/status`, { status });
    return response.data;
  },
};

export default recruiterService;
