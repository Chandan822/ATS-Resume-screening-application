import prisma from '../config/db.js';

export const findJobs = async ({ query, department, status, jobType, location, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', companyId }) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(companyId ? { companyId } : {}),
    ...(status && status !== 'ALL' ? { status } : {}),
    ...(department && department !== 'ALL' ? { department: { equals: department, mode: 'insensitive' } } : {}),
    ...(jobType && jobType !== 'ALL' ? { jobType } : {}),
    ...(location ? { location: { contains: location, mode: 'insensitive' } } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { department: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [jobs, totalCount] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: { select: { name: true, logoUrl: true } },
        _count: { select: { applications: true } },
        jobSkills: { include: { skill: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    jobs,
    pagination: {
      totalCount,
      page,
      limit,
      totalPages,
    },
  };
};

export const findJobById = async (id) => {
  return prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
      recruiter: true,
      jobSkills: { include: { skill: true } },
      _count: { select: { applications: true } },
    },
  });
};

export const createJobRecord = async (recruiterId, companyId, data) => {
  return prisma.job.create({
    data: {
      companyId,
      recruiterId,
      title: data.title,
      department: data.department || 'Engineering',
      description: data.description,
      requirements: data.requirements || null,
      benefits: data.benefits || null,
      location: data.location,
      jobType: data.jobType || 'FULL_TIME',
      experienceLevel: data.experienceLevel || 'MID',
      minSalary: data.minSalary ? parseFloat(data.minSalary) : null,
      maxSalary: data.maxSalary ? parseFloat(data.maxSalary) : null,
      currency: data.currency || 'USD',
      status: data.status || 'DRAFT',
      priority: data.priority || 'MEDIUM',
    },
    include: { _count: { select: { applications: true } } },
  });
};

export const updateJobRecord = async (id, data) => {
  return prisma.job.update({
    where: { id },
    data: {
      title: data.title,
      department: data.department,
      description: data.description,
      requirements: data.requirements,
      benefits: data.benefits,
      location: data.location,
      jobType: data.jobType,
      experienceLevel: data.experienceLevel,
      minSalary: data.minSalary ? parseFloat(data.minSalary) : null,
      maxSalary: data.maxSalary ? parseFloat(data.maxSalary) : null,
      currency: data.currency,
      status: data.status,
      priority: data.priority,
    },
    include: { _count: { select: { applications: true } } },
  });
};

export const updateJobStatusRecord = async (id, status) => {
  return prisma.job.update({
    where: { id },
    data: { status },
  });
};

export const duplicateJobRecord = async (id, recruiterId) => {
  const originalJob = await prisma.job.findUnique({ where: { id } });
  if (!originalJob) throw new Error('Job not found');

  return prisma.job.create({
    data: {
      companyId: originalJob.companyId,
      recruiterId: recruiterId || originalJob.recruiterId,
      title: `${originalJob.title} (Copy)`,
      department: originalJob.department,
      description: originalJob.description,
      requirements: originalJob.requirements,
      benefits: originalJob.benefits,
      location: originalJob.location,
      jobType: originalJob.jobType,
      experienceLevel: originalJob.experienceLevel,
      minSalary: originalJob.minSalary,
      maxSalary: originalJob.maxSalary,
      currency: originalJob.currency,
      status: 'DRAFT',
      priority: originalJob.priority,
    },
    include: { _count: { select: { applications: true } } },
  });
};

export const deleteJobRecord = async (id) => {
  return prisma.job.delete({ where: { id } });
};
