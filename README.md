# SkillAnchor ⚓

<p align="center">
  <b>The modern hiring platform for skilled and hourly workers.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-000000?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-7.x-FF4438?logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Vitest-4-729B1B?logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://github.com/pulkitjaincs/SkillAnchor/actions/workflows/ci.yml/badge.svg" alt="CI" />
</p>

---

> **[Read the Full Architecture Documentation (ARCHITECTURE.md)](ARCHITECTURE.md)** for a deep dive into our design patterns, auth flow, and state management.

---

## 🛡️ Security

- **Edge Middleware Auth**: Next.js intercepts requests, validating JWTs securely.
- **Strict HttpOnly Cookies**: Total eradication of `localStorage` tokens. JWTs are handled strictly by the browser via `httpOnly`, `secure`, `sameSite=strict` cookies, eliminating XSS token theft vectors.
- **Hardened HTTP Headers**: `helmet` middleware for XSS and clickjacking protection.
- **Distributed Rate Limiting**: Redis-backed request throttling on all authentication/OTP routes, with strict policies for job creation and application submission to prevent automated spam.
- **Exhaustive Schema Validation**: **Zod** validates payloads on **all** API routes before controller execution.
- **Validated Environment Variables**: `env.ts` parses and validates all environment variables at server startup using Zod — the server fails fast with a clear error if any required variable is missing or malformed.
- **NoSQL Injection Guard**: Custom middleware and `express-mongo-sanitize` completely sanitize incoming requests.
- **Secure OTP Generation**: Native `crypto.randomInt` for cryptographically strong verification codes.
- **Centralized Error Handling**: Global error middleware catches Mongoose, Zod, and application errors with consistent responses.

## ⚡ Performance & UX

- **Hybrid Rendering**: Server Components by default, `"use client"` only for interactive leaves — drastically minimizes the JavaScript bundle.
- **React Compiler**: `babel-plugin-react-compiler` automatically memoizes components and hooks, eliminating manual `useMemo`/`useCallback` boilerplate.
- **Fluid UI (120fps Experience)**: System-wide optimization of CSS transitions to use exclusively compositor-friendly properties (`transform`, `opacity`), eliminating layout jank and reflows for a buttery-smooth feel.
- **Hardware Acceleration**: GPU-promoted layers via `will-change` and `translateZ(0)` on high-interaction components like cards and listings.
- **Optimized Transitions**: Page transitions tuned to 300ms with custom cubic-bezier curves for a snappier, responsive interface.
- **List Performance**: **React Virtuoso** for 60fps scrolling on massive datasets with zero jitter during dynamic layout shifts.
- **Image Optimization**: `next/image` for automatic WebP/AVIF compression and CLS prevention.
- **Font Optimization**: `next/font/google` inlines Inter and Plus Jakarta Sans at build time.
- **Route-Level Boundaries**: `loading.tsx`, `error.tsx`, and `not-found.tsx` for graceful suspense and error handling.
- **Intelligent Caching**: **Redis-powered** cache-aside pattern for job listings and user profiles, reducing database load and response times.
- **Scan-Based Cache Invalidation**: Optimized cache invalidation using a robust `async/await` loop with Redis `SCAN` for reliable, non-blocking key deletion.
- **Atomic Data Integrity**: Enforced write correctness across multi-collection operations (job applications, hire events) using **MongoDB Transactions**.
- **Distributed Task Queue**: Hiring events processed via **BullMQ** (Redis-backed), enabling horizontal scaling with at-least-once delivery and exponential-backoff retries.
- **Distributed Rate Limiting**: Redis-backed rate limiting ensures consistent security across multiple server instances with granular control over write-heavy routes.
- **Gzip Compression**: `compression` middleware enabled on the Express server for all API responses.

---

## 🧪 Testing Infrastructure

SkillAnchor employs a comprehensive, parallelized testing suite using **Vitest**.

- **Backend (Node.js/Express):** Full test isolation with dedicated in-memory MongoDB and Redis databases. Features extensive unit tests for service logic and integration tests (via Supertest) for API routes.
- **Frontend (React/Next.js):** JSDOM and React Testing Library integration. Includes deep component testing simulating mock hooks, routing, dynamic imports (`next/dynamic`), and complex authentication states.
- **Code Coverage:** Enforced via V8 coverage reports.

---

## Overview

SkillAnchor is a full-stack recruitment platform purpose-built for the hourly and blue-collar labor market. It connects workers—from skilled tradespeople to part-time students—with employers hiring across hospitality, retail, logistics, construction, and more.

