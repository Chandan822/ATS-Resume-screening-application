import { z } from 'zod';

export const parsedExperienceSchema = z.object({
  companyName: z.string().default('Unknown Company'),
  jobTitle: z.string().default('Role'),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isCurrentJob: z.boolean().default(false),
  description: z.string().nullable().optional(),
});

export const parsedEducationSchema = z.object({
  institution: z.string().default('Unknown Institution'),
  degree: z.string().default('Degree'),
  fieldOfStudy: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export const parsedProjectSchema = z.object({
  title: z.string().default('Project'),
  description: z.string().nullable().optional(),
  projectUrl: z.string().nullable().optional(),
});

export const aiParsedResumeSchema = z.object({
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  skills: z.array(z.string()).default([]),
  experience: z.array(parsedExperienceSchema).default([]),
  education: z.array(parsedEducationSchema).default([]),
  projects: z.array(parsedProjectSchema).default([]),
  languages: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
});
