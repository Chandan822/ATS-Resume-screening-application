# AI Applicant Tracking System (AI ATS) - AI Interview Question Generator Documentation

## Executive Summary
**Phase Objective**: Implement the AI Interview Question Generator using Google Gemini API (`gemini-1.5-flash`) to analyze Candidate Resumes, Job Requisitions, and Experience Levels, producing customized **Technical**, **Behavioral**, and **Coding** questions categorized by difficulty level (**Easy**, **Medium**, **Hard**). Includes an inline recruiter editor for customizing questions and persisting question kits into database `InterviewRound.questions` records.

---

## 1. Interview Question Kit Output Schema

```json
{
  "technical": [
    {
      "id": "t1",
      "question": "Can you explain your technical approach to building scalable backend services in Node.js?",
      "difficulty": "MEDIUM",
      "expectedAnswer": "Should cover API architecture, database indexing, caching strategies, and load management."
    }
  ],
  "behavioral": [
    {
      "id": "b1",
      "question": "Describe a time when you had to resolve a high-priority production outage under tight pressure.",
      "difficulty": "EASY",
      "expectedAnswer": "STAR method response highlighting root-cause analysis, team communication, and post-mortem actions."
    }
  ],
  "coding": [
    {
      "id": "c1",
      "question": "Design an LRU Cache with O(1) time complexity for get and put operations.",
      "difficulty": "HARD",
      "expectedAnswer": "Doubly linked list combined with Hash Map data structure."
    }
  ]
}
```

---

## 2. API Endpoint Specification

All endpoints require JWT Authentication (`Authorization: Bearer <token>`) and Recruiter/Admin authorization.

| Method | Endpoint | Description | Payload / Response |
|---|---|---|---|
| `POST` | `/api/recruiter/interviews/generate-questions` | Generate customized question kit from resume & job | `{ candidateName, jobTitle, resumeText, jobDescription }` |
| `POST` | `/api/recruiter/interviews/:roundId/questions` | Save edited question kit to `InterviewRound.questions` | `interviewQuestionKit` object |
| `GET` | `/api/recruiter/interviews/:roundId/questions` | Fetch saved question kit | `{ technical: [], behavioral: [], coding: [] }` |

---

## 3. Recruiter Interactive Question Editor (`client/src/components/InterviewQuestionGenerator.jsx`)
- **Category Tabs**: Technical, Behavioral, and Coding questions.
- **Difficulty Badges**: `EASY` (Green), `MEDIUM` (Amber), `HARD` (Rose).
- **Inline Editing**: Recruiter can edit question prompt text, change difficulty level dropdown, add new custom questions, or delete questions.
- **Database Save**: Saves customized question kit directly into PostgreSQL database.
