# AI Applicant Tracking System (AI ATS) - Application Workflow Documentation

## Executive Summary
**Phase Objective**: Implement the complete Application Workflow & Pipeline for Candidates and Recruiters. Candidates can browse open positions, search/filter jobs, view detailed specifications, submit 1-click applications attaching their primary resume, withdraw applications, save/bookmark jobs, and track live application stage progress. Recruiters can view applicant candidate submissions, shortlist, advance stages, extend offers, hire candidates, or reject submissions.

---

## 1. Candidate Application Workflow Architecture

```
┌──────────────────────────────────────────┐
│ Candidate Browse & Search Job Openings   │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│   Job Specification Modal Details View   │
└──────────┬────────────────────┬──────────┘
           │                    │
           ▼                    ▼
┌──────────────────────┐ ┌────────────────────────┐
│  1-Click Apply       │ │  Save / Bookmark Job   │
│  (Attaches Resume)   │ │  (SavedSearches Table) │
└──────────┬───────────┘ └────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Candidate Application Tracker Timeline   │
│ [APPLIED] -> [SCREENING] -> [INTERVIEW]  │
│          -> [OFFERED] -> [HIRED/REJECTED]│
└──────────────────────────────────────────┘
```

---

## 2. API Endpoint Specifications

### Candidate Endpoints (`/api/candidate`)

| Method | Endpoint | Description | Payload / Response |
|---|---|---|---|
| `POST` | `/api/candidate/applications` | Apply to a job (attaches primary resume version) | `{ jobId }` |
| `GET` | `/api/candidate/applications` | Get candidate's submitted applications with live status | `Application[]` |
| `DELETE` | `/api/candidate/applications/:id` | Withdraw candidate's application submission | `{ message: "Application withdrawn" }` |
| `POST` | `/api/candidate/saved-jobs/:jobId` | Save / Bookmark job for candidate | `{ message: "Job saved" }` |
| `DELETE` | `/api/candidate/saved-jobs/:jobId` | Remove bookmarked job | `{ message: "Job removed" }` |
| `GET` | `/api/candidate/saved-jobs` | Fetch candidate's saved jobs list | `Job[]` |

### Recruiter Pipeline Actions (`/api/recruiter`)

| Method | Endpoint | Description | Status Value |
|---|---|---|---|
| `PUT` | `/api/recruiter/applications/:id/status` | Advance candidate application stage | `APPLIED` \| `SCREENING` \| `INTERVIEW` \| `OFFERED` \| `HIRED` \| `REJECTED` |

---

## 3. Application Stage Status State Machine

```
               ┌──────────────┐
               │   APPLIED    │
               └──────┬───────┘
                      │
                      ▼
               ┌──────────────┐
               │  SCREENING   │
               └──────┬───────┘
                      │
                      ▼
               ┌──────────────┐
               │  INTERVIEW   │
               └──────┬───────┘
                      │
       ┌──────────────┴──────────────┐
       ▼                             ▼
┌──────────────┐              ┌──────────────┐
│   OFFERED    │              │   REJECTED   │
└──────┬───────┘              └──────────────┘
       │
       ▼
┌──────────────┐
│    HIRED     │
└──────────────┘
```
