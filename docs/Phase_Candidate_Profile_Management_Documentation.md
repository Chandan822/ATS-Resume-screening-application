# AI Applicant Tracking System (AI ATS) - Candidate Profile Management Documentation

## Executive Summary
**Phase Objective**: Implement comprehensive candidate profile management featuring full CRUD REST APIs, database persistence via Prisma ORM & Neon PostgreSQL, Zod validation, profile completion scoring algorithm (0-100%), Multer resume uploads, and a light-themed tabbed user interface.

---

## 1. API Endpoint Specifications

All endpoints under `/api/candidate` require JWT Authentication (`Authorization: Bearer <token>`) and Candidate/Admin role authorization.

| Method | Endpoint | Description | Payload / Parameters |
|---|---|---|---|
| `GET` | `/api/candidate/profile` | Fetch candidate profile with all sub-sections & completion score | None |
| `PUT` | `/api/candidate/profile` | Update candidate basic info & summary | `headline`, `summary`, `currentLocation`, `preferredLocation`, `expectedSalary`, `noticePeriod`, `githubUrl`, `linkedinUrl`, `portfolioUrl`, `languages` |
| `POST` | `/api/candidate/education` | Add education entry | `institution`, `degree`, `fieldOfStudy`, `startDate`, `endDate`, `isCurrent`, `grade` |
| `PUT` | `/api/candidate/education/:id` | Update education entry | Education payload |
| `DELETE` | `/api/candidate/education/:id` | Delete education entry | `:id` parameter |
| `POST` | `/api/candidate/experience` | Add work experience | `companyName`, `jobTitle`, `location`, `startDate`, `endDate`, `isCurrentJob`, `description` |
| `PUT` | `/api/candidate/experience/:id` | Update work experience | Experience payload |
| `DELETE` | `/api/candidate/experience/:id` | Delete work experience | `:id` parameter |
| `POST` | `/api/candidate/projects` | Add portfolio project | `title`, `description`, `projectUrl`, `githubUrl`, `startDate`, `endDate` |
| `PUT` | `/api/candidate/projects/:id` | Update project | Project payload |
| `DELETE` | `/api/candidate/projects/:id` | Delete project | `:id` parameter |
| `POST` | `/api/candidate/skills` | Add skill to candidate taxonomy | `skillName`, `category`, `yearsOfExperience`, `proficiencyLevel` |
| `DELETE` | `/api/candidate/skills/:id` | Remove skill entry | `:id` parameter |
| `POST` | `/api/candidate/certificates` | Add certification | `name`, `issuingOrganization`, `issueDate`, `credentialId`, `credentialUrl` |
| `DELETE` | `/api/candidate/certificates/:id` | Delete certificate | `:id` parameter |
| `POST` | `/api/candidate/resumes` | Upload resume file via Multer | `multipart/form-data` with `resume` file (.pdf, .doc, .docx) |
| `DELETE` | `/api/candidate/resumes/:id` | Delete resume file | `:id` parameter |

---

## 2. Profile Completion Calculator Algorithm

The overall candidate profile completion percentage (0-100%) is calculated as follows:

| Section | Condition | Weight |
|---|---|---|
| **Headline & Summary** | Non-empty headline (5%) + summary (10%) | **15%** |
| **Location & Salary** | Current location (5%) + Preferred location (5%) + Expected Salary (5%) | **15%** |
| **Social Links** | At least 1 valid social link (GitHub / LinkedIn / Portfolio) | **10%** |
| **Education** | At least 1 education record added | **15%** |
| **Work Experience** | At least 1 experience record added | **20%** |
| **Skills Taxonomy** | At least 3 candidate skills added (15%) or 1-2 skills (8%) | **15%** |
| **Resume Upload** | At least 1 primary resume file uploaded | **10%** |
| **Total Maximum** | All sections completed | **100%** |

---

## 3. Frontend Architecture

### Component: `client/src/pages/candidate/CandidateProfile.jsx`
- **Header Summary Card**: Avatar, full name, headline, location, and animated **Profile Completion Progress Bar**.
- **Tabs**:
  1. `Overview & Info`: Personal details, summary, salary, notice period, GitHub, LinkedIn, Portfolio.
  2. `Education`: Timeline list with Add Education modal and delete controls.
  3. `Experience`: Work history timeline with Add Experience modal and delete controls.
  4. `Projects`: Showcase cards with live demo & repository links.
  5. `Skills`: Interactive taxonomy tag chips showing proficiency level and years of experience.
  6. `Certificates & Languages`: Certification cards and credential links.
  7. `Resumes`: Drag & Drop file dropzone with Multer upload handler and Primary file indicators.
