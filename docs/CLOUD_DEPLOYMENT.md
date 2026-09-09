# CPMS Cloud Deployment & Multi-Platform Guide

Comprehensive deployment reference for the **Campus Placement Management System (CPMS)** across **Render**, **Vercel**, **Upstash Redis**, **Railway**, **AWS**, and self-hosted **Docker Compose**.

---

## Architecture Overview

```
                          ┌─────────────────────────────┐
                          │       Vercel (Frontend)     │
                          │   React 19 + Vite SPA       │
                          │   https://cpms.vercel.app   │
                          └──────────────┬──────────────┘
                                         │ HTTPS / Credentials (Cookies)
                                         ▼
                          ┌─────────────────────────────┐
                          │       Render (Backend)      │
                          │   Node.js 20 Express API    │
                          │   https://api.yourdomain    │
                          └──────┬───────────────┬──────┘
                                 │               │
                 Mongoose / Pool │               │ Redis Protocol (TLS)
                                 ▼               ▼
         ┌─────────────────────────────┐   ┌─────────────────────────────┐
         │     MongoDB Atlas (M0/M10)  │   │     Upstash Redis (Free)    │
         │   Database & Schema Indexes │   │   Cache, Queue & Limiter    │
         └─────────────────────────────┘   └─────────────────────────────┘
```

---

## 1. Render Deployment (Backend API)

The backend is configured as a native Node.js web service managed via `render.yaml` or directly through the Render Dashboard.

### Setup Steps
1. **Connect GitHub Repository**: In Render Dashboard, click **New +** $\rightarrow$ **Blueprint** and select your repository (it will automatically detect `render.yaml`).
2. **Environment Variables**: Configure the following in the Render Dashboard:

| Variable | Type | Example / Value | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | `production` | Enables production optimisations |
| `PORT` | Number | `5000` | Port served by Express |
| `MONGO_URI` | Secret | `mongodb+srv://user:pass@cluster.mongodb.net/cpms?appName=CPMS` | MongoDB connection string |
| `REDIS_URL` | Secret | `rediss://default:token@...upstash.io:6379` *(or `false`)* | Upstash Redis connection string |
| `JWT_ACCESS_SECRET` | Secret | `64-character-hex-random-string` | Access token JWT secret |
| `JWT_REFRESH_SECRET` | Secret | `different-64-char-hex-string` | Refresh token JWT secret |
| `FRONTEND_URL` | String | `https://cpms.vercel.app` | Allowed CORS origins (HTTPS only) |
| `BREVO_API_KEY` | Secret | `xkeysib-...` | Brevo transactional email key |
| `BREVO_SENDER_EMAIL`| String | `placements@mite.ac.in` | Verified Brevo sender email |
| `CLOUDINARY_CLOUD_NAME`| String| `your-cloud-name` | Cloudinary storage name |
| `CLOUDINARY_API_KEY`| String | `123456789` | Cloudinary API key |
| `CLOUDINARY_API_SECRET`| Secret| `your-api-secret` | Cloudinary secret |

### Built-in Automated Features
- **Database Migrations**: Configured with `preDeployCommand: npm run migrate:up`. Before every deployment goes live, Render automatically applies any pending MongoDB compound index migrations.
- **Deep Health Probing**: Configured with `healthCheckPath: /health`. Render tests both MongoDB connection and Redis ping before routing traffic to a newly deployed worker.

---

## 2. Upstash Redis Integration (Free Tier)

CPMS uses Redis for three features:
1. **Cache-aside** for active job drives and institutional notices (sub-millisecond loads).
2. **Distributed Rate Limiting** for campus Wi-Fi / shared IP protection.
3. **Asynchronous Email Queue** for non-blocking batch notification dispatches.

