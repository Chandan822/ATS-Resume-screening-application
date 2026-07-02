# AI Applicant Tracking System (AI ATS) - Database Design Documentation

## Executive Summary
**Phase Objective**: Implement the complete, fully normalized database schema for the AI Applicant Tracking System using Prisma ORM and PostgreSQL (Neon DB with `pgvector` vector embedding support).

---

## 1. Database Schema Overview

The database contains 23 normalized tables mapped across 6 functional domains. Every table includes:
- Primary key `id` (UUID format)
- Audit timestamps (`createdAt`, `updatedAt`)
- Foreign key constraints with explicit cascade rules (`onDelete: Cascade` / `SetNull`)
- Performance indexes on frequently searched columns and foreign keys

---

## 2. Table Directory & Entity Relationships

```
+-----------------------------------------------------------------------------------+
|                                 1. Identity & Auth                                |
|                              [User] <---> [UserRole]                              |
+------------------------------------------+----------------------------------------+
                                           |
                   +-----------------------+-----------------------+
                   | 1-to-1                                | 1-to-1
                   v                                       v
        +----------------------+                +----------------------+
        |     [Candidate]      |                |     [Recruiter]      |
        +----------+-----------+                +----------+-----------+
                   |                                       |
                   | 1-to-N                                | N-to-1
                   |                                       v
                   |                            +----------------------+
                   |                            |      [Company]       |
                   |                            +----------+-----------+
                   |                                       | 1-to-N
                   v                                       v
+--------------------------------------+        +----------------------+
|       Profile Details & Resumes      |        |        [Job]         |
| [Education]  [Experience]  [Project] |        +----------+-----------+
| [Certificate] [ResumeFile]           |                   |
|       └─> [ResumeVersion]            |                   |
+------------------+-------------------+                   |
                   |                                       |
                   +-------------------+   +---------------+
                                       |   |
                                       v   v
                            +----------------------+
                            |    [Application]     |
                            +----------+-----------+
                                       |
                                       v
                            +----------------------+
                            |  [InterviewRound]    |
                            | [InterviewFeedback]  |
                            +----------------------+
```

### Table Summary List

| # | Table Name | Description | Key Foreign Keys & Cascade Rules | Indexes |
|---|---|---|---|---|
| 1 | `users` | User credentials, roles, and status | None (Root Entity) | `email` (unique), `role` |
| 2 | `companies` | Corporate employer profiles | None | `slug` (unique), `name` |
| 3 | `recruiters` | Recruiter profile mapping | `userId` -> `users` (Cascade)<br>`companyId` -> `companies` (Cascade) | `userId` (unique), `companyId` |
| 4 | `candidates` | Candidate profile details | `userId` -> `users` (Cascade) | `userId` (unique), `currentLocation` |
| 5 | `educations` | Candidate academic records | `candidateId` -> `candidates` (Cascade) | `candidateId` |
| 6 | `experiences` | Candidate employment history | `candidateId` -> `candidates` (Cascade) | `candidateId` |
| 7 | `projects` | Candidate portfolio projects | `candidateId` -> `candidates` (Cascade) | `candidateId` |
| 8 | `certificates` | Professional certifications | `candidateId` -> `candidates` (Cascade) | `candidateId` |
| 9 | `resume_files` | Uploaded resume file records | `candidateId` -> `candidates` (Cascade) | `candidateId` |
| 10 | `resume_versions` | Parsed resume text & versioning | `resumeFileId` -> `resume_files` (Cascade)<br>`candidateId` -> `candidates` (Cascade) | `resumeFileId`, `candidateId` |
| 11 | `skills` | Master skill catalog | None | `name` (unique) |
| 12 | `candidate_skills` | Junction table for Candidate skills | `candidateId` -> `candidates` (Cascade)<br>`skillId` -> `skills` (Cascade) | Unique `(candidateId, skillId)`, `candidateId`, `skillId` |
| 13 | `job_skills` | Junction table for Job required skills | `jobId` -> `jobs` (Cascade)<br>`skillId` -> `skills` (Cascade) | Unique `(jobId, skillId)`, `jobId`, `skillId` |
| 14 | `jobs` | Job postings created by recruiters | `companyId` -> `companies` (Cascade)<br>`recruiterId` -> `recruiters` (SetNull) | `companyId`, `recruiterId`, `status`, `jobType` |
| 15 | `applications` | Candidate job applications | `jobId` -> `jobs` (Cascade)<br>`candidateId` -> `candidates` (Cascade)<br>`resumeVersionId` -> `resume_versions` (SetNull) | Unique `(jobId, candidateId)`, `status` |
| 16 | `interview_rounds` | Interview schedule rounds | `applicationId` -> `applications` (Cascade) | `applicationId`, `status` |
| 17 | `interview_feedback` | Evaluation feedback by interviewers | `interviewRoundId` -> `interview_rounds` (Cascade)<br>`interviewerId` -> `users` (Cascade) | `interviewRoundId`, `interviewerId` |
| 18 | `embeddings` | Vector store for AI semantic matching | `candidateId` -> `candidates` (Cascade)<br>`jobId` -> `jobs` (Cascade)<br>`resumeVersionId` -> `resume_versions` (Cascade) | `entityType`, `candidateId`, `jobId` |
| 19 | `notifications` | System notifications for users | `userId` -> `users` (Cascade) | `userId`, `isRead` |
| 20 | `audit_logs` | Security audit trail | `userId` -> `users` (SetNull) | `userId`, `entity`, `action` |
| 21 | `saved_searches` | Saved recruiter queries | `userId` -> `users` (Cascade) | `userId` |
| 22 | `analytics` | Performance metrics & dashboard data | `companyId` -> `companies` (Cascade) | `companyId`, `metricName`, `recordedAt` |
| 23 | `system_health` | Baseline system diagnostics | None | None |

---

## 3. Database Sync Verification

- **Command**: `npx prisma db push`
- **Datasource**: Neon PostgreSQL (`ep-gentle-truth-ao6dfsb0-pooler.c-2.ap-southeast-1.aws.neon.tech`)
- **Status**: Database synchronized successfully. Prisma Client generated cleanly (`v5.22.0`).
