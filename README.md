# Campus Placement Management System (CPMS) — MITE

A modern, full-stack campus recruitment portal designed for the **Mangalore Institute of Technology & Engineering (MITE)**. The platform facilitates seamless interaction between **students** and **administrators** throughout the entire placement lifecycle.

---

## 🚀 Overview

CPMS is built on the **MERN** stack, focusing on professional aesthetics, secure authentication, transactional email delivery, and real-time data tracking. It provides a centralized hub for managing student profiles, recruitment drives, placement applications, institutional notices, and placement analytics.

### Key Features

- **Two-Role System**: Secure login for **Students** and **Admins** only. JWT-based access & refresh token sessions with httpOnly cookies.
- **Admin Two-Step OTP Login**: Admin authentication uses a two-step flow — password verification followed by a time-limited OTP delivered via Brevo transactional email.
- **OTP Email Verification**: Email-based OTP verification (10-minute TTL) for secure student onboarding.
- **Password Recovery**: Forgot password / reset password flow with a 15-minute time-limited secure token.
- **Admin Change Password**: Dedicated admin password change with extra validation and `mustChangePassword` flag enforcement.
- **Student Dashboard**: Real-time tracking of profile completion, applied jobs, eligibility status, and upcoming placement drives.
- **Smart Eligibility Engine**: Automated eligibility checks (CGPA, 10th %, 12th %, backlogs, branch, course) per drive.
- **Resume Management**: Secure PDF resume uploads (max 2MB) and deletion powered by Cloudinary via Multer.
- **Placement Drives**: Full CRUD for recruitment drives with company logo and PDF brochure uploads (Cloudinary), smart status engine (`upcoming` → `open` → `closed`), and detailed eligibility configuration.
- **Applications System**: Students apply to drives; admins view applicants, update individual or bulk application statuses.
- **Application Status Emails**: Automatic HTML emails sent to students via Brevo whenever their application status is updated — includes styled status badge and optional admin remarks.
- **Notices Board**: Admin creates, updates, archives, and deletes notices. Students view active notices with per-user read-tracking. Optional PDF attachments (with upload/removal support) via Cloudinary are supported.
- **Notice Lifecycle (Auto-Archive & Purge)**: A scheduled `node-cron` job runs daily at midnight IST — automatically archives notices older than 30 days and permanently purges archived notices older than 60 days.
- **Student Directory**: Admin view of all registered students with profile modal and PDF/CSV export.
- **Analytics Dashboard**: Admin placement analytics powered by Recharts.
- **PDF Export**: Export reports using jsPDF and jspdf-autotable.
- **Drive Reports**: Admin endpoint to generate per-drive applicant reports.
- **Transactional Email (Brevo)**: All system emails (student OTP, admin OTP, password reset, status updates) are delivered via the **Brevo HTTP API** — bypassing SMTP restrictions on cloud providers like Render.
- **Professional UI**: Premium corporate UI with Tailwind CSS v3, Framer Motion animations, and Lucide icons.
- **Role-Based Access Control (RBAC)**: Strict permission enforcement across student and admin roles.
- **Rate Limiting**: API-level, login, registration, and sensitive-operation rate limiting.
- **Security**: Helmet security headers, bcrypt password hashing, hashed refresh tokens in DB, httpOnly cookies, XSS-safe HTML email templates.
- **Automated Tests**: Jest + Supertest backend test suite.
- **Docker Containerization**: Multi-stage Docker builds for frontend (Nginx Alpine) and backend, with Docker Compose for production and hot-reload dev environments.
- **Automated CI/CD**: GitHub Actions pipeline (`ci.yml`) for test execution and Docker image verification on every push to `main`.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **State Management**: Redux Toolkit (`authSlice`, `profileSlice`, `driveSlice`, `applicationSlice`, `noticeSlice`)
- **Styling**: Tailwind CSS v3
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form + Zod (via `@hookform/resolvers`)
- **Charts**: Recharts
- **PDF Export**: jsPDF + jspdf-autotable
- **HTTP Client**: Axios (with automatic silent token refresh interceptor)
- **Routing**: React Router DOM v7
- **Notifications**: React Hot Toast
- **Context**: Custom `ConfirmContext` for global confirmation dialogs

