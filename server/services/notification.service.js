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

/** Email dispatcher placeholder until a mail transport is configured. */
export const sendNotificationEmail = async ({ emailTo, title, message: _message, type }) => {
  if (!emailTo) return;

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
