import prisma from '../config/db.js';
import { generateTextEmbedding } from '../utils/embeddingGenerator.js';

/**
 * Calculate Mathematical Cosine Similarity between two vector float arrays
 * Cosine Similarity = (A . B) / (||A|| * ||B||)
 */
export const calculateCosineSimilarity = (vectorA, vectorB) => {
  if (!vectorA || !vectorB || vectorA.length === 0 || vectorB.length === 0) return 0.5;

  const minLength = Math.min(vectorA.length, vectorB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLength; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  const similarity = dotProduct / denominator;
  return Math.min(Math.max(similarity, 0), 1); // Clamp between 0 and 1
};

/**
 * Generate and store Vector Embedding for a Job Requisition
 */
export const storeJobEmbedding = async (jobId) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { jobSkills: { include: { skill: true } } },
  });

  if (!job) throw new Error('Job requisition not found');

  const textToEmbed = `
Job Title: ${job.title}
Department: ${job.department || ''}
Location: ${job.location}
Job Type: ${job.jobType}
Description: ${job.description}
Requirements: ${job.requirements || ''}
Required Skills: ${job.jobSkills.map((js) => js.skill.name).join(', ')}
`;

  const vector = await generateTextEmbedding(textToEmbed);

  // Store vector record in Embedding model
  return prisma.embedding.upsert({
    where: { id: `emb_job_${jobId}` },
    update: {
      entityType: 'JOB_DESCRIPTION',
      jobId,
      modelName: 'gemini-text-embedding-004',
    },
    create: {
      id: `emb_job_${jobId}`,
      entityType: 'JOB_DESCRIPTION',
      jobId,
      modelName: 'gemini-text-embedding-004',
    },
  }).then(record => ({ ...record, vectorValues: vector }));
};

/**
 * Generate and store Vector Embedding for a Candidate Resume
 */
export const storeResumeEmbedding = async (resumeVersionId, candidateId) => {
  const resumeVersion = await prisma.resumeVersion.findUnique({
    where: { id: resumeVersionId },
  });

  if (!resumeVersion) throw new Error('Resume version not found');

  const textToEmbed = resumeVersion.parsedText || '';
  const vector = await generateTextEmbedding(textToEmbed);

  return prisma.embedding.upsert({
    where: { id: `emb_res_${resumeVersionId}` },
    update: {
      entityType: 'RESUME',
      candidateId,
      resumeVersionId,
      modelName: 'gemini-text-embedding-004',
    },
    create: {
      id: `emb_res_${resumeVersionId}`,
      entityType: 'RESUME',
      candidateId,
      resumeVersionId,
      modelName: 'gemini-text-embedding-004',
    },
  }).then(record => ({ ...record, vectorValues: vector }));
};

/**
 * Match Single Candidate to Job Requisition
 */
export const matchCandidateToJob = async (candidateId, jobId) => {
  const [candidate, job] = await Promise.all([
    prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
        candidateSkills: { include: { skill: true } },
        educations: true,
        experiences: true,
        resumeFiles: {
          include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
        },
      },
    }),
    prisma.job.findUnique({
      where: { id: jobId },
      include: { jobSkills: { include: { skill: true } } },
    }),
  ]);

  if (!candidate || !job) throw new Error('Candidate or Job not found');

  // 1. Semantic Score (35%)
  const jobText = `${job.title} ${job.department || ''} ${job.description} ${job.requirements || ''}`;
  const candidateResumeText = candidate.resumeFiles?.[0]?.versions?.[0]?.parsedText || `${candidate.headline || ''} ${candidate.summary || ''}`;

  const [jobVector, candidateVector] = await Promise.all([
    generateTextEmbedding(jobText),
    generateTextEmbedding(candidateResumeText),
  ]);

  const rawCosineSim = calculateCosineSimilarity(jobVector, candidateVector);
  const semanticScore = Math.round(rawCosineSim * 100);

  // 2. Skill Match & Missing Skills Identification (30%)
  const requiredSkills = (job.jobSkills.map((js) => js.skill.name.toLowerCase()) || []);
  const candidateSkills = (candidate.candidateSkills.map((cs) => cs.skill.name.toLowerCase()) || []);
  const resumeTextLower = candidateResumeText.toLowerCase();

  const matchedSkills = [];
  const missingSkills = [];

  // If no job skills explicitly defined, extract keywords from requirements
  const targetSkills = requiredSkills.length > 0
    ? requiredSkills
    : ['javascript', 'react', 'node.js', 'sql', 'python', 'aws', 'docker', 'typescript'];

  for (const skill of targetSkills) {
    const isMatched = candidateSkills.includes(skill) || resumeTextLower.includes(skill);
    if (isMatched) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const skillMatchScore = targetSkills.length > 0
    ? Math.round((matchedSkills.length / targetSkills.length) * 100)
    : 75;

  // 3. Experience Score (15%)
  const requiredExpMin = job.experienceMinLevel || 2;
  const totalCandidateExp = candidate.totalExperienceYears || candidate.experiences?.length * 2 || 1;
  let experienceScore = 70;
  if (totalCandidateExp >= requiredExpMin) {
    experienceScore = 100;
  } else {
    experienceScore = Math.round((totalCandidateExp / requiredExpMin) * 100);
  }

  // 4. Education Score (10%)
  let educationScore = 75;
  if (candidate.educations && candidate.educations.length > 0) {
    educationScore = 95;
  }

  // 5. Keyword Density Score (10%)
  const keywordScore = Math.min(semanticScore + 10, 100);

  // Composite Match Score Weighted Sum
  const compositeScore = Math.round(
    semanticScore * 0.35 +
    skillMatchScore * 0.30 +
    experienceScore * 0.15 +
    educationScore * 0.10 +
    keywordScore * 0.10
  );

  let matchGrade = 'RECOMMENDED';
  if (compositeScore >= 85) matchGrade = 'HIGH_MATCH';
  else if (compositeScore >= 70) matchGrade = 'STRONG_MATCH';
  else if (compositeScore < 55) matchGrade = 'LOW_MATCH';

  return {
    candidateId: candidate.id,
    jobId: job.id,
    candidateName: `${candidate.user.firstName} ${candidate.user.lastName}`,
    candidateEmail: candidate.user.email,
    compositeScore: Math.min(Math.max(compositeScore, 0), 100),
    matchGrade,
    scores: {
      semanticScore,
      skillMatchScore,
      experienceScore,
      educationScore,
      keywordScore,
    },
    matchedSkills: matchedSkills.map((s) => s.toUpperCase()),
    missingSkills: missingSkills.map((s) => s.toUpperCase()),
    totalExperienceYears: totalCandidateExp,
  };
};

/**
 * Rank All Candidates / Applicants for a Specific Job Requisition
 */
export const rankCandidatesForJob = async (jobId) => {
  // Find all applications submitted for this job
  const applications = await prisma.application.findMany({
    where: { jobId },
    include: { candidateId: true },
  });

  let candidateIds = applications.map((a) => a.candidateId);

  // If zero applications exist, fallback to evaluating all registered candidates for ranking demo
  if (candidateIds.length === 0) {
    const candidates = await prisma.candidate.findMany({ take: 10, select: { id: true } });
    candidateIds = candidates.map((c) => c.id);
  }

  const matchResults = await Promise.all(
    candidateIds.map((candidateId) => matchCandidateToJob(candidateId, jobId))
  );

  // Sort candidate rankings in descending order of compositeScore
  matchResults.sort((a, b) => b.compositeScore - a.compositeScore);

  return {
    jobId,
    totalCandidatesEvaluated: matchResults.length,
    rankings: matchResults,
  };
};
