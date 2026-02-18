# SkillAnchor ⚓

<p align="center">
  <b>The modern hiring platform for skilled and hourly workers.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/AWS_S3-Storage-FF9900?logo=amazonaws&logoColor=white" alt="AWS S3" />
</p>

---

## 🛡️ Recent Security Enhancements

- **Hardened HTTP Headers**: Integrated `helmet` middleware for protection against XSS and clickjacking.
- **Rate Limiting**: Added `express-rate-limit` to prevent brute-force attacks on API endpoints.
- **Request Validation**: Implemented strict schema-based input validation using **Zod**.
- **NoSQL Injection Guard**: Added custom middleware to sanitize all incoming user data.

## ⚡ Performance & UX Upgrades

- **Database Optimization**: Added compound indexes for complex queries (e.g., sort by date within groups).
- **Smooth Navigation**: Integrated **Framer Motion** for seamless page transitions.
- **Build Efficiency**: Configured Vite manual chunks for better caching.
- **SEO & Accessibility**: Added comprehensive meta tags and improved semantic structure.

---

## Overview

SkillAnchor is a full-stack recruitment platform purpose-built for the hourly and blue-collar labor market. It connects workers—from skilled tradespeople to part-time students—with employers hiring across hospitality, retail, logistics, construction, and more.

The platform is engineered for **performance**, **scalability**, and a **premium user experience**, featuring virtualized rendering, intelligent caching, and native hardware-accelerated transitions.

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
| **Save Jobs** | Bookmark listings for later review |
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
| **Standardized Categories** | Centralized category system across posting, editing, and filtering |

### Performance & Optimization

| Optimization | Impact |
| :--- | :--- |
| **List Virtualization** | `react-virtuoso` renders only visible DOM nodes. Supports **10,000+ listings at 120fps** |
| **React Query** | `@tanstack/react-query` provides aggressive caching, background refetching, and optimistic updates |
| **View Transitions API** | Native hardware-accelerated **150ms** theme transitions via `document.startViewTransition()` |
| **Route-Level Splitting** | `React.lazy()` for all pages reduces initial bundle size by ~40% |
| **Component Lazy Loading** | Heavy sub-components (Modals, Listing, Forms) loaded on demand |
| **Backend `.lean()`** | Mongoose `.lean()` + field projection on all read-heavy queries |
| **Gzip Compression** | `compression` middleware for all JSON API responses |
| **GPU Hints** | `will-change: transform` and `backface-visibility: hidden` for smooth card animations |

---

## Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 6 | UI framework and build tool |
| **Routing** | React Router v7 | Client-side navigation |
| **State** | TanStack React Query | Server state, caching, background sync |
| **Auth State** | Context API | Client-side auth context |
| **Styling** | Bootstrap 5, Custom CSS Variables | Responsive design system with theming |
| **Rendering** | React Virtuoso | Windowed list virtualization |
| **Backend** | Node.js 20, Express | RESTful API server |
| **Database** | MongoDB 8.0, Mongoose | Document storage and ODM |
| **Auth** | JWT, bcrypt, OTP | Stateless authentication |
| **Storage** | AWS S3 | Profile photo storage |
| **Compression** | `compression` middleware | Gzip response encoding |

---

## Architecture

```
SkillAnchor/
├── client/                     # React SPA (Vite)
│   └── src/
│       ├── components/
│       │   ├── common/         # Reusable UI (Card, SearchHero, ApplyModal)
│       │   ├── layout/         # Navbar, Footer
│       │   └── form/           # FormInput, FormSelect, FormTextarea
│       ├── constants/          # Centralized constants (job categories)
│       ├── context/            # AuthContext, ThemeContext
│       ├── hooks/
│       │   ├── queries/        # React Query hooks (useJobs, useProfile)
│       │   └── index.js        # useForm, useDebounce, custom hooks
│       ├── pages/              # Route components (all lazy-loaded)
│       ├── services/           # API abstraction layer (Axios)
│       ├── styles/             # Global CSS design system
│       └── utils/              # formatDate, formatSalary helpers
│
└── server/                     # Express API
    └── src/
        ├── controllers/        # Business logic (auth, jobs, profile)
        ├── models/             # Mongoose schemas
        ├── routes/             # API endpoints
        ├── middleware/         # Auth guards, error handling, uploads
        └── config/             # Database, S3, environment config
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

# Install all dependencies (client + server)
npm run install:all
```

### Environment Setup

Create `server/.env`:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

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
# Both client and server concurrently
npm run dev

# Or individually
npm run dev:server    # Backend  → http://localhost:5000
npm run dev:client    # Frontend → http://localhost:5173
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
| **SavedJob** | Worker bookmarks |

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

- [x] Premium UI redesign (Edit Profile, Settings, Navbar)
- [x] Profile photo uploads with AWS S3
- [x] Multi-step profile wizard with completion tracking
- [x] Secure contact verification (OTP-based updates)
- [x] Trust badges for verified users
- [x] Work Experience system with auto-verification on hire
- [x] Employer Team Management dashboard
- [x] Enhanced full-text search with relevance ranking
- [x] Flattened Search Hero with category chips
- [x] Scroll-linked Navbar with search morph
- [x] Performance: Virtualization, React Query, Lazy Loading, Gzip
- [x] View Transitions API for hardware-accelerated theme switching
- [x] Brand overhaul to SkillAnchor with database migration
- [ ] Salary range filter UI
- [ ] Shift-based scheduling with calendar view
- [ ] Real-time in-app messaging (Socket.io)
- [ ] Push notifications
- [ ] Worker ratings and reviews
- [ ] Multi-language support
- [ ] Document-based identity verification
- [ ] PWA support (offline + installability)

---

## Database Migration

If upgrading from the legacy **KaamSetu** system:

```bash
node server/scripts/migrate-db.js
```

This copies all collections from `KaamSetuDB` → `SkillAnchorDB`.

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