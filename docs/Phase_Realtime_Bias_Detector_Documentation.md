# AI Applicant Tracking System (AI ATS) - Real-time Bias & Inclusivity Analyzer Documentation

## Executive Summary
**Phase Objective**: Implement the Real-time Job Description Bias Detector & Inclusivity Analyzer. Scans text in real time (<50ms dictionary rules + Gemini AI) across 5 core bias categories: Gender Bias, Age Bias, Exclusionary Language, Aggressive Tone, and Accessibility Issues. Highlights problematic phrases, provides explanations, and offers 1-click replacement buttons with inclusive alternatives.

---

## 1. 5 Bias Detection Categories & Patterns

| Category | Problematic Phrase Examples | Inclusive Alternative Suggestions |
|---|---|---|
| **Gender Bias** | `rockstar`, `ninja`, `dominant`, `guru`, `manpower` | `exceptional engineer`, `skilled developer`, `subject matter expert` |
| **Age Bias** | `digital native`, `recent graduate`, `youthful team` | `proficient with modern tools`, `early-career professional` |
| **Exclusionary Language** | `native English speaker`, `culture fit`, `clean driver record` | `fluent in business English`, `culture add`, `reliable office commute` |
| **Aggressive Tone** | `work hard play hard`, `relentless`, `crush it` | `balanced workplace`, `persistent`, `achieve team milestones` |
| **Accessibility Issues** | `must stand 8 hours`, `lift 50 lbs`, `perfect vision` | `perform core duties with accommodation` |

---

## 2. API Endpoint Specification

Endpoint requires JWT Authentication (`Authorization: Bearer <token>`) and Recruiter/Admin authorization.

### Request Contract
`POST /api/recruiter/jobs/analyze-bias`
```json
{
  "text": "We are looking for a rockstar digital native who can work hard play hard and is a native English speaker."
}
```

### Response Contract (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Job description analyzed for inclusive language & bias successfully",
  "data": {
    "inclusivityScore": 64,
    "detectedBiases": [
      {
        "id": "b1",
        "phrase": "rockstar",
        "category": "GENDER_BIAS",
        "explanation": "Masculine-coded term that alienates female applicants.",
        "suggestion": "exceptional engineer"
      },
      {
        "id": "b2",
        "phrase": "digital native",
        "category": "AGE_BIAS",
        "explanation": "Ageist term favoring younger candidates.",
        "suggestion": "proficient with digital tools"
      }
    ]
  }
}
```

---

## 3. Real-time Visual Editor Component (`client/src/components/InclusiveJobEditor.jsx`)
- **Real-time Inclusivity Meter**: `64% / 100` with color-coded grades (A+, B, C-).
- **Categorized Problematic Phrase Highlights**:
  - `GENDER_BIAS` (Purple)
  - `AGE_BIAS` (Amber)
  - `EXCLUSIONARY_LANGUAGE` (Rose)
  - `AGGRESSIVE_TONE` (Orange)
  - `ACCESSIBILITY_ISSUE` (Cyan)
- **1-Click Suggestion Replacement**: One-click button that instantly replaces problematic phrases in the text editor.
