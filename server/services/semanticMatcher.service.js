import prisma from '../config/db.js';
import {
  calculateCosineSimilarity,
  compareEntities,
  getOrCreateEmbedding,
} from './embedding.service.js';

export { calculateCosineSimilarity };

export const buildJobEmbeddingText = (job) => `
Job Title: ${job.title}
Department: ${job.department || ''}
Location: ${job.location || ''}
Job Type: ${job.jobType || ''}
Description: ${job.description || ''}
Requirements: ${job.requirements || ''}
Required Skills: ${(job.jobSkills || []).map((js) => js.skill.name).join(', ')}
`;

const buildResumeEmbeddingText = (resumeVersion) => resumeVersion.parsedText || '';

const jobEntity = (job) => ({
  type: 'job',
  id: job.id,
  text: buildJobEmbeddingText(job),
  updatedAt: job.updatedAt,
});

const resumeEntity = (resumeVersion, candidateId) => ({
  type: 'resume',
  id: resumeVersion.id,
  candidateId,
  text: buildResumeEmbeddingText(resumeVersion),
  updatedAt: resumeVersion.updatedAt,
});

/** Generate one requested provider embedding, reusing an exact text/version cache entry. */
export const storeJobEmbedding = async (jobId, provider) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { jobSkills: { include: { skill: true } } },
  });
  if (!job) throw new Error('Job requisition not found');
  return getOrCreateEmbedding(jobEntity(job), buildJobEmbeddingText(job), provider);
};

/** Generate one requested provider embedding, reusing an exact text/version cache entry. */
export const storeResumeEmbedding = async (resumeVersionId, candidateId, provider) => {
  const resumeVersion = await prisma.resumeVersion.findUnique({ where: { id: resumeVersionId } });
  if (!resumeVersion) throw new Error('Resume version not found');
  return getOrCreateEmbedding(
    resumeEntity(resumeVersion, candidateId),
    buildResumeEmbeddingText(resumeVersion),
    provider,
  );
};

const compareJobAndResume = async (job, resumeVersion, candidateId) => compareEntities(
  jobEntity(job),
  resumeEntity(resumeVersion, candidateId),
);

/** Match one candidate to one job using a compatible embedding pair. */
export const matchCandidateToJob = async (candidateId, jobId) => {
  const [candidate, job] = await Promise.all([
    prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
        candidateSkills: { include: { skill: true } },
        educations: true,
        experiences: true,
        resumeFiles: { include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } } },
      },
    }),
    prisma.job.findUnique({
      where: { id: jobId },
      include: { jobSkills: { include: { skill: true } } },
    }),
  ]);

  if (!candidate || !job) throw new Error('Candidate or Job not found');

  const resumeVersion = candidate.resumeFiles?.[0]?.versions?.[0] || null;
  let rawCosineSim = 0.5;
  if (resumeVersion) {
    const comparison = await compareJobAndResume(job, resumeVersion, candidateId);
    rawCosineSim = comparison.similarity;
  }

  const semanticScore = Math.round(rawCosineSim * 100);
  const requiredSkills = job.jobSkills.map((js) => js.skill.name.toLowerCase());
  const candidateSkills = candidate.candidateSkills.map((cs) => cs.skill.name.toLowerCase());
  const candidateText = resumeVersion?.parsedText || `${candidate.headline || ''} ${candidate.summary || ''}`;
  const targetSkills = requiredSkills.length > 0
    ? requiredSkills
    : ['javascript', 'react', 'node.js', 'sql', 'python', 'aws', 'docker', 'typescript'];
  const matchedSkills = targetSkills.filter((skill) => candidateSkills.includes(skill) || candidateText.toLowerCase().includes(skill));
  const missingSkills = targetSkills.filter((skill) => !matchedSkills.includes(skill));
  const skillMatchScore = targetSkills.length > 0 ? Math.round((matchedSkills.length / targetSkills.length) * 100) : 75;

  const requiredExpMin = job.experienceMinLevel || 2;
  const totalCandidateExp = candidate.totalExperienceYears || candidate.experiences?.length * 2 || 1;
  const experienceScore = totalCandidateExp >= requiredExpMin
    ? 100
    : Math.round((totalCandidateExp / requiredExpMin) * 100);
  const educationScore = candidate.educations?.length > 0 ? 95 : 75;
  const keywordScore = Math.min(semanticScore + 10, 100);
  const compositeScore = Math.round(
    semanticScore * 0.35 + skillMatchScore * 0.30 + experienceScore * 0.15 + educationScore * 0.10 + keywordScore * 0.10,
  );
  const matchGrade = compositeScore >= 85 ? 'HIGH_MATCH'
    : compositeScore >= 70 ? 'STRONG_MATCH'
      : compositeScore < 55 ? 'LOW_MATCH' : 'RECOMMENDED';

  return {
    candidateId: candidate.id,
    jobId: job.id,
    candidateName: `${candidate.user.firstName} ${candidate.user.lastName}`,
    candidateEmail: candidate.user.email,
    compositeScore: Math.min(Math.max(compositeScore, 0), 100),
    matchGrade,
    scores: { semanticScore, skillMatchScore, experienceScore, educationScore, keywordScore },
    matchedSkills: matchedSkills.map((skill) => skill.toUpperCase()),
    missingSkills: missingSkills.map((skill) => skill.toUpperCase()),
    totalExperienceYears: totalCandidateExp,
  };
};

export const rankCandidatesForJob = async (jobId) => {
  const applications = await prisma.application.findMany({ where: { jobId }, select: { candidateId: true } });
  let candidateIds = applications.map((application) => application.candidateId);
  if (candidateIds.length === 0) {
    const candidates = await prisma.candidate.findMany({ take: 10, select: { id: true } });
    candidateIds = candidates.map((candidate) => candidate.id);
  }
  const rankings = await Promise.all(candidateIds.map((candidateId) => matchCandidateToJob(candidateId, jobId)));
  rankings.sort((a, b) => b.compositeScore - a.compositeScore);
  return { jobId, totalCandidatesEvaluated: rankings.length, rankings };
};
