import * as candidateRepo from '../repositories/candidate.repository.js';
import { extractResumeText } from '../utils/resumeExtractor.js';
import { parseResumeTextWithAI } from './aiParser.service.js';
import { calculateAtsScore } from '../utils/atsScorer.js';

/**
 * Calculate Candidate Profile Completion Percentage (0-100%)
 */
export const calculateProfileCompletion = (candidate) => {
  let score = 0;

  // 1. Headline & Summary (15%)
  if (candidate.headline && candidate.headline.trim() !== '') score += 5;
  if (candidate.summary && candidate.summary.trim() !== '') score += 10;

  // 2. Location & Salary info (15%)
  if (candidate.currentLocation) score += 5;
  if (candidate.preferredLocation) score += 5;
  if (candidate.expectedSalary && candidate.expectedSalary > 0) score += 5;

  // 3. Social Links (10%)
  if (candidate.githubUrl || candidate.linkedinUrl || candidate.portfolioUrl) score += 10;

  // 4. Education (15%)
  if (candidate.educations && candidate.educations.length > 0) score += 15;

  // 5. Experience (20%)
  if (candidate.experiences && candidate.experiences.length > 0) score += 20;

  // 6. Skills (15%)
  if (candidate.candidateSkills && candidate.candidateSkills.length >= 3) {
    score += 15;
  } else if (candidate.candidateSkills && candidate.candidateSkills.length > 0) {
    score += 8;
  }

  // 7. Resumes (10%)
  if (candidate.resumeFiles && candidate.resumeFiles.length > 0) score += 10;

  return Math.min(score, 100);
};

/**
 * Get Full Candidate Profile
 */
export const getCandidateProfile = async (userId) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  const completionPercentage = calculateProfileCompletion(candidate);

  return {
    candidate,
    completionPercentage,
  };
};

/**
 * Update Candidate Profile Basic Info
 */
export const updateProfile = async (userId, data) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  const updated = await candidateRepo.updateCandidateProfile(candidate.id, data);
  return updated;
};

// Education Services
export const addEducation = async (userId, data) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  return candidateRepo.createEducation(candidate.id, data);
};

export const editEducation = async (userId, educationId, data) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  await candidateRepo.updateEducation(educationId, candidate.id, data);
  return { message: 'Education updated successfully' };
};

export const removeEducation = async (userId, educationId) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  await candidateRepo.deleteEducation(educationId, candidate.id);
  return { message: 'Education deleted successfully' };
};

// Experience Services
export const addExperience = async (userId, data) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  return candidateRepo.createExperience(candidate.id, data);
};

export const editExperience = async (userId, experienceId, data) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  await candidateRepo.updateExperience(experienceId, candidate.id, data);
  return { message: 'Experience updated successfully' };
};

export const removeExperience = async (userId, experienceId) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  await candidateRepo.deleteExperience(experienceId, candidate.id);
  return { message: 'Experience deleted successfully' };
};

// Project Services
export const addProject = async (userId, data) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  return candidateRepo.createProject(candidate.id, data);
};

export const editProject = async (userId, projectId, data) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  await candidateRepo.updateProject(projectId, candidate.id, data);
  return { message: 'Project updated successfully' };
};

export const removeProject = async (userId, projectId) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  await candidateRepo.deleteProject(projectId, candidate.id);
  return { message: 'Project deleted successfully' };
};

// Skill Services
export const addSkill = async (userId, data) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  return candidateRepo.addCandidateSkill(
    candidate.id,
    data.skillName,
    data.category,
    data.yearsOfExperience,
    data.proficiencyLevel
  );
};

export const removeSkill = async (userId, candidateSkillId) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  await candidateRepo.deleteCandidateSkill(candidateSkillId, candidate.id);
  return { message: 'Skill deleted successfully' };
};

// Certificate Services
export const addCertificate = async (userId, data) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  return candidateRepo.createCertificate(candidate.id, data);
};

export const removeCertificate = async (userId, certificateId) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  await candidateRepo.deleteCertificate(certificateId, candidate.id);
  return { message: 'Certificate deleted successfully' };
};

// Resume Services
export const uploadResumeFile = async (userId, file) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  const fileUrl = `/uploads/${file.filename}`;

  // 1. Extract and clean raw text from PDF or DOCX file
  let extractedText = '';
  try {
    extractedText = await extractResumeText(file.path, file.mimetype, file.originalname);
  } catch (err) {
    console.warn(`[Text Extraction Warning] ${err.message}`);
    extractedText = '';
  }

  // 2. Save ResumeFile record
  const resumeFile = await candidateRepo.createResumeFileRecord(
    candidate.id,
    file.originalname,
    fileUrl,
    file.mimetype,
    file.size
  );

  // 3. Save ResumeVersion record with parsedText
  const resumeVersion = await candidateRepo.createResumeVersionRecord(
    resumeFile.id,
    candidate.id,
    extractedText
  );

  return {
    resumeFile,
    resumeVersion,
    extractedText,
    charCount: extractedText.length,
    wordCount: extractedText ? extractedText.split(/\s+/).filter(Boolean).length : 0,
  };
};

