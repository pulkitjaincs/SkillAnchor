# SkillAnchor ⚓

<p align="center">
  <b>The modern hiring platform for skilled and hourly workers.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/AWS_S3-Storage-FF9900?logo=amazonaws&logoColor=white" alt="AWS S3" />
</p>

---

## 🛡️ Security

- **Edge Middleware Auth**: Next.js `middleware.ts` intercepts requests at the edge, validating JWT cookies before the page is rendered.
- **Hardened HTTP Headers**: `helmet` middleware for XSS and clickjacking protection.
- **Rate Limiting**: `express-rate-limit` to prevent brute-force attacks.
- **Request Validation**: **Zod** schema validation on **all** API routes (auth, jobs, applications, profile, work experience).
- **NoSQL Injection Guard**: Custom sanitization middleware on all incoming data.
- **Secure OTP Generation**: Native `crypto.randomInt` for cryptographically strong verification codes.
- **Centralized Error Handling**: Global error middleware catches Mongoose, Zod, and application errors with consistent responses.

## ⚡ Performance & UX

- **Hybrid Rendering**: Server Components by default, `"use client"` only for interactive leaves — drastically minimizes the JavaScript bundle.
- **Image Optimization**: `next/image` for automatic WebP/AVIF compression, lazy-loading, and CLS prevention.
- **Font Optimization**: `next/font/google` inlines Inter and Plus Jakarta Sans at build time — zero external requests, instant text rendering.
- **Database Optimization**: Compound indexes, `.lean()` on all reads, field projections, **Cursor-based Pagination** on all list endpoints, and **Aggregation Pipelines** for optimized profile joins.
- **Data Synchronization**: **Optimistic UI Updates** via React Query for instantaneous feedback on applications and team management.
- **List Performance**: **React Virtuoso** for 60fps scrolling on massive datasets (My Jobs, My Team, Applicants).
- **Component Memoization**: `React.memo` and `useCallback` on reusable components to prevent unnecessary re-renders.
- **Route-Level Boundaries**: `loading.tsx`, `error.tsx`, and `not-found.tsx` for graceful suspense, errors, and 404 states.

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
| **State** | TanStack React Query | Server state, caching, optimistic updates, background sync |
| **Auth State** | Context API | Client-side auth context |
| **Styling** | Bootstrap 5, Custom CSS Variables | Responsive design system with theming |
| **Fonts** | `next/font` (Inter, Plus Jakarta Sans) | Build-time font inlining, no external requests |
| **Images** | `next/image` | Automatic optimization, lazy loading, format negotiation |
| **Rendering** | React Virtuoso | Windowed list virtualization |
| **Animations** | Framer Motion | Page transitions with reduced motion support |
| **Backend** | Node.js 20, Express 5 | RESTful API server |
| **Database** | MongoDB 8.0, Mongoose 9 | Document storage and ODM |
| **Validation** | Zod 4 | Schema-based request validation on all routes |
| **Auth** | JWT, bcrypt, OTP | Stateless authentication |
| **Storage** | AWS S3 | Profile photo storage |

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
├── server/                      # Express API
     └── src/
        ├── controllers/         # Route handlers (thin, wrapped with asyncHandler)
        ├── services/            # Business logic (auth, profile services)
        ├── models/              # Mongoose schemas with compound indexes
        ├── routes/              # API endpoints with Zod validation
        ├── middleware/          # Auth guards, validation, uploads
        ├── utils/               # asyncHandler, generateToken
        └── config/              # Database, S3, environment config

```

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** v6+ (local or Atlas)
- **AWS S3 Bucket** *(optional, for profile photos)*

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
JWT_SECRET=your_jwt_secret_key

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your_bucket_name
```

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
| POST | `/api/auth/send-otp` | Send OTP to phone or email |
| POST | `/api/auth/verify-otp` | Verify OTP and authenticate |
| POST | `/api/auth/register` | Register with email |
| POST | `/api/auth/login` | Login with email + password |
| POST | `/api/auth/forgot-password` | Initiate password reset |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| POST | `/api/auth/logout` | Logout and clear session |
| POST | `/api/auth/update-password` | Change password (authenticated) |
| POST | `/api/auth/send-update-otp` | OTP for contact update |
| POST | `/api/auth/verify-update-otp` | Verify and update contact |

### Worker Profile

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/profile/my-profile` | Get current user's profile |
| GET | `/api/profile/user/:userId` | Get profile by user ID |
| PUT | `/api/profile/my-profile` | Update profile |
| POST | `/api/profile/upload-avatar` | Upload profile photo to S3 |

### Jobs

| Method | Endpoint | Auth |
| :--- | :--- | :--- |
| GET | `/api/jobs` | Public |
| GET | `/api/jobs/:id` | Public |
| POST | `/api/jobs` | Employer |
| PUT | `/api/jobs/:id` | Employer |
| DELETE | `/api/jobs/:id` | Employer |

### Applications

| Method | Endpoint | Auth |
| :--- | :--- | :--- |
| POST | `/api/applications/apply/:jobId` | Worker |
| GET | `/api/applications/my-applications` | Worker |
| GET | `/api/applications/job/:jobId` | Employer |
| PATCH | `/api/applications/:id/status` | Employer |
| DELETE | `/api/applications/:id` | Worker |

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
