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

## Rollback & Versioning

- Before replacing files, back up current `public_html` to a dated folder (e.g., `/backup_YYYYMMDD/`).
- Keep local `dist.zip` archives with version/date labels.
- To roll back, re-upload a previous `dist.zip` and extract over `public_html` (or restore your backup).

## Staging (optional)

- If using a staging subdomain, upload to its directory (e.g., `/staging/`).
- Set `VITE_APP_URL` accordingly in `.env.production` before building.

## Notes

- We’re not using CI/CD; deployments are manual from local builds.
- No backend integration is included yet; the app is a front-end SPA ready for future API wiring.

---
