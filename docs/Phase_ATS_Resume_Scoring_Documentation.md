# AI Applicant Tracking System (AI ATS) - ATS Resume Scoring Engine Documentation

## Executive Summary
**Phase Objective**: Implement the ATS Resume Scoring Engine evaluating candidate resumes across **8 section criteria** (Formatting, Skills Density, Action Keywords, Experience Depth, Education Credentials, Grammar & Tone, Quantified Achievements, and Resume Length). Computes an overall score (0-100), section score breakdown, and targeted improvement suggestions, rendered via an animated SVG gauge meter dashboard.

---

## 1. 8-Category Section Scoring Formula

The Overall ATS Score (0-100) is calculated using weighted category scores:

| Category | Weight | Evaluation Criteria |
|---|---|---|
| **Formatting & Layout** | **10%** | Detects standard ATS headings (`Summary`, `Experience`, `Education`, `Skills`, `Projects`). |
| **Skills Density** | **15%** | Evaluates volume of hard/soft skills extracted against tech taxonomy. |
| **Action Keywords** | **15%** | Scans for high-impact verbs (`Spearheaded`, `Architected`, `Optimized`, `Scaled`). |
| **Work Experience Depth** | **15%** | Evaluates company count, job titles, and chronology. |
| **Education & Credentials** | **10%** | Verifies degree, major, and institutional credentials. |
| **Grammar & Tone** | **10%** | Penalizes first-person pronouns (`I`, `my`, `me`) in bullet points. |
| **Quantified Achievements** | **15%** | Scans for metrics (`%`, `$`, `35% growth`, `$500k ARR`). |
| **Resume Length** | **10%** | Rewards ideal length (400 - 800 words). Penalizes <200 or >1,200 words. |
| **Total** | **100%** | Weighted sum of all 8 section scores. |

---

## 2. API Endpoint Specification

- **Endpoint**: `POST /api/candidate/resumes/:id/score`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response Sample (HTTP 200 OK)**:
```json
{
  "success": true,
  "message": "ATS Resume score calculated successfully",
  "data": {
    "resumeFileId": "res_12345",
    "resumeVersionId": "ver_67890",
    "overallScore": 86,
    "scoreGrade": "EXCELLENT",
    "wordCount": 540,
    "sectionScores": {
      "formatting": 92,
      "skills": 85,
      "keywords": 90,
      "experience": 85,
      "education": 95,
      "grammar": 85,
      "achievements": 75,
      "length": 100
    },
    "suggestions": [
      "Achievements: Add measurable numbers and percentages (e.g., 'Increased performance by 35%')."
    ]
  }
}
```

---

## 3. Dashboard UI Components (`client/src/components/AtsScoreDashboard.jsx`)
- **Animated Circular SVG Gauge Meter**: Smooth stroke-dashoffset perimeter animation color-graded by score thresholds (Green >= 85, Indigo >= 70, Amber >= 55, Rose < 55).
- **8 Section Progress Bars**: Clean progress bars showing percentage scores and category weightings.
- **Recommendations Drawer**: Categorized actionable tips with alert icons.
