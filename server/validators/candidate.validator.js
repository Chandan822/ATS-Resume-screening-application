import { z } from 'zod';

export const updateProfileSchema = z.object({
  headline: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  currentLocation: z.string().trim().optional(),
  preferredLocation: z.string().trim().optional(),
  totalExperienceYears: z.number().min(0).optional(),
  expectedSalary: z.number().min(0).optional(),
  noticePeriod: z.string().trim().optional(),
  githubUrl: z.string().trim().url('Invalid URL format').or(z.literal('')).optional(),
  linkedinUrl: z.string().trim().url('Invalid URL format').or(z.literal('')).optional(),
  portfolioUrl: z.string().trim().url('Invalid URL format').or(z.literal('')).optional(),
  languages: z
    .array(
      z.object({
        language: z.string().min(1, 'Language name required'),
        proficiency: z.string().min(1, 'Proficiency level required'),
      })
    )
    .optional(),
});

export const educationSchema = z.object({
  institution: z.string().trim().min(1, 'Institution is required'),
  degree: z.string().trim().min(1, 'Degree is required'),
  fieldOfStudy: z.string().trim().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
  grade: z.string().trim().optional(),
});

export const experienceSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required'),
  jobTitle: z.string().trim().min(1, 'Job title is required'),
  location: z.string().trim().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
  isCurrentJob: z.boolean().default(false),
  description: z.string().trim().optional(),
});

export const projectSchema = z.object({
  title: z.string().trim().min(1, 'Project title is required'),
  description: z.string().trim().optional(),
  projectUrl: z.string().trim().url('Invalid URL').or(z.literal('')).optional(),
  githubUrl: z.string().trim().url('Invalid URL').or(z.literal('')).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const skillSchema = z.object({
  skillName: z.string().trim().min(1, 'Skill name is required'),
  category: z.string().trim().optional(),
  yearsOfExperience: z.number().min(0).default(1),
  proficiencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('INTERMEDIATE'),
});

export const certificateSchema = z.object({
  name: z.string().trim().min(1, 'Certificate name is required'),
  issuingOrganization: z.string().trim().min(1, 'Issuing organization is required'),
  issueDate: z.string().optional().nullable(),
  credentialId: z.string().trim().optional(),
  credentialUrl: z.string().trim().url('Invalid URL').or(z.literal('')).optional(),
});
