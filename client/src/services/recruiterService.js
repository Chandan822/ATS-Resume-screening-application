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

  // AI Interview Question Generator Methods
  async generateInterviewQuestions(data) {
    const response = await apiClient.post('/recruiter/interviews/generate-questions', data);
    return response.data;
  },

  async saveInterviewQuestions(roundId, questionKit) {
    const response = await apiClient.post(`/recruiter/interviews/${roundId}/questions`, questionKit);
    return response.data;
  },

  async getInterviewQuestions(roundId) {
    const response = await apiClient.get(`/recruiter/interviews/${roundId}/questions`);
    return response.data;
  },

  // AI Interviewer Notes & Feedback Analyzer Methods
  async analyzeInterviewerNotes(notes) {
    const response = await apiClient.post('/recruiter/interviews/analyze-notes', { notes });
    return response.data;
  },

  async saveInterviewFeedback(roundId, feedbackData) {
    const response = await apiClient.post(`/recruiter/interviews/${roundId}/feedback`, feedbackData);
    return response.data;
  },

  async getInterviewFeedback(roundId) {
    const response = await apiClient.get(`/recruiter/interviews/${roundId}/feedback`);
    return response.data;
  },

  // Real-time Bias & Inclusivity Analyzer Method
  async analyzeJobBias(text) {
    const response = await apiClient.post('/recruiter/jobs/analyze-bias', { text });
    return response.data;
  },

  async getJobRecommendations(jobId) {
    const response = await apiClient.get(`/recruiter/jobs/${jobId}/recommendations`);
    return response.data;
  },
};

export default recruiterService;
