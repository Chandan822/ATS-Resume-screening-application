import { z } from 'zod';

export const biasCategoryEnum = z.enum([
  'GENDER_BIAS',
  'AGE_BIAS',
  'EXCLUSIONARY_LANGUAGE',
  'AGGRESSIVE_TONE',
  'ACCESSIBILITY_ISSUE',
]);

export const detectedBiasItemSchema = z.object({
  id: z.string(),
  phrase: z.string(),
  category: biasCategoryEnum,
  explanation: z.string(),
  suggestion: z.string(),
});

export const biasAnalysisOutputSchema = z.object({
  inclusivityScore: z.number().min(0).max(100),
  detectedBiases: z.array(detectedBiasItemSchema).default([]),
});
