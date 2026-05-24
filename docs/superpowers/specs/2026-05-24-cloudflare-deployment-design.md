# Deployment Design: Cloudflare Pages + Koyeb + TiDB Cloud

**Date:** 2026-05-24  
**Status:** Approved

## Architecture

```
Browser
  ├─→ Cloudflare Pages  (React SPA, free CDN, global edge)
  └─→ Koyeb             (Node.js/Express backend, free tier, was region)
        └─→ TiDB Cloud Serverless  (MySQL-compatible, free tier)
```

**Cost:** $0/month

## Components

### Frontend — Cloudflare Pages
- Build command: `npm run build` inside `erp-frontend/`
- Output directory: `dist`
- Root directory: `erp-frontend`
- SPA routing: `erp-frontend/public/_redirects` already contains `/* /index.html 200`
- Env var at build time: `VITE_API_BASE_URL=https://<koyeb-app>.koyeb.app/api`

### Backend — Koyeb Free Tier
- Deployment config: `koyeb.yaml` (already in repo root)
- Pulls from GitHub `main` branch, builds `Backend/Dockerfile`
- Port: 5000, region: was
- Required env vars set in Koyeb dashboard:
  - `DB_HOST` — TiDB Cloud hostname
  - `DB_PORT` — TiDB Cloud port (4000 typically)
  - `DB_USER` — TiDB Cloud username
  - `DB_PASSWORD` — TiDB Cloud password
  - `DB_NAME` — erp
  - `SESSION_SECRET` — strong random secret
  - `CORS_ORIGIN` — Cloudflare Pages URL

### Database — TiDB Cloud Serverless
- Free tier: 5 GiB storage, 50M row-reads/month
- MySQL-compatible; `mysql2` driver works without changes
- SSL required (TiDB enforces TLS); pass `ssl: { rejectUnauthorized: true }` in `config/db.js`
- Schema initialised by `Backend/initDb.js` + migrations on first startup

## Code Changes Required

### 1. `Backend/server.js` — cookie sameSite fix
Cross-origin session cookies (CF Pages domain → Koyeb domain) require `sameSite: "none"` + `secure: true` in production.

```js
cookie: {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure:   process.env.NODE_ENV === "production"
}
```

### 2. `Backend/config/db.js` — SSL for TiDB
TiDB Cloud requires TLS. Add `ssl: { rejectUnauthorized: true }` to the pool config when `NODE_ENV === "production"`.

### 3. `koyeb.yaml` — env var placeholders
`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` updated to indicate TiDB Cloud values.
`CORS_ORIGIN` and `SESSION_SECRET` remain `SET_IN_KOYEB_DASHBOARD`.
Add `NODE_ENV=production`.

## Deployment Steps (manual, one-time)

1. Create TiDB Cloud Serverless cluster → copy connection string
2. Add Koyeb env vars in dashboard (DB creds, SESSION_SECRET, CORS_ORIGIN)
3. Push changes to GitHub → Koyeb auto-deploys
4. Create Cloudflare Pages project pointing to `erp-frontend/`, set `VITE_API_BASE_URL`
5. Verify: login, load assets, SSE notifications

## What Does NOT Change
- `express-session` cookie auth — no JWT rewrite
- SSE notifications — work unchanged on Koyeb
- All 14 API route groups — no path changes
- `mysql2` driver — compatible with TiDB Cloud
- Frontend API calls via `services/api.js` `BASE_URL` — just picks up the env var
