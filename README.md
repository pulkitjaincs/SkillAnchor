# KaamSetu 💼

A premium job portal for the blue-collar workforce, connecting skilled workers with employers across industries like hospitality, construction, manufacturing, logistics, and more.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap)

## ✨ Features

- **Modern UI/UX** - Apple/Linear-inspired interface with premium animations
- **Dark/Light Theme** - Seamless theme switching with system preference detection
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Smooth Animations** - Spring-based easing curves and layered transitions

## 🎨 Design Highlights

### Animations
| Action | Animation |
|--------|-----------|
| First Open | Scale up from 92% with shadow build and content reveal |
| Switch Listing | Subtle 0.3s slide with content refresh |
| Close | Scale down to 95% with fade out |
| Card Hover | 1.05x scale with shadow lift |

### Components
- **Navbar** - Floating glass-panel with rounded corners, theme toggle, and responsive search
- **Cards** - Hover-interactive job cards with selection states
- **Listing** - Full job details with hero header and premium styling

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/pulkitjaincs/KaamSetu.git
cd KaamSetu

# Setup Backend
cd server
npm install
cp .env.example .env  # Add your MONGO_URI
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
PORT=5000
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/jobs` | List all active jobs |
| GET | `/api/jobs/:id` | Get single job details |

## 📁 Project Structure

```
KaamSetu/
├── client/                     # Frontend (React/Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Card, Listing
│   │   │   └── layout/         # Navbar, Footer
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── styles/             # Global CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend (Node.js & Express)
│   └── src/
│       ├── config/             # DB & App config
│       ├── controllers/        # Route logic
│       ├── models/             # Mongoose models
│       ├── routes/             # API routes
│       ├── middleware/         # Auth & error handling
│       ├── services/           # Business logic
│       ├── utils/              # Helper functions
│       ├── app.js              # Express app setup
│       └── server.js           # Entry point
│
├── package.json                # Root monorepo scripts
└── README.md
```

## 🎯 Tech Stack

### Frontend
- **React 19** - UI library with hooks
- **Vite 7** - Next-gen frontend tooling
- **Bootstrap 5.3** - CSS framework
- **Bootstrap Icons** - Icon library
- **CSS Variables** - Theming system

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB & Mongoose** - Database & ODM
- **JWT & bcrypt** - Authentication

### Database Models
| Model | Purpose |
|-------|---------|
| User | Auth (phone/email), role, verification |
| OTP | Phone verification with auto-expiry |
| WorkerProfile | Job seeker details, skills, documents |
| EmployerProfile | Hiring manager info |
| Company | Business entities |
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
| Mobile | Single view with back navigation |

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client dev server |
| `npm run dev:client` | Start client (explicit) |
| `npm run dev:server` | Start server (when ready) |
| `npm run build` | Build client for production |

## 📄 License

MIT © 2025

---

<p align="center">
  Made with ❤️ for the blue-collar workforce of India
</p>