# Cloudflare Pages + Koyeb + TiDB Cloud Deployment Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the ERP app for free — React frontend on Cloudflare Pages, Express backend on Koyeb, MySQL on TiDB Cloud Serverless.

**Architecture:** Frontend (Cloudflare Pages) makes cross-origin API calls to backend (Koyeb). Session cookies work cross-origin with `sameSite: "none"` + `secure: true`. Backend connects to TiDB Cloud Serverless (MySQL-compatible) over TLS.

**Tech Stack:** React 19 + Vite (CF Pages), Node.js/Express + express-session (Koyeb), mysql2 + TiDB Cloud Serverless, Cloudflare Pages free, Koyeb free tier.

---

## File Map

| File | Change |
|------|--------|
| `Backend/config/db.js` | Add SSL option for TiDB Cloud (production only) |
| `Backend/server.js` | Fix session cookie `sameSite`/`secure` for cross-origin production |
| `koyeb.yaml` | Add `NODE_ENV=production`, update DB env var comments |

No new files. No frontend code changes.

---

### Task 1: Add TiDB Cloud SSL to database pool

TiDB Cloud Serverless enforces TLS. Without `ssl: { rejectUnauthorized: true }` the connection will be refused in production.

**Files:**
- Modify: `Backend/config/db.js`

- [ ] **Step 1: Open `Backend/config/db.js`** — current content:

```js
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "erp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port: Number(process.env.DB_PORT || 3306)
});

export default db;
```

- [ ] **Step 2: Replace the file with the SSL-aware version**

```js
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "erp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port: Number(process.env.DB_PORT || 3306),
  ...(process.env.NODE_ENV === "production" && {
    ssl: { rejectUnauthorized: true }
  })
});

export default db;
```

