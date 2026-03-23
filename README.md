# SkillAnchor ⚓

A full-stack job portal purpose-built for India's blue-collar and hourly workforce. SkillAnchor connects skilled tradespeople, service industry workers, and daily-wage labourers with verified employers through a modern, mobile-first experience — featuring OTP-based passwordless auth, real-time application tracking, employer-verified work history, and a premium UI with dark-mode support.

> **Architecture Deep-Dive →** [ARCHITECTURE.md](ARCHITECTURE.md) — system design, data flow, security model, and key trade-offs explained in detail.

---

## Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Prerequisites](#-prerequisites)
- [Environment Setup](#-environment-setup)
- [Installation](#-installation)
- [Running Locally](#-running-locally)
- [Testing & Code Quality](#-testing--code-quality)
- [CI / CD](#-ci--cd)
- [API Overview](#-api-overview)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Key Features

### For Workers
| Feature | Description |
|---|---|
| **Quick Apply** | One-tap job applications with optional cover notes |
| **Rich Profile** | Skills, languages, bio, work history, expected salary, and S3-hosted avatar |
| **Application Tracking** | Real-time status pipeline: `Pending → Viewed → Shortlisted → Hired` |
| **Verified Work History** | Employer-verified experience entries with ratings and reviews |
| **Document Management** | Aadhaar, PAN, and driving license storage with verification tracking |
| **Secure Contact Updates** | OTP-verified modifications to email and phone number |

### For Employers
| Feature | Description |
|---|---|
| **Job Management** | Create, edit, pause, and close listings with category, shift, and salary details |
| **Applicant Dashboard** | Review candidates, view full profiles, and advance application status |
| **My Team** | Dedicated dashboard for managing currently active hires |
| **End-to-End Hiring** | Processing a hire automatically creates a verified work-experience entry for the worker via a background job |
| **Company Profiles** | Multi-location company entities with GSTIN and industry details |

### Platform-Wide
| Feature | Description |
|---|---|
| **Dual Auth Modes** | Phone/Email OTP (passwordless) alongside traditional Email + Password |
| **Full-Text Search** | MongoDB text indexes across title, description, skills, category, and location |
| **Dark Mode** | System-aware light/dark theming with smooth CSS transitions |
| **Premium UI** | Hardware-accelerated Framer Motion animations, scroll-linked navigation, and responsive design |
| **Virtualized Lists** | React Virtuoso for fluid 60 FPS scrolling on large result sets |
| **Structured Logging** | Pino JSON logging with request IDs and per-request HTTP tracing |

---

## 🛠️ Tech Stack

### Frontend (`client/`)

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router) with **React 19** |
| Language | TypeScript 5 |
| State Management | TanStack React Query v5, React Context API |
| Styling | Tailwind CSS v4, Bootstrap 5, CSS Modules |
| Animations | Framer Motion 12 |
| Performance | React Compiler (auto-memoization), React Virtuoso, `next/image`, `next/font` |
| Icons | Bootstrap Icons, Lucide React |
| HTTP Client | Axios (with interceptors for 401 auto-logout) |
| Testing | Vitest 4, React Testing Library, jsdom |

### Backend (`server/`)

| Layer | Technology |
|---|---|
| Runtime | **Node.js 20+**, **Express 5** |
| Language | TypeScript 5 (ESM) |
| Database | MongoDB 8.0, Mongoose 9 |
| Caching & Queues | Redis 7 (ioredis), BullMQ 5 |
| Validation | Zod 4 (request payloads + environment variables) |
| Authentication | JWT (HttpOnly cookies), bcrypt, OTP via Nodemailer |
| File Storage | AWS S3 (pre-signed URLs for direct client uploads) |
| Security | Helmet, CORS, NoSQL injection sanitization, Redis-backed rate limiting |
| Logging | Pino + pino-http (structured JSON with request IDs) |
| Testing | Vitest 4, Supertest, mongodb-memory-server (in-memory replica set) |

---

## 📁 Repository Structure

```
SkillAnchor/
├── .github/workflows/ci.yml      # GitHub Actions CI pipeline
├── client/                        # Next.js frontend application
│   ├── src/
│   │   ├── app/                   # App Router pages & layouts
│   │   │   ├── (auth)/            # Login, Register, Forgot Password
│   │   │   ├── (employer)/        # My Jobs, My Team
│   │   │   ├── (worker)/          # My Applications
│   │   │   ├── jobs/[id]/         # Job detail page
│   │   │   ├── post-job/          # Job creation form
│   │   │   ├── edit-job/          # Job editing form
│   │   │   └── profile/           # Profile view, edit, settings
│   │   ├── components/            # Reusable UI (common, layout, modals, profile)
│   │   ├── hooks/                 # Custom hooks
│   │   │   ├── queries/           # React Query hooks (jobs, applications, profile)
│   │   │   └── ui/                # Auth flow hooks (useLogin, useRegister)
│   │   ├── context/               # AuthContext (global user state)
│   │   ├── providers/             # QueryClient + AuthProvider composition
│   │   ├── lib/                   # Axios instance & API client modules
│   │   ├── types/                 # TypeScript interfaces & API response types
│   │   ├── constants/             # Job categories & static data
│   │   ├── utils/                 # Utility functions (formatting, S3 helpers)
│   │   └── tests/                 # Component, hook, and utility tests
│   ├── vitest.config.ts
│   ├── next.config.ts
│   └── package.json
├── server/                        # Express API backend
│   ├── src/
│   │   ├── app.ts                 # Express app setup & middleware pipeline
│   │   ├── server.ts              # Server entry point with graceful shutdown
│   │   ├── config/                # db, redis, s3, env (Zod), rateLimiter
│   │   ├── routes/                # API route definitions (6 modules)
│   │   ├── controllers/           # Request handlers (5 modules)
│   │   ├── services/              # Business logic (auth, profile)
│   │   ├── models/                # Mongoose schemas (8 models)
│   │   ├── middleware/            # auth, validate, sanitize, requestId
│   │   ├── queues/                # BullMQ workers (hired pipeline)
│   │   ├── types/                 # TypeScript interfaces & Express augmentation
│   │   ├── utils/                 # asyncHandler, cache, email, logger, token
│   │   └── tests/                 # Integration & unit tests (15 suites)
│   ├── vitest.config.js
│   └── package.json
└── package.json                   # Root-level scripts (install:all, dev, lint)
```

---

## ⚙️ Prerequisites

Ensure the following are installed and running:

| Dependency | Version | Notes |
|---|---|---|
| **Node.js** | 20+ | LTS recommended |
| **MongoDB** | 7+ | Must run as a **Replica Set** for transaction support |
| **Redis** | 7+ | Used for rate limiting, caching, and BullMQ |
| **AWS S3 Bucket** | — | _Optional_ — needed for avatar/media uploads |
| **SMTP Server** | — | _Optional_ — needed for email OTP delivery |

> **Note:** MongoDB must run as a replica set for transaction support. **MongoDB Atlas (all tiers, including M0 free) provisions a replica set automatically** — no extra configuration needed. For local development, either run `mongod --replSet rs0` or use [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server) (included as a dev dependency for tests).

---

## 🔐 Environment Setup

### Client — `client/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Server — `server/.env`

```env
# ── Core (Required) ──────────────────────────────
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/SkillAnchorDB
JWT_SECRET=your_super_secret_jwt_key_must_be_32_chars_min
REDIS_URL=redis://localhost:6379

# ── AWS S3 (Optional — for file uploads) ─────────
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your_bucket_name

# ── SMTP (Optional — for email OTPs) ─────────────
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

> Environment variables are validated at startup using Zod. The server will **exit immediately** with descriptive errors if required variables are missing.

---

## 🚀 Installation

```bash
# 1. Clone the repository
git clone https://github.com/pulkitjaincs/SkillAnchor.git
cd SkillAnchor

# 2. Install all dependencies (root + client + server)
npm run install:all
```

---

## 🏃 Running Locally

Start both servers in **separate terminals**:

```bash
# Terminal 1 — Backend API (http://localhost:5000)
npm run dev:server

# Terminal 2 — Frontend App (http://localhost:3000)
npm run dev:client
```

| Script | Description |
|---|---|
| `npm run dev:server` | Starts the Express server with `tsx watch` (hot reload) |
| `npm run dev:client` | Starts the Next.js dev server |
| `npm run build` | Builds the Next.js client for production |
| `npm run lint` | Runs ESLint on the client |

---

## 🧪 Testing & Code Quality

SkillAnchor uses **Vitest** across both packages with enforced coverage thresholds.

### Running Tests

```bash
# Server — integration & unit tests (sequential, uses in-memory MongoDB)
cd server && npm run test

# Client — component, hook, and utility tests
cd client && npm run test

# Coverage reports (HTML + JSON + text)
cd server && npm run test:coverage
cd client && npm run test:coverage

# Vitest interactive UI (server only)
cd server && npm run test:ui
```

### Coverage Thresholds

| Package | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| **Server** | 80% | 70% | 80% | 80% |
| **Client** | 70% | 60% | 69% | 70% |

### Test Infrastructure

- **Server:** Supertest for HTTP-level integration tests, `mongodb-memory-server` for an isolated in-memory replica set — zero database pollution.
- **Client:** React Testing Library + jsdom environment, `@testing-library/user-event` for realistic interaction simulation.

### Linting

```bash
# Client (from root)
npm run lint

# Server
cd server && npm run lint
```

---

## 🔄 CI / CD

GitHub Actions runs on every push to `main` and on PRs targeting `main`:

| Job | Steps |
|---|---|
| **Backend** | `npm ci` → TypeScript type-check → ESLint → Test with coverage (with Redis 7 + MongoDB 7 service containers) |
| **Frontend** | `npm ci` → ESLint → TypeScript type-check → Test with coverage |

Configuration: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

---

## 📡 API Overview

All endpoints are prefixed with `/api/v1`. Responses follow a consistent JSON envelope:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "..." }
```

### Endpoints

| Module | Method | Endpoint | Auth | Role |
|---|---|---|---|---|
| **Health** | `GET` | `/health` | — | — |
| **Auth** | `POST` | `/auth/register` | — | — |
| | `POST` | `/auth/login` | — | — |
| | `POST` | `/auth/send-otp` | — | — |
| | `POST` | `/auth/verify-otp` | — | — |
| | `POST` | `/auth/forgot-password` | — | — |
| | `POST` | `/auth/reset-password` | — | — |
| | `POST` | `/auth/logout` | — | — |
| | `GET` | `/auth/get-me` | ✅ | — |
| | `POST` | `/auth/update-password` | ✅ | — |
| | `POST` | `/auth/send-update-otp` | ✅ | — |
| | `POST` | `/auth/verify-update-otp` | ✅ | — |
| **Jobs** | `GET` | `/jobs` | — | — |
| | `GET` | `/jobs/:id` | — | — |
| | `GET` | `/jobs/my-jobs` | ✅ | Employer |
| | `POST` | `/jobs` | ✅ | Employer |
| | `PUT` | `/jobs/:id` | ✅ | Employer |
| | `DELETE` | `/jobs/:id` | ✅ | Employer |
| **Applications** | `POST` | `/applications/apply/:jobId` | ✅ | Worker |
| | `GET` | `/applications/my-applications` | ✅ | Worker |
| | `GET` | `/applications/job/:jobId` | ✅ | Employer |
| | `PATCH` | `/applications/:id/status` | ✅ | Employer |
| | `DELETE` | `/applications/:id` | ✅ | Worker |
| **Profile** | `GET` | `/profile/my-profile` | ✅ | — |
| | `PUT` | `/profile/my-profile` | ✅ | — |
| | `PATCH` | `/profile/update-avatar-url` | ✅ | — |
| | `GET` | `/profile/user/:userId` | ✅ | — |
| | `GET` | `/profile/my-team` | ✅ | Employer |
| **Work Exp** | `GET` | `/work-experience/user/:userId` | — | — |
| | `POST` | `/work-experience` | ✅ | Worker |
| | `PUT` | `/work-experience/:id` | ✅ | Worker |
| | `DELETE` | `/work-experience/:id` | ✅ | Worker |
| | `PATCH` | `/work-experience/:id/end` | ✅ | — |
| | `PATCH` | `/work-experience/:id/toggle-visibility` | ✅ | Worker |
| **Upload** | `GET` | `/upload/pre-signed-url` | ✅ | — |

---

## 🤝 Contributing

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes logically: `git commit -m 'Add awesome feature'`
4. Ensure all tests pass and coverage thresholds are met
5. Push to the branch: `git push origin feature/your-feature`
6. Open a **Pull Request** — CI must pass before merge

### Code Standards
- TypeScript strict mode across both packages
- Zod schemas for all API request validation
- Service layer pattern — business logic in `services/`; controllers are thin HTTP adapters
- Auth utilities centralized in `utils/auth.ts` (`generateToken`, `setAuthCookie`)
- ESLint enforced on both client and server
- Minimum coverage thresholds enforced in CI

