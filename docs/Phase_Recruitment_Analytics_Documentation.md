# AI Applicant Tracking System (AI ATS) - Recruitment Analytics & Export Documentation

## Executive Summary
**Phase Objective**: Implement the Recruitment Analytics Engine & Executive Dashboard. Features 8 core recruiting metrics (**Applications Volume**, **Hiring Funnel Conversion**, **Time to Hire**, **Offer Accept Rate**, **Source Effectiveness**, **Skill Demand**, **Monthly Hiring Volume**, and **Recruiter Productivity**), 4 visual chart types (**Bar Chart**, **Pie Chart**, **Line Chart**, **Activity Heatmap**), alongside **Export CSV** and **Export PDF** report capabilities.

---

## 1. 8 Core Metrics & Visualization Matrix

| Metric Dimension | Target Value | Chart Visualization Type | Description |
|---|---|---|---|
| **Total Applications** | `142` (+18% MoM) | Executive Stat Widget | Total application volume and traffic velocity. |
| **Time to Hire** | `18 Days` (-3 Days) | Executive Stat Widget | Average duration from application submission to offer acceptance. |
| **Offer Accept Rate** | `85.7%` | Executive Stat Widget | Percentage of extended job offers accepted by candidates. |
| **Recruiter Velocity** | `92 / 100` | Executive Stat Widget | Weekly evaluation throughput and stage transition speed. |
| **Skill Demand** | Top 6 Skills | **Bar Chart** | Frequency distribution of required technical skills across active requisitions. |
| **Source Effectiveness** | 4 Channels | **Pie / Donut Chart** | Candidate sourcing channel distribution (LinkedIn 45%, Direct 30%, GitHub 15%, Boards 10%). |
| **Monthly Hiring Volume** | 6 Months Trend | **Line Chart** | Application growth vs successful hires progression over time. |
| **Recruiter Productivity** | 5 Days x 6 Hours | **Activity Heatmap** | Heatmap matrix tracking hourly recruiter activity and candidate evaluations. |

---

## 2. API Endpoint Specification

Endpoint requires JWT Authentication (`Authorization: Bearer <token>`) and Recruiter/Admin authorization.

### Request Contract
`GET /api/recruiter/analytics/overview`

### Response Contract (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Recruitment analytics overview dataset fetched successfully",
  "data": {
    "overviewStats": {
      "totalApplications": 142,
      "openJobs": 12,
      "timeToHireDays": 18,
      "offerAcceptanceRate": 85.7,
      "recruiterProductivityScore": 92
    },
    "hiringFunnel": [
      { "stage": "Applied", "count": 142, "conversionRate": 100 },
      { "stage": "Screening", "count": 86, "conversionRate": 60.5 },
      { "stage": "Interview", "count": 42, "conversionRate": 29.5 },
      { "stage": "Offered", "count": 14, "conversionRate": 9.8 },
      { "stage": "Hired", "count": 12, "conversionRate": 8.4 }
    ],
    "sourceEffectiveness": [
      { "source": "LinkedIn Jobs", "count": 64, "percentage": 45, "hires": 6 },
      { "source": "Direct Website", "count": 42, "percentage": 30, "hires": 4 },
      { "source": "GitHub Sourced", "count": 22, "percentage": 15, "hires": 2 },
      { "source": "Referrals & Boards", "count": 14, "percentage": 10, "hires": 0 }
    ]
  }
}
```

---

## 3. Export Capabilities ([exportUtils.js](file:///d:/Chandan/projects/ATS-Resume%20screening%20application/client/src/utils/exportUtils.js))
1. **Export CSV**: Triggers instant `.csv` file download containing raw metric tables.
2. **Export PDF**: Generates a formatted, printable executive PDF report with tables and metric breakdowns.