### How to Provision Free Upstash Redis
1. Visit [console.upstash.com](https://console.upstash.com/) and create a free account.
2. Click **Create Database**:
   - **Name**: `cpms-redis`
   - **Type**: Regional
   - **Primary Region**: Select the same region as your Render backend (e.g., `AWS - eu-west-1` or `AWS - ap-southeast-1` or `AWS - us-east-1`).
   - **Eviction**: Enabled (e.g. `allkeys-lru`).
3. Under the **Details** tab, locate **Connect to your database** $\rightarrow$ select **Node.js** or **ioredis** and copy the `rediss://...` connection string.
4. Add it to Render Environment Variables:
   ```env
   REDIS_URL=rediss://default:YOUR_TOKEN@YOUR_HOST.upstash.io:6379
   ```

### Resilient Fallback Mode (Running Without Redis)
If you prefer not to use Redis, simply set:
```env
REDIS_URL=false
```
The CPMS backend is programmed to detect this and gracefully fall back to:
- Direct indexed MongoDB queries (taking only ~2–5 ms).
- In-memory rate limiting with user ID keying.
- In-memory email queuing.

---

## 3. Vercel Deployment (Frontend React SPA)

The frontend is a React 19 + Vite Single Page Application configured with code splitting and client-side routing.

### Setup Steps
1. In Vercel, click **Add New...** $\rightarrow$ **Project** and import your Git repository.
2. **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (or leave default if using root `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   ```env
   VITE_API_BASE_URL=https://your-backend-domain.onrender.com/api/v1
   VITE_COLLEGE_DOMAIN=mite.ac.in
   VITE_COLLEGE_NAME="Mangalore Institute of Technology & Engineering"
   ```
4. Click **Deploy**.

### Routing and Caching Rules
- The repository includes [frontend/vercel.json](file:///c:/Users/Alok%20Chandra/cpms-mini-project/frontend/vercel.json) and a root [vercel.json](file:///c:/Users/Alok%20Chandra/cpms-mini-project/vercel.json).
- Rewrites all paths `/(.*)` to `/index.html` to ensure that refreshing pages like `/student/drives` does not result in 404 errors.
- Sets immutable 1-year browser caching on rollup chunks (`/assets/(.*)`).
- Sets `no-cache` on `index.html` so new deployments are fetched immediately by clients.

---

## 4. Railway Deployment (Alternative PaaS)

Railway allows one-click full-stack deployment with integrated Redis.

### Deploying to Railway
1. Install the Railway CLI or link via [railway.app](https://railway.app/).
2. The project contains a pre-configured [railway.toml](file:///c:/Users/Alok%20Chandra/cpms-mini-project/railway.toml).
3. In Railway Dashboard:
   - Click **+ New** $\rightarrow$ **Database** $\rightarrow$ **Add Redis**.
   - Click **+ New** $\rightarrow$ **GitHub Repo** $\rightarrow$ Select `cpms-mini-project`.
   - Under backend service variables, reference Railway's internal Redis:
     ```env
     REDIS_URL=${{Redis.REDIS_URL}}
     ```
   - Railway will automatically run `npm run migrate:up` and monitor `/health`.

---

## 5. AWS Deployment (ECS Fargate / App Runner)

For enterprise high-availability AWS hosting:

### Using GitHub Actions Multi-Arch Docker Builds
The workflow in `.github/workflows/ci.yml` builds and pushes multi-platform Docker images to Docker Hub:
- `linux/amd64` (Standard x86 Intel/AMD instances)
- `linux/arm64` (AWS Graviton2 / Graviton3 instances, reducing compute cost by ~20%)

### Deploying on AWS App Runner
1. Create an **App Runner Service** using **Container registry**.
2. Point image URI to `your-dockerhub-username/cpms-backend:latest`.
3. Set Port to `5000`.
4. Configure Health Check:
   - **Protocol**: `HTTP`
   - **Path**: `/health`
   - **Interval**: 20s, **Timeout**: 5s, **Healthy threshold**: 2
5. Enter environment variables matching your MongoDB Atlas and Upstash / ElastiCache Redis endpoints.

---

## 6. Self-Hosted Docker Compose (VPS / Linux Server)

For hosting on a cloud VM (e.g. AWS EC2, DigitalOcean Droplet, Hetzner):

### Steps
1. Clone the repository on the server:
   ```bash
   git clone https://github.com/Alok-Chandra108/Placement-management-system.git
   cd Placement-management-system
   ```
2. Create `backend/.env` with your production variables:
   ```bash
   cp backend/.env.production.example backend/.env
   # Edit with your secrets and credentials
   ```
3. Run migrations:
   ```bash
   cd backend && npm run migrate:up && cd ..
   ```
4. Launch the stack:
   ```bash
   docker compose -f docker-compose.yml up -d --build
   ```
5. Check status:
   ```bash
   docker compose ps
   curl -i http://localhost:5000/health
   ```
