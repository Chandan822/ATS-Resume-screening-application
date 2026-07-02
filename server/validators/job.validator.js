import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().trim().min(1, 'Job title is required'),
  department: z.string().trim().default('Engineering'),
  description: z.string().trim().min(1, 'Description is required'),
  requirements: z.string().trim().optional(),
  benefits: z.string().trim().optional(),
  location: z.string().trim().min(1, 'Location is required'),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']).default('FULL_TIME'),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']).default('MID'),
  minSalary: z.number().min(0).optional(),
  maxSalary: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED']).default('DRAFT'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  skills: z.array(z.string()).optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const jobQuerySchema = z.object({
  query: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(['ALL', 'DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED']).optional(),
  jobType: z.enum(['ALL', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']).optional(),
  location: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  sortBy: z.enum(['createdAt', 'title', 'minSalary', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
