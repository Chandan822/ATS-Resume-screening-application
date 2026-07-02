import prisma from '../config/db.js';

export const findCandidateByUserId = async (userId) => {
  let candidate = await prisma.candidate.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true },
      },
      educations: { orderBy: { startDate: 'desc' } },
      experiences: { orderBy: { startDate: 'desc' } },
      projects: { orderBy: { createdAt: 'desc' } },
      certificates: { orderBy: { createdAt: 'desc' } },
      candidateSkills: { include: { skill: true } },
      resumeFiles: { orderBy: { createdAt: 'desc' } },
    },
  });

  // Auto-create Candidate profile if missing
  if (!candidate) {
    candidate = await prisma.candidate.create({
      data: { userId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true },
        },
        educations: true,
        experiences: true,
        projects: true,
        certificates: true,
        candidateSkills: { include: { skill: true } },
        resumeFiles: true,
      },
    });
  }

  return candidate;
};

export const updateCandidateProfile = async (candidateId, profileData) => {
  return prisma.candidate.update({
    where: { id: candidateId },
    data: profileData,
  });
};

// Education CRUD
export const createEducation = async (candidateId, data) => {
  return prisma.education.create({
    data: {
      candidateId,
      institution: data.institution,
      degree: data.degree,
      fieldOfStudy: data.fieldOfStudy || null,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      isCurrent: data.isCurrent || false,
      grade: data.grade || null,
    },
  });
};

export const updateEducation = async (id, candidateId, data) => {
  return prisma.education.updateMany({
    where: { id, candidateId },
    data: {
      institution: data.institution,
      degree: data.degree,
      fieldOfStudy: data.fieldOfStudy || null,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      isCurrent: data.isCurrent || false,
      grade: data.grade || null,
    },
  });
};

export const deleteEducation = async (id, candidateId) => {
  return prisma.education.deleteMany({
    where: { id, candidateId },
  });
};

// Experience CRUD
export const createExperience = async (candidateId, data) => {
  return prisma.experience.create({
    data: {
      candidateId,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      location: data.location || null,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      isCurrentJob: data.isCurrentJob || false,
      description: data.description || null,
    },
  });
};

export const updateExperience = async (id, candidateId, data) => {
  return prisma.experience.updateMany({
    where: { id, candidateId },
    data: {
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      location: data.location || null,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      isCurrentJob: data.isCurrentJob || false,
      description: data.description || null,
    },
  });
};

export const deleteExperience = async (id, candidateId) => {
  return prisma.experience.deleteMany({
    where: { id, candidateId },
  });
};

// Projects CRUD
export const createProject = async (candidateId, data) => {
  return prisma.project.create({
    data: {
      candidateId,
      title: data.title,
      description: data.description || null,
      projectUrl: data.projectUrl || null,
      githubUrl: data.githubUrl || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });
};

export const updateProject = async (id, candidateId, data) => {
  return prisma.project.updateMany({
    where: { id, candidateId },
    data: {
      title: data.title,
      description: data.description || null,
      projectUrl: data.projectUrl || null,
      githubUrl: data.githubUrl || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });
};

export const deleteProject = async (id, candidateId) => {
  return prisma.project.deleteMany({
    where: { id, candidateId },
  });
};

// Skills CRUD
export const addCandidateSkill = async (candidateId, skillName, category, yearsOfExperience, proficiencyLevel) => {
  const normalizedSkillName = skillName.trim();
  let skill = await prisma.skill.findUnique({ where: { name: normalizedSkillName } });

  if (!skill) {
    skill = await prisma.skill.create({
      data: { name: normalizedSkillName, category: category || 'General' },
    });
  }

  return prisma.candidateSkill.upsert({
    where: { candidateId_skillId: { candidateId, skillId: skill.id } },
    update: { yearsOfExperience, proficiencyLevel },
    create: { candidateId, skillId: skill.id, yearsOfExperience, proficiencyLevel },
    include: { skill: true },
  });
};

export const deleteCandidateSkill = async (candidateSkillId, candidateId) => {
  return prisma.candidateSkill.deleteMany({
    where: { id: candidateSkillId, candidateId },
  });
};

// Certificate CRUD
export const createCertificate = async (candidateId, data) => {
  return prisma.certificate.create({
    data: {
      candidateId,
      name: data.name,
      issuingOrganization: data.issuingOrganization,
      issueDate: data.issueDate ? new Date(data.issueDate) : null,
      credentialId: data.credentialId || null,
      credentialUrl: data.credentialUrl || null,
    },
  });
};

export const deleteCertificate = async (id, candidateId) => {
  return prisma.certificate.deleteMany({
    where: { id, candidateId },
  });
};

// Resume File CRUD
export const createResumeFileRecord = async (candidateId, fileName, fileUrl, fileType, fileSize, isPrimary = true) => {
  if (isPrimary) {
    await prisma.resumeFile.updateMany({
      where: { candidateId },
      data: { isPrimary: false },
    });
  }

  return prisma.resumeFile.create({
    data: {
      candidateId,
      fileName,
      fileUrl,
      fileType,
      fileSize,
      isPrimary,
    },
  });
};

export const createResumeVersionRecord = async (resumeFileId, candidateId, parsedText) => {
  // Find current max version number for candidate
  const lastVersion = await prisma.resumeVersion.findFirst({
    where: { candidateId },
    orderBy: { versionNumber: 'desc' },
  });

  const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

  return prisma.resumeVersion.create({
    data: {
      resumeFileId,
      candidateId,
      versionNumber: nextVersionNumber,
      parsedText,
    },
  });
};

export const deleteResumeFileRecord = async (id, candidateId) => {
  return prisma.resumeFile.deleteMany({
    where: { id, candidateId },
  });
};
