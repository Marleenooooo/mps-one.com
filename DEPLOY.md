# Deployment to Hostinger (Manual Upload — No CI/CD)

We deploy manually without GitHub Actions. Build locally, then upload the contents of `webapp/dist/` to Hostinger `public_html/` using hPanel File Manager or an FTP client.

## Prerequisites

- Local machine with Node.js LTS installed.
- Hostinger account with domain configured and SSL enabled (Let’s Encrypt).
- Access to hPanel File Manager or FTP credentials.

## Repository (reference)

- Primary repo: https://github.com/Marleenooooo/mps-one.com
- The app lives in `webapp/`. CI workflows exist in the repo but are not used operationally.

## Build Locally

1. Open a terminal in `webapp`.
2. Install dependencies: `npm ci`.
3. Build production bundle: `npm run build`.
4. Verify output in `webapp/dist/` (includes `index.html`, `assets/`, and `.htaccess`).
   - Documentation for the in-app Doc Viewer is bundled from `webapp/public/docs/*`.

Optional: Package for upload as a single archive (Windows):
- Use File Explorer to create `dist.zip` from the contents of `webapp/dist/`.
- Or PowerShell: `Compress-Archive -Path .\dist\* -DestinationPath .\dist.zip -Force`.

## Upload to Hostinger

You can deploy via either hPanel File Manager or an FTP client.

### Option A — hPanel File Manager

1. Log in to Hostinger hPanel.
2. Open File Manager and navigate to `/public_html/` (document root).
3. Upload `dist.zip` (or the contents of `webapp/dist/`).
4. If you uploaded `dist.zip`, extract it so that `index.html`, `assets/`, and `.htaccess` sit directly under `/public_html/`.
5. Remove old assets if necessary (back up first; see Rollback).

### Option B — FTP client (FileZilla/WinSCP)

- Host: `153.92.11.36` (explicit TLS, port 21)
- Username: `u485208858`
- Password: your FTP account password
- Remote directory: `/public_html/`

Steps:
1. Connect with explicit TLS.
2. Upload the contents of `webapp/dist/` (not the `dist` folder itself) into `/public_html/`.
3. Confirm that `index.html` and `.htaccess` are present at the root.

## Environment Configuration

- Ensure `webapp/.env.production` is correct:
  - `VITE_APP_URL=https://mps-one.com/` (or your staging domain)
- `vite.config.ts` has `base: './'` so asset paths are relative and work from `public_html/`.

## SPA Routing (Apache)

`webapp/public/.htaccess` is included in the build to support client-side routing:

```
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
```

This allows deep links like `/admin` or `/procurement/quote-builder` to resolve to `index.html`.
Also verify new routes such as `/help` (Help Center) correctly resolve.

## Post-Deployment Checks

- Visit your domain and hard-refresh (Ctrl+Shift+R).
- Open DevTools and confirm no 404s for `assets/*` and no console errors.
- Test a few deep links and page refresh to verify `.htaccess` routing.
- Open `/help` and ensure the Help Center loads; open a doc and confirm it renders.

## Staging Verification Checklist (Pre-Release)

Use this checklist before promoting a build to production:

- Build with `npm ci && npm run build` and confirm `webapp/dist/` contents.
- Verify `.env.production` values (e.g., `VITE_APP_URL` for staging domain).
- Upload to staging subdomain directory (e.g., `/staging/`) and extract.
- Confirm SPA routing works: deep links `/admin`, `/procurement/pr`, `/help` resolve.
- Hard refresh, check DevTools for 404s and console errors.
- Navigate PR List and People Directory; confirm performance and no UI errors.
- If monitoring is enabled (`VITE_ANALYTICS_URL`), verify route view events are sent.
- Document outcomes and any deviations; only proceed when all checks pass.

## Rollback Playbook

Follow these steps for a safe rollback when issues are detected:

1. Create a backup of current `/public_html/` to a dated folder (e.g., `/backup_YYYYMMDD/`).
2. Identify the last known good `dist.zip` or backup folder.
3. Restore by re-uploading the previous `dist.zip` and extracting to `/public_html/`, or move backup contents back.
4. Clear browser cache and hard refresh; confirm the site loads without errors.
5. Record rollback details and root cause; schedule a fix before redeploy.

## Rollback & Versioning

- Before replacing files, back up current `public_html` to a dated folder (e.g., `/backup_YYYYMMDD/`).
- Keep local `dist.zip` archives with version/date labels.
- To roll back, re-upload a previous `dist.zip` and extract over `public_html` (or restore your backup).

## Staging (optional)

- If using a staging subdomain, upload to its directory (e.g., `/staging/`).
- Set `VITE_APP_URL` accordingly in `.env.production` before building.
 - Optionally set `VITE_ANALYTICS_URL` to a staging endpoint to validate event hooks.

## Analytics Collector (Local Dev)

A lightweight backend collector is available for development to validate monitoring and route analytics end-to-end.

- Backend endpoints (Express, `webapp/server/index.mjs`):
  - `POST /api/analytics` — accepts JSON `{ name, data, ts, url, ua }` and stores in memory.
  - `GET /api/analytics?limit=100` — returns recent events (disabled in production).
- Dev proxy: Vite forwards `/api/*` to `http://localhost:3001` (see `vite.config.ts`).
- Frontend config:
  - Default posting uses `${VITE_API_BASE}/analytics` when `VITE_ANALYTICS_URL` is not set.
  - Ensure `VITE_API_BASE=/api` in `.env.development`.
- Verify ingestion:
  1) Start backend: in WSL, run `npm run server` from `webapp/`.
  2) Open the app and navigate routes (e.g., `/procurement/pr`).
  3) Check recent events: `GET http://localhost:3001/api/analytics?limit=5`.
  4) You should see `app_boot` and `route_view` entries when browsing.

## Notes

- We’re not using CI/CD; deployments are manual from local builds.
- Optional local backend is used in development for monitoring/analytics validation; production build remains a front-end SPA.

---
