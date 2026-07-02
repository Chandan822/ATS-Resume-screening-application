import apiClient from './api';

export const recruiterService = {
  async getDashboardStats() {
    const response = await apiClient.get('/recruiter/dashboard/stats');
    return response.data;
  },

  async getJobs(params = {}) {
    const response = await apiClient.get('/recruiter/jobs', { params });
    return response.data;
  },

  async getJobById(id) {
    const response = await apiClient.get(`/recruiter/jobs/${id}`);
    return response.data;
  },

  async createJob(jobData) {
    const response = await apiClient.post('/recruiter/jobs', jobData);
    return response.data;
  },

  async updateJob(id, jobData) {
    const response = await apiClient.put(`/recruiter/jobs/${id}`, jobData);
    return response.data;
  },

  async updateJobStatus(id, status) {
    const response = await apiClient.patch(`/recruiter/jobs/${id}/status`, { status });
    return response.data;
  },

  async duplicateJob(id) {
    const response = await apiClient.post(`/recruiter/jobs/${id}/duplicate`);
    return response.data;
  },

  async deleteJob(id) {
    const response = await apiClient.delete(`/recruiter/jobs/${id}`);
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
