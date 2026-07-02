import * as candidateRepo from '../repositories/candidate.repository.js';
import { extractResumeText } from '../utils/resumeExtractor.js';

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
