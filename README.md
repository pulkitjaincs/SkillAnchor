# KaamSetu

**The job platform for hourly and skilled workers.**

KaamSetu connects workers with employers hiring for hourly, part-time, and full-time roles across industries. Whether you're a student looking for weekend shifts, a skilled tradesperson seeking steady work, or an employer filling positions fast—KaamSetu makes it simple.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## The Problem

Finding hourly and blue-collar work is still broken. Workers scroll through cluttered job boards or rely on word of mouth. Employers post on multiple platforms and still can't find reliable candidates. The process is slow, fragmented, and frustrating for everyone.

## The Solution

KaamSetu is a focused platform where:
- **Workers** find jobs that match their skills and schedule, apply instantly, and track every application
- **Employers** post openings, review candidates, and hire—without wasting time

Built for simplicity. Works on any device.

---

## Who It's For

| Workers | Employers |
|---------|-----------|
| Students looking for part-time or weekend work | Restaurants hiring servers and kitchen staff |
| Skilled tradespeople (electricians, plumbers, welders) | Warehouses filling packer and loader roles |
| Drivers and delivery personnel | Hotels hiring housekeeping and front desk |
| Retail and service workers | Construction firms finding skilled labor |
| Gig workers seeking steady income | Retail stores staffing for busy seasons |

---

## Features

### For Workers
- Browse jobs by category, location, and pay
- View full job details with salary, skills, benefits, and requirements
- Filter by full-time, part-time, or flexible hours
- Apply with one tap
- Track application status in real-time
- Save jobs for later
- **Profile photo upload** with S3 cloud storage
- **Multi-step profile wizard** for easy onboarding
- **Profile completion tracking** with visual progress
- **WhatsApp number support** for direct communication
- **Work Experience Management**: Add and manage work history via modal with visibility toggle
- **Verified Experience Badges**: Experiences from hired jobs are auto-verified
- **Secure phone display** (read-only in profile, updated via OTP in settings)

### For Employers
- Post jobs with salary, schedule, and requirements
- View applicants dashboard with contact details and cover notes
- View full applicant profiles to assess skills and experience
- Track application count per job in real-time
- Update status: Pending → Viewed → Shortlisted → Hired → Rejected
- **Premium My Team Dashboard**: Manage active hires with a high-fidelity interface, quick-call actions, and deep-link profile navigation
- **End Employment Flow**: End employment relationships, automatically updating work history
- **Manage all listings** from one dashboard

### Platform
- Phone OTP login (no password needed)
- Email OTP login (passwordless option)
- Email + password login
- Forgot password with OTP verification
- Responsive design for mobile and desktop
- **Modern UI** with refined components and smooth animations
- **Dark and light mode** with smooth transitions
- **Trust Badges**: Verified phone/email markers in Settings and Profile
- **Secure Contact Guard**: Force contact updates through OTP verification
- **Enhanced Job Search**: MongoDB text search with relevance ranking across title, description, skills, category, city
- **Flattened Search Hero**: Prominent search bar with keyword, location, and category chip filters on the homepage
- **Scroll-Linked Navbar Search**: Search bar morphs into a compact version in the sticky navbar on scroll using IntersectionObserver
- **Standardized Job Categories**: Centralized category system ensuring consistent categorization across posting, editing, and filtering

---

## Industries

| Category | Example Roles |
|----------|---------------|
| Food & Hospitality | Server, Barista, Cook, Dishwasher, Host |
| Retail | Cashier, Stock Clerk, Sales Associate |
| Logistics & Delivery | Driver, Courier, Warehouse Associate, Packer |
| Construction & Trades | Electrician, Plumber, Carpenter, Painter, Welder |
| Cleaning & Maintenance | Janitor, Housekeeper, Groundskeeper |
| Events & Promotions | Event Staff, Brand Ambassador, Usher |
| Healthcare Support | Caregiver, Home Health Aide, Medical Assistant |

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB 8+

### Installation

```bash
git clone https://github.com/pulkitjaincs/KaamSetu.git
cd KaamSetu
npm run install:all
```

Create `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/kaamsetu
JWT_SECRET=your-secret-key
PORT=5000

# AWS S3 (for profile photo uploads)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-bucket-name
```

### Run Locally

