import * as appRepo from '../repositories/application.repository.js';
import * as candidateRepo from '../repositories/candidate.repository.js';
import { matchCandidateToJob } from './semanticMatcher.service.js';
import prisma from '../config/db.js';

export const applyToJob = async (userId, jobId) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);

  // Find latest primary resume version if available
  const latestResume = candidate.resumeFiles?.find((r) => r.isPrimary) || candidate.resumeFiles?.[0];
  let resumeVersionId = null;

  if (latestResume) {
    const version = await candidateRepo.findLatestResumeVersion(latestResume.id, candidate.id);
    resumeVersionId = version?.id || null;
  }

  const application = await appRepo.createApplication(candidate.id, jobId, resumeVersionId);

  // Calculate composite match score using AI & semantic matching services
  try {
    const matchResult = await matchCandidateToJob(candidate.id, jobId);
    await prisma.application.update({
      where: { id: application.id },
      data: { matchScore: matchResult.compositeScore },
    });
    application.matchScore = matchResult.compositeScore;
  } catch (err) {
    console.warn(`[Match Score Calculation Warning] Failed to compute match score for application: ${err.message}`);
  }

  return application;
};

export const withdrawApplication = async (userId, applicationId) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  await appRepo.deleteApplication(candidate.id, applicationId);
  return { message: 'Application withdrawn successfully' };
};

export const getCandidateApplications = async (userId) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  return appRepo.getCandidateApplications(candidate.id);
};

export const saveJob = async (userId, jobId) => {
  return appRepo.saveJobRecord(userId, jobId);
};

export const unsaveJob = async (userId, jobId) => {
  await appRepo.removeSavedJobRecord(userId, jobId);
  return { message: 'Job removed from saved list' };
};

export const getSavedJobs = async (userId) => {
  return appRepo.getSavedJobsList(userId);
};
