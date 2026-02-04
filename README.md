# KaamSetu 💼

A premium job portal for the blue-collar workforce, connecting skilled workers with employers across industries like hospitality, construction, manufacturing, logistics, and more.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb)

## ✨ Features

### Core Features
- **Job Listings** - Browse and search available jobs with pagination
- **Job Details** - View comprehensive job information with company details
- **User Authentication** - Phone OTP and Email/Password login options
- **Role-Based Access** - Separate flows for Workers and Employers
- **Employer Dashboard** - Post, Edit, and Delete job listings
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### Employer Features
- **Post Jobs** - Create new job listings with detailed information
- **Edit Jobs** - Update existing job postings
- **Delete Jobs** - Remove job listings with confirmation
- **My Jobs** - Dashboard to manage all posted jobs
- **Job Status** - Track Active, Paused, and Closed jobs

### UI/UX
- **Modern UI** - Apple/Linear-inspired interface with premium animations
- **Dark/Light Theme** - Seamless theme switching with system preference detection
- **Smooth Animations** - Spring-based easing curves and layered transitions
- **Glass Morphism** - Premium glass-panel effects on navigation
- **Premium Forms** - Section dividers, icons, and focus states
- **Hover Effects** - Subtle scale and color transitions on buttons

## 🔐 Authentication System

| Feature | Description |
|---------|-------------|
| Phone OTP Login | Send OTP → Verify → Auto-create account |
| Email Login | Email + Password authentication |
| Registration | Role selection (Worker/Employer) + Name + Phone/Email |
| Auth Context | Global state management for user session |
| Protected Routes | Role-based route protection |
| Session Persistence | Token stored in localStorage |

## 🎨 Design Highlights

### Animations
| Action | Animation |
|--------|-----------|
| First Open | Scale up from 92% with shadow build and content reveal |
| Switch Listing | Subtle 0.3s slide with content refresh |
| Close | Scale down to 95% with fade out |
| Card Hover | 1.05x scale with shadow lift |
| Button Hover | Scale with color transition |

### Components
- **Navbar** - Floating glass-panel with user avatar, logout, theme toggle, and search
- **Cards** - Hover-interactive job cards with company logos and fallback initials
- **Listing** - Full job details with hero header and premium styling
- **Login/Register** - Premium auth forms with inline validation
- **My Jobs** - Horizontal card layout with status indicators and action buttons
- **Post/Edit Job** - Premium forms with section dividers and icons

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/pulkitjaincs/KaamSetu.git
cd KaamSetu

# Setup Backend
cd server
npm install
cp .env.example .env  # Add your MONGO_URI and JWT_SECRET
npm run dev           # Starts on port 5000

# Setup Frontend (new terminal)
cd client
npm install
npm run dev           # Starts on port 5173
```

### Environment Variables

Create `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/kaamsetu
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

## 🔌 API Endpoints

### Health & Jobs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Health check | ❌ |
| GET | `/api/jobs` | List jobs with cursor pagination | ❌ |
| GET | `/api/jobs/:id` | Get single job details | ❌ |
| GET | `/api/jobs/my-jobs` | Get employer's posted jobs | ✅ Employer |
| POST | `/api/jobs` | Create a new job | ✅ Employer |
| PUT | `/api/jobs/:id` | Update a job | ✅ Employer |
| DELETE | `/api/jobs/:id` | Delete a job | ✅ Employer |

### Applications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/applications/apply/:jobId` | Apply to a job | ✅ Worker |
| GET | `/api/applications/my-applications` | Get worker's applications | ✅ Worker |
| GET | `/api/applications/job/:jobId` | Get job applicants | ✅ Employer |
| PATCH | `/api/applications/:id/status` | Update application status | ✅ Employer |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to phone number |
| POST | `/api/auth/verify-otp` | Verify OTP and login/register |
| POST | `/api/auth/register` | Email registration |
| POST | `/api/auth/login` | Email login |

## 📁 Project Structure

```
KaamSetu/
├── client/                     # Frontend (React/Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Card, Listing, ProtectedRoutes
│   │   │   └── layout/         # Navbar, Footer
│   │   ├── pages/              # HomePage, LoginPage, RegisterPage, 
│   │   │                       # JobDetailPage, MyJobsPage, 
│   │   │                       # PostJobPage, EditJobPage
│   │   ├── context/            # AuthContext (global auth state)
│   │   ├── styles/             # Global CSS with theme variables
│   │   ├── App.jsx             # Routes configuration
│   │   └── main.jsx            # Entry point with AuthProvider
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend (Node.js & Express)
│   └── src/
│       ├── config/             # DB connection
│       ├── controllers/        # auth.controller, job.controller
│       ├── models/             # User, OTP, Job, Company, etc.
│       ├── routes/             # API routes
│       ├── middleware/         # Auth middleware (protect, requireRole)
│       ├── utils/              # generateToken, helpers
│       ├── app.js              # Express app setup
│       └── server.js           # Entry point
│
├── package.json                # Root monorepo scripts
└── README.md
```

## 🎯 Tech Stack

### Frontend
- **React 19** - UI library with hooks
- **Vite 6** - Next-gen frontend tooling
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Bootstrap 5.3** - CSS framework
- **Bootstrap Icons** - Icon library
- **CSS Variables** - Theming system

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB & Mongoose** - Database & ODM
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing

### Database Models
| Model | Purpose |
|-------|---------|
| User | Auth (phone/email), role, name, verification |
| OTP | Phone verification with 10-min auto-expiry |
| WorkerProfile | Job seeker details, skills, documents |
| EmployerProfile | Hiring manager info |
| Company | Business entities with logos |
| Job | Job listings with search indexes |
| Application | Job applications with status tracking |
| SavedJob | Bookmarks/wishlist |
| WorkExperience | Employer-verified work history |

## 🌙 Theme System

KaamSetu uses CSS custom properties for theming:

```css
:root {
  --bg-body: #fafafa;
  --bg-card: #ffffff;
  --text-main: #09090b;
  --text-muted: #71717a;
  --primary-500: #6366f1;
}

[data-theme="dark"] {
  --bg-body: #09090b;
  --bg-card: #18181b;
  --text-main: #fafafa;
}
```

## 📱 Responsive Behavior

| Screen Size | Layout |
|-------------|--------|
| Desktop (lg+) | Side-by-side: Job list + Details panel |
| Tablet | Compact cards with modal details |
| Mobile | Single view with back navigation |

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client dev server |
| `npm run build` | Build client for production |

## 🗺️ Roadmap

### Completed ✅
- [x] Job listing with pagination
- [x] Job detail view
- [x] Phone OTP authentication
- [x] Email authentication
- [x] User registration with roles
- [x] Auth context for state management
- [x] Dark/Light theme toggle
- [x] Responsive design
- [x] Protected routes (role-based)
- [x] Post Job (for employers)
- [x] Edit Job (for employers)
- [x] Delete Job (for employers)
- [x] My Jobs dashboard
- [x] Premium UI styling
- [x] Date format (dd/mm/yyyy)
- [x] Apply to Jobs (for workers)
- [x] Job Application System
- [x] Application status tracking
- [x] Login redirect with return URL

### Coming Soon 🚧
- [ ] My Applications page (workers)
- [ ] Employer Applications Dashboard
- [ ] Worker Profile Management
- [ ] Job search & filters
- [ ] Company profiles
- [ ] Notifications
- [ ] Messaging system

## 📄 License

MIT © 2025

---

<p align="center">
  Made with ❤️ for the blue-collar workforce of India
</p>