```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

Frontend: `http://localhost:5173` | Backend: `http://localhost:5000`

---

## Architecture

```
KaamSetu/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # UI components (Navbar, SearchHero, Cards, FormComponents)
│       ├── constants/      # Centralized constants (job categories)
│       ├── pages/          # Home, Login, Jobs, Profile, Settings
│       ├── context/        # Auth state management
│       ├── hooks/          # Custom hooks (useForm, useFetch, useDebounce)
│       ├── services/       # Centralized API layer
│       ├── utils/          # Utility functions (formatDate, formatSalary)
│       └── styles/         # Global CSS with design system
│
└── server/                 # Express backend
    └── src/
        ├── controllers/    # Business logic (auth, job, profile, etc.)
        ├── models/         # User, Job, Application, WorkerProfile
        ├── routes/         # API endpoints (thin wrappers)
        ├── config/         # Database, S3 configuration
        └── middleware/     # Auth guards, file upload
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router, Bootstrap 5 |
| State | Custom hooks (useForm, useFetch, useDebounce) |
| Backend | Node.js, Express, Mongoose, Multer |
| Database | MongoDB |
| Auth | JWT, bcrypt, OTP |
| Storage | AWS S3 |

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to phone or email |
| POST | `/api/auth/verify-otp` | Verify OTP and login |
| POST | `/api/auth/register` | Register with email |
| POST | `/api/auth/login` | Login with email + password |
| POST | `/api/auth/forgot-password` | Send password reset OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/update-password` | Change password (authenticated) |
| POST | `/api/auth/send-update-otp` | Send OTP to update email/phone |
| POST | `/api/auth/verify-update-otp` | Verify OTP and update account |

### Worker Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/my-profile` | Get current user's profile |
| GET | `/api/profile/user/:userId` | Get profile by user ID |
| PUT | `/api/profile/my-profile` | Update profile (skills, bio, etc) |
| POST | `/api/profile/upload-avatar` | Upload profile photo to S3 |

### Jobs

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/jobs` | Public |
| GET | `/api/jobs/:id` | Public |
| POST | `/api/jobs` | Employer |
| PUT | `/api/jobs/:id` | Employer |
| DELETE | `/api/jobs/:id` | Employer |

### Applications

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/applications/apply/:jobId` | Worker |
| GET | `/api/applications/my-applications` | Worker |
| GET | `/api/applications/job/:jobId` | Employer |
| PATCH | `/api/applications/:id/status` | Employer |
| DELETE | `/api/applications/:id` | Worker |

---

## Data Models

| Model | Purpose |
|-------|---------|
| User | Phone/email auth, role (worker/employer) |
| Job | Title, description, salary, location, schedule |
| Application | Links worker to job, tracks status |
| WorkerProfile | Skills, availability, experience |
| Company | Employer business details |

---

## Roadmap

- [x] Premium UI redesign (Edit Profile, Settings, Navbar)
- [x] Profile photo uploads with S3
- [x] Multi-step profile wizard
- [x] Client-side profile completion tracking
- [x] Secure contact verification (OTP-based updates)
- [x] Trust badges for verified users
- [x] **Work Experience System**: Manual entry + Automatic verification on hire
- [x] **Employer Team View**: manage active employees
- [x] **Codebase Standardization**: Centralized API layer, custom hooks, FormComponents
- [x] **Enhanced Search**: Full-text search with multi-field matching and relevance ranking
- [x] **Work Experience Modal**: Modal-based management with visibility toggle and employment controls
- [x] **Flattened Search Hero**: Homepage search with category chips and location filter
- [x] **Standardized Categories**: Centralized job category system with dropdown selectors
- [x] **Scroll-Linked Navbar**: Sticky navbar with search bar morph transition on scroll
- [x] **Performance**: Backend query optimization (.lean(), projection) & Frontend list virtualization
- [ ] Salary range filter UI
- [ ] Shift-based job scheduling
- [ ] In-app messaging
- [ ] Push notifications
- [ ] Worker ratings and reviews
- [ ] Multi-language support
- [ ] Identity verification (Document-based)

---

## Contributing

Contributions welcome. Open an issue or submit a pull request.

## License

MIT © 2025-2026

---

<p align="center">
  <strong>KaamSetu</strong> — Work, simplified.
</p>