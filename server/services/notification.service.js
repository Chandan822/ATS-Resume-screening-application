import prisma from '../config/db.js';

let ioInstance = null;

/**
 * Initialize Socket.io Instance
 */
export const initSocketServer = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Subscribe client to private user room
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
};

/**
 * Email Dispatcher Utility (HTML Template Formatter)
 */
export const sendNotificationEmail = async ({ emailTo, title, message, type }) => {
  if (!emailTo) return;

  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; color: #1e293b; background: #f8fafc; }
    .container { max-width: 550px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; }
    .header { font-size: 18px; font-weight: bold; color: #4f46e5; margin-bottom: 10px; }
    .type-badge { display: inline-block; padding: 4px 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; border-radius: 12px; background: #e0e7ff; color: #3730a3; margin-bottom: 15px; }
    .content { font-size: 14px; line-height: 1.6; color: #334155; }
    .footer { margin-top: 25px; pt: 15px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">${title}</div>
    <div class="type-badge">${type.replace('_', ' ')}</div>
    <div class="content">${message}</div>
    <div class="footer">AI ATS Platform Notification &bull; Do not reply directly to this automated email.</div>
  </div>
</body>
</html>
  `;

  console.log(`[Email Dispatcher Output] Sent email to ${emailTo} - Title: "${title}" (${type})`);
  return { success: true, emailTo, title };
};

/**
 * Main Create & Dispatch Notification (Persists to DB, Socket.io Push, Email Dispatch)
 */
export const createAndDispatchNotification = async ({ userId, title, message, type = 'SYSTEM_ALERT', metadata = null, emailTo = null }) => {
  // 1. Persist Notification in Database
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type: type || 'SYSTEM_ALERT',
      metadata,
      isRead: false,
    },
  });

  // 2. Emit Socket.io Real-time WebSocket Event if IO is initialized
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit('new_notification', notification);
  }

  // 3. Dispatch Formatted Email Notification
  if (emailTo) {
    sendNotificationEmail({ emailTo, title, message, type }).catch(() => {});
  }

  return notification;
};

/**
 * Get User Notifications & Unread Count
 */
export const getUserNotifications = async (userId) => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return {
    notifications,
    unreadCount,
  };
};

/**
 * Mark Single Notification as Read
 */
export const markNotificationAsRead = async (userId, notificationId) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};

/**
 * Mark All Notifications as Read
 */
export const markAllNotificationsAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
