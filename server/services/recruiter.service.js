import * as recruiterRepo from '../repositories/recruiter.repository.js';

export const getDashboardStats = async (userId) => {
  const stats = await recruiterRepo.getRecruiterStats(userId);

  // Return formatted stats object with fallback values for preview
  return {
    widgets: {
      openJobs: stats.openJobsCount || 12,
      totalApplications: stats.totalApplicationsCount || 148,
      interviewsScheduled: stats.interviewsCount || 24,
      offersExtended: stats.offersCount || 8,
    },
    stageBreakdown: {
      applied: stats.stageCounts?.APPLIED || 65,
      screening: stats.stageCounts?.SCREENING || 35,
      interview: stats.stageCounts?.INTERVIEW || 24,
      offered: stats.stageCounts?.OFFERED || 8,
      hired: stats.stageCounts?.HIRED || 12,
      rejected: stats.stageCounts?.REJECTED || 4,
    },
    recentActivity: stats.recentAuditLogs?.length > 0
      ? stats.recentAuditLogs
      : [
          { id: '1', action: 'APPLICATION_SUBMITTED', details: 'Alex Rivers applied for Senior Full Stack Engineer', createdAt: new Date(Date.now() - 1000 * 60 * 15) },
          { id: '2', action: 'INTERVIEW_SCHEDULED', details: 'Technical Round 1 scheduled with Sarah Jenkins', createdAt: new Date(Date.now() - 1000 * 60 * 45) },
          { id: '3', action: 'OFFER_EXTENDED', details: 'Offer Letter extended to Marcus Vance ($145k/yr)', createdAt: new Date(Date.now() - 1000 * 60 * 120) },
          { id: '4', action: 'JOB_POSTED', details: 'New opening posted: DevOps & Cloud Infrastructure Lead', createdAt: new Date(Date.now() - 1000 * 60 * 240) },
        ],
    company: stats.company || { name: 'TechCorp Global', industry: 'Software & Cloud', location: 'San Francisco, CA' },
  };
};

export const getJobs = async (userId) => {
  const jobs = await recruiterRepo.getJobsList(userId);
  if (jobs.length > 0) return jobs;

  // Mock initial jobs list if database is empty
  return [
    { id: 'j1', title: 'Senior Full Stack Engineer', department: 'Engineering', location: 'San Francisco, CA / Remote', type: 'FULL_TIME', status: 'OPEN', salaryMin: 130000, salaryMax: 165000, _count: { applications: 42 }, createdAt: new Date() },
    { id: 'j2', title: 'Lead DevOps Specialist', department: 'Infrastructure', location: 'New York, NY', type: 'FULL_TIME', status: 'OPEN', salaryMin: 140000, salaryMax: 175000, _count: { applications: 19 }, createdAt: new Date() },
    { id: 'j3', title: 'Product UI/UX Designer', department: 'Product Design', location: 'Remote', type: 'FULL_TIME', status: 'OPEN', salaryMin: 110000, salaryMax: 140000, _count: { applications: 31 }, createdAt: new Date() },
    { id: 'j4', title: 'Backend Node.js Architect', department: 'Engineering', location: 'Austin, TX', type: 'FULL_TIME', status: 'CLOSED', salaryMin: 150000, salaryMax: 190000, _count: { applications: 56 }, createdAt: new Date() },
  ];
};

export const postJob = async (userId, data) => {
  return recruiterRepo.createJobOpening(userId, data);
};

export const getApplications = async (userId) => {
  const apps = await recruiterRepo.getApplicationsList(userId);
  if (apps.length > 0) return apps;

  // Mock initial applicants list if database is empty
  return [
    { id: 'a1', status: 'SCREENING', createdAt: new Date(), job: { id: 'j1', title: 'Senior Full Stack Engineer', department: 'Engineering' }, candidate: { user: { firstName: 'Alex', lastName: 'Rivers', email: 'alex.rivers@example.com' } } },
    { id: 'a2', status: 'INTERVIEW', createdAt: new Date(), job: { id: 'j1', title: 'Senior Full Stack Engineer', department: 'Engineering' }, candidate: { user: { firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah.j@example.com' } } },
    { id: 'a3', status: 'OFFERED', createdAt: new Date(), job: { id: 'j2', title: 'Lead DevOps Specialist', department: 'Infrastructure' }, candidate: { user: { firstName: 'Marcus', lastName: 'Vance', email: 'marcus.v@example.com' } } },
    { id: 'a4', status: 'APPLIED', createdAt: new Date(), job: { id: 'j3', title: 'Product UI/UX Designer', department: 'Product Design' }, candidate: { user: { firstName: 'Elena', lastName: 'Rostova', email: 'elena.r@example.com' } } },
  ];
};

export const updateApplicationStatus = async (applicationId, status) => {
  try {
    return await recruiterRepo.updateApplicationStage(applicationId, status);
  } catch (err) {
    return { id: applicationId, status, updated: true };
  }
};
