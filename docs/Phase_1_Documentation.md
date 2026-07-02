# AI Applicant Tracking System (AI ATS) - Phase 1 Documentation

## Executive Summary
**Phase 1 Goal**: Establish an enterprise-grade, decoupled application structure separating `client/` (React + Vite) and `server/` (Express + Prisma + Node.js) without business logic, complete with environment configs, database ORM setup, code quality tooling, and baseline health connection endpoints.

---

## 1. Tech Stack Architecture

### Frontend (`client/`)
- **Framework**: React 18+ powered by Vite
- **Routing**: React Router DOM (v6)
- **Styling**: TailwindCSS (v4) with dark glassmorphism design system
- **State & Data Fetching**: `@tanstack/react-query` (v5) + Axios
- **Form Management & Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **Deployment Target**: Vercel

### Backend (`server/`)
- **Runtime & Framework**: Node.js (ES Modules) with Express.js
- **ORM & Database Client**: Prisma ORM (v5)
- **Database Engine**: PostgreSQL (Neon database ready) with `pgvector` preview enabled
- **Security & Middlewares**: Helmet, CORS, Morgan (logger), Multer (file uploads)
- **Authentication Preparedness**: JSON Web Token (`jsonwebtoken`), `bcryptjs`
- **Deployment Target**: Render

---

## 2. Complete Directory Structure

```
AI-ATS-Project/
├── package.json               # Workspace orchestration scripts
├── .gitignore                 # Root git ignore
├── docs/                      # Side-by-side phase documentation
│   └── Phase_1_Documentation.md
├── client/                    # Frontend React Application
│   ├── package.json           # Frontend dependencies & scripts
│   ├── vite.config.js         # Vite configuration with Tailwind & path aliases
│   ├── index.html             # HTML entry point with Google Fonts
│   ├── .env                   # Local environment variables
│   ├── .env.example           # Environment variables template
│   ├── .eslintrc.cjs          # ESLint rules for React
│   ├── .prettierrc            # Prettier formatting rules
│   ├── .gitignore             # Client git ignore
│   └── src/
│       ├── main.jsx           # Client mounting with Providers
│       ├── App.jsx            # System Health & Connection Visualizer
│       ├── index.css          # Tailwind CSS directives
│       ├── components/        # Reusable UI components
│       ├── pages/             # Application views/pages
│       ├── layouts/           # Page wrapper layouts
│       ├── hooks/             # Custom React hooks
│       ├── context/           # React Context state providers
│       ├── services/          # API services (Axios client)
│       ├── utils/             # Helper utilities
│       ├── constants/         # App constants
│       ├── assets/            # Static assets & images
│       └── routes/            # React Router definitions
└── server/                    # Backend Express Application
    ├── package.json           # Backend dependencies & scripts
    ├── index.js               # Express server entry point
    ├── .env                   # Backend environment configuration
    ├── .env.example           # Backend environment template
    ├── .eslintrc.cjs          # ESLint rules for Node.js
    ├── .prettierrc            # Prettier formatting rules
    ├── .gitignore             # Server git ignore
    ├── config/                # Environment & Database configurations
    │   ├── env.js
    │   └── db.js              # Prisma Client singleton & DB health check
    ├── routes/                # Express API route definitions
    │   └── health.routes.js   # Health check endpoint (/api/health)
    ├── middlewares/           # Custom Express middlewares
    │   └── errorHandler.js    # Global error & 404 handlers
    ├── controllers/           # HTTP Request handlers
    ├── services/              # Core business logic services
    ├── repositories/          # Database query abstractions
    ├── validators/            # Request validation schemas (Zod)
    ├── utils/                 # Server utilities
    ├── uploads/               # Temporary file storage for resume uploads
    └── prisma/
        └── schema.prisma      # Prisma schema with PostgreSQL & pgvector setup
```

---

## 3. Configuration & Environment Variables

### Client Environment Variables (`client/.env`)
| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Base API URL for backend calls |

### Server Environment Variables (`server/.env`)
| Variable | Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port Express server listens on |
| `NODE_ENV` | `development` | Environment mode (`development` / `production`) |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string (Neon DB compatible) |
| `JWT_SECRET` | `ai_ats_super_secret_jwt_key_phase1` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | Expiration duration for tokens |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin for client access |

---

## 4. Health Check Endpoint & Diagnostics

The Express server exposes a health diagnostic route at `GET /api/health`:

```json
{
  "success": true,
  "message": "AI ATS Server is healthy and running",
  "timestamp": "2026-07-02T14:55:00.000Z",
  "server": "Running",
  "database": "Connected",
  "details": {
    "environment": "development",
    "dbStatus": "Connected to PostgreSQL"
  }
}
```

---

## 5. Verification & Running the Project

### Installation Command
From the project root:
```bash
npm run install:all
```

### Development Command
Run both client and server concurrently:
```bash
npm run dev
```

### Individual Commands
- **Frontend only**: `npm run dev:client` (Runs Vite on `http://localhost:5173`)
- **Backend only**: `npm run dev:server` (Runs Nodemon on `http://localhost:5000`)
- **Prisma Client Generate**: `npm run prisma:generate`

---

## 6. Phase 1 Completion Checklist
- [x] Full folder structure created for `client/` and `server/`.
- [x] Client configured with Vite, React 18, TailwindCSS, React Router DOM, Axios, React Query, React Hook Form, and Zod.
- [x] Server configured with Express.js, Prisma ORM, Helmet, CORS, Morgan, Multer, JWT, and bcryptjs.
- [x] Environment files (`.env` & `.env.example`) configured for both client and server.
- [x] Prisma schema initialized with PostgreSQL provider and `pgvector` readiness.
- [x] Side-by-side documentation (`docs/Phase_1_Documentation.md`) created.
- [x] Zero business logic added; infrastructure validated.

*Ready to proceed to Phase 2: Authentication Implementation.*
