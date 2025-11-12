Language: [English](ONBOARDING.md) | [Bahasa Indonesia](id/ONBOARDING.md)

# Onboarding Guide

This guide helps you get from zero to running the app locally and walking through the core procurement flow. It complements the Developer Quickstart in `README.md` and the SOP in `.trae/rules/project_rules.md`.

## 1) Environment Setup
- Node (Windows): ensure `node -v` ≥ 18 (current workspace: `v24.11.0`).
- WSL2 Ubuntu-20.04: run Docker Engine inside WSL only.
- Git installed.

## 2) First Run
```bash
cd webapp
npm ci
npm run dev
# Open http://localhost:5173
```
Optional preview + tests:
```bash
npm run build -- --base=/
npm run preview        # http://localhost:4173
npx playwright install winldd
npx playwright test
```

## 3) Backend & DB (optional, when needed)
Run inside WSL:
```bash
wsl -d Ubuntu-20.04
docker ps
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker run -d -p 8080:80 --name web nginx:alpine
docker ps
```
Migrations:
```bash
bash scripts/import-migrations.sh
bash scripts/verify-db.sh
```

## 4) Switch Modes (Client/Supplier)
- Use the Topbar segmented toggle to switch `Client` ↔ `Supplier`.
- Switching clears pillar-scoped caches to avoid cross-mode bleed and navigates to a mode-specific landing.

## 5) Core Flow Walkthrough (Client → Supplier)
1. Client creates and approves a PR (`/procurement/pr`).
2. Send PR to suppliers; suppliers build quotes (`/procurement/quote-builder`).
3. Client compares quotes and accepts one (`/procurement/quote-comparison`).
4. Generate PO and preview (`/procurement/po/preview`).
5. Record deliveries and corrections (`/inventory/delivery-notes`).
6. Supplier creates invoices within allowed amounts (`/supplier/reporting`).

Illustrations (placeholders):
- ![GIF: Create & Approve PR](../webapp/public/docs/gifs/create-approve-pr.gif)
- ![GIF: Compare Quotes & Generate PO](../webapp/public/docs/gifs/compare-quotes-generate-po.gif)
- ![GIF: Delivery Notes & Invoice](../webapp/public/docs/gifs/delivery-invoice.gif)

## 6) Troubleshooting
- Preview deep routes blank: rebuild with `--base=/`, then `npm run preview`.
- Playwright dependency `winldd` missing: `npx playwright install winldd`.
- Proxy errors to `/api/*` during preview/tests are expected when backend is off.
- Port conflicts: dev `5173`, preview `4173`, backend proxy `3001`.
- See `docs/FAQ.md` for full onboarding fixes.

## 7) Useful References
- `docs/WORKFLOWS.md`: detailed workflow steps and guards.
- `docs/ROLES_PERMISSIONS.md`: roles and permissions matrix.
- `docs/UI_THEME_I18N.md`: neon theme and language settings.
- `DEPLOY.md`: production procedures.