export const removeResumeFile = async (userId, resumeId) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  await candidateRepo.deleteResumeFileRecord(resumeId, candidate.id);
  return { message: 'Resume deleted successfully' };
};

export const parseResumeWithAI = async (userId, resumeFileId) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  const resumeVersion = await candidateRepo.findLatestResumeVersion(resumeFileId, candidate.id);

  if (!resumeVersion) {
    const error = new Error('Resume file or version record not found');
    error.statusCode = 404;
    throw error;
  }

  // Parse structured JSON using Gemini API with retry and fallback
  const structuredData = await parseResumeTextWithAI(resumeVersion.parsedText);

  // Store JSON in ResumeVersion.parsedData
  await candidateRepo.updateResumeVersionParsedData(resumeVersion.id, structuredData);

  // Auto-fill candidate summary & headline if missing
  if (structuredData.summary && (!candidate.summary || candidate.summary.trim() === '')) {
    await candidateRepo.updateCandidateProfile(candidate.id, { summary: structuredData.summary });
  }

  return {
    resumeFileId,
    resumeVersionId: resumeVersion.id,
    parsedData: structuredData,
  };
};

export const scoreResume = async (userId, resumeFileId) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  const resumeVersion = await candidateRepo.findLatestResumeVersion(resumeFileId, candidate.id);

  if (!resumeVersion) {
    const error = new Error('Resume file or version record not found');
    error.statusCode = 404;
    throw error;
  }

  const scoringResult = calculateAtsScore(resumeVersion.parsedText, resumeVersion.parsedData || {});

  return {
    resumeFileId,
    resumeVersionId: resumeVersion.id,
    ...scoringResult,
  };
};

export const compareResumes = async (userId, resumeIdA, resumeIdB) => {
  const candidate = await candidateRepo.findCandidateByUserId(userId);
  const versionA = await candidateRepo.findLatestResumeVersion(resumeIdA, candidate.id);
  const versionB = await candidateRepo.findLatestResumeVersion(resumeIdB, candidate.id);

  if (!versionA || !versionB) {
    throw new Error('Both resume versions must exist to run comparative analysis.');
  }

  const scoreA = calculateAtsScore(versionA.parsedText || '', versionA.parsedData || {});
  const scoreB = calculateAtsScore(versionB.parsedText || '', versionB.parsedData || {});

  const skillsA = (versionA.parsedData?.skills || []).map((s) => (typeof s === 'string' ? s : s.name || ''));
  const skillsB = (versionB.parsedData?.skills || []).map((s) => (typeof s === 'string' ? s : s.name || ''));

  const addedSkills = skillsB.filter((s) => s && !skillsA.includes(s));
  const removedSkills = skillsA.filter((s) => s && !skillsB.includes(s));

  const improvements = [];
  const atsDiff = scoreB.overallScore - scoreA.overallScore;

  if (atsDiff > 0) {
    improvements.push(`Resume B increases overall ATS Score by +${atsDiff} points (${scoreA.overallScore}% → ${scoreB.overallScore}%).`);
  } else if (atsDiff < 0) {
    improvements.push(`Resume A achieves a higher overall ATS Score (+${Math.abs(atsDiff)} points).`);
  } else {
    improvements.push('Both resumes achieve an identical overall ATS score benchmark.');
  }

  if (addedSkills.length > 0) {
    improvements.push(`Resume B adds ${addedSkills.length} new technical skills: ${addedSkills.slice(0, 5).join(', ')}.`);
  }

  if (scoreB.sections.keywords > scoreA.sections.keywords) {
    improvements.push(`Resume B improves Keyword Optimization score by +${scoreB.sections.keywords - scoreA.sections.keywords}%.`);
  }

  if (scoreB.sections.formatting > scoreA.sections.formatting) {
    improvements.push(`Resume B improves ATS Formatting & Parser Compatibility by +${scoreB.sections.formatting - scoreA.sections.formatting}%.`);
  }

  return {
    resumeA: {
      id: resumeIdA,
      title: 'Resume Version A',
      atsScore: scoreA.overallScore,
      sections: scoreA.sections,
      skillsCount: skillsA.length,
      skills: skillsA,
      wordCount: (versionA.parsedText || '').split(/\s+/).length,
    },
    resumeB: {
      id: resumeIdB,
      title: 'Resume Version B',
      atsScore: scoreB.overallScore,
      sections: scoreB.sections,
      skillsCount: skillsB.length,
      skills: skillsB,
      wordCount: (versionB.parsedText || '').split(/\s+/).length,
    },
    deltas: {
      atsScoreDiff: atsDiff,
      winningResume: atsDiff >= 0 ? 'Resume B' : 'Resume A',
      addedSkills,
      removedSkills,
    },
    improvements,
  };
};
