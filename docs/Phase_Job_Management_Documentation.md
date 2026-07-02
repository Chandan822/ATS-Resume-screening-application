# AI Applicant Tracking System (AI ATS) - Job Management Documentation

## Executive Summary
**Phase Objective**: Implement comprehensive Job Management for recruiters supporting **Create, Edit, Delete, Archive, Publish, Close, and Duplicate** actions. Includes Zod validation, server-side pagination, full-text searching, multi-criteria filtering, and sorting across 12 core job attributes.

---

## 1. Supported Job Requisition Attributes

| Field Name | Prisma Column | Data Type & Description |
|---|---|---|
| **Title** | `title` | String (Required, e.g. "Senior Full Stack Engineer") |
| **Department** | `department` | String (e.g. "Engineering", "Infrastructure", "Product Design") |
| **Description** | `description` | Text (Required, detailed job duties & mission) |
| **Requirements** | `requirements` | Text (Qualifications, years experience, degrees) |
| **Benefits** | `benefits` | Text (Health, 401k, PTO, remote stipends) |
| **Location** | `location` | String (e.g. "San Francisco, CA / Remote") |
| **Employment Type** | `jobType` | Enum (`FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`, `REMOTE`) |
| **Experience Level** | `experienceLevel` | Enum (`ENTRY`, `MID`, `SENIOR`, `LEAD`, `EXECUTIVE`) |
| **Salary Range** | `minSalary`, `maxSalary` | Float (Minimum and maximum annual compensation) |
| **Currency** | `currency` | String (Default "USD") |
| **Status** | `status` | Enum (`DRAFT`, `OPEN`, `CLOSED`, `ARCHIVED`) |
| **Priority** | `priority` | String (`HIGH`, `MEDIUM`, `LOW`) |

---

## 2. API Endpoint Specification

All endpoints under `/api/recruiter/jobs` require JWT Authentication (`Authorization: Bearer <token>`) and Recruiter or Admin role authorization.

| Method | Endpoint | Query / Body Parameters | Description |
|---|---|---|---|
| `GET` | `/api/recruiter/jobs` | `query`, `department`, `status`, `jobType`, `page`, `limit`, `sortBy` | Query jobs list with search, filters, sorting, and pagination. |
| `POST` | `/api/recruiter/jobs` | Job payload | Create new job requisition. |
| `GET` | `/api/recruiter/jobs/:id` | None | Fetch single job details. |
| `PUT` | `/api/recruiter/jobs/:id` | Updated job payload | Edit job details. |
| `PATCH` | `/api/recruiter/jobs/:id/status` | `{ status: "OPEN" | "CLOSED" | "ARCHIVED" }` | One-click status transition (Publish, Close, Archive). |
| `POST` | `/api/recruiter/jobs/:id/duplicate` | None | Instant job cloning with `(Copy)` suffix and `DRAFT` status. |
| `DELETE` | `/api/recruiter/jobs/:id` | None | Delete job requisition. |

---

## 3. Query Engine: Pagination, Search & Filtering Sample

### API Request
`GET /api/recruiter/jobs?query=Engineer&department=Engineering&status=OPEN&page=1&limit=10&sortBy=createdAt`

### Response Sample (HTTP 200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "job_98123",
      "title": "Senior Full Stack Engineer",
      "department": "Engineering",
      "location": "San Francisco, CA / Remote",
      "jobType": "FULL_TIME",
      "status": "OPEN",
      "priority": "HIGH",
      "minSalary": 130000,
      "maxSalary": 165000,
      "_count": { "applications": 42 },
      "createdAt": "2026-07-02T13:55:00.000Z"
    }
  ],
  "pagination": {
    "totalCount": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```