### Backend
- **Environment**: Node.js 20
- **Framework**: Express.js v5
- **Database**: MongoDB (Mongoose ODM v9)
- **File Storage**: Cloudinary (resumes via `multer-storage-cloudinary`; images & PDFs via `multer`)
- **Authentication**: JWT (Access Token 15m + Refresh Token 7d, stored as bcrypt hash in DB)
- **Email Service**: **Brevo HTTP API** — OTP, admin OTP, password reset, and application status update emails
- **Scheduled Jobs**: `node-cron` — daily notice auto-archive (30 days) + purge (60 days) at midnight IST
- **Validation**: `express-validator` (per-route validation chains)
- **Security**: Helmet, `express-rate-limit`, bcrypt, httpOnly cookies, HTML-escaped email templates
- **Logging**: Morgan (dev mode; admin routes only in production)
- **Testing**: Jest + Supertest

### Deployment & DevOps
- **Containerization**: Docker & Docker Compose (multi-stage builds, dev & prod orchestration)
- **Web Server**: Nginx Alpine (serving production React SPA with `try_files` fallback routing)
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml` — automated test run + Docker build verification)
- **Cloud Hosting**: Render (Node.js web service & static site via `render.yaml`)

---

## 📁 Project Structure

```text
cpms-mini-project/
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions CI pipeline (test + Docker build)
├── ci_cd_guide.md                # Comprehensive CI/CD & DevOps documentation
├── docker-compose.yml            # Production Docker Compose orchestration
├── docker-compose.dev.yml        # Development Docker Compose with hot-reload volume mounts
├── render.yaml                   # Render cloud deployment configuration
│
├── backend/
│   ├── Dockerfile                # Multi-stage: base → development → production
│   ├── app.js                    # Express app setup (middleware, routes, error handler)
│   ├── server.js                 # HTTP server entry point + starts notice archive cron
│   ├── __tests__/
│   │   └── app.test.js           # Backend integration tests (Jest + Supertest)
│   ├── config/
│   │   ├── cloudinary.js         # Cloudinary SDK configuration
│   │   └── db.js                 # MongoDB connection
│   ├── constants/
│   │   └── roles.js              # Role constants: student, admin
│   ├── controllers/
│   │   ├── auth.controller.js    # Register, OTP verify, login, admin-login (OTP), logout, refresh, forgot/reset password, admin-change-password
│   │   ├── admin.controller.js   # Dashboard stats, student directory, student by ID, drive reports
│   │   ├── profile.controller.js # Student profile CRUD + resume upload/delete
│   │   ├── drive.controller.js   # Placement drive CRUD (with logo upload)
│   │   ├── application.controller.js # Apply, view applications, individual & bulk status update
│   │   └── notice.controller.js  # Notice CRUD, archive, restore, auto-archive/purge runners, read-tracking
│   ├── middleware/
│   │   ├── auth.middleware.js     # verifyAccessToken, restrictToRoles
│   │   ├── upload.middleware.js   # Multer: resume (PDF, 2MB) + image (logo) + PDF (notice attachment)
│   │   ├── rateLimiter.js         # apiLimiter, loginLimiter, registerLimiter, sensitiveLimiter
│   │   ├── validateRequest.middleware.js # express-validator error aggregator
│   │   └── error.middleware.js    # Global error handler
│   ├── models/
│   │   ├── User.model.js          # Student schema (USN, department, yearOfStudy, readNotices, refresh token)
│   │   ├── Admin.model.js         # Admin schema (readNotices, mustChangePassword, refresh token)
│   │   ├── StudentProfile.model.js # Full student academic & personal profile
│   │   ├── Drive.model.js         # Drive schema (eligibility, status engine, companyLogo, dynamic createdBy)
│   │   ├── Application.model.js   # Application schema (status pipeline, remarks, resumeSnapshot)
│   │   ├── Notice.model.js        # Notice schema (category, PDF attachment, isArchived, archivedAt)
│   │   └── OTP.model.js           # OTP storage with TTL expiry index
│   ├── routes/
│   │   ├── auth.routes.js         # /api/v1/auth/*
│   │   ├── profile.routes.js      # /api/v1/profile/* (student only)
│   │   ├── drive.routes.js        # /api/v1/drives/* (admin-only for write ops)
│   │   ├── application.routes.js  # /api/v1/applications/*
│   │   ├── notice.routes.js       # /api/v1/notices/* (with archive & read-tracking sub-routes)
│   │   └── admin.routes.js        # /api/v1/admin/* (admin-only)
│   ├── scripts/
│   │   └── seedAdmin.js           # Seeds the initial admin user
│   ├── services/
│   │   ├── email.service.js       # Brevo HTTP API: sendOTPEmail, sendAdminOTPEmail, sendResetEmail, sendStatusUpdateEmail
│   │   └── noticeArchiveCron.js   # node-cron: auto-archive (30d) + purge (60d) @ midnight IST
│   ├── utils/
│   │   ├── ApiResponse.js         # Standardised API response wrapper
│   │   └── generateOTP.js         # 6-digit OTP generator
│   └── validators/
│       ├── auth.validators.js     # Validation chains for all auth routes
│       ├── profile.validators.js  # Profile update validation
│       ├── drive.validators.js    # Drive create/update validation
│       └── notice.validators.js   # Notice create/update validation
│
└── frontend/
    ├── Dockerfile                 # Multi-stage: base → development → build → production
    ├── nginx.conf                 # Nginx SPA routing (try_files for React Router)
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx               # React root, Redux Provider
        ├── App.jsx                # App entry with router
        ├── app/
        │   └── store.js           # Redux store configuration
        ├── api/
        │   ├── axiosInstance.js   # Axios base instance + silent token refresh interceptor
        │   ├── authApi.js         # Auth API calls
        │   ├── profileApi.js      # Profile API calls
        │   ├── driveApi.js        # Drive API calls
        │   ├── applicationApi.js  # Application API calls (incl. bulk status)
        │   ├── noticeApi.js       # Notice API calls (incl. archive, read-tracking)
        │   └── adminApi.js        # Admin API calls
        ├── constants/
        │   └── roles.js           # ROLES, DEPARTMENTS, YEARS_OF_STUDY, DASHBOARD_ROUTES
        ├── context/
        │   └── ConfirmContext.jsx # Global confirmation dialog context
        ├── features/
        │   ├── auth/
        │   │   ├── authSlice.js
        │   │   └── authThunks.js
        │   ├── profile/
        │   │   ├── profileSlice.js
        │   │   └── profileThunks.js
        │   ├── drives/
        │   │   └── driveSlice.js
        │   ├── applications/
        │   │   └── applicationSlice.js
        │   └── notices/
        │       └── noticeSlice.js
        ├── pages/
        │   ├── auth/
        │   │   ├── LoginPage.jsx
        │   │   ├── RegisterPage.jsx
        │   │   ├── VerifyEmailPage.jsx
        │   │   ├── ForgotPasswordPage.jsx
        │   │   ├── ResetPasswordPage.jsx
        │   │   ├── AdminLoginPage.jsx          # Two-step: password → Brevo OTP verification
        │   │   └── AdminChangePasswordPage.jsx
        │   └── dashboard/
        │       ├── StudentDashboard.jsx
        │       ├── StudentDashboardHome.jsx
        │       ├── StudentProfilePage.jsx
        │       ├── DrivesPage.jsx
        │       ├── DriveDetail.jsx
        │       ├── ApplicationsPage.jsx
        │       ├── NoticesPage.jsx              # Per-notice read-tracking
        │       ├── AdminDashboard.jsx
        │       └── admin/
        │           ├── AdminOverview.jsx
        │           ├── AdminDrivesPage.jsx
        │           ├── AdminNoticesPage.jsx     # Active + archived tabs, notice CRUD
        │           ├── DriveApplicationsPage.jsx
        │           ├── StudentDirectory.jsx
        │           ├── StudentProfileModal.jsx
        │           └── components/
        │               ├── DriveModal.jsx              # Create/Edit drive with logo upload
        │               ├── DriveDetailsModal.jsx       # View drive details
        │               ├── AnalyticsDashboard.jsx      # Recharts placement analytics
        │               └── ApplicationStatusManager.jsx # Individual + bulk status management
        ├── routes/
        │   ├── AppRouter.jsx       # All app routes (student + admin)
        │   ├── ProtectedRoute.jsx  # Auth guard
        │   ├── PublicRoute.jsx     # Redirect if already logged in
        │   └── RoleRoute.jsx       # Role-based route guard
        ├── components/
        │   ├── CompanyLogo.jsx
        │   ├── ErrorBoundary.jsx
        │   ├── admin/
        │   ├── auth/
        │   ├── dashboard/
        │   └── layout/
        ├── hooks/
        │   ├── useAuth.js          # Auth state selector
        │   ├── useCountdown.js     # OTP countdown timer
        │   └── useEligibility.js   # Drive eligibility check logic
        ├── schemas/
        │   ├── authSchemas.js      # Zod schemas for auth forms
        │   └── profileSchema.js    # Zod schema for profile form
        ├── services/
        │   └── admin.service.js
        ├── utils/
        │   ├── exportUtils.js      # PDF/CSV export helpers
        │   ├── passwordStrength.js # Password strength indicator
        │   ├── profileUtils.js     # Profile completion calculation
        │   └── tokenUtils.js       # Token decode helpers
        └── lib/
            └── utils.js            # clsx/tailwind-merge utility
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js**: v20+ (for manual local setup)
- **Docker & Docker Compose**: Recommended for containerized setup
- **MongoDB Atlas**: Or a local MongoDB instance
- **Cloudinary account**: For resume (PDF), company logo (image), and notice attachment (PDF) uploads
- **Brevo account**: For all transactional emails (OTP, admin OTP, password reset, status updates)

