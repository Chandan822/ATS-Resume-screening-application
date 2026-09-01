import prisma from '../config/db.js';
import {
  calculateResumeExperienceYears,
  isUsefulResumeValue,
  mergeResumeLanguages,
  normalizeResumeKey,
  normalizeResumeValue,
  parseResumeDate,
  uniqueResumeValues,
} from '../utils/resumeProfileMapper.js';

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

/**
 * Persist structured resume data into the candidate profile without replacing
 * values the candidate already entered or data merged from GitHub.
 */
export const applyParsedResumeData = async ({ candidateId, resumeVersionId, parsedData }) => {
  return prisma.$transaction(async (tx) => {
    const candidate = await tx.candidate.findUnique({
      where: { id: candidateId },
      include: {
        user: true,
        educations: true,
        experiences: true,
        projects: true,
        certificates: true,
        candidateSkills: { include: { skill: true } },
      },
    });

    if (!candidate) throw new Error('Candidate profile not found');

    await tx.resumeVersion.update({
      where: { id: resumeVersionId },
      data: { parsedData },
    });

    const profileData = {};
    const profileFieldsUpdated = [];
    const firstExperience = parsedData?.experience?.find((experience) => isUsefulResumeValue(experience?.jobTitle));

    if (!isUsefulResumeValue(candidate.headline) && isUsefulResumeValue(firstExperience?.jobTitle)) {
      profileData.headline = normalizeResumeValue(firstExperience.jobTitle);
    }
    if (!isUsefulResumeValue(candidate.summary) && isUsefulResumeValue(parsedData?.summary)) {
      profileData.summary = normalizeResumeValue(parsedData.summary);
    }
    if (!isUsefulResumeValue(candidate.currentLocation) && isUsefulResumeValue(parsedData?.location)) {
      profileData.currentLocation = normalizeResumeValue(parsedData.location);
    }

    const calculatedExperienceYears = calculateResumeExperienceYears(parsedData?.experience || []);
    if ((!candidate.totalExperienceYears || candidate.totalExperienceYears <= 0) && calculatedExperienceYears > 0) {
      profileData.totalExperienceYears = calculatedExperienceYears;
    }

    const mergedLanguages = mergeResumeLanguages(candidate.languages, parsedData?.languages || []);
    if (mergedLanguages.length > 0) profileData.languages = mergedLanguages;

    if (Object.keys(profileData).length > 0) {
      await tx.candidate.update({ where: { id: candidate.id }, data: profileData });
      profileFieldsUpdated.push(...Object.keys(profileData));
    }

    if (!isUsefulResumeValue(candidate.user.phone) && isUsefulResumeValue(parsedData?.phone)) {
      await tx.user.update({
        where: { id: candidate.user.id },
        data: { phone: normalizeResumeValue(parsedData.phone) },
      });
      profileFieldsUpdated.push('phone');
    }

    const existingSkillKeys = new Set(
      (candidate.candidateSkills || []).map((candidateSkill) => normalizeResumeKey(candidateSkill.skill.name))
    );
    const skillsAdded = [];

    for (const skillName of uniqueResumeValues(parsedData?.skills || [])) {
      const skillKey = normalizeResumeKey(skillName);
      if (existingSkillKeys.has(skillKey)) continue;

      let skill = await tx.skill.findFirst({
        where: { name: { equals: skillName, mode: 'insensitive' } },
      });
      if (!skill) {
        skill = await tx.skill.create({ data: { name: skillName, category: 'TECHNICAL' } });
      }

      await tx.candidateSkill.upsert({
        where: { candidateId_skillId: { candidateId: candidate.id, skillId: skill.id } },
        update: {},
        create: {
          candidateId: candidate.id,
          skillId: skill.id,
          yearsOfExperience: calculatedExperienceYears || 1,
          proficiencyLevel: 'INTERMEDIATE',
        },
      });
      existingSkillKeys.add(skillKey);
      skillsAdded.push(skillName);
    }

    const educationAdded = [];
    for (const education of parsedData?.education || []) {
      const institution = normalizeResumeValue(education?.institution);
      const degree = normalizeResumeValue(education?.degree);
      const startDate = parseResumeDate(education?.startDate);
      if (!isUsefulResumeValue(institution) || !isUsefulResumeValue(degree) || !startDate) continue;

      const duplicate = candidate.educations.some(
        (existing) =>
          normalizeResumeKey(existing.institution) === normalizeResumeKey(institution) &&
          normalizeResumeKey(existing.degree) === normalizeResumeKey(degree) &&
          existing.startDate.getTime() === startDate.getTime()
      );
      if (duplicate) continue;

      await tx.education.create({
        data: {
          candidateId: candidate.id,
          institution,
          degree,
          fieldOfStudy: isUsefulResumeValue(education?.fieldOfStudy) ? normalizeResumeValue(education.fieldOfStudy) : null,
          startDate,
          endDate: parseResumeDate(education?.endDate),
        },
      });
      educationAdded.push({ institution, degree });
    }

    const experienceAdded = [];
    for (const experience of parsedData?.experience || []) {
      const companyName = normalizeResumeValue(experience?.companyName);
      const jobTitle = normalizeResumeValue(experience?.jobTitle);
      const startDate = parseResumeDate(experience?.startDate);
      if (!isUsefulResumeValue(companyName) || !isUsefulResumeValue(jobTitle) || !startDate) continue;

      const duplicate = candidate.experiences.some(
        (existing) =>
          normalizeResumeKey(existing.companyName) === normalizeResumeKey(companyName) &&
          normalizeResumeKey(existing.jobTitle) === normalizeResumeKey(jobTitle) &&
          existing.startDate.getTime() === startDate.getTime()
      );
      if (duplicate) continue;

      await tx.experience.create({
        data: {
          candidateId: candidate.id,
          companyName,
          jobTitle,
          location: isUsefulResumeValue(experience?.location) ? normalizeResumeValue(experience.location) : null,
          startDate,
          endDate: parseResumeDate(experience?.endDate),
          isCurrentJob: Boolean(experience?.isCurrentJob),
          description: isUsefulResumeValue(experience?.description) ? normalizeResumeValue(experience.description) : null,
        },
      });
      experienceAdded.push({ companyName, jobTitle });
    }

    const projectAdded = [];
    for (const project of parsedData?.projects || []) {
      const title = normalizeResumeValue(project?.title);
      if (!isUsefulResumeValue(title)) continue;

      const duplicate = candidate.projects.some((existing) => normalizeResumeKey(existing.title) === normalizeResumeKey(title));
      if (duplicate) continue;

      await tx.project.create({
        data: {
          candidateId: candidate.id,
          title,
          description: isUsefulResumeValue(project?.description) ? normalizeResumeValue(project.description) : null,
          projectUrl: isUsefulResumeValue(project?.projectUrl) ? normalizeResumeValue(project.projectUrl) : null,
          githubUrl: isUsefulResumeValue(project?.githubUrl) ? normalizeResumeValue(project.githubUrl) : null,
          startDate: parseResumeDate(project?.startDate),
          endDate: parseResumeDate(project?.endDate),
        },
      });
      projectAdded.push(title);
    }

    const certificatesAdded = [];
    for (const certificate of uniqueResumeValues(parsedData?.certifications || [])) {
      const duplicate = candidate.certificates.some(
        (existing) => normalizeResumeKey(existing.name) === normalizeResumeKey(certificate)
      );
      if (duplicate) continue;

      await tx.certificate.create({
        data: {
          candidateId: candidate.id,
          name: certificate,
          issuingOrganization: 'Resume',
        },
      });
      certificatesAdded.push(certificate);
    }

    return {
      profileFieldsUpdated,
      skillsAdded,
      educationAdded,
      experienceAdded,
      projectAdded,
      certificatesAdded,
    };
  }, {
    maxWait: 10000,
    timeout: 30000,
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

export const updateResumeVersionParsedData = async (resumeVersionId, parsedData) => {
  return prisma.resumeVersion.update({
    where: { id: resumeVersionId },
    data: { parsedData },
  });
};

export const findLatestResumeVersion = async (resumeFileId, candidateId) => {
  return prisma.resumeVersion.findFirst({
    where: { resumeFileId, candidateId },
    orderBy: { createdAt: 'desc' },
  });
};

export const deleteResumeFileRecord = async (id, candidateId) => {
  return prisma.resumeFile.deleteMany({
    where: { id, candidateId },
  });
};
