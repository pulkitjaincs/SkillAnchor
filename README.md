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
- Filter by full-time, part-time, or flexible hours
- Apply with one tap
- Track application status in real-time
- Save jobs for later

### For Employers
- Post jobs with salary, schedule, and requirements
- View applicants dashboard with contact details and cover notes
- Track application count per job in real-time
- Update status: Pending → Viewed → Shortlisted → Hired → Rejected
- Manage all listings from one dashboard

### Platform
- Phone OTP login (no password needed)
- Email login option
- Responsive design for mobile and desktop
- Dark and light mode

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

### Configuration

Create `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/kaamsetu
JWT_SECRET=your-secret-key
PORT=5000
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
│       ├── components/     # UI components
│       ├── pages/          # Home, Login, Jobs, Applications
│       ├── context/        # Auth state
│       └── services/       # API calls
│
└── server/                 # Express backend
    └── src/
        ├── controllers/    # Business logic
        ├── models/         # User, Job, Application
        ├── routes/         # API endpoints
        └── middleware/     # Auth guards
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT, bcrypt, OTP |

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP and login |
| POST | `/api/auth/register` | Register with email |
| POST | `/api/auth/login` | Login with email |

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

- [ ] Advanced search with location and salary filters
- [ ] Shift-based job scheduling
- [ ] In-app messaging
- [ ] Push notifications
- [ ] Worker ratings and reviews
- [ ] Multi-language support
- [ ] Identity verification

---

## Contributing

Contributions welcome. Open an issue or submit a pull request.

## License

MIT © 2025

---

<p align="center">
  <strong>KaamSetu</strong> — Work, simplified.
</p>