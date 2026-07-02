import * as recruiterService from '../services/recruiter.service.js';
import * as jobService from '../services/job.service.js';
import * as semanticService from '../services/semanticMatcher.service.js';
import * as questionService from '../services/questionGenerator.service.js';
import { createJobSchema, updateJobSchema, jobQuerySchema } from '../validators/job.validator.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const data = await recruiterService.getDashboardStats(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Job Management Handlers
export const getJobs = async (req, res, next) => {
  try {
    const queryParams = jobQuerySchema.parse(req.query);
    const result = await jobService.listJobs(req.user.id, queryParams);
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

export const createJob = async (req, res, next) => {
  try {
    const validatedData = createJobSchema.parse(req.body);
    const job = await jobService.createJob(req.user.id, validatedData);
    return res.status(201).json({ success: true, message: 'Job created successfully', data: job });
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

export const updateJob = async (req, res, next) => {
  try {
    const validatedData = updateJobSchema.parse(req.body);
    const updated = await jobService.updateJob(req.params.id, validatedData);
    return res.status(200).json({ success: true, message: 'Job updated successfully', data: updated });
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

export const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const updated = await jobService.updateJobStatus(req.params.id, status);
    return res.status(200).json({ success: true, message: `Job status updated to ${status}`, data: updated });
  } catch (error) {
    next(error);
  }
};

export const duplicateJob = async (req, res, next) => {
  try {
    const duplicated = await jobService.duplicateJob(req.params.id, req.user.id);
    return res.status(201).json({ success: true, message: 'Job duplicated successfully', data: duplicated });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    await jobService.deleteJob(req.params.id);
    return res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Application Pipeline Handlers
export const getApplications = async (req, res, next) => {
  try {
    const data = await recruiterService.getApplications(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const result = await recruiterService.updateApplicationStatus(req.params.id, status);
    return res.status(200).json({ success: true, message: 'Application status updated', data: result });
  } catch (error) {
    next(error);
  }
};

// Semantic Matching & Vector Search Endpoints
export const generateJobEmbedding = async (req, res, next) => {
  try {
    const result = await semanticService.storeJobEmbedding(req.params.id);
    return res.status(201).json({ success: true, message: 'Job embedding generated and stored', data: result });
  } catch (error) {
    next(error);
  }
};

export const generateResumeEmbedding = async (req, res, next) => {
  try {
    const { candidateId } = req.body;
    const result = await semanticService.storeResumeEmbedding(req.params.id, candidateId);
    return res.status(201).json({ success: true, message: 'Resume embedding generated and stored', data: result });
  } catch (error) {
    next(error);
  }
};

export const getJobCandidateMatches = async (req, res, next) => {
  try {
    const rankings = await semanticService.rankCandidatesForJob(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Candidate rankings calculated using vector similarity & composite scoring',
      data: rankings,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleCandidateMatch = async (req, res, next) => {
  try {
    const { id: jobId, candidateId } = req.params;
    const result = await semanticService.matchCandidateToJob(candidateId, jobId);
    return res.status(200).json({
      success: true,
      message: 'Candidate match breakdown calculated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// AI Interview Question Generator Handlers
export const generateInterviewQuestions = async (req, res, next) => {
  try {
    const { resumeText, jobDescription, candidateExperience, candidateName, jobTitle } = req.body;
    const questions = await questionService.generateInterviewQuestions({
      resumeText,
      jobDescription,
      candidateExperience,
      candidateName,
      jobTitle,
    });
    return res.status(200).json({
      success: true,
      message: 'AI interview questions generated successfully',
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

export const saveInterviewQuestions = async (req, res, next) => {
  try {
    const { roundId } = req.params;
    const result = await questionService.saveInterviewQuestions(roundId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Interview question kit saved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewQuestions = async (req, res, next) => {
  try {
    const { roundId } = req.params;
    const questions = await questionService.getInterviewQuestions(roundId);
    return res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};