- [ ] **Step 3: Verify dev still works** — start backend locally and confirm it connects (local MySQL doesn't need SSL):

```bash
cd Backend
npm start
```

Expected: `Server running on port 5000` with no SSL errors.

- [ ] **Step 4: Commit**

```bash
git add Backend/config/db.js
git commit -m "feat: add TiDB Cloud SSL support for production database pool"
```

---

### Task 2: Fix session cookie for cross-origin production

When the frontend (CF Pages domain, e.g. `erp.pages.dev`) calls the backend (Koyeb domain, e.g. `erp-backend.koyeb.app`), the browser will not send a `sameSite: "lax"` cookie cross-origin. The cookie must be `sameSite: "none"` + `secure: true` in production (HTTPS only — never send `secure` in dev or the cookie won't work on localhost HTTP).

**Files:**
- Modify: `Backend/server.js` (line 43 — the cookie config inside `app.use(session(...))`)

- [ ] **Step 1: Open `Backend/server.js`** — find the session middleware block (lines ~36–44):

```js
app.use(session({
  secret: process.env.SESSION_SECRET || "erp-dev-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax" }
}));
```

- [ ] **Step 2: Replace the cookie line with an environment-aware version**

```js
app.use(session({
  secret: process.env.SESSION_SECRET || "erp-dev-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure:   process.env.NODE_ENV === "production"
  }
}));
```

- [ ] **Step 3: Verify dev still works** — restart backend, log in via the frontend dev server, confirm session cookie is set (Browser DevTools → Application → Cookies → `localhost:5000`). The cookie should have `SameSite=Lax` and `Secure` unchecked (HTTP dev).

- [ ] **Step 4: Commit**

```bash
git add Backend/server.js
git commit -m "feat: use sameSite=none secure=true for cross-origin production session cookie"
```

---

### Task 3: Update koyeb.yaml with NODE_ENV and TiDB placeholders

Koyeb reads `koyeb.yaml` on deploy. We need `NODE_ENV=production` so both the cookie fix and SSL fix activate. DB credentials are set in the Koyeb dashboard (not in the file) — update comments to reflect TiDB Cloud.

**Files:**
- Modify: `koyeb.yaml`

- [ ] **Step 1: Open `koyeb.yaml`** — current env section:

```yaml
env:
  - key: PORT
    value: "5000"
  - key: DB_HOST
    value: "db4free.net"
  - key: DB_PORT
    value: "3306"
  - key: DB_USER
    value: "SET_IN_KOYEB_DASHBOARD"
  - key: DB_PASSWORD
    value: "SET_IN_KOYEB_DASHBOARD"
  - key: DB_NAME
    value: "erp"
  - key: SESSION_SECRET
    value: "SET_IN_KOYEB_DASHBOARD"
  - key: CORS_ORIGIN
    value: "SET_IN_KOYEB_DASHBOARD"
```

- [ ] **Step 2: Replace the env section** — add `NODE_ENV`, change DB_HOST/DB_PORT placeholders to TiDB Cloud defaults:

```yaml
env:
  - key: PORT
    value: "5000"
  - key: NODE_ENV
    value: "production"
  - key: DB_HOST
    value: "SET_IN_KOYEB_DASHBOARD"
  - key: DB_PORT
    value: "SET_IN_KOYEB_DASHBOARD"
  - key: DB_USER
    value: "SET_IN_KOYEB_DASHBOARD"
  - key: DB_PASSWORD
    value: "SET_IN_KOYEB_DASHBOARD"
  - key: DB_NAME
    value: "erp"
  - key: SESSION_SECRET
    value: "SET_IN_KOYEB_DASHBOARD"
  - key: CORS_ORIGIN
    value: "SET_IN_KOYEB_DASHBOARD"
```

- [ ] **Step 3: Commit**

```bash
git add koyeb.yaml
git commit -m "chore: add NODE_ENV=production and TiDB Cloud env var placeholders to koyeb.yaml"
```

---

### Task 4: Push to GitHub

Koyeb auto-deploys on push to `main`. Cloudflare Pages also auto-deploys on push once connected.

- [ ] **Step 1: Push all commits**

```bash
git push origin main
```

Expected: GitHub accepts the push; Koyeb starts a new build (visible in Koyeb dashboard → Deployments).

---

### Task 5: Set up TiDB Cloud Serverless database (manual, one-time)

This is a browser/dashboard task, not a code task.

- [ ] **Step 1: Create a TiDB Cloud account** — go to `https://tidbcloud.com`, sign up free, create a **Serverless** cluster (free tier, no credit card).

- [ ] **Step 2: Get connection credentials** — in TiDB Cloud dashboard → your cluster → Connect → choose "General" → copy:
  - Host (e.g. `gateway01.us-east-1.prod.aws.tidbcloud.com`)
  - Port (typically `4000`)
  - Username (e.g. `2abc123def.root`)
  - Password (generated on cluster creation — save it)
  - CA cert bundle is handled by `ssl: { rejectUnauthorized: true }` in the driver; no manual cert needed for `mysql2`.

- [ ] **Step 3: Create the `erp` database** — in TiDB Cloud SQL editor (or via mysql client):

```sql
CREATE DATABASE IF NOT EXISTS erp;
```

- [ ] **Step 4: Note the credentials** — you'll enter them in Koyeb dashboard in the next task.

---

### Task 6: Configure Koyeb environment variables (manual, one-time)

- [ ] **Step 1: Open Koyeb dashboard** → your `erp-backend` service → Settings → Environment Variables.

- [ ] **Step 2: Set each variable** (override the `SET_IN_KOYEB_DASHBOARD` placeholders):

| Variable | Value |
|----------|-------|
| `DB_HOST` | TiDB Cloud host (e.g. `gateway01.us-east-1.prod.aws.tidbcloud.com`) |
| `DB_PORT` | `4000` |
| `DB_USER` | TiDB Cloud username (e.g. `2abc123def.root`) |
| `DB_PASSWORD` | TiDB Cloud password |
| `SESSION_SECRET` | A long random string — generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CORS_ORIGIN` | Your Cloudflare Pages URL (e.g. `https://erp-app.pages.dev`) — set after CF Pages is deployed in Task 7 |

- [ ] **Step 3: Redeploy** — after saving env vars, trigger a redeploy in Koyeb. Wait for the health check (`GET /api/auth`) to pass (green).

- [ ] **Step 4: Verify schema init** — check Koyeb logs for `Server running on port 5000` and no DB connection errors. The `initDatabase()` call in `server.js` runs all migrations automatically on startup.

---

### Task 7: Deploy frontend to Cloudflare Pages (manual, one-time)

- [ ] **Step 1: Open Cloudflare dashboard** → Pages → Create a project → Connect to Git → select `aishwarya22-l/ERP_NEW`.

- [ ] **Step 2: Set build configuration:**

| Setting | Value |
|---------|-------|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `erp-frontend` |

- [ ] **Step 3: Add environment variable** (Pages → Settings → Environment Variables → Production):

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://<your-koyeb-app>.koyeb.app/api` |

Example: if your Koyeb app URL is `erp-backend-abc123.koyeb.app`, set `VITE_API_BASE_URL=https://erp-backend-abc123.koyeb.app/api`.

- [ ] **Step 4: Deploy** — click Save and Deploy. CF Pages will build `erp-frontend/` and publish `dist/`.

- [ ] **Step 5: Copy the CF Pages URL** (e.g. `https://erp-app.pages.dev`) and go back to **Task 6 Step 2** to set `CORS_ORIGIN` in Koyeb, then redeploy Koyeb.

---

### Task 8: End-to-end verification

- [ ] **Step 1: Open the CF Pages URL** in a browser (incognito recommended).

- [ ] **Step 2: Log in** — credentials from your `employees` table. The session cookie should be set (DevTools → Application → Cookies → your CF Pages domain). It should show `SameSite=None; Secure`.

- [ ] **Step 3: Navigate to Assets** — verify data loads from TiDB Cloud.

- [ ] **Step 4: Test SSE notifications** — open a second tab, create a ticket, confirm the notification bell updates in the first tab within a few seconds.

- [ ] **Step 5: Check CORS** — DevTools Network tab, filter to `api/`, confirm no CORS errors on any request.

---

## Rollback

If anything breaks:
- **Backend fails to start:** Check Koyeb logs — most likely a DB connection error. Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` in Koyeb dashboard.
- **Login works but session drops:** `CORS_ORIGIN` mismatch (trailing slash, wrong URL) or `SESSION_SECRET` not set. Fix in Koyeb env vars, redeploy.
- **Frontend shows blank page:** Check CF Pages build logs. Usually a missing `VITE_API_BASE_URL` or build failure.
- **SSE not working:** Koyeb free tier allows long-lived connections; if SSE disconnects, `NotificationCenter.jsx` reconnects automatically.
