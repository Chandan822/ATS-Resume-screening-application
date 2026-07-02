import apiClient from './api';

export const candidateService = {
  async getProfile() {
    const response = await apiClient.get('/candidate/profile');
    return response.data;
  },

  async updateProfile(data) {
    const response = await apiClient.put('/candidate/profile', data);
    return response.data;
  },

  // Education
  async addEducation(data) {
    const response = await apiClient.post('/candidate/education', data);
    return response.data;
  },

  async updateEducation(id, data) {
    const response = await apiClient.put(`/candidate/education/${id}`, data);
    return response.data;
  },

  async deleteEducation(id) {
    const response = await apiClient.delete(`/candidate/education/${id}`);
    return response.data;
  },

  // Experience
  async addExperience(data) {
    const response = await apiClient.post('/candidate/experience', data);
    return response.data;
  },

  async updateExperience(id, data) {
    const response = await apiClient.put(`/candidate/experience/${id}`, data);
    return response.data;
  },

  async deleteExperience(id) {
    const response = await apiClient.delete(`/candidate/experience/${id}`);
    return response.data;
  },

  // Projects
  async addProject(data) {
    const response = await apiClient.post('/candidate/projects', data);
    return response.data;
  },

  async updateProject(id, data) {
    const response = await apiClient.put(`/candidate/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id) {
    const response = await apiClient.delete(`/candidate/projects/${id}`);
    return response.data;
  },

  // Skills
  async addSkill(data) {
    const response = await apiClient.post('/candidate/skills', data);
    return response.data;
  },

  async deleteSkill(id) {
    const response = await apiClient.delete(`/candidate/skills/${id}`);
    return response.data;
  },

  // Certificates
  async addCertificate(data) {
    const response = await apiClient.post('/candidate/certificates', data);
    return response.data;
  },

  async deleteCertificate(id) {
    const response = await apiClient.delete(`/candidate/certificates/${id}`);
    return response.data;
  },

  // Resumes
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await apiClient.post('/candidate/resumes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteResume(id) {
    const response = await apiClient.delete(`/candidate/resumes/${id}`);
    return response.data;
  },

  async parseResumeAI(resumeFileId) {
    const response = await apiClient.post(`/candidate/resumes/${resumeFileId}/parse-ai`);
    return response.data;
  },

  async scoreResume(resumeFileId) {
    const response = await apiClient.post(`/candidate/resumes/${resumeFileId}/score`);
    return response.data;
  },
};

export default candidateService;
