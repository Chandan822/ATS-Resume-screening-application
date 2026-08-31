# AI ATS - Backend API Server

The backend application is an **Express** server serving REST API endpoints, handling file uploads, managing PostgreSQL schemas via **Prisma ORM**, and executing vector calculations using the **`pgvector`** PostgreSQL extension.

---

## 🛠️ Tech Stack & Dependencies
* **Core**: Node.js, Express.js.
* **Database & ORM**: PostgreSQL, Prisma.
* **File Uploads**: Multer.
* **Text Extraction**: `mammoth` (DOCX), `pdf-parse` (PDF).
* **AI Engine**: Hugging Face Inference API embeddings, local Python `sentence-transformers` fallback, and Gemini embeddings for existing/new compatible vectors.
* **Real-time**: `socket.io` for WebSockets notification push.

---

## 📂 Backend Architecture

```text
server/
├── prisma/                 # Prisma configuration and relational schema
├── config/                 # Database clients and env configurations
├── controllers/            # Request routers mapping logic
├── middlewares/            # JWT validation, error formatting, upload limits
├── repositories/           # Direct database CRUD helpers
├── routes/                 # Express endpoint endpoints list
├── services/               # Main business logic
│   ├── aiParser.service.js           # PDF/DOCX text parsing via Gemini
│   ├── analytics.service.js          # Sourcing, funnels, heatmaps queries
│   ├── biasDetector.service.js       # DEI keyword rules & contextual AI scans
│   ├── semanticMatcher.service.js    # Cosine vector similarity & ranking
│   └── socialIntegration.service.js  # Pinned repositories sync
└── utils/                  # Core helpers (PDF readers, embedding tools)
```

---

## ⚙️ Development Guide

### 1. Environment Variables Configuration
Create a `.env` file in the `server/` directory:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/ai_ats_db?schema=public
JWT_SECRET=your_jwt_secret_key
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
HF_API_KEY=your_hugging_face_token
HF_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
LOCAL_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
GEMINI_EMBEDDING_MODEL=text-embedding-004
```

## Embedding Spaces

All semantic comparisons are resolved as a pair through `services/embedding.service.js`.
The service first reuses a common compatible space, in this order: Hugging Face,
local Sentence Transformers, then Gemini. If none exists, it tries to create the
missing pair in that same order. Provider, model, model version, vector dimension,
and a source-text SHA-256 hash are stored with every new vector; incompatible vectors
are rejected before cosine similarity is calculated.

Existing rows named `gemini-text-embedding-004` are retained as known legacy Gemini
vectors. Other rows without reliable metadata are treated as legacy/unknown and are
not compared until a fresh compatible embedding is created.

Run the schema migration before deploying this version:

```bash
npx prisma migrate deploy
```

For Render, install the local fallback before starting Node (the worker loads once and
runs on CPU):

```bash
pip install -r server/requirements.txt && cd server && npm ci && npx prisma migrate deploy
```

Set `HF_API_KEY` only on the backend service. If the HF free allowance, network, or
provider is unavailable, the comparison falls back to the local worker; Gemini remains
the final compatible-provider fallback.

### 2. Available Scripts
Inside the `server/` directory:
* **Run Dev Server**: Starts Express API in hot-reload mode on [http://localhost:5000](http://localhost:5000)
  ```bash
  npm run dev
  ```
* **Database Migration**: Synchronizes database schemas with Prisma models.
  ```bash
  npx prisma db push
  ```
* **Open Prisma Studio**: Web interface to explore database tables.
  ```bash
  npx prisma studio
  ```

---

## 🔗 Key API Endpoint Documentation

| Verb | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Registers Candidate or Recruiter |
| `POST` | `/api/auth/login` | Public | Authenticates credentials with role-check |
| `POST` | `/api/candidate/resumes` | Candidate | Uploads PDF/Word resume (Multer limit 10MB) |
| `POST` | `/api/candidate/resumes/:id/parse-ai` | Candidate | Parses resume using Gemini AI model |
| `GET` | `/api/candidate/resumes/compare` | Candidate | Compares two resume versions and their ATS scores |
| `GET` | `/api/recruiter/jobs` | Recruiter | Gets jobs with pagination and debounced query search |
| `POST` | `/api/recruiter/jobs` | Recruiter | Creates a job posting |
| `POST` | `/api/recruiter/jobs/analyze-bias` | Recruiter | Scans job description text for DEI bias indicators |
| `GET` | `/api/recruiter/jobs/:id/recommendations` | Recruiter | Ranks and evaluates talent pool matching rankings |
| `GET` | `/api/recruiter/analytics/overview` | Recruiter | Fetches charts overview metrics (funnels, heatmaps) |
| `GET` | `/api/recruiter/audit-logs` | Recruiter | Searches security audit log traces |
