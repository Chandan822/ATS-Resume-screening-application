# AI ATS - Client Application

The client application is built with **React**, **Vite**, and **Tailwind CSS**. It provides Candidate and Recruiter portals with interactive scoreboards, dashboard graphs, real-time alert notifications, and resume upload flows.

## 🛠️ Tech Stack & Libraries
* **Build System**: Vite (fast module bundling and hot-reloading).
* **State Management & Querying**: `@tanstack/react-query` (React Query) for API caching and mutation requests.
* **Forms**: `react-hook-form` with `zod` schema resolvers.
* **Icons**: `lucide-react`.

---

## 📂 Folder Directory Layout

```text
client/src/
├── components/         # Interactive elements
│   ├── AtsScoreDashboard.jsx       # ATS Score breakdowns & suggestions
│   ├── InclusiveJobEditor.jsx      # Job editor with DEI replacement scanner
│   ├── NotificationCenter.jsx      # Socket.io notification drawer
│   └── SocialIntegrationModal.jsx  # Pinned repositories sync & parsing
├── context/            # Auth and WebSocket Connection state providers
├── hooks/              # Custom hooks (e.g. useAuth)
├── layouts/            # Shared dashboards layout grids & routing guards
├── pages/
│   ├── candidate/      # Candidate profile setup, resume comparator, and job list
│   ├── recruiter/      # Applicants matching, analytics charts, and job management
│   └── Login.jsx / Register.jsx   # Dynamic login split role interfaces
└── services/           # Axios client HTTP call mappings
```

---

## ⚙️ Development Guide

### 1. Environment Variables Configuration
Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

### 2. Available Scripts
Inside the `client/` directory:
* **Run Local Server**: Starts Vite local development server on [http://localhost:5173](http://localhost:5173)
  ```bash
  npm run dev
  ```
* **Build Production**: Compiles assets for production deployment.
  ```bash
  npm run build
  ```
* **Lint Check**: Checks files for formatting or syntax issues.
  ```bash
  npm run lint
  ```
