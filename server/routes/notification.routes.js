import express from 'express';
import * as notifController from '../controllers/notification.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/', notifController.getNotifications);
router.patch('/read-all', notifController.markAllAsRead);
router.patch('/:id/read', notifController.markAsRead);
router.post('/test-trigger', notifController.triggerTestNotification);

export default router;
