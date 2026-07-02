import express from 'express';
import * as recruiterController from '../controllers/recruiter.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Guard with JWT and Recruiter/Admin roles
router.use(authenticateJWT);
router.use(authorizeRoles('RECRUITER', 'ADMIN'));

router.get('/dashboard/stats', recruiterController.getDashboardStats);
router.get('/jobs', recruiterController.getJobs);
router.post('/jobs', recruiterController.createJob);
router.get('/applications', recruiterController.getApplications);
router.put('/applications/:id/status', recruiterController.updateApplicationStatus);

export default router;
