# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ERP Asset Management System — React frontend + Node.js/Express backend + MySQL database.

## Dev Commands

### Frontend (`erp-frontend/`)
```bash
cd erp-frontend
npm run dev       # Vite dev server on http://localhost:5173
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Backend (`Backend/`)
```bash
cd Backend
npm start         # node --env-file=.env server.js  (port 5000)
```

### Database
```bash
cd Backend
node runMigrations.js   # Apply pending SQL migrations from migrations/
node initDb.js          # Seed/init the database schema from scratch
```

No test runner is configured. There are Playwright e2e tests at the root (`tests/`, `playwright-report/`) run from the root `package.json`.

## Architecture

### Backend — MVC + service layer (ES modules)

```
Backend/
  server.js           — Express app entry, registers all routes
  sse.js              — SSE connection manager (Map<userId, Set<res>>)
  config/db.js        — mysql2 connection pool (database: "erp", port 3306)
  middleware/auth.js  — isAuth (session check), allowRoles(...roles)
  routes/             — thin Express routers, delegate to controllers
  controllers/        — request/response handling
  services/           — business logic
    notificationService.js  — send() persists to DB + pushes SSE event
    auditService.js         — logEvent() writes to audit_logs
    slaService.js           — computeDueAt(), checkEscalations()
  migrations/         — numbered SQL files applied by runMigrations.js
```

All routes are mounted under `/api/*` in `server.js`. Authentication uses `express-session` (cookie-based). User object is at `req.session.user` (`{ id, name, role }`).

Roles: `admin`, `manager`, `employee`, `assets`. Route guards use `allowRoles("admin", "manager", ...)`.

### Frontend — React 19 + Vite + React Router v7

```
erp-frontend/src/
  main.jsx / App.jsx  — router root, lazy-loads all pages
  layout/AppLayout.jsx — persistent shell: Sidebar + top bar + NotificationCenter
  context/AuthContext.jsx — user session state, login/logout
  services/api.js     — apiRequest() base fetch wrapper (credentials: include)
  api/                — one file per domain (ticketApi, notificationApi, etc.)
  pages/              — route-level components grouped by domain
    admin/            — Users, Roles, Departments
    assets/           — Assets, Categories, Assignments, Maintenance
    tickets/          — Tickets (admin/manager), TicketDetail
    employee/         — EmployeeDashboard, RaiseTicket, MyTickets, EmployeeAssets
    analytics/        — Analytics
  components/         — shared: Sidebar, NotificationCenter, GlobalSearch, ActivityFeed
  context/            — AuthContext
  routes/ProtectedRoute.jsx — role-based redirect guard
  styles/             — CSS files per domain
```

All API calls go through `services/api.js → apiRequest()` which hits `http://localhost:5000/api`. Session cookie is sent with every request (`credentials: "include"`).

### Real-time Notifications (SSE)

Flow: backend event → `notificationService.send()` → DB insert + `sse.notifyUser()` → SSE push → `NotificationCenter` SSE listener → state update.

- `Backend/sse.js` manages open connections keyed by `userId`.
- `Backend/services/notificationService.js` is the single entry point for sending notifications.
- Frontend SSE connection: `new EventSource("http://localhost:5000/api/sse", { withCredentials: true })` in `NotificationCenter.jsx`.
- Notification types in use: `ticket_update`, `asset_assigned`, `sla_breach`.

### Route Access Matrix

| Path prefix | Roles |
|---|---|
| `/dashboard`, `/assets/*`, `/tickets/*`, `/analytics` | admin, manager, assets |
| `/admin/*` | admin only |
| `/manager` | admin, manager |
| `/employee/*` | employee only |

### Database Schema (key tables)

- `employees` — users/staff (used as auth identity)
- `tickets` — status enum: open/in_progress/resolved/closed/escalated; priority: low/medium/high/urgent
- `notifications` — user_id, type, title, message, entity_type, entity_id, is_read
- `audit_logs` — entity_type, entity_id, actor, action, before_data, after_data
- `assets`, `asset_assignments`, `maintenance_logs`, `departments`, `roles`, `categories`

All DB changes must use a new numbered migration file in `Backend/migrations/` rather than editing `initDb.js`.

## Key Conventions

- Business logic belongs in `services/`, not controllers.
- Every notification goes through `notificationService.send()` — never insert to `notifications` directly.
- Frontend pages fetch data on mount; mutations call the API then re-fetch (no global state library).
- The `user.id` from session is the same as `employees.id` in the database.
- Purple theme (`#a855f7`, `#7c3aed`) is the design system color — match it for new UI.
- DB pool credentials are hardcoded in `config/db.js` (root/no password) — do not modify `.env` or deployment configs.
