# AI Applicant Tracking System (AI ATS) - Gemini / OpenAI AI Resume Parsing Documentation

## Executive Summary
**Phase Objective**: Integrate Google Gemini (`gemini-1.5-flash`) / OpenAI for structured AI resume parsing. Converts raw extracted text from `ResumeVersion.parsedText` into validated JSON matching a strict Zod schema (Name, Email, Phone, Location, Summary, Skills, Experience, Education, Projects, Languages, Certifications), persists output to `ResumeVersion.parsedData` in Neon PostgreSQL, implements exponential backoff retries, and includes a fallback heuristic parser for malformed resumes.

---

## 1. AI Parsing Pipeline Workflow

```
Raw Extracted Resume Text (ResumeVersion.parsedText)
                       │
                       ▼
┌──────────────────────────────────────────────┐
│   Google Gemini API / OpenAI Prompt Engine   │  <-- Structured JSON Mode (temperature: 0.1)
└──────────────────────┬───────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │ Retry Mechanism (Max 3)   │  <-- Exponential delay (1s, 2s, 4s) on error
         └─────────────┬─────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│    Strict Zod Output Schema Validation       │  <-- Enforces typing & defaults
└──────────────────────┬───────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │  Fallback Heuristic Engine │  <-- Regex extraction if API key absent/fails
         └─────────────┬─────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│   Prisma Database Persistence                │  <-- Saves to ResumeVersion.parsedData
└──────────────────────────────────────────────┘
```

---

## 2. Structured JSON Schema Output Specification

```json
{
  "name": "Alex Rivers",
  "email": "alex.rivers@example.com",
  "phone": "+1 (555) 234-5678",
  "location": "San Francisco, CA",
  "summary": "Senior Full-Stack Engineer with 6+ years experience building cloud-native SaaS applications.",
  "skills": [
    "JavaScript", "TypeScript", "React", "Node.js", "Express", "PostgreSQL", "Docker", "AWS"
  ],
  "experience": [
    {
      "companyName": "TechCorp Global",
      "jobTitle": "Lead Full Stack Engineer",
      "startDate": "2021-03",
      "endDate": null,
      "isCurrentJob": true,
      "description": "Led engineering team scaling high-throughput microservices."
    }
  ],
  "education": [
    {
      "institution": "University of California, Berkeley",
      "degree": "B.S. Computer Science",
      "fieldOfStudy": "Computer Science",
      "startDate": "2015-08",
      "endDate": "2019-05"
    }
  ],
  "projects": [
    {
      "title": "AI ATS Screening Engine",
      "description": "Full stack ATS platform using Gemini API and PostgreSQL pgvector.",
      "projectUrl": "https://github.com/example/ai-ats"
    }
  ],
  "languages": ["English", "Spanish"],
  "certifications": ["AWS Certified Solutions Architect"]
}
```

---

## 3. API Endpoint Specification

- **Endpoint**: `POST /api/candidate/resumes/:id/parse-ai`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**:
```json
{
  "success": true,
  "message": "Resume parsed into structured JSON successfully",
  "data": {
    "resumeFileId": "res_12345",
    "resumeVersionId": "ver_67890",
    "parsedData": {
      "name": "Alex Rivers",
      "email": "alex.rivers@example.com",
      "phone": "+1 (555) 234-5678",
      "location": "San Francisco, CA",
      "summary": "Senior Full-Stack Engineer...",
      "skills": ["JavaScript", "React", "Node.js"]
    }
  }
}
```