---

### Option A: 🐳 Running with Docker (Recommended)

1. **Clone and configure environment variables**
   ```bash
   git clone https://github.com/Alok-Chandra108/Placement-management-system.git
   cd cpms-mini-project
   # Create backend/.env (see Environment Variables below)
   ```

2. **Production Mode (Nginx + Node.js)**
   ```bash
   docker compose up --build -d
   ```
   - **Frontend (Nginx)**: `http://localhost` (Port 80)
   - **Backend API**: `http://localhost:5000`

3. **Development Mode (Live Reloading)**
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```
   - **Frontend Dev Server**: `http://localhost:5173`
   - **Backend Dev Server**: `http://localhost:5000`

---

### Option B: 💻 Manual Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Alok-Chandra108/Placement-management-system.git
   cd cpms-mini-project
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env (see Environment Variables below)
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Seed Admin User** *(first-time setup only)*
   ```bash
   cd backend
   node scripts/seedAdmin.js
   ```

5. **Run Backend Tests**
   ```bash
   cd backend
   npm test
   ```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Brevo transactional email (replaces Gmail SMTP)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_brevo_sender@example.com

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@mite.ac.in
```

> **Note:** Gmail SMTP (`GMAIL_USER`, `GMAIL_APP_PASSWORD`) is no longer used. All transactional emails are delivered via the **Brevo HTTP API**, which is not blocked by Render's cloud infrastructure.

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 🌐 API Routes

### Auth (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Student registration |
| POST | `/api/v1/auth/verify-email` | Public | OTP email verification (10-min TTL) |
| POST | `/api/v1/auth/resend-otp` | Public | Resend OTP |
| PUT | `/api/v1/auth/update-verify-email` | Public | Update email & re-verify |
| POST | `/api/v1/auth/login` | Public | Student login |
| POST | `/api/v1/auth/admin-login` | Public | Admin login — step 1: password; step 2: OTP via Brevo |
| POST | `/api/v1/auth/refresh-token` | Public | Refresh access token |
| POST | `/api/v1/auth/forgot-password` | Public | Send password reset email (15-min TTL) |
| POST | `/api/v1/auth/validate-reset-token` | Public | Validate reset token |
| POST | `/api/v1/auth/reset-password` | Public | Reset password |
| POST | `/api/v1/auth/logout` | Auth | Logout & clear tokens |
| POST | `/api/v1/auth/admin-change-password` | Admin | Change admin password |

### Profile (`/api/v1/profile`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/profile/me` | Student | Get own profile |
| PUT | `/api/v1/profile/me` | Student | Update own profile |
| POST | `/api/v1/profile/resume` | Student | Upload resume (PDF ≤ 2MB) |
| DELETE | `/api/v1/profile/resume` | Student | Delete resume |

### Drives (`/api/v1/drives`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/drives` | Auth | List all active drives |
| POST | `/api/v1/drives` | Admin | Create drive (with optional logo and PDF brochure upload) |
| GET | `/api/v1/drives/:id` | Auth | Get drive details |
| PATCH | `/api/v1/drives/:id` | Admin | Update drive (includes support for logo/PDF removal) |
| DELETE | `/api/v1/drives/:id` | Admin | Soft-delete drive |

### Applications (`/api/v1/applications`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/applications/apply/:driveId` | Student | Apply to a drive |
| GET | `/api/v1/applications/my-applications` | Student | My applications list |
| GET | `/api/v1/applications/drive/:driveId` | Admin | All applicants for a drive |
| PATCH | `/api/v1/applications/:applicationId/status` | Admin | Update individual status (triggers Brevo email to student) |
| PATCH | `/api/v1/applications/bulk-status` | Admin | Bulk update multiple application statuses |

### Notices (`/api/v1/notices`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/notices` | Auth | List active, non-archived notices |
| POST | `/api/v1/notices` | Admin | Create notice (optional PDF attachment via Cloudinary) |
| GET | `/api/v1/notices/:id` | Auth | Get notice details |
| PUT | `/api/v1/notices/:id` | Admin | Update notice (includes support for PDF removal) |
| DELETE | `/api/v1/notices/:id` | Admin | Delete notice |
| GET | `/api/v1/notices/archived` | Admin | List archived notices |
| PATCH | `/api/v1/notices/:id/archive` | Admin | Manually archive a notice |
| PATCH | `/api/v1/notices/:id/restore` | Admin | Restore an archived notice |
| GET | `/api/v1/notices/read` | Auth | Get IDs of notices read by current user |
| PATCH | `/api/v1/notices/:id/read` | Auth | Mark a notice as read |

