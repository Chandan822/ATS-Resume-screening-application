# AI Applicant Tracking System (AI ATS)

An enterprise-grade, production-style Applicant Tracking System (ATS) built with **React**, **Node.js**, **PostgreSQL** (with **pgvector**), and **Google Gemini AI**. The platform automates resume processing, semantic candidate ranking, job posting bias detection, and interview tracking.

---

## 🚀 Key Features

### 🔐 1. Role-Based Authentication & Security
* **JWT Access & Refresh Tokens**: Secure token-based session lifecycle with automatic silent refresh on the client.
* **Separated Role Validation**: Strict login portals for **Candidates** and **Recruiters/Admins**. Recruiter credentials cannot access candidate logins and vice-versa.
* **Route Protection**: Fully protected dashboard layouts with role-specific views.

### 📄 2. Resume Parsing & Text Extraction Pipeline
* **Multi-Format Parsing**: Extracts plain text from **PDF** files (via `pdf-parse`) and **DOCX** files (via `mammoth`).
* **AI Attribute Extraction**: Leverages Google Gemini AI to analyze raw resume text and return structured JSON containing Candidate Name, Email, Phone, Location, Summary, Experiences, Educations, and Technical Skills.

### 📊 3. Interactive ATS Resume Score & Recommendations
* **Scoring Dashboard**: Rates candidate resumes out of 100 based on keyword density, formatting checks, structural organization, and technical skill lists.
* **Improvement Suggestions**: Generates customized technical tips and resume improvements to help candidates optimize their scores.
* **Resume Version Comparison**: Enables candidates to upload multiple resume versions and compare scores, word counts, and skill changes side-by-side.

### 🧮 4. Semantic pgvector Candidate-Job Matching
* **1536-Dimensional Embeddings**: Generates vector representations of jobs and resumes using Gemini's `text-embedding-004` model.
* **PostgreSQL pgvector Integration**: Stores vectors in PostgreSQL and calculates mathematical Cosine Similarity using raw DB queries (`vector <=> job_vector`).
* **Hybrid Scoring**: Ranks candidates based on a composite score: 35% Semantic Similarity, 30% Skill Match, 15% Experience tenure, 10% Education, and 10% Keyword density.

### ⚖️ 5. Real-Time DEI Inclusivity & Bias Scanner
* **Diversity, Equity, and Inclusion Check**: Analyzes job posting text for **Gender Bias**, **Age Bias**, **Exclusionary Language**, **Aggressive Tone**, and **Accessibility Issues**.
* **Instant Dictionary Lookup**: Local database engine flags common biased keywords (e.g., *"rockstar"*, *"young and vibrant"*, *"native English speaker"*) instantly (<50ms).
* **Gemini Context Scan**: Evaluates overall text layout and contextual tone for more subtle biases.
* **1-Click Replacement**: Recruiter UI offers a one-click button to automatically replace biased terms with recommended inclusive alternatives.

### 📈 6. Recruiter Analytics & Funnel Dashboard
* **Sourcing Slices**: Distribution charts showing effectiveness of hiring channels (LinkedIn, GitHub, Job boards).
* **Hiring Funnel**: Tracks candidate distribution from Applied, Screening, Shortlisted, Interviewed, and Hired.
* **Activity Heatmap**: Visualizes candidate application and system logins over hour-by-hour intervals.

### ⚡ 7. Real-Time Notifications & Auditing
* **WebSockets Integration**: Pushes instant application updates, interview schedules, and alerts to users using `Socket.io`.
* **Security Audit Logging**: Automatically records system events (Logins, profile edits, application updates) with search filters by action and user.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, React Router DOM, React Query, Lucide Icons, Axios |
| **Backend** | Node.js, Express, Prisma ORM, Multer, Socket.io |
| **Database & AI** | PostgreSQL (with `pgvector` extension), Google Gemini API (`gemini-3.5-flash`, `text-embedding-004`) |

---

## 📂 Project Structure

```text
├── client/                     # React Frontend Application (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI widgets (Modals, Editors, Dashboard charts)
│   │   ├── context/            # Auth and Socket state providers
│   │   ├── layouts/            # Dashboard layout grid and navigation
│   │   ├── pages/              # Portal views for Candidates and Recruiters
│   │   └── services/           # Axios HTTP client requests mapping
│   └── package.json
│
├── server/                     # Express Backend API Application
│   ├── prisma/                 # Database Schema definitions & configurations
│   │   └── schema.prisma       # Prisma ORM Schema for PostgreSQL
│   ├── controllers/            # Express request handlers
│   ├── routes/                 # REST Route mappings
│   ├── services/               # AI parser, matching, bias scans, and analytics logic
│   └── package.json
│
└── docs/                       # Technical Phase Scaffolding Documentation
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
* **Node.js** (v18+)
* **PostgreSQL** database instance (with `pgvector` extension active)
* **Google Gemini API Key** (for parsing, matching, and bias analysis features)

### 1. Database Configuration
Enable `pgvector` in your PostgreSQL instance:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Environment Setup
* Configure environmental variables by checking the `.env.example` templates in both `client/` and `server/` directories.

### 3. Installation
Run the root package installer script to build and download dependencies for the entire project:
```bash
npm run install:all
```

### 4. Database Setup & Sync
Navigate to the server directory, generate Prisma client, and synchronize schema tables:
```bash
cd server
npx prisma db push
```

### 5. Running the Application
Return to the root folder and run both the client and server simultaneously:
```bash
npm run dev
```
* **Frontend**: Runs on [http://localhost:5173](http://localhost:5173)
* **Backend**: Runs on [http://localhost:5000](http://localhost:5000)
