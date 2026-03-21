# SkillAnchor Architecture

**SkillAnchor** is a modern, full-stack web platform connecting blue-collar workers and unskilled laborers with authentic employers and micro-contractors.

This document details the architecture, design patterns, security mechanisms, and testing infrastructure of the application as of **Phase 4**.

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
*   **Logging:** Structured JSON logging with Pino & Pino-HTTP
*   **Observability:** Request Correlation IDs (UUID) for end-to-end tracing
*   **API Versioning:** Standardized `/v1` routes
*   **Reliability:** SIGTERM/SIGINT graceful shutdown handlers
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

## 🧪 5. Testing Infrastructure (Deep Integration)

The platform utilizes a comprehensive testing suite with **Vitest**, ensuring logic remains airtight across the stack.

### Backend (`server/`)
*   **Framework:** Vitest + Supertest
*   **Strategy**: Combination of unit tests for isolated utilities (auth, cache, email) and full-path integration tests for controllers.
*   **Coverage**: >90% global test coverage across statements, functions, branches, and lines.
*   **Isolation**: Every test file runs against a freshly flushed in-memory **MongoDB Replica Set** (to support transactions) and Redis instance.
*   **Security Testing**: Explicit verification of rate-limiting thresholds and authorization guards.

### Frontend (`client/`)
*   **Framework:** Vitest + React Testing Library + JSDOM
*   **Strict Typing**: 100% `as any` eradication; all mocks use `ReturnType<typeof hook>` for deep type-safety.
*   **Component Logic**: Full coverage for complex components (`Navbar`, `SearchHero`, `MyJobs`) and state-machine verification for hooks like `useLogin`.

### Code Coverage (CI Enforced)
*   **Thresholds**: CI builds fail if coverage falls below **80% on server** or **70% on client**.
*   **Tooling**: V8 coverage reports integrated directly into the GitHub Actions logs.

---

## 🚀 6. Distributed Task Queuing (Phase 3 Upgrade)

To support horizontal scaling, we migrated from an in-process `EventEmitter` to **BullMQ** (a Redis-backed message queue).

### Why BullMQ?
*   **Persistence:** Jobs survive server restarts.
*   **Horizontal Scaling:** Multiple server instances can process jobs from the same queue.
*   **Reliability:** Native support for exponential backoff retries and "at-least-once" delivery.

### Implementation:
*   **Producer:** When an employer hires a worker, the `application.controller.ts` pushes a `process-hire` job to the `hired-worker` queue.
*   **Consumer:** The `hired.queue.ts` worker processes the job, creating a `WorkExperience` record and updating the `WorkerProfile` within a MongoDB transaction.

---

## 🌐 7. Deployment Topology (Target)

While the project is locally developed, the architectural choices mandate the following production topology:

1.  **Frontend (Next.js):** Deployed to Vercel (or equivalent Edge network) to utilize automatic static optimization and caching.
2.  **Backend (Express):** Deployed as a scalable Node container (e.g., Render, Fly.io, or AWS ECS).
3.  **Databases:**
    *   MongoDB Atlas Serverless/Dedicated.
---

## 🛡️ 8. Observability & Production Hardening (Phase 4 Upgrade)

The application implements a modern observability stack to ensure production readiness and ease of debugging.

### Structured Logging (Pino)
- We migrated from `console.log/error` to **Pino**, a high-performance, low-overhead JSON logger.
- **Production:** Logs are output as machine-readable JSON for integration with log aggregators (ELK, Datadog).
- **Development:** Logs are "pretty-printed" for human readability.

### Request Correlation (RequestId)
- Every incoming request is assigned a unique `requestId` (UUID) via middleware.
- This ID is:
    1.  Included in all logs generated during the request lifecycle.
    2.  Returned to the client in the `x-request-id` header.
- This allows developers to isolate logs for a specific request across concurrent users.

### API Versioning
- All API routes are prefixed with `/api/v1/`.
- This ensures backward compatibility as the platform evolves and allows for side-by-side deployment of new API versions in the future.

### Graceful Shutdown
- The server implements a robust shutdown sequence when receiving `SIGTERM` or `SIGINT`.
- It ensures all active database connections (MongoDB), Redis clients, and BullMQ workers are closed cleanly before the process exits, preventing data corruption and lost background jobs.

---

## 🚀 9. DevOps & Automation

The platform is integrated with professional DevOps standards to ensure code quality.

### GitHub Actions CI
- **Automated Verification:** A `.github/workflows/ci.yml` pipeline triggers on every push and pull request.
- **Enforced Standards:** Automatically runs TypeScript type-checking (`tsc --noEmit`), ESLint linting, and full test suites with **coverage thresholds**.

### Code Quality Standards
- **Strict Linting**: Both client and server utilize ESLint to enforce consistent coding patterns and early bug detection. The client strictly adheres to a zero-warning policy to enforce deep rules like `react-hooks/exhaustive-deps` and `@next/next/no-img-element`.
- **Server Hardening**: Explicitly added `eslint` and `@typescript-eslint` to the backend to maintain the same quality bar as the Next.js frontend.
