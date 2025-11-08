# Deployment to Hostinger via GitHub Actions (FTP)

This project uses Vite (React + TypeScript). The recommended deployment is to upload the built `dist` folder to Hostinger via a GitHub Actions workflow.

## Prerequisites

1. GitHub repository with this project (ensure the `webapp` folder is at the repo root).
2. Hostinger FTP account and directory:
   - For staging: create `staging.mps-one.com` and note its directory path.
   - For production: `public_html` is typically the document root.
3. SSL enabled (Let’s Encrypt) in hPanel for your domains.

## Repository

- Primary repo: https://github.com/Marleenooooo/mps-one.com
- Ensure `.github/workflows/deploy.yml` exists in the repo; it builds from `webapp` and deploys via FTP.

## Configure Secrets and Variables (GitHub)

Set the following in your repository settings:

### Secrets

- `FTP_HOST` — Hostinger FTP server (e.g., `ftp.mps-one.com` or server hostname).
- `FTP_USERNAME` — FTP username.
- `FTP_PASSWORD` — FTP password.
- `FTP_DIR` — Remote directory (e.g., `/public_html/` for production or `/staging/` for staging).

### Variables (optional)

- `VITE_APP_URL` — `https://mps-one.com/` for production, or your staging URL.

> Note: The workflow uses `VITE_APP_URL` during the build. You can also rely on `.env.production`, but variables offer flexibility.

### Production (mps-one.com) — Hostinger values

Use these exact values for deploying to production:

- `FTP_HOST` = `153.92.11.36` (hostname only, no `ftp://` prefix)
- `FTP_USERNAME` = `u485208858`
- `FTP_PASSWORD` = your FTP account password (keep in GitHub Secrets)
- `FTP_DIR` = `/public_html/` (document root; include trailing slash)
- `VITE_APP_URL` = `https://mps-one.com/`

Notes:
- The workflow uses FTPS (explicit TLS) on port `21` by default.
- If authentication fails (530), re-check username/password in hPanel and that the account has access to `/public_html/`.
- If uploads succeed but the site doesn’t change, verify `FTP_DIR` matches your real document root in File Manager.

## Workflow

The workflow file is at `.github/workflows/deploy.yml`:

- Builds using Node 18 with `npm ci` in `webapp` and runs `npm run build`.
- Uploads `webapp/dist` to the FTP `server-dir` using `SamKirkland/FTP-Deploy-Action`.
- Triggered on push to `main` or manually (workflow dispatch).

## SPA Fallback for Routing

The file `webapp/public/.htaccess` is included in the build and provides:

```
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
```

This ensures deep links like `/admin` or `/procurement/quote-builder` route to `index.html`.

## Local Build (optional)

1. Install Node.js LTS.
2. In `webapp`:
   - `npm ci`
   - `npm run build`
3. The build output is in `webapp/dist`.

## Rollback

- Before changing FTP directory contents, back up your current `public_html` via Hostinger File Manager.
- GitHub retains history; revert by pushing a previous commit to `main` to trigger redeploy.

## Notes

- For staging, set `FTP_DIR` to the staging directory and `VITE_APP_URL` to the staging URL.
- For production, use `FTP_DIR` = `/public_html/` and `VITE_APP_URL` = `https://mps-one.com/`.
- No backend integration is included yet; the app is a front-end SPA ready for future API wiring.