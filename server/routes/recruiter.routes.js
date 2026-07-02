import express from 'express';
import * as recruiterController from '../controllers/recruiter.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Guard with JWT and Recruiter/Admin roles
router.use(authenticateJWT);
router.use(authorizeRoles('RECRUITER', 'ADMIN'));

// Dashboard Overview
router.get('/dashboard/stats', recruiterController.getDashboardStats);

// Job Management Endpoints
router.get('/jobs', recruiterController.getJobs);
router.post('/jobs', recruiterController.createJob);
router.get('/jobs/:id', recruiterController.getJobById);
router.put('/jobs/:id', recruiterController.updateJob);
router.patch('/jobs/:id/status', recruiterController.updateJobStatus);
router.post('/jobs/:id/duplicate', recruiterController.duplicateJob);
router.delete('/jobs/:id', recruiterController.deleteJob);

// Semantic Matching & Candidate Ranking Endpoints
router.post('/jobs/:id/embeddings', recruiterController.generateJobEmbedding);
router.post('/resumes/:id/embeddings', recruiterController.generateResumeEmbedding);
router.get('/jobs/:id/matches', recruiterController.getJobCandidateMatches);
router.post('/jobs/:id/match-candidate/:candidateId', recruiterController.getSingleCandidateMatch);

// AI Interview Question Generator Endpoints
router.post('/interviews/generate-questions', recruiterController.generateInterviewQuestions);
router.post('/interviews/:roundId/questions', recruiterController.saveInterviewQuestions);
router.get('/interviews/:roundId/questions', recruiterController.getInterviewQuestions);

// Applicant Pipeline Endpoints
router.get('/applications', recruiterController.getApplications);
router.put('/applications/:id/status', recruiterController.updateApplicationStatus);

export default router;
