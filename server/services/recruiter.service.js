import * as recruiterRepo from '../repositories/recruiter.repository.js';

export const getDashboardStats = async (userId) => {
  const stats = await recruiterRepo.getRecruiterStats(userId);

  return {
    widgets: {
      openJobs: stats.openJobsCount || 0,
      totalApplications: stats.totalApplicationsCount || 0,
      interviewsScheduled: stats.interviewsCount || 0,
      offersExtended: stats.offersCount || 0,
    },
    stageBreakdown: {
      applied: stats.stageCounts?.APPLIED || 0,
      screening: stats.stageCounts?.SCREENING || 0,
      interview: stats.stageCounts?.INTERVIEW_SCHEDULED || 0,
      offered: stats.stageCounts?.OFFERED || 0,
      hired: stats.stageCounts?.HIRED || 0,
      rejected: stats.stageCounts?.REJECTED || 0,
    },
    recentActivity: stats.recentAuditLogs || [],
    company: stats.company || { name: 'No Company Configured', industry: '', location: '' },
  };
};

export const getJobs = async (userId) => {
  return recruiterRepo.getJobsList(userId);
};

export const postJob = async (userId, data) => {
  return recruiterRepo.createJobOpening(userId, data);
};

export const getApplications = async (userId) => {
  return recruiterRepo.getApplicationsList(userId);
};

export const updateApplicationStatus = async (applicationId, status, schedule) => {
  return recruiterRepo.updateApplicationStage(applicationId, status, schedule);
};

export const getCandidates = async () => {
  return recruiterRepo.getAllCandidatesList();
};

export const getInterviews = async (userId) => {
  return recruiterRepo.getInterviewsList(userId);
};


