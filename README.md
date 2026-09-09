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
- **Database Migrations (`migrate-mongo`)**: Managed schema migrations and compound performance indexes for high-throughput queries.
- **Deep Health & Readiness Probing**: Production `/health` and `/api/v1/health` monitoring endpoints probing MongoDB connection latency, Redis ping, memory metrics (RSS, Heap), and process uptime.
- **Redis Caching & Asynchronous Queue**: Sub-millisecond read caching for drives and notices with an asynchronous email notification queue (with graceful, non-fatal in-memory fallback).
- **Campus Wi-Fi Shared IP Protection**: User-ID keyed distributed rate limiting ensuring students in campus computer labs or shared college NAT IPs are never throttled.
- **Frontend Code Splitting & Vendor Chunking**: Dynamic route-level React 19 lazy loading with Rollup vendor chunking (`vendor-react`, `vendor-redux`, `vendor-charts`, `vendor-forms`, `vendor-motion`, `vendor-ui`).
- **Professional UI**: Premium corporate UI with Tailwind CSS v3, Framer Motion animations, and Lucide icons.
- **Role-Based Access Control (RBAC)**: Strict permission enforcement across student and admin roles.
- **Security**: Helmet security headers, bcrypt password hashing, hashed refresh tokens in DB, httpOnly cookies, CSRF tokens, NoSQL sanitization, XSS-safe HTML email templates.
- **Automated Tests**: Comprehensive 10-suite Jest + Supertest backend test suite covering auth, CSRF, health checks, cache, and rate limiters.
- **Docker Containerization**: Multi-stage Docker builds for frontend (Nginx Alpine) and backend, with multi-platform support (`linux/amd64` and `linux/arm64`).
- **Automated CI/CD**: GitHub Actions pipeline (`ci.yml`) for containerized test execution and multi-arch Docker image builds.
- **Multi-Cloud Deployment Setup**: Fully configured production deployments for **Render** (backend with pre-deploy migrations), **Vercel** (frontend SPA with asset caching), **Railway**, **AWS** (ECS/App Runner), and **Docker Compose**.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite 8)
- **Architecture**: Route-level Code Splitting & Rollup Vendor Chunking
- **State Management**: Redux Toolkit (`authSlice`, `profileSlice`, `driveSlice`, `applicationSlice`, `noticeSlice`)
- **Styling**: Tailwind CSS v3
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form + Zod (via `@hookform/resolvers`)
- **Charts**: Recharts
- **PDF Export**: jsPDF + jspdf-autotable
- **HTTP Client**: Axios (with automatic silent token refresh & CSRF interceptor)
- **Routing**: React Router DOM v7
- **Notifications**: React Hot Toast
- **Context**: Custom `ConfirmContext` for global confirmation dialogs
- **Deployment**: Vercel (custom rewrites, immutable chunk caching, security headers)

### Backend
- **Environment**: Node.js 20
- **Framework**: Express.js v5 (with PM2 multi-core cluster support)
- **Database**: MongoDB (Mongoose ODM v9) + `migrate-mongo` migration engine
- **Cache & Queue**: Redis 7 / Upstash Redis (cache-aside, distributed rate limiting, email worker queue with in-memory fallback)
- **File Storage**: Cloudinary (resumes via `multer-storage-cloudinary`; images & PDFs via `multer`)
- **Authentication**: JWT (Access Token 15m + Refresh Token 7d, stored as bcrypt hash in DB) + Two-Step Admin OTP
- **Email Service**: **Brevo HTTP API** — OTP, admin OTP, password reset, and application status update emails
- **Scheduled Jobs**: `node-cron` — daily notice auto-archive (30 days) + purge (60 days) at midnight IST (cluster-safe instance-0 worker)
- **Validation**: `express-validator` (per-route validation chains)
- **Security**: Helmet, `express-rate-limit`, `rate-limit-redis`, bcrypt, httpOnly cookies, CSRF protection, Mongo Sanitize, XSS-clean
- **Logging**: Structured JSON logging via Pino & `pino-http` (Morgan in dev)
- **Compression**: Response compression (`compression` gzip/deflate)
- **Health Checks**: Deep readiness probing (`/health` & `/api/v1/health`)
- **Testing**: Jest + Supertest (10 test suites, 113+ automated tests)

