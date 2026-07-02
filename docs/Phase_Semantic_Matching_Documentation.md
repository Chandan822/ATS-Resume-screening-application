# AI Applicant Tracking System (AI ATS) - Semantic Matching & Vector Search Documentation

## Executive Summary
**Phase Objective**: Implement the Backend Semantic Matching Engine powered by Vector Embeddings (`pgvector` / Google Gemini `text-embedding-004` API) and Cosine Similarity calculations. Computes a multi-dimensional composite match score combining Vector Semantic Similarity, Skill Match Ratio, Experience Level Alignment, Education Credentials, and identifies Missing Skills, returning ranked applicant lists without requiring UI.

---

## 1. Composite Match Weighting Formula

$$\text{Composite Match Score} = (S_{\text{semantic}} \times 0.35) + (S_{\text{skills}} \times 0.30) + (S_{\text{experience}} \times 0.15) + (S_{\text{education}} \times 0.10) + (S_{\text{keywords}} \times 0.10)$$

| Dimension | Weight | Mathematical / Algorithmic Evaluation |
|---|---|---|
| **Semantic Similarity** | **35%** | Cosine similarity between Gemini `text-embedding-004` vectors of Job Description & Candidate Resume: $\text{Cosine Sim} = \frac{A \cdot B}{\|A\| \|B\|}$. |
| **Skill Match Ratio** | **30%** | Overlap ratio between Job required skills and Candidate skills taxonomy + resume text: $\frac{\text{Matched Skills}}{\text{Total Required Skills}}$. |
| **Experience Alignment** | **15%** | Ratio of candidate total work years vs job minimum experience level requirement. |
| **Education Match** | **10%** | Degree credential matching (Bachelor, Master, Computer Science). |
| **Keyword Density** | **10%** | High-density technical terms and domain terminology overlap. |
| **Missing Skills Identification** | N/A | Extracted list of job-required skills absent in Candidate profile. |

---

## 2. API Endpoint Specification (Backend Only)

All endpoints require JWT Authentication (`Authorization: Bearer <token>`) and Recruiter/Admin authorization.

### Endpoints
1. `POST /api/recruiter/jobs/:id/embeddings`: Generates & stores Gemini vector embedding for a Job Requisition.
2. `POST /api/recruiter/resumes/:id/embeddings`: Generates & stores Gemini vector embedding for a Candidate Resume.
3. `GET /api/recruiter/jobs/:id/matches`: Returns candidate rankings for a job sorted by `compositeScore` descending with breakdown & `missingSkills`.
4. `POST /api/recruiter/jobs/:id/match-candidate/:candidateId`: Calculates side-by-side match analysis for a single candidate.

---

## 3. Candidate Match Payload Sample

```json
{
  "success": true,
  "message": "Candidate rankings calculated using vector similarity & composite scoring",
  "data": {
    "jobId": "j1_senior_engineer",
    "totalCandidatesEvaluated": 3,
    "rankings": [
      {
        "candidateId": "cand_98123",
        "candidateName": "Alex Rivers",
        "candidateEmail": "alex.rivers@example.com",
        "compositeScore": 88,
        "matchGrade": "HIGH_MATCH",
        "scores": {
          "semanticScore": 89,
          "skillMatchScore": 90,
          "experienceScore": 100,
          "educationScore": 95,
          "keywordScore": 85
        },
        "matchedSkills": ["JAVASCRIPT", "REACT", "NODE.JS", "POSTGRESQL", "AWS", "DOCKER"],
        "missingSkills": ["KUBERNETES", "GRAPHQL"],
        "totalExperienceYears": 6
      }
    ]
  }
}
```
