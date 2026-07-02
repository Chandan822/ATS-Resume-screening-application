# AI Applicant Tracking System (AI ATS) - Audit Logging & Security Log Viewer Documentation

## Executive Summary
**Phase Objective**: Implement the Centralized Security Audit Logging Engine & Searchable Audit Log Dashboard. Automatically records every important system action (**Login**, **Logout**, **Create Job**, **Delete Job**, **Application Status Update**, **Schedule Interview**, **Extend Offer**, **Reject Application**, **Profile Update**, and **Admin Actions**) into PostgreSQL database (`audit_logs` table), with a searchable log viewer featuring filters by **User**, **Date Range**, **Action**, and **Entity**.

---

## 1. Logged Actions Matrix

| Action Name | Trigger Workflow | Entity Type | Recorded Payload Details |
|---|---|---|---|
| **`USER_LOGIN`** | Successful candidate / recruiter login | `User` | User email, role, client IP address |
| **`USER_LOGOUT`** | Session sign-out | `User` | Session ID, logout timestamp |
| **`CREATE_JOB`** | Recruiter creates new job requisition | `Job` | Job title, department, employment type, location |
| **`DELETE_JOB`** | Recruiter deletes job opening | `Job` | Deleted job ID & title |
| **`UPDATE_APPLICATION_STATUS`** | Candidate moved through pipeline stages | `Application` | Candidate ID, previous stage, new stage |
| **`SCHEDULE_INTERVIEW`** | Interview round created / updated | `InterviewRound` | Candidate ID, interviewer, round type, scheduled time |
| **`EXTEND_OFFER`** | Job offer extended to candidate | `Application` | Offer salary, start date, expiration date |
| **`REJECT_APPLICATION`** | Candidate application rejected | `Application` | Rejection rationale notes |
| **`UPDATE_PROFILE`** | Candidate profile edited | `Candidate` | Updated fields, added skills |
| **`ADMIN_ACTION`** | Admin system configuration change | `System` | Changed config settings |

---

## 2. API Endpoint Specification

Endpoint requires JWT Authentication (`Authorization: Bearer <token>`) and Recruiter/Admin authorization.

### Request Contract
`GET /api/recruiter/audit-logs?search=Senior&action=CREATE_JOB&entity=Job&dateRange=7d&page=1&limit=10`

### Response Contract (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Audit logs fetched successfully",
  "data": [
    {
      "id": "log_101",
      "userId": "usr_recruiter_1",
      "action": "CREATE_JOB",
      "entity": "Job",
      "entityId": "job_senior_eng",
      "ipAddress": "192.168.1.45",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "createdAt": "2026-07-02T14:38:00.000Z",
      "user": {
        "firstName": "Sarah",
        "lastName": "Jenkins",
        "email": "sarah.recruiter@example.com",
        "role": "RECRUITER"
      },
      "changes": {
        "title": "Senior Full Stack Engineer",
        "department": "Engineering",
        "status": "OPEN"
      }
    }
  ],
  "pagination": {
    "totalCount": 1,
    "page": 1,
    "totalPages": 1
  }
}
```

---

## 3. Frontend Component ([AuditLogViewer.jsx](file:///d:/Chandan/projects/ATS-Resume%20screening%20application/client/src/components/AuditLogViewer.jsx))
- **Search Input Bar**: Instant search across action names, users, entities, and client IP addresses.
- **Multi-Criteria Filters**: Filter by User, Date Range (`24h`, `7d`, `30d`, `all`), Action Type, and Entity Type.
- **JSON Changes Drawer**: Interactive modal inspecting full state changes payload.
- **Server-side Pagination**: Page controls and records per page indicator.
