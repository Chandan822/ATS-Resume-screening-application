import apiClient from './api';

export const notificationService = {
  async getNotifications() {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  async markAsRead(id) {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },

  async triggerTestNotification(type = 'INTERVIEW_SCHEDULE') {
    const response = await apiClient.post('/notifications/test-trigger', { type });
    return response.data;
  },
};

export default notificationService;
