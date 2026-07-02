import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as candidateController from '../controllers/candidate.controller.js';
import * as appController from '../controllers/application.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(__dirname, '../uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents (.doc, .docx) are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = express.Router();

// Apply Authentication & Authorization Middleware to all candidate routes
router.use(authenticateJWT);
router.use(authorizeRoles('CANDIDATE', 'ADMIN'));

// Profile Basic Info
router.get('/profile', candidateController.getProfile);
router.put('/profile', candidateController.updateProfile);

// Education
router.post('/education', candidateController.addEducation);
router.put('/education/:id', candidateController.updateEducation);
router.delete('/education/:id', candidateController.deleteEducation);

// Experience
router.post('/experience', candidateController.addExperience);
router.put('/experience/:id', candidateController.updateExperience);
router.delete('/experience/:id', candidateController.deleteExperience);

// Projects
router.post('/projects', candidateController.addProject);
router.put('/projects/:id', candidateController.updateProject);
router.delete('/projects/:id', candidateController.deleteProject);

// Skills
router.post('/skills', candidateController.addSkill);
router.delete('/skills/:id', candidateController.deleteSkill);

// Certificates
router.post('/certificates', candidateController.addCertificate);
router.delete('/certificates/:id', candidateController.deleteCertificate);

// Resume Upload, AI Parsing & ATS Scoring
router.get('/resumes/compare', candidateController.compareResumes);
router.post('/resumes', upload.single('resume'), candidateController.uploadResume);
router.post('/resumes/:id/parse-ai', candidateController.parseResumeAI);
router.post('/resumes/:id/score', candidateController.scoreResume);
router.delete('/resumes/:id', candidateController.deleteResume);

// Candidate Applications Workflow
router.post('/applications', appController.applyToJob);
router.get('/applications', appController.getMyApplications);
router.delete('/applications/:id', appController.withdrawApplication);

// Candidate Saved Jobs
router.post('/saved-jobs/:jobId', appController.saveJob);
router.delete('/saved-jobs/:jobId', appController.unsaveJob);
router.get('/saved-jobs', appController.getSavedJobs);

export default router;
