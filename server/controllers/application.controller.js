import * as appService from '../services/application.service.js';

export const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId is required' });
    }
    const application = await appService.applyToJob(req.user.id, jobId);
    return res.status(201).json({ success: true, message: 'Application submitted successfully', data: application });
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (req, res, next) => {
  try {
    const result = await appService.withdrawApplication(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const data = await appService.getCandidateApplications(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const data = await appService.saveJob(req.user.id, jobId);
    return res.status(200).json({ success: true, message: 'Job saved successfully', data });
  } catch (error) {
    next(error);
  }
};

export const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const result = await appService.unsaveJob(req.user.id, jobId);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export const getSavedJobs = async (req, res, next) => {
  try {
    const data = await appService.getSavedJobs(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
