import prisma from '../config/db.js';

/**
 * Apply to Job Opening
 */
export const createApplication = async (candidateId, jobId, resumeVersionId) => {
  // Check if candidate already applied
  const existing = await prisma.application.findUnique({
    where: { jobId_candidateId: { jobId, candidateId } },
  });

  if (existing) {
    const error = new Error('You have already applied for this job position.');
    error.statusCode = 400;
    throw error;
  }

  return prisma.application.create({
    data: {
      candidateId,
      jobId,
      resumeVersionId: resumeVersionId || null,
      status: 'APPLIED',
    },
    include: {
      job: { include: { company: true } },
    },
  });
};

/**
 * Withdraw Application
 */
export const deleteApplication = async (candidateId, applicationId) => {
  return prisma.application.deleteMany({
    where: { id: applicationId, candidateId },
  });
};

/**
 * Get Candidate Applications
 */
export const getCandidateApplications = async (candidateId) => {
  return prisma.application.findMany({
    where: { candidateId },
    include: {
      job: {
        include: { company: { select: { name: true, logoUrl: true } } },
      },
      resumeVersion: { select: { versionNumber: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Save / Bookmark Job
 */
export const saveJobRecord = async (userId, jobId) => {
  const existing = await prisma.savedSearch.findFirst({
    where: { userId, title: `JOB_${jobId}` },
  });

  if (existing) return existing;

  return prisma.savedSearch.create({
    data: {
      userId,
      title: `JOB_${jobId}`,
      filters: { jobId },
    },
  });
};

/**
 * Unsave / Remove Saved Job
 */
export const removeSavedJobRecord = async (userId, jobId) => {
  return prisma.savedSearch.deleteMany({
    where: { userId, title: `JOB_${jobId}` },
  });
};

/**
 * Get Candidate Saved Jobs List
 */
export const getSavedJobsList = async (userId) => {
  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId, title: { startsWith: 'JOB_' } },
  });

  const jobIds = savedSearches
    .map((s) => s.filters?.jobId)
    .filter(Boolean);

  if (jobIds.length === 0) return [];

  return prisma.job.findMany({
    where: { id: { in: jobIds } },
    include: {
      company: { select: { name: true, logoUrl: true } },
      _count: { select: { applications: true } },
    },
  });
};
