import * as candidateService from '../services/candidate.service.js';
import * as socialService from '../services/socialIntegration.service.js';
import * as jobService from '../services/job.service.js';
import { jobQuerySchema } from '../validators/job.validator.js';
import {
  updateProfileSchema,
  educationSchema,
  experienceSchema,
  projectSchema,
  skillSchema,
  certificateSchema,
} from '../validators/candidate.validator.js';

export const getJobs = async (req, res, next) => {
  try {
    const queryParams = jobQuerySchema.parse(req.query);
    const result = await jobService.listCandidateJobs(queryParams);
    return res.status(200).json({ success: true, data: result.jobs, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const data = await candidateService.getCandidateProfile(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const updated = await candidateService.updateProfile(req.user.id, validatedData);
    return res.status(200).json({ success: true, message: 'Profile updated', data: updated });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};

// Education
export const addEducation = async (req, res, next) => {
  try {
    const validatedData = educationSchema.parse(req.body);
    const education = await candidateService.addEducation(req.user.id, validatedData);
    return res.status(201).json({ success: true, data: education });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};

export const updateEducation = async (req, res, next) => {
  try {
    const validatedData = educationSchema.parse(req.body);
    const result = await candidateService.editEducation(req.user.id, req.params.id, validatedData);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};

export const deleteEducation = async (req, res, next) => {
  try {
    const result = await candidateService.removeEducation(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

// Experience
export const addExperience = async (req, res, next) => {
  try {
    const validatedData = experienceSchema.parse(req.body);
    const experience = await candidateService.addExperience(req.user.id, validatedData);
    return res.status(201).json({ success: true, data: experience });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};

export const updateExperience = async (req, res, next) => {
  try {
    const validatedData = experienceSchema.parse(req.body);
    const result = await candidateService.editExperience(req.user.id, req.params.id, validatedData);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};

export const deleteExperience = async (req, res, next) => {
  try {
    const result = await candidateService.removeExperience(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

// Projects
export const addProject = async (req, res, next) => {
  try {
    const validatedData = projectSchema.parse(req.body);
    const project = await candidateService.addProject(req.user.id, validatedData);
    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const validatedData = projectSchema.parse(req.body);
    const result = await candidateService.editProject(req.user.id, req.params.id, validatedData);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const result = await candidateService.removeProject(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

// Skills
export const addSkill = async (req, res, next) => {
  try {
    const validatedData = skillSchema.parse(req.body);
    const skill = await candidateService.addSkill(req.user.id, validatedData);
    return res.status(201).json({ success: true, data: skill });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    const result = await candidateService.removeSkill(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

// Certificates
export const addCertificate = async (req, res, next) => {
  try {
    const validatedData = certificateSchema.parse(req.body);
    const certificate = await candidateService.addCertificate(req.user.id, validatedData);
    return res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};

export const deleteCertificate = async (req, res, next) => {
  try {
    const result = await candidateService.removeCertificate(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

// Resume File Upload
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume file (.pdf, .doc, .docx)' });
    }
    const resume = await candidateService.uploadResumeFile(req.user.id, req.file);
    return res.status(201).json({ success: true, message: 'Resume uploaded successfully', data: resume });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const result = await candidateService.removeResumeFile(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export const parseResumeAI = async (req, res, next) => {
  try {
    const result = await candidateService.parseResumeWithAI(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Resume parsed into structured JSON successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const scoreResume = async (req, res, next) => {
  try {
    const scoreResult = await candidateService.scoreResume(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: 'Resume scored successfully', data: scoreResult });
  } catch (error) {
    next(error);
  }
};

export const compareResumes = async (req, res, next) => {
  try {
    const { resumeA, resumeB } = req.query;
    if (!resumeA || !resumeB) {
      return res.status(400).json({ success: false, message: 'Query parameters resumeA and resumeB are required' });
    }
    const result = await candidateService.compareResumes(req.user.id, resumeA, resumeB);
    return res.status(200).json({
      success: true,
      message: 'Comparative analysis generated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GitHub & LinkedIn Integration Handlers
export const fetchGitHubIntegration = async (req, res, next) => {
  try {
    const { username, grantPermission } = req.body;
    if (!grantPermission) {
      return res.status(403).json({ success: false, message: 'Explicit user permission consent is required to fetch GitHub data.' });
    }
    const result = await socialService.fetchGitHubData(username);
    return res.status(200).json({
      success: true,
      message: 'GitHub profile, repositories, languages, and contribution stats fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const syncMergeSocialProfile = async (req, res, next) => {
  try {
    const { githubData } = req.body;
    const result = await socialService.mergeSocialDataToCandidateProfile(req.user.id, {
      githubData,
    });
    return res.status(200).json({
      success: true,
      message: 'Social profile data merged into candidate database profile successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
