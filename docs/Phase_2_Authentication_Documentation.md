# AI Applicant Tracking System (AI ATS) - Phase 2 Authentication Documentation

## Executive Summary
**Phase Objective**: Implement enterprise-grade authentication, session management, password hashing, dual JWT token rotation (Access + Refresh tokens), email verification, password recovery, and Role-Based Access Control (RBAC) for Candidates, Recruiters, and Admins across backend APIs and frontend React Hook Form / Zod interfaces.

---

## 1. Authentication Architecture & Security

```
+-------------------+              +-------------------+              +-------------------+
|   React Client    |              |  Express Server   |              | Neon PostgreSQL   |
| (Axios + Context) |              |  (JWT + bcrypt)   |              | (Prisma Database) |
+---------+---------+              +---------+---------+              +---------+---------+
          |                                  |                                  |
          |  1. POST /api/auth/register      |                                  |
          |--------------------------------->|  2. Hash password (bcrypt)       |
          |                                  |--------------------------------->| Save User & Profile
          |                                  |<---------------------------------|
          |                                  |                                  |
          |  3. POST /api/auth/login         |                                  |
          |--------------------------------->|  4. Validate credentials         |
          |                                  |--------------------------------->| Issue RefreshToken
          |  5. Return AccessToken & Refresh |<---------------------------------|
          |<---------------------------------|                                  |
          |                                  |                                  |
          |  6. GET /api/auth/me (Bearer)    |                                  |
          |--------------------------------->|  7. Verify JWT & Role (RBAC)     |
          |<---------------------------------|                                  |
```

### Key Security Features
1. **Password Hashing**: `bcryptjs` with 10 salt rounds. Passwords are never stored or logged in plain text.
2. **Access Tokens**: Short-lived JWTs (15-minute expiration) signed using `JWT_SECRET`.
3. **Refresh Tokens**: Cryptographic 7-day tokens stored securely in the database (`refresh_tokens` table) with token rotation on refresh and immediate revocation on logout or password reset.
4. **Role-Based Access Control (RBAC)**: `authorizeRoles('ADMIN', 'RECRUITER', 'CANDIDATE')` middleware enforcing route protection.
5. **Data Sanitization**: `passwordHash`, `emailVerificationToken`, and `passwordResetToken` stripped from API responses.

---

## 2. API Endpoint Specifications

| Method | Endpoint | Auth | Description | Payload / Schema |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register Candidate or Recruiter | `email`, `password`, `firstName`, `lastName`, `role`, optional `companyName`, `designation` |
| `POST` | `/api/auth/login` | Public | Authenticate user & return tokens | `email`, `password` |
| `POST` | `/api/auth/refresh-token` | Public | Rotate refresh token & get new access token | `refreshToken` |
| `POST` | `/api/auth/logout` | Public | Revoke refresh token & destroy session | `refreshToken` |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset token | `email` |
| `POST` | `/api/auth/reset-password` | Public | Reset password with security token | `token`, `password` |
| `GET` | `/api/auth/verify-email/:token` | Public | Verify email token | URL parameter `:token` |
| `GET` | `/api/auth/me` | Protected | Fetch current user profile & role | `Authorization: Bearer <access_token>` |

---

## 3. Frontend Architecture

### 1. Services & Interceptors (`client/src/services/`)
- **`api.js`**: Axios client with automatic request header injection (`Authorization: Bearer <accessToken>`) and response interceptors for automatic token rotation on `401 TOKEN_EXPIRED` errors.
- **`authService.js`**: Client API methods calling `/api/auth/*` endpoints.

### 2. Auth State & Hook (`client/src/context/` & `client/src/hooks/`)
- **`AuthContext.js` & `AuthProvider.jsx`**: Global authentication state provider storing current user, tokens in `localStorage`, and login/register/logout handlers.
- **`useAuth.js`**: React hook exposing auth state and role checks (`isCandidate`, `isRecruiter`, `isAdmin`).

### 3. Protected Routes (`client/src/routes/ProtectedRoute.jsx`)
- Route wrapper verifying `isAuthenticated` status and matching user role against `allowedRoles`. Redirects unauthenticated users to `/login` and unauthorized users to `/unauthorized`.

### 4. Authentication Views (`client/src/pages/`)
- **`Login.jsx`**: Dark glassmorphic tabbed login for Candidates, Recruiters, and Admins.
- **`Register.jsx`**: Registration form with role switcher (Candidate vs. Recruiter) and Zod field validations.
- **`ForgotPassword.jsx`**: Request password recovery link/token.
- **`ResetPassword.jsx`**: Submit new password with reset token.
- **`Unauthorized.jsx`**: 403 Forbidden page.

---

## 4. Verification & Testing Instructions

1. Start development server:
   ```bash
   npm run dev
   ```
2. Open browser at `http://localhost:5173/login` or `http://localhost:5173/register`.
3. Select role (Candidate or Recruiter), fill out form with Zod validation, and submit.
4. Verify JWT Access & Refresh tokens stored in `localStorage` upon successful authentication.
