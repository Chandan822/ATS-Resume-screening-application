import { z } from 'zod';

export const singleQuestionSchema = z.object({
  id: z.string().default(() => `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`),
  question: z.string().trim().min(1, 'Question text is required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  expectedAnswer: z.string().trim().optional(),
});

export const interviewQuestionKitSchema = z.object({
  technical: z.array(singleQuestionSchema).default([]),
  behavioral: z.array(singleQuestionSchema).default([]),
  coding: z.array(singleQuestionSchema).default([]),
});
