# SkillAnchor Architecture

**SkillAnchor** is a modern, full-stack web platform connecting blue-collar workers and unskilled laborers with authentic employers and micro-contractors.

This document details the architecture, design patterns, security mechanisms, and testing infrastructure of the application as of **Phase 3**.

---

## 🏗️ 1. High-Level Architecture

The project utilizes a monorepo setup, strictly separating the frontend (Client) and backend (Server).

### **Frontend (Client)**
*   **Framework:** Next.js (App Router) + React
*   **Language:** TypeScript (Strict Mode)
*   **Styling:** Bootstrap 5 (CSS Modules / Vanilla CSS over Tailwind per design choice)
*   **State Management:** React Context API (`AuthContext`) + React Query (TanStack Query)
*   **Package Manager:** npm

### **Backend (Server)**
*   **Framework:** Node.js + Express
*   **Language:** JavaScript (ES6+ with extensive JSDoc types for strictness)
*   **Database:** MongoDB Atlas (Mongoose ORM)
*   **Caching & Rate Limiting:** Redis (via Aiven)
*   **Message Broker:** BullMQ (backed by Redis) for background jobs
*   **Authentication:** JWT via HttpOnly Cookies
*   **Email Delivery:** Nodemailer (SMTP)

---

## 🔐 2. Authentication Flow (Phase 2 Upgrade)

We explicitly migrated from an insecure `localStorage`-based token approach to a highly secure **HttpOnly Cookie** flow.

### Flow Breakdown:
1.  **Login/Register:** User submits credentials (or OTP).
2.  **Server Generation:** Server verifies the user, generates a JWT (`jwt.sign`), and attaches it to an `httpOnly`, `secure`, `sameSite=strict` cookie.
3.  **Client Persistence:** The browser automatically stores the cookie. The client code *never* directly handles or reads the token.
4.  **Subsequent Requests:** The browser automatically injects the cookie into the `Cookie` header for every API request via `axios` (`withCredentials: true`).
5.  **State Hydration:** On app load, `AuthContext` calls `/api/auth/me` to determine if a valid cookie session exists and populates the `user` state.
6.  **Logout:** Server clears the cookie by setting an expiration date in the past.

### Security Defenses:
*   **XSS (Cross-Site Scripting):** Tokens cannot be stolen via JavaScript because of the `httpOnly` flag.
*   **CSRF (Cross-Site Request Forgery):** Mitigated by the `sameSite=strict` flag and custom Next.js routing.
*   **Brute Force:** Redis-based rate limiting on `/login`, `/register`, and `/send-otp` endpoints.

---

## 💾 3. Data Layer & Caching

### MongoDB (Primary Store)
*   **Schemas:** Heavily referenced models (`User`, `Job`, `Application`, `Profile`).
*   **Sanitization:** Uses custom middleware and Mongo sanitization libraries to prevent NoSQL injection.
*   **Indexes:** Optimized indexes on frequent search fields (e.g., Job titles, User roles).

### Redis (Performance & Protection)
*   **OTP Storage:** Transient storage for OTPs (Email verification) with automatic TTL expiry (5-10 minutes).
*   **Rate Limiting:** IP-based request throttling using `rate-limit-redis`, preventing abuse of the Express server.

---

## 🛡️ 4. API & Error Handling Standardization

### Zod Validation
All incoming API payloads are parsed and strictly validated using **Zod** middleware *before* hitting the controller logic.

### Global Error Handler
Express is configured with a unified error handling middleware (`src/middleware/error.js`). 
*   **Structure:** Every API response adheres to a strict standard: `{ success: boolean, data?: any, error?: string }`.
*   This predictable contract enables the frontend React Query hooks to reliably parse errors and notify the user.

---

## 🧪 5. Testing Infrastructure (Phase 3 Integration)

The platform is heavily tested using **Vitest**, providing a fast, isolated, and parallelized testing environment.

### Backend (`server/`)
*   **Framework:** Vitest + Supertest
*   **Mocking Boundaries:** 
    *   Separate in-memory MongoDB connection for tests (`MONGO_URI_TEST`).
    *   Separate isolated Redis DB (`REDIS_URL_TEST`).
*   **Coverage:** Unit tests cover service logic (e.g., OTP generation), while Integration tests cover complete API routes covering request validation, DB persistence, and response structure.
*   **Global Teardown:** Databases are flushed completely after every test suite to preserve test idempotency (`src/tests/setup.js`).

### Frontend (`client/`)
*   **Framework:** Vitest + React Testing Library + JSDOM
*   **Coverage:** Critical components (`Listing.tsx`, Auth Pages)
*   **Mocking Strategy:** 
    *   Extensive use of `vi.mock` for Next.js internal hooks (`useRouter`, `next/dynamic`, `next/image`).
    *   Mocks API responses (`applicationsAPI`) and Context boundaries (`useAuth`) to accurately simulate edge cases like logged-out states, specific roles (`employer` vs `worker`), and pre-existing applications.

---

## 🚀 6. Distributed Task Queuing (Phase 3 Upgrade)

To support horizontal scaling, we migrated from an in-process `EventEmitter` to **BullMQ** (a Redis-backed message queue).

### Why BullMQ?
*   **Persistence:** Jobs survive server restarts.
*   **Horizontal Scaling:** Multiple server instances can process jobs from the same queue.
*   **Reliability:** Native support for exponential backoff retries and "at-least-once" delivery.

### Implementation:
*   **Producer:** When an employer hires a worker, the `application.controller.ts` pushes a job to the `hired-worker` queue.
*   **Consumer:** The `hired.queue.ts` worker processes the job, creating a `WorkExperience` record and updating the `WorkerProfile` within a MongoDB transaction.

---

## 🌐 7. Deployment Topology (Target)

While the project is locally developed, the architectural choices mandate the following production topology:

1.  **Frontend (Next.js):** Deployed to Vercel (or equivalent Edge network) to utilize automatic static optimization and caching.
2.  **Backend (Express):** Deployed as a scalable Node container (e.g., Render, Fly.io, or AWS ECS).
3.  **Databases:**
    *   MongoDB Atlas Serverless/Dedicated.
    *   Redis hosted remotely (Aiven/Upstash for low latency to the Node server).
4.  **Routing:** The frontend API client proxies requests directly to the deployed backend URL, passing credentials seamlessly.
