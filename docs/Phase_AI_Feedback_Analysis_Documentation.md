# AI Applicant Tracking System (AI ATS) - AI Interviewer Notes & Feedback Analyzer Documentation

## Executive Summary
**Phase Objective**: Implement the AI Interviewer Notes & Feedback Analysis Engine using Google Gemini API (`gemini-1.5-flash`) to parse unformatted interviewer free-text notes into structured JSON evaluations. Extracts Summary, Strengths, Weaknesses, Communication Score (0-100%), Technical Skills Score (0-100%), Culture Fit Score (0-100%), Hiring Recommendation (`STRONG_HIRE`, `HIRE`, `NEUTRAL`, `NO_HIRE`, `STRONG_NO_HIRE`), and Recommendation Confidence Score (0-100%), persisting records in `InterviewFeedback.aiAnalysis` in Neon PostgreSQL and displaying them visually.

---

## 1. Structured JSON Output Schema

```json
{
  "summary": "Candidate demonstrated solid problem solving and domain knowledge.",
  "strengths": [
    "Articulate verbal communication and problem explanation",
    "Strong technical background matching role requirements",
    "Positive attitude and collaborative mindset"
  ],
  "weaknesses": [
    "Could provide deeper real-world metrics for past architecture decisions"
  ],
  "communicationScore": 90,
  "technicalScore": 92,
  "cultureFitScore": 85,
  "recommendation": "STRONG_HIRE",
  "confidenceScore": 94
}
```

---

## 2. API Endpoint Specification

All endpoints require JWT Authentication (`Authorization: Bearer <token>`) and Recruiter/Admin authorization.

| Method | Endpoint | Description | Payload / Response |
|---|---|---|---|
| `POST` | `/api/recruiter/interviews/analyze-notes` | Analyze raw free-text notes into structured JSON | `{ notes: "raw free text" }` |
| `POST` | `/api/recruiter/interviews/:roundId/feedback` | Save feedback record & AI analysis to DB | `{ roundId, rating, comments, rawNotes, aiAnalysis }` |
| `GET` | `/api/recruiter/interviews/:roundId/feedback` | Retrieve saved feedback records for an interview round | `InterviewFeedback[]` |

---

## 3. Visual Dashboard Display (`client/src/components/FeedbackAnalysisDashboard.jsx`)
- **Raw Notes Textarea**: Fast entry area for pasting interviewer bullet notes or transcripts.
- **Hiring Recommendation Banner**:
  - `STRONG_HIRE` (Emerald Badge)
  - `HIRE` (Indigo Badge)
  - `NEUTRAL` (Amber Badge)
  - `NO_HIRE` / `STRONG_NO_HIRE` (Rose Badge)
- **Confidence Score Meter**: Dynamic percentage indicator (`94% Confidence`).
- **3 Metric Scores**: Communication, Technical Proficiency, and Culture & Team Alignment.
- **Strengths & Weaknesses Cards**: Bulleted breakdown of key strengths and considerations.
