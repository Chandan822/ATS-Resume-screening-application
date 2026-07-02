# AI Applicant Tracking System (AI ATS) - Automated Talent Sourcing & Candidate Recommendation Documentation

## Executive Summary
**Phase Objective**: Implement the Automated Talent Pool Sourcing & Candidate Recommendation Engine. When a recruiter creates a new job (or clicks "Auto-Source" on any open job requisition), the engine automatically searches the candidate database, ranks candidate profiles across 6 dimensions, and generates human-readable **AI Recommendation Explanations** detailing why each candidate is a top match for the role.

---

## 1. 6-Dimension Ranking Weights

$$\text{Composite Match Score} = (S_{\text{semantic}} \times 0.30) + (S_{\text{experience}} \times 0.20) + (S_{\text{skills}} \times 0.20) + (S_{\text{education}} \times 0.10) + (S_{\text{availability}} \times 0.10) + (S_{\text{resume}} \times 0.10)$$

| Dimension | Weight | Evaluation Rationale |
|---|---|---|
| **Semantic Similarity** | **30%** | Vector cosine match between job description and candidate resume text. |
| **Experience Level** | **20%** | Years of work experience vs minimum job requirement. |
| **Skills Coverage** | **20%** | Overlap ratio of candidate skills vs required job skills. |
| **Education Credentials** | **10%** | Degree qualification match (Bachelor, Master, CS degree). |
| **Availability Status** | **10%** | Immediate availability vs 30-day notice period. |
| **ATS Resume Score** | **10%** | Resume parser quality and ATS score benchmark. |

---

## 2. API Endpoint Specification

Endpoint requires JWT Authentication (`Authorization: Bearer <token>`) and Recruiter/Admin authorization.

### Request Contract
`GET /api/recruiter/jobs/:id/recommendations`

### Response Contract (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Automated candidate recommendations generated from talent pool database successfully",
  "data": {
    "jobId": "j1_senior_engineer",
    "jobTitle": "Senior Full Stack Engineer",
    "totalCandidatesEvaluated": 2,
    "recommendations": [
      {
        "candidateId": "cand_1",
        "name": "Alex Rivers",
        "email": "alex.rivers@example.com",
        "headline": "Senior Full Stack Engineer",
        "matchScore": 92,
        "rankGrade": "TOP_MATCH",
        "totalExperienceYears": 6,
        "availabilityLabel": "Immediate / <15 days",
        "matchedSkills": ["REACT", "NODE.JS", "POSTGRESQL", "AWS", "TYPESCRIPT"],
        "explanations": [
          "High 91% vector semantic match with job role description and target responsibilities.",
          "Has 6 years of relevant work experience, fully satisfying your 5+ year requirement.",
          "Possesses 5 key required technical skills: REACT, NODE.JS, POSTGRESQL, AWS.",
          "Candidate is immediately available for onboarding."
        ]
      }
    ]
  }
}
```

---

## 3. Frontend Sourcing Component ([CandidateRecommendationModal.jsx](file:///d:/Chandan/projects/ATS-Resume%20screening%20application/client/src/components/CandidateRecommendationModal.jsx))
- **Automatic Trigger**: Automatically opens upon job creation or clicking "Auto-Source" on job requisitions.
- **Top Match Cards**: Match % meter, Candidate Name, Title, Experience years, and Availability status.
- **Why Recommended Panel**: Bulleted list of AI match rationale explanations.
- **Quick Action Button**: 1-Click "Shortlist Candidate" button.
