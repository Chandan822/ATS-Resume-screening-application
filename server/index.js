import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// Security and Logging Middlewares
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register Routes
app.use('/api', healthRoutes);

// Catch 404 and Global Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`🚀 [AI ATS Server] Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`📡 [Health Check] Available at http://localhost:${env.PORT}/api/health`);
  });
}

export default app;