### Admin (`/api/v1/admin`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/admin/stats` | Admin | Dashboard placement statistics |
| GET | `/api/v1/admin/students` | Admin | All registered students |
| GET | `/api/v1/admin/students/:id` | Admin | Get student profile by ID |
| GET | `/api/v1/admin/reports/drive/:driveId` | Admin | Drive-specific applicant report |

---

## 📧 Email System (Brevo)

All system emails are delivered via the **Brevo HTTP API** (`https://api.brevo.com/v3/smtp/email`) with custom-branded HTML templates:

| Email Type | Trigger | Template Style |
|------------|---------|---------------|
| Student OTP | Registration / resend-OTP | MITE branded, orange OTP block, 10-min expiry |
| Admin OTP | Admin login step 2 | Dark security-themed, gradient OTP block, warning notice |
| Password Reset | Forgot password | MITE branded, CTA button, 15-min expiry |
| Application Status Update | Admin updates application status | Status badge with colour coding + optional remarks block |

The status update email is **non-blocking** — a delivery failure does not fail the API response.

---

## 🚢 Deployment & DevOps

### Containerization & Orchestration

- **Docker Multi-Stage Builds**:
  - **Frontend (`frontend/Dockerfile`)**: Four stages — `base` (shared deps), `development` (Vite dev server on `5173`), `build` (`npm run build` produces `dist/`), and `production` (Nginx Alpine serving `dist/` via `nginx.conf`).
  - **Backend (`backend/Dockerfile`)**: Three stages — `base` (shared deps), `development` (nodemon hot-reload), `production` (lean, `--omit=dev`).
- **Docker Compose**:
  - **`docker-compose.yml`**: Production — backend on `5000`, frontend Nginx on `80`, connected via `cpms-network` bridge.
  - **`docker-compose.dev.yml`**: Development override — live volume mounts for hot-reloading on both services.

### CI/CD (GitHub Actions)

- **`.github/workflows/ci.yml`**: Triggers on push/PR to `main`. Sets up Node.js 20, installs deps, runs Jest tests (`npm test`) for backend and frontend, then verifies Docker image builds for both services.
- For a deep-dive into registry integration and SSH-based auto-deployment, see [ci_cd_guide.md](ci_cd_guide.md).

### Cloud Hosting (Render)

Configured via `render.yaml`:
- **Backend** (`cpms-backend`): Node.js web service, `npm start` from `backend/`
- **Frontend** (`cpms-frontend`): Static site, `npm run build` from `frontend/`, serving `dist/`

---

## 📄 License

This project is for internal use at **MITE Mangalore**. All rights reserved.

Created by [Alok Chandra](https://github.com/Alok-Chandra108)
