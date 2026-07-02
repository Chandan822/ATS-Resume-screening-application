import * as notifService from '../services/notification.service.js';

export const getNotifications = async (req, res, next) => {
  try {
    const data = await notifService.getUserNotifications(req.user.id);
    return res.status(200).json({ success: true, data: data.notifications, unreadCount: data.unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    await notifService.markNotificationAsRead(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notifService.markAllNotificationsAsRead(req.user.id);
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

export const triggerTestNotification = async (req, res, next) => {
  try {
    const { title, message, type, emailTo } = req.body;
    const notification = await notifService.createAndDispatchNotification({
      userId: req.user.id,
      title: title || 'Application Update Received',
      message: message || 'Your application status for Senior Engineer was updated to Interview Scheduled.',
      type: type || 'INTERVIEW_SCHEDULE',
      emailTo: emailTo || req.user.email,
    });
    return res.status(201).json({ success: true, message: 'Notification created and dispatched', data: notification });
  } catch (error) {
    next(error);
  }
};
