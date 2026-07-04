import * as jobRepo from '../repositories/job.repository.js';
import prisma from '../config/db.js';

const getRecruiterDetails = async (userId) => {
  let recruiter = await prisma.recruiter.findUnique({ where: { userId } });
  if (!recruiter) {
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: { name: 'TechCorp Global', slug: 'techcorp-global', industry: 'Software', location: 'San Francisco, CA' },
      });
    }
    recruiter = await prisma.recruiter.create({
      data: { userId, companyId: company.id, designation: 'Hiring Manager' },
    });
  }
  return recruiter;
};

export const listJobs = async (userId, params) => {
  const recruiter = await getRecruiterDetails(userId);
  return jobRepo.findJobs({ ...params, companyId: recruiter.companyId });
};

export const listCandidateJobs = async (params) => {
  return jobRepo.findJobs({ ...params, status: params.status || 'OPEN' });
};

export const getJobById = async (id) => {
  const job = await jobRepo.findJobById(id);
  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }
  return job;
};

export const createJob = async (userId, data) => {
  const recruiter = await getRecruiterDetails(userId);
  return jobRepo.createJobRecord(recruiter.id, recruiter.companyId, data);
};

export const updateJob = async (id, data) => {
  return jobRepo.updateJobRecord(id, data);
};

export const updateJobStatus = async (id, status) => {
  return jobRepo.updateJobStatusRecord(id, status);
};

export const duplicateJob = async (id, userId) => {
  const recruiter = await getRecruiterDetails(userId);
  return jobRepo.duplicateJobRecord(id, recruiter.id);
};

export const deleteJob = async (id) => {
  return jobRepo.deleteJobRecord(id);
};
