import apiClient from './api';

export const authService = {
  async register(data) {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async refreshToken(refreshToken) {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  async logout(refreshToken) {
    const response = await apiClient.post('/auth/logout', { refreshToken });
    return response.data;
  },

  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(data) {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  async verifyEmail(token) {
    const response = await apiClient.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default authService;
