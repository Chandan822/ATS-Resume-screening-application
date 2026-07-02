# AI Applicant Tracking System (AI ATS) - GitHub & LinkedIn Integration Documentation

## Executive Summary
**Phase Objective**: Implement the GitHub & LinkedIn Integration Engine. Candidates can grant explicit consent permission to fetch public GitHub repositories, programming languages breakdown, pinned repos, total star count, contribution stats, and README summaries, alongside LinkedIn profile headline, work experience history, educations, and skills taxonomy, presenting a side-by-side sync preview with 1-click merging into candidate profile database records.

---

## 1. Data Extracted & Profile Mapping

| Source | Extracted Attribute | Profile Field Mapping |
|---|---|---|
| **GitHub** | Public Repositories list | Added to Candidate Portfolio / Projects |
| **GitHub** | Top Programming Languages | Merged into Candidate Technical Skills |
| **GitHub** | Pinned Repositories | Highlighted in Portfolio |
| **GitHub** | Total Star & Fork Stats | Extracted into Project Analytics |
| **GitHub** | README Summaries | Summarized in Project descriptions |
| **LinkedIn** | Public Headline | Updated in `Candidate.headline` |
| **LinkedIn** | Work Experience History | Merged into `CandidateExperience` records |
| **LinkedIn** | Education Credentials | Merged into `CandidateEducation` records |
| **LinkedIn** | Endorsed Skills Taxonomy | Merged into `CandidateSkill` records |

---

## 2. Explicit Permission Consent Requirement

Before executing any external social API query, the candidate must check explicit permission consent:
`grantPermission: true`

If `grantPermission` is omitted or `false`, the API returns HTTP 403 Forbidden:
`"Explicit user permission consent is required to fetch GitHub/LinkedIn data."`

---

## 3. API Endpoint Specifications

All endpoints require JWT Authentication (`Authorization: Bearer <token>`) and Candidate role authorization.

### Endpoints
1. `POST /api/candidate/integrations/github`: Fetches GitHub repos, languages, stars, contributions, and README summaries (`{ username, grantPermission: true }`).
2. `POST /api/candidate/integrations/linkedin`: Fetches LinkedIn headline, experiences, educations, and skills (`{ linkedinUrl, grantPermission: true }`).
3. `POST /api/candidate/integrations/sync-merge`: Merges selected social data into candidate profile database records.

---

## 4. Frontend Component ([SocialIntegrationModal.jsx](file:///d:/Chandan/projects/ATS-Resume%20screening%20application/client/src/components/SocialIntegrationModal.jsx))
- **Explicit Consent Checkbox**: Enforces user authorization before API calls.
- **GitHub Preview Card**: Repos count, Total Stars, Top Languages, Contribution stats, and Pinned repos list with README summaries.
- **LinkedIn Preview Card**: Headline, Work Experience history, Educations, and Skills list.
- **1-Click Merge Button**: Merges extracted skills, projects, and headline into database records.
