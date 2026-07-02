# AI Applicant Tracking System (AI ATS) - Multi-Resume Upload & Side-by-Side Comparison Documentation

## Executive Summary
**Phase Objective**: Implement Multiple Resume Storage & Side-by-Side Comparative Analysis Engine. Allows candidates to upload multiple resume versions (PDF / DOCX), set a primary version, and compare any 2 resumes side-by-side across **ATS Score**, **Keywords**, **Skills**, **Formatting**, **Grammar**, and **Semantic Match**, with visual comparative charts and automated improvement callouts.

---

## 1. Comparative Dimensions Evaluated

| Dimension | Metrics & Calculation |
|---|---|
| **Overall ATS Score** | Composite ATS Parser score benchmark (0 - 100%) and delta ($\Delta$). |
| **Keywords Optimization** | Search term density and role terminology alignment score. |
| **Skills & Tech Stack** | Unique technical skills count, newly added skills, and removed skills list. |
| **ATS Formatting & Parser** | Heading structure, bullet layout, and font compatibility rating. |
| **Grammar & Tone** | Readability score, spelling accuracy, and professional phrasing rating. |
| **Semantic Match** | Vector embedding role relevance rating. |

---

## 2. API Endpoint Specification

Endpoint requires JWT Authentication (`Authorization: Bearer <token>`) and Candidate role authorization.

### Request Contract
`GET /api/candidate/resumes/compare?resumeA=<resumeId1>&resumeB=<resumeId2>`

### Response Contract (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Comparative analysis generated successfully",
  "data": {
    "resumeA": {
      "id": "res_1",
      "title": "Fullstack_2026.pdf",
      "atsScore": 74,
      "sections": { "formatting": 80, "skills": 75, "keywords": 70, "grammar": 72, "experience": 78 },
      "skillsCount": 12
    },
    "resumeB": {
      "id": "res_2",
      "title": "Senior_FullStack_2026.docx",
      "atsScore": 88,
      "sections": { "formatting": 90, "skills": 92, "keywords": 86, "grammar": 88, "experience": 88 },
      "skillsCount": 18
    },
    "deltas": {
      "atsScoreDiff": 14,
      "winningResume": "Resume B",
      "addedSkills": ["TypeScript", "Next.js", "AWS", "GraphQL", "CI/CD", "Redis"]
    },
    "improvements": [
      "Resume B increases overall ATS Score by +14 points (74% → 88%).",
      "Resume B adds 6 high-value technical skills: TypeScript, Next.js, AWS, GraphQL, CI/CD, Redis.",
      "Resume B improves Keyword Optimization score by +16%."
    ]
  }
}
```

---

## 3. Frontend Component (`client/src/pages/candidate/ResumeComparisonView.jsx`)
- **Resume Selectors**: Dropdowns for picking Resume A vs Resume B.
- **Side-by-Side Parallel Column Layout**: Parallel metrics cards for baseline vs target versions.
- **Visual Progress Bars**: CSS comparative gauges for ATS Score, Keywords, Skills, Formatting, and Grammar.
- **Improvement Highlights Callout Banner**: Automated list highlighting score gains and added technical skills.
