import prisma from '../config/db.js';

/**
 * Fetch Recruiter Dashboard High-Level Statistics
 */
export const getRecruiterStats = async (userId) => {
  // Find recruiter & company if exists
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId },
    include: { company: true },
  });

  const companyId = recruiter?.companyId || null;

  // 1. Open Jobs Count
  const openJobsCount = await prisma.job.count({
    where: companyId ? { companyId, status: 'OPEN' } : { status: 'OPEN' },
  });

  // 2. Total Applications Count
  const totalApplicationsCount = await prisma.application.count({
    where: companyId ? { job: { companyId } } : {},
  });

  // 3. Scheduled Interviews Count
  const interviewsCount = await prisma.interviewRound.count({
    where: companyId ? { application: { job: { companyId } } } : {},
  });

  // 4. Offers Extended Count
  const offersCount = await prisma.application.count({
    where: companyId ? { job: { companyId }, status: 'OFFERED' } : { status: 'OFFERED' },
  });

  // Stage breakdown
  const stages = ['APPLIED', 'SCREENING', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED'];
  const stageCounts = {};
  for (const stage of stages) {
    stageCounts[stage] = await prisma.application.count({
      where: companyId ? { job: { companyId }, status: stage } : { status: stage },
    });
  }

  // Recent Activity Audit Log
  const recentAuditLogs = await prisma.auditLog.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    select: { id: true, action: true, entity: true, changes: true, createdAt: true },
  });

  return {
    openJobsCount,
    totalApplicationsCount,
    interviewsCount,
    offersCount,
    stageCounts,
    recentAuditLogs,
    company: recruiter?.company || null,
  };
};

/**
 * Get Recruiter Jobs with Applicant Counts
 */
export const getJobsList = async (userId) => {
  const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
  const companyId = recruiter?.companyId || null;

  return prisma.job.findMany({
    where: companyId ? { companyId } : {},
    include: {
      company: { select: { name: true, logoUrl: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Create New Job Opening
 */
export const createJobOpening = async (userId, data) => {
  let recruiter = await prisma.recruiter.findUnique({ where: { userId } });

  // Auto-create Recruiter record if missing
  if (!recruiter) {
    let defaultCompany = await prisma.company.findFirst();
    if (!defaultCompany) {
      defaultCompany = await prisma.company.create({
        data: { name: 'TechCorp Global', slug: 'techcorp-global', industry: 'Software', location: 'San Francisco, CA' },
      });
    }
    recruiter = await prisma.recruiter.create({
      data: { userId, companyId: defaultCompany.id, designation: 'Hiring Manager' },
    });
  }

  return prisma.job.create({
    data: {
      companyId: recruiter.companyId,
      recruiterId: recruiter.id,
      title: data.title,
      description: data.description || 'Job description',
      department: data.department || 'Engineering',
      location: data.location || 'Remote',
      jobType: data.jobType || 'FULL_TIME',
      experienceLevel: data.experienceLevel || 'MID',
      minSalary: data.minSalary ? parseFloat(data.minSalary) : null,
      maxSalary: data.maxSalary ? parseFloat(data.maxSalary) : null,
      status: 'OPEN',
    },
  });
};

/**
 * Get Applications Pipeline
 */
export const getApplicationsList = async (userId) => {
  const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
  const companyId = recruiter?.companyId || null;

  return prisma.application.findMany({
    where: companyId ? { job: { companyId } } : {},
    include: {
      job: { select: { id: true, title: true, department: true } },
      candidate: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Update Application Status Stage
 */
export const updateApplicationStage = async (applicationId, status) => {
  return prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });
};

/**
 * Get All Candidates (Global Talent Pool)
 */
export const getAllCandidatesList = async () => {
  return prisma.candidate.findMany({
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
      },
      candidateSkills: { include: { skill: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get Company Scheduled Interviews
 */
export const getInterviewsList = async (userId) => {
  const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
  const companyId = recruiter?.companyId || null;

  return prisma.interviewRound.findMany({
    where: companyId ? { application: { job: { companyId } } } : {},
    include: {
      application: {
        include: {
          job: { select: { id: true, title: true, department: true } },
          candidate: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });
};

