# AI Applicant Tracking System (AI ATS) - Recruiter Dashboard Documentation

## Executive Summary
**Phase Objective**: Implement the full Recruiter Dashboard ecosystem providing 5 dedicated views (Dashboard Overview, Jobs Management, Applicants Pipeline, Recruitment Analytics, Company Profile), 4 high-level stat widgets (Open Jobs, Total Applications, Scheduled Interviews, Offers Extended), real-time activity audit log, and hiring pipeline stage controls.

---

## 1. Dashboard Sub-Pages & Features

| Page | URL | Key Features |
|---|---|---|
| **Dashboard Overview** | `/dashboard` or `/dashboard/recruiter` | 4 stat widgets, candidate hiring funnel progress bars, real-time activity feed, quick action links. |
| **Job Management** | `/dashboard/jobs` | Job requisitions grid, department filters, status badges (`OPEN`, `CLOSED`), **Create Job Opening** modal. |
| **Applicants Pipeline** | `/dashboard/candidates` | Applicant candidate table, email & position tracking, stage filter, interactive **Update Stage** dropdown (`APPLIED`, `SCREENING`, `INTERVIEW`, `OFFERED`, `HIRED`, `REJECTED`). |
| **Recruitment Analytics** | `/dashboard/analytics` | Time-to-hire velocity metric, offer acceptance rate (84.5%), total hires YTD, department capacity bars. |
| **Company Profile** | `/dashboard/companies` | Company details, HQ location, employee headcount, active hiring departments. |

---

## 2. API Endpoint Specification

All endpoints under `/api/recruiter` require JWT Authentication (`Authorization: Bearer <token>`) and Recruiter or Admin role authorization (`CANDIDATE` access is rejected with HTTP 403 Forbidden).

| Method | Endpoint | Description | Payload / Response |
|---|---|---|---|
| `GET` | `/api/recruiter/dashboard/stats` | High-level metrics for 4 widgets, funnel breakdown, & activity log | `{ widgets, stageBreakdown, recentActivity, company }` |
| `GET` | `/api/recruiter/jobs` | List all posted jobs with applicant counts | `Job[]` |
| `POST` | `/api/recruiter/jobs` | Create new job opening | `{ title, department, location, type, salaryMin, salaryMax }` |
| `GET` | `/api/recruiter/applications` | List applicant submissions across jobs | `Application[]` |
| `PUT` | `/api/recruiter/applications/:id/status` | Update candidate pipeline stage | `{ status: "SCREENING" | "INTERVIEW" | "OFFERED" | ... }` |

---

## 3. Core Metric Widget Calculations

1. **Open Jobs**: Count of `Job` records with `status: 'OPEN'`.
2. **Total Applications**: Total count of `Application` records submitted for the recruiter's company.
3. **Scheduled Interviews**: Total count of `InterviewRound` records.
4. **Offers Extended**: Count of `Application` records with `status: 'OFFERED'`.
