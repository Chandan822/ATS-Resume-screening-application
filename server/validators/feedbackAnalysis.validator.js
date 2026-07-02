import { z } from 'zod';

export const feedbackAnalysisSchema = z.object({
  summary: z.string().trim().default('Candidate demonstrated solid problem solving and domain knowledge.'),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  communicationScore: z.number().min(0).max(100).default(80),
  technicalScore: z.number().min(0).max(100).default(85),
  cultureFitScore: z.number().min(0).max(100).default(80),
  recommendation: z
    .enum(['STRONG_HIRE', 'HIRE', 'NEUTRAL', 'NO_HIRE', 'STRONG_NO_HIRE'])
    .default('HIRE'),
  confidenceScore: z.number().min(0).max(100).default(88),
});