### Deployment & DevOps
- **Cloud PaaS**: Render (Backend web service with `preDeployCommand` migrations & `/health` checks)
- **Cloud Edge**: Vercel (Frontend React SPA deployment with immutable asset caching)
- **Cloud Redis**: Upstash Redis (serverless Redis with TLS & automatic in-memory fallback)
- **Alternative PaaS**: Railway (`railway.toml` 1-click template)
- **Enterprise Cloud**: AWS (ECS Fargate / App Runner via multi-arch Docker images)
- **Containerization**: Docker & Docker Compose (multi-stage builds, dev & prod orchestration with health checks)
- **Web Server**: Nginx Alpine (serving production React SPA with `try_files` fallback and gzip compression)
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml` — automated test runs + multi-arch `linux/amd64` and `linux/arm64` image builds)

---

## 📁 Project Structure

```text
cpms-mini-project/
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions CI/CD (test + multi-arch Docker build)
├── docs/
│   ├── CLOUD_DEPLOYMENT.md       # Complete multi-cloud ops guide (Render, Vercel, Upstash, AWS)
│   ├── cicd-explanation.md       # CI/CD deep dive & concepts
│   └── docker-explanation.md     # Docker containerization reference
├── docker-compose.yml            # Production Docker Compose orchestration (backend, frontend, redis)
├── docker-compose.ci.yml         # Isolated CI test orchestration with health-checked services
├── docker-compose.dev.yml        # Development Docker Compose with hot-reload volume mounts
├── render.yaml                   # Render Blueprint config (health checks, pre-deploy migrations, Upstash)
├── railway.toml                  # Railway 1-click deployment configuration
├── vercel.json                   # Root Vercel SPA routing & monorepo build configuration
│
├── backend/
│   ├── Dockerfile                # Multi-stage: base → development → test → production
│   ├── app.js                    # Express app (security headers, CORS, rate limits, routes)
│   ├── server.js                 # Server entry point + DB/Redis connection + graceful shutdown
│   ├── ecosystem.config.js       # PM2 cluster configuration (zero-downtime reloads)
│   ├── migrate-mongo-config.js   # MongoDB migration configuration
│   ├── migrations/               # Version-controlled schema & index migrations
│   ├── __tests__/                # 10 Jest test suites (auth, csrf, health, cache, rate limits)
│   ├── config/
│   │   ├── cloudinary.js         # Cloudinary SDK configuration
│   │   ├── db.js                 # MongoDB connection & pool tuning
│   │   ├── logger.js             # Pino structured JSON logger
│   │   └── redis.js              # Resilient Redis client with in-memory fallback
│   ├── controllers/              # Business logic handlers
│   ├── middleware/               # Auth, upload, CSRF, rate limiter, request ID, error handling
│   ├── models/                   # Mongoose schemas (User, Admin, Drive, Application, Notice, OTP)
│   ├── routes/
│   │   ├── health.routes.js      # /health & /api/v1/health deep readiness probes
│   │   ├── auth.routes.js        # /api/v1/auth/*
│   │   ├── profile.routes.js     # /api/v1/profile/*
│   │   ├── drive.routes.js       # /api/v1/drives/*
│   │   ├── application.routes.js # /api/v1/applications/*
│   │   ├── notice.routes.js      # /api/v1/notices/*
│   │   └── admin.routes.js       # /api/v1/admin/*
│   ├── services/
│   │   ├── cache.service.js      # Redis cache-aside helper for drives & notices
│   │   ├── emailQueue.service.js # Asynchronous background email notification queue
│   │   ├── email.service.js      # Brevo HTTP API email sender
│   │   └── noticeArchiveCron.js  # Daily auto-archive & purge scheduled cron
│   └── validators/               # express-validator request schemas
│
└── frontend/
    ├── Dockerfile                # Multi-stage: base → dev → build → Nginx production
    ├── nginx.conf                # Nginx reverse proxy, gzip, and SPA fallback routing
    ├── vercel.json               # Vercel routing rewrites, security headers & immutable asset cache
    ├── vite.config.js            # Rollup manual chunks & vendor code splitting
    ├── index.html
    └── src/                      # React 19 application components, pages, Redux slices
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

For full, step-by-step guides, operational procedures, and environment variables across all supported platforms, see [docs/CLOUD_DEPLOYMENT.md](docs/CLOUD_DEPLOYMENT.md).

### Cloud Platform Deployments

- **Render (Backend API)**:
  - Deployed as a Node.js web service using `render.yaml`.
  - **Automated Migrations**: Uses `preDeployCommand: npm run migrate:up` to apply MongoDB schema and compound index migrations before each release.
  - **Deep Health Probing**: Monitored via `healthCheckPath: /health` to verify database and cache readiness before traffic routing.
  - **Redis Layer**: Seamlessly connects to **Upstash Redis** (`REDIS_URL`) or runs in resilient in-memory fallback mode (`REDIS_URL=false`).

- **Vercel (Frontend React SPA)**:
  - Production build using Vite 8 (`dist/`).
  - Configured via [frontend/vercel.json](frontend/vercel.json) and root [vercel.json](vercel.json).
  - Handles client-side routing with `/(.*) -> /index.html` rewrites, 1-year immutable caching on hashed rollup chunks (`/assets/(.*)`), `no-cache` for `index.html`, and strict security headers.

- **Railway (Alternative 1-Click PaaS)**:
  - Pre-configured with [railway.toml](railway.toml) for Dockerfile-based building.
  - Automatically provisions private Redis networking and monitors `/health`.

- **AWS (ECS Fargate / AWS App Runner)**:
  - Supported natively using the multi-arch production Docker images published by GitHub Actions (`linux/amd64` and `linux/arm64` for Graviton).

### Containerization & Orchestration

- **Docker Multi-Stage Builds**:
  - **Frontend (`frontend/Dockerfile`)**: Multi-stage — `base` (shared deps), `development` (Vite dev server on `5173`), `build` (`npm run build`), and `production` (Nginx Alpine serving `dist/` with gzip and asset caching).
  - **Backend (`backend/Dockerfile`)**: Multi-stage — `base`, `development` (nodemon hot-reload), `test` (full dev dependencies for Jest), and `production` (lean `--omit=dev` with non-root user and `/health` probe).
- **Docker Compose**:
  - **`docker-compose.yml`**: Production stack — backend (`5000`), frontend Nginx (`80`), and Redis 7 Alpine (`6379`) with container health checks and dependencies.
  - **`docker-compose.ci.yml`**: Isolated CI testing container stack with MongoDB and Redis health checks preventing startup race conditions.
  - **`docker-compose.dev.yml`**: Development override with live volume mounts for hot reloading.

### CI/CD Pipeline (GitHub Actions)

- **`.github/workflows/ci.yml`**:
  - Triggers on push and pull requests to `main`.
  - Runs isolated containerized Jest test suites and frontend bundle verification.
  - Uses QEMU v3 and Docker Buildx to build and push multi-arch images (`linux/amd64`, `linux/arm64`) to Docker Hub with GitHub Actions cache.

---

## 📄 License

This project is for internal use at **MITE Mangalore**. All rights reserved.

Created by [Alok Chandra](https://github.com/Alok-Chandra108)
