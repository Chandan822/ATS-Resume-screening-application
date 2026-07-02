import express from 'express';
import { checkDatabaseConnection } from '../config/db.js';

const router = express.Router();

router.get('/health', async (req, res) => {
  const dbStatus = await checkDatabaseConnection();

  res.status(200).json({
    success: true,
    message: 'AI ATS Server is healthy and running',
    timestamp: new Date().toISOString(),
    server: 'Running',
    database: dbStatus.connected ? 'Connected' : 'Disconnected',
    details: {
      environment: process.env.NODE_ENV || 'development',
      dbStatus: dbStatus.status,
    },
  });
});

export default router;
