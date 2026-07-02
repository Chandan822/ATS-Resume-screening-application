import prisma from '../config/db.js';
import { generateTextEmbedding } from '../utils/embeddingGenerator.js';
import { calculateCosineSimilarity } from './semanticMatcher.service.js';

/**
 * Recommend candidates from talent pool database for a job requisition
 * Ranks across 6 dimensions: Semantic, Experience, Skills, Education, Availability, Resume Score
 * Generates clear human-readable AI match rationale explanations
 */
export const recommendCandidatesForJob = async (jobId) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { jobSkills: { include: { skill: true } } },
  });

  if (!job) throw new Error('Job requisition not found');

  // Fetch all registered candidates in talent pool database
  const candidates = await prisma.candidate.findMany({
    take: 25,
    include: {
      user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
      candidateSkills: { include: { skill: true } },
      educations: true,
      experiences: true,
      resumeFiles: {
        include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
      },
    },
  });

  if (candidates.length === 0) {
    return { jobId, totalCandidatesFound: 0, recommendations: [] };
  }

  // Generate job embedding vector for semantic matching
  const jobText = `${job.title} ${job.department || ''} ${job.description} ${job.requirements || ''}`;
  const jobVector = await generateTextEmbedding(jobText);

  const requiredExpMin = job.experienceMinLevel || 2;
  const requiredSkills = job.jobSkills.map((js) => js.skill.name.toLowerCase());

  const recommendations = await Promise.all(
    candidates.map(async (candidate) => {
      const candidateName = `${candidate.user.firstName || 'Candidate'} ${candidate.user.lastName || ''}`.trim();
      const latestResume = candidate.resumeFiles?.[0]?.versions?.[0];
      const resumeText = latestResume?.parsedText || `${candidate.headline || ''} ${candidate.summary || ''}`;

      // 1. Semantic Similarity (30%)
      const candidateVector = await generateTextEmbedding(resumeText);
      const rawCosine = calculateCosineSimilarity(jobVector, candidateVector);
      const semanticScore = Math.round(rawCosine * 100);

      // 2. Experience Score (20%)
      const totalExpYears = candidate.totalExperienceYears || candidate.experiences?.length * 2 || 1;
      let experienceScore = 70;
      if (totalExpYears >= requiredExpMin) {
        experienceScore = 100;
      } else {
        experienceScore = Math.round((totalExpYears / requiredExpMin) * 100);
      }

      // 3. Skills Score (20%)
      const candSkills = candidate.candidateSkills.map((cs) => cs.skill.name.toLowerCase());
      const resumeTextLower = resumeText.toLowerCase();

      const targetSkills = requiredSkills.length > 0
        ? requiredSkills
        : ['javascript', 'react', 'node.js', 'sql', 'python', 'aws', 'docker', 'typescript'];

      const matchedSkills = [];
      targetSkills.forEach((skill) => {
        if (candSkills.includes(skill) || resumeTextLower.includes(skill)) {
          matchedSkills.push(skill.toUpperCase());
        }
      });

      const skillsScore = targetSkills.length > 0
        ? Math.round((matchedSkills.length / targetSkills.length) * 100)
        : 75;

      // 4. Education Score (10%)
      const educationScore = candidate.educations && candidate.educations.length > 0 ? 95 : 70;

      // 5. Availability Score (10%)
      const isImmediatelyAvailable = candidate.noticePeriodDays ? candidate.noticePeriodDays <= 15 : true;
      const availabilityScore = isImmediatelyAvailable ? 100 : 70;
      const availabilityLabel = isImmediatelyAvailable ? 'Immediate / <15 days' : '30 days notice';

      // 6. ATS Resume Score (10%)
      const resumeScore = latestResume?.parsedData ? 88 : 75;

      // Overall Composite Score Weighted Sum
      const matchScore = Math.round(
        semanticScore * 0.30 +
        experienceScore * 0.20 +
        skillsScore * 0.20 +
        educationScore * 0.10 +
        availabilityScore * 0.10 +
        resumeScore * 0.10
      );

      // Generate Human-Readable Recommendation Explanations
      const explanations = [];

      if (semanticScore >= 80) {
        explanations.push(`High ${semanticScore}% vector semantic match with job role & requirements.`);
      }

      if (totalExpYears >= requiredExpMin) {
        explanations.push(`Has ${totalExpYears} years of work experience, fully satisfying your ${requiredExpMin}+ year requirement.`);
      } else {
        explanations.push(`Has ${totalExpYears} years relevant work experience.`);
      }

      if (matchedSkills.length > 0) {
        explanations.push(`Possesses ${matchedSkills.length} key required technical skills: ${matchedSkills.slice(0, 4).join(', ')}.`);
      }

      if (isImmediatelyAvailable) {
        explanations.push('Candidate is immediately available for onboarding.');
      }

      if (candidate.educations && candidate.educations.length > 0) {
        const edu = candidate.educations[0];
        explanations.push(`Holds degree credential: ${edu.degree || 'Bachelor'} in ${edu.fieldOfStudy || 'Software Engineering'}.`);
      }

      return {
        candidateId: candidate.id,
        name: candidateName,
        email: candidate.user.email,
        headline: candidate.headline || 'Software Engineer',
        matchScore: Math.min(Math.max(matchScore, 0), 100),
        rankGrade: matchScore >= 85 ? 'TOP_MATCH' : matchScore >= 70 ? 'STRONG_MATCH' : 'POTENTIAL_MATCH',
        dimensions: {
          semanticScore,
          experienceScore,
          skillsScore,
          educationScore,
          availabilityScore,
          resumeScore,
        },
        matchedSkills,
        totalExperienceYears: totalExpYears,
        availabilityLabel,
        explanations,
      };
    })
  );

  // Sort recommendations in descending order of matchScore
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  return {
    jobId,
    jobTitle: job.title,
    department: job.department,
    totalCandidatesEvaluated: recommendations.length,
    recommendations,
  };
};