The platform is engineered for **performance**, **scalability**, and a **premium user experience**, featuring hybrid rendering, intelligent caching, and native hardware-accelerated transitions.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Industries Served](#industries-served)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Features

### For Workers

| Feature | Description |
| :--- | :--- |
| **One-Tap Apply** | Apply instantly with a pre-built profile |
| **Profile Wizard** | Multi-step onboarding for skills, experience, and availability |
| **Real-time Tracking** | Monitor application status: Pending → Viewed → Shortlisted → Hired |
| **Verified Badges** | Automatically earn verification badges for completed on-platform contracts |
| **S3 Profile Photos** | Upload and manage profile images via cloud storage |
| **WhatsApp Integration** | Add WhatsApp number for direct employer communication |
| **Work History** | Add/manage work experience with modal-based UI and visibility toggles |
| **Secure Contact** | Phone/email updates require OTP verification |

### For Employers

| Feature | Description |
| :--- | :--- |
| **Job Posting** | Create detailed listings with salary, schedule, skills, and requirements |
| **Applicant Dashboard** | Review candidates with cover notes and full profile access |
| **Status Workflow** | Update applicant status: Pending → Viewed → Shortlisted → Hired → Rejected |
| **My Team** | Premium dashboard to manage active hires with quick-call actions |
| **End Employment** | Conclude contracts seamlessly, auto-updating worker history |
| **Application Counter** | Real-time applicant count per job listing |
| **Manage Listings** | Edit, delete, and track all jobs from one dashboard |

### Platform & UX

| Feature | Description |
| :--- | :--- |
| **Passwordless Auth** | Phone OTP and Email OTP login options |
| **Email OTP Delivery** | OTPs sent via SMTP (Nodemailer) for email-based auth flows |
| **Email + Password** | Traditional auth with forgot-password OTP flow |
| **Dark Mode** | Full dark/light/system theme support |
| **Responsive Design** | Mobile-first, works on all screen sizes |
| **Search System** | Full-text search across title, description, skills, category, city |
| **Search Hero** | Homepage search bar with keyword, location, and category chip filters |
| **Scroll-Linked Navbar** | Search bar morphs into compact navbar version via IntersectionObserver |
| **Trust Badges** | Verified phone/email indicators on profile and settings |

---

## Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript | Framework with hybrid SSR/SSG/ISR rendering |
| **Routing** | File-system App Router (`src/app/`) | Server-side and client-side navigation |
| **Auth** | Edge Middleware (`middleware.ts`) | Route protection before page code is sent |
| **State** | TanStack React Query v5 | Server state, caching, optimistic updates, background sync |
| **Auth State** | Context API | Client-side auth context |
| **Styling** | Bootstrap 5, Custom CSS Variables | Responsive design system with theming |
| **Icons** | Bootstrap Icons, Lucide React | UI iconography |
| **Fonts** | `next/font` (Inter, Plus Jakarta Sans) | Build-time font inlining, no external requests |
| **Images** | `next/image` | Automatic optimization, lazy loading, format negotiation |
| **Rendering** | React Virtuoso | Windowed list virtualization |
| **Animations** | Framer Motion 12 | Page transitions with reduced motion support |
| **Compiler** | React Compiler (`babel-plugin-react-compiler`) | Automatic component memoization |
| **Backend** | Node.js 20, Express 5 | RESTful API server |
| **Database** | MongoDB 8.0, Mongoose 9 | Document storage and ODM |
| **Cache/Store** | Redis 7 | Distributed caching, OTP storage, and rate limiting |
| **Validation** | Zod | Schema-based request and env-var validation |
| **Auth** | JWT, bcrypt, OTP | Stateless authentication |
| **Storage** | AWS S3 | Profile photo storage |
| **Email** | Nodemailer (SMTP) | Transactional OTP email delivery |

---

## Architecture

```
SkillAnchor/
├── client/                      # Next.js 16 App (TypeScript)
│   └── src/
│       ├── app/                 # App Router pages & layouts
│       │   ├── (auth)/          # Login, Register, Forgot Password (SSG)
│       │   ├── (employer)/      # My Jobs, My Team (SSR, protected)
│       │   ├── (worker)/        # My Applications (SSR, protected)
│       │   ├── edit-job/[id]/   # Edit Job (SSR, protected)
│       │   ├── jobs/[id]/       # Job Detail (ISR), Applicants (SSR)
│       │   ├── post-job/        # Post Job (SSR, protected)
│       │   ├── profile/         # Profile, Edit, Settings (SSR)
│       │   ├── layout.tsx       # Root layout (fonts, Navbar, Footer)
│       │   ├── page.tsx         # Home page (SSG)
│       │   ├── error.tsx        # Global error boundary
│       │   ├── loading.tsx      # Global loading state
│       │   └── not-found.tsx    # 404 page
│       ├── components/
│       │   ├── common/          # Card, Listing, SearchHero, FormComponents, ApplyModal
│       │   ├── layout/          # Navbar, Footer
│       │   ├── modals/          # ApplicationDetailModal, WorkExperienceModal
│       │   ├── profile/         # ProfileHeader, SkillsSection, WorkHistory, Sidebar
│       │   ├── profile-edit/    # Edit profile step components
│       │   └── settings/        # PasswordCard, ContactDetailsCard
│       ├── constants/           # Job categories
│       ├── context/             # AuthContext (client-side auth)
│       ├── hooks/
│       │   ├── queries/         # React Query hooks (useInfiniteJobs, useProfile, useApplications)
│       │   ├── ui/              # useLogin, useRegister
│       │   └── index.ts         # useForm, useDebounce
│       ├── lib/                 # Axios API client (api.ts)
│       ├── providers/           # QueryClient + Auth provider wrapper
│       ├── types/               # Shared TypeScript interfaces (Job, User, Company)
│       └── utils/               # formatDate, formatSalary, timeAgo helpers
│
└── server/                      # Express API (TypeScript)
     └── src/
        ├── controllers/         # Route handlers (thin, wrapped with asyncHandler)
        ├── services/            # Business logic (auth, profile services)
        ├── models/              # Mongoose schemas with compound indexes
        ├── routes/              # API endpoints with Zod validation
        ├── middleware/          # Auth guards, Zod validation, NoSQL sanitize
        ├── queues/              # BullMQ Producers & Workers (e.g., hired-worker)
        ├── utils/               # asyncHandler, generateToken, cache, email
        ├── types/               # Shared TypeScript types (AppError)
        └── config/              # db, redis, s3, env (Zod-validated)

```

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** v6+ (local or Atlas)
- **Redis** v7+ (local or managed, e.g., Upstash)
- **AWS S3 Bucket** *(optional, for profile photos)*
- **SMTP Server** *(optional, for email OTP delivery)*

### Installation

```bash
# Clone
git clone https://github.com/pulkitjaincs/SkillAnchor.git
cd SkillAnchor

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### Environment Setup

Create `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Create `server/.env`:
```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017/SkillAnchorDB

# Authentication
JWT_SECRET=your_jwt_secret_key_min_32_chars

# Redis (required for caching, OTP, and rate limiting)
REDIS_URL=redis://localhost:6379

# AWS S3 (Optional — for profile photos)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your_bucket_name

# SMTP Email (Optional — for email OTP delivery)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

> **Note:** The server validates all environment variables at startup using Zod. Missing or invalid values will cause the process to exit immediately with a descriptive error.

### Run Locally

```bash
# Client (Next.js dev server)
cd client && npm run dev      # → http://localhost:3000

# Server (Express API)
cd server && npm run dev      # → http://localhost:5000
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/v1/auth/send-otp` | Send OTP to phone or email |
| POST | `/api/v1/auth/verify-otp` | Verify OTP and authenticate |
| POST | `/api/v1/auth/register` | Register with email |
| POST | `/api/v1/auth/login` | Login with email + password |
| POST | `/api/v1/auth/forgot-password` | Initiate password reset |
| POST | `/api/v1/auth/reset-password` | Reset password with OTP |
| POST | `/api/v1/auth/logout` | Logout and clear session |
| POST | `/api/v1/auth/update-password` | Change password (authenticated) |
| POST | `/api/v1/auth/send-update-otp` | OTP for contact update |
| POST | `/api/v1/auth/verify-update-otp` | Verify and update contact |

### Worker Profile

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/v1/profile/my-profile` | Get current user's profile |
| GET | `/api/v1/profile/user/:userId` | Get profile by user ID |
| PUT | `/api/v1/profile/my-profile` | Update profile |
| POST | `/api/v1/profile/upload-avatar` | Upload profile photo to S3 |

### Jobs

| Method | Endpoint | Auth |
| :--- | :--- | :--- |
| GET | `/api/v1/jobs` | Public |
| GET | `/api/v1/jobs/:id` | Public |
| POST | `/api/v1/jobs` | Employer |
| PUT | `/api/v1/jobs/:id` | Employer |
| DELETE | `/api/v1/jobs/:id` | Employer |

### Applications

| Method | Endpoint | Auth |
| :--- | :--- | :--- |
| POST | `/api/v1/applications/apply/:jobId` | Worker |
| GET | `/api/v1/applications/my-applications` | Worker |
| GET | `/api/v1/applications/job/:jobId` | Employer |
| PATCH | `/api/v1/applications/:id/status` | Employer |
| DELETE | `/api/v1/applications/:id` | Worker |

---

## Data Models

| Model | Purpose |
| :--- | :--- |
| **User** | Authentication, role (worker/employer), verified contact info |
| **Job** | Title, description, salary range, location, schedule, skills, category |
| **Application** | Links worker to job, tracks status lifecycle |
| **WorkerProfile** | Skills, availability, bio, education, avatar |
| **EmployerProfile** | Company association, business details |
| **Company** | Name, logo, description |
| **WorkExperience** | Employment history with verified/unverified status |
| **SavedJob** | Bookmarked job listings per worker |

---

## Industries Served

| Category | Example Roles |
| :--- | :--- |
| **Food & Hospitality** | Server, Barista, Cook, Dishwasher, Host |
| **Retail** | Cashier, Stock Clerk, Sales Associate |
| **Logistics & Delivery** | Driver, Courier, Warehouse Associate, Packer |
| **Construction & Trades** | Electrician, Plumber, Carpenter, Painter, Welder |
| **Cleaning & Maintenance** | Janitor, Housekeeper, Groundskeeper |
| **Events & Promotions** | Event Staff, Brand Ambassador, Usher |
| **Healthcare Support** | Caregiver, Home Health Aide, Medical Assistant |

---

## Roadmap

- [x] Next.js App Router migration (from Vite SPA)
- [x] TypeScript across entire frontend
- [x] Edge Middleware authentication
- [x] Hybrid rendering (SSG / ISR / SSR per route)
- [x] `next/image` and `next/font` optimizations
- [x] Global error/loading/not-found boundaries
- [x] Premium UI redesign (Edit Profile, Settings, Navbar)
- [x] Profile photo uploads with AWS S3
- [x] Multi-step profile wizard with completion tracking
- [x] Secure contact verification (OTP-based updates)
- [x] Work Experience system with auto-verification on hire
- [x] Employer Team Management dashboard
- [x] Enhanced full-text search with relevance ranking
- [x] Performance: Virtualization, React Query, Lazy Loading
- [x] Cursor-based Pagination for all lists
- [x] Optimistic UI Updates (Apply/Withdraw/Hire)
- [x] MongoDB Aggregation Pipelines for Profile Joins
- [x] Zod validation on all API routes
- [x] Component modularization and shared types
- [x] **Redis Integration**: Distributed caching, rate limiting, and OTP migration
- [x] **Strict HttpOnly Cookie Auth**: Migration from insecure client-side tokens
- [x] **TypeScript Hardening**: Elimination of `any` and strict API typing
- [x] **Zero-Warning Linting**: Strict ESLint compliance enforcing React Hooks rules and Next.js optimization primitives across the entire client application
- [x] **Full-Stack Test Suite**: Vitest, Supertest, RTL, and JSDOM coverage
- [x] **Server Code Audit & Hardening**: Fixed type safety issues, Mongoose query filters, and API response consistency
- [x] **Zod Env Validation**: Startup-time environment variable parsing with descriptive failure messages
- [x] **Email OTP Delivery**: SMTP-based transactional email via Nodemailer
- [x] **React Compiler**: Automatic component memoization via `babel-plugin-react-compiler`
- [x] **Event-Driven Scaling**: **BullMQ** (backed by Redis) decouples hire events from controller logic for horizontal scalability
- [x] **MongoDB Transactions**: Atomic multi-document writes for job applications and hire-event processing
- [x] **Robust Rate Limiting**: Centralized Redis-backed throttling with strict policies for write-heavy routes
- [x] **Optimized Cache Invalidation**: Reliable `async/await` scanning for non-blocking cache clearing
- [x] **Structured Logging**: High-performance JSON logging with **Pino** and **Pino-HTTP**
- [x] **Request Correlation**: System-wide traceability via unique `x-request-id` headers and log markers
- [x] **API Versioning**: Standardized `/api/v1` routing across backend and frontend
- [x] **Graceful Shutdown**: Clean resource release (MongoDB, Redis, BullMQ) on server termination
- [x] **CI Pipeline**: GitHub Actions workflow for automated testing, linting, and type-checking
- [ ] Shift-based scheduling with calendar view
- [ ] Real-time in-app messaging (Socket.io)
- [ ] Push notifications
- [ ] Worker ratings and reviews
- [ ] Multi-language support
- [ ] Document-based identity verification
- [ ] PWA support (offline + installability)

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<p align="center">
  <strong>SkillAnchor</strong> — Work, simplified.
</p>
