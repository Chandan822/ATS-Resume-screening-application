import * as recruiterService from '../services/recruiter.service.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const data = await recruiterService.getDashboardStats(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const data = await recruiterService.getJobs(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const job = await recruiterService.postJob(req.user.id, req.body);
    return res.status(201).json({ success: true, message: 'Job opening created successfully', data: job });
  } catch (error) {
    next(error);
  }
};

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
