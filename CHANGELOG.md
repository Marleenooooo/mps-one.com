# Changelog

## v0.1.40 (2025-11-12) — Theme: Global Standardization & Guide

### Highlights
- Docs: Added `immitation.md` guide describing how to imitate the clean theme globally.
- Theme Docs: Updated `docs/UI_THEME_I18N.md` and `docs/id/UI_THEME_I18N.md` with standardized utilities and tokens.
- CSS: Confirmed global tokens/utilities exist in `webapp/src/index.css` (radii, spacing, containers, header gradient, button variants).
- UI: Began applying utilities across pages (Login, Topbar), with Sidebar refactor planned.

### Verification
- Preview dev server and verify:
  - Header sections use `.header-gradient` and neat spacing.
  - Buttons use `.btn-*` variants; glow reduced ~50%.
  - Cards/tooltips leverage `.card` with standardized radius and padding.

### Notes
- Future work: Complete Sidebar and additional routes per SOP.
- Once implementation is complete, the temporary `mpsone/components` can be removed as the patterns are codified.

## v0.1.39 (2025-11-12) — Security: Mode Guards Extension

### Highlights
- Backend: Enforced Client mode on `GET /api/po/summary` and `GET /api/invoice/status`.
- Verification: Supplier mode returns `403` on both endpoints; Client mode returns `200` when DB is available.

### Affected Files
- `webapp/server/index.mjs` (add `requireMode(['Client'])` on PO summary and invoice status routes)

### Verification
- Start backend: `npm run server` → `http://localhost:3001`.
- Ensure DB running: `docker compose up -d` inside WSL (`Ubuntu-20.04`).
- Supplier mode: `GET /api/po/summary` and `/api/invoice/status` → `403 Forbidden: mode not permitted`.
- Client mode: `GET /api/po/summary` → `200` (after DB up); `/api/invoice/status` → `200` when DB up.

### Notes
- No UI changes; backend-only enforcement aligned with Route Guards policy.
- DB connectivity required for `200` responses; guards evaluate before DB calls.

## v0.1.38 (2025-11-12) — Security: Audit active_mode + PR Guards

### Highlights
- Database: Added `active_mode` to `audit_log` with index `idx_audit_mode` for mode-based filtering.
- Backend: Updated `logAudit(...)` to persist `active_mode` on all audit writes.
- Guards: Enforced Client mode on PR read endpoints (`GET /api/pr`, `GET /api/pr/:id`).
- Docs: Updated DB setup (English/Indonesian) with migration and verification steps.

### Affected Files
- `db/migrations/0020_audit_active_mode.sql` (new)
- `webapp/server/index.mjs` (logAudit active_mode; `requireMode(['Client'])` for PR reads)
- `docs/DB_SETUP.md` (new section: 0020 — Audit Log: active_mode)
- `docs/id/DB_SETUP.md` (bagian baru: 0020 — Log Audit: active_mode)

### Verification
- Import migrations in WSL:
  - `bash scripts/import-migrations.sh`
  - `bash scripts/verify-db.sh`
- Check via MySQL/phpMyAdmin:
  - `SHOW COLUMNS FROM audit_log;` → `active_mode` exists
  - `SHOW INDEX FROM audit_log;` → `idx_audit_mode` exists
- Backend checks:
  - Hitting `GET /api/pr` in Supplier mode returns `403` (forbidden: mode not permitted)
  - PR create/update/delete audit entries include `active_mode` reflecting current mode

### Notes
- Aligns with Front‑End ↔ Database Alignment Policy and Subroadmap enforcement.
- Mode values are constrained to `Client|Supplier`; default fallback is `Client`.

## v0.1.37 (2025-11-12) — Performance: Proper Caching & Service Worker

### Highlights
- Added a minimal service worker that:
  - Serves built assets (`/assets/*`) via cache‑first.
  - Handles HTML navigations with network‑first and cache fallback.
  - Applies stale‑while‑revalidate to same‑origin API `GET` requests under `/api/*`.
- Strengthened Apache headers for immutable assets and non‑cached HTML.
- Registered the service worker only in production with `VITE_ENABLE_SW` opt‑in.

### Affected Files
- `webapp/public/sw.js` (new)
- `webapp/src/main.tsx` (SW registration)
- `webapp/public/.htaccess` (immutable caching headers)

### Verification
- Built via `npm run build`; preview served at `http://localhost:5181/`.
- SW registration verified without console errors; application loads normally.

### Notes
- Strategies are framework‑agnostic and align with Vite build output.
- Future enhancements can move to Workbox or `vite-plugin-pwa` if needed.

## v0.1.36 (2025-11-12) — Performance: Bundle Analysis & Tree‑Shaking

### Highlights
- Integrated `rollup-plugin-visualizer` to generate a treemap bundle report at `dist/stats.html`.
- Enabled Rollup treeshake with safe defaults and `sourcemap` for inspection.
- Verified preview server serves the report without errors.

### Affected Files
- `webapp/vite.config.ts` (visualizer plugin; treeshake and sourcemap)
- `subroadmap.md` (new item: Performance & Build — Bundle Analysis & Tree‑Shaking)
- `roadmap.md` (Performance item marked progressed/completed)

### Verification
- Built via `npm run build`; preview served at `http://localhost:5180/`.
- Opened `http://localhost:5180/stats.html`; no browser errors observed.

### Notes
- Follow‑ups can explore further reductions (e.g., aggressive `drop: ['console']`) once profiling confirms safety.

## v0.1.35 (2025-11-12) — Security & Access: Route Guards + Mode Guard

### Highlights
- Frontend: Standardized route guards via a reusable `RouteGuard` component; applied to `/client` and `/supplier/admin` to enforce mode and role.
- Backend: Extended auth parsing to include `mode` from `x-user-type` and introduced `requireMode()` middleware.
- Enforcement: Applied `requireMode('Client')` to `/api/pr` family endpoints and `requireMode(['Client','Supplier'])` to `/api/docs/upload`.
- API: Client and supplier requests now include `x-user-type` header to propagate active mode to the backend.

### Affected Files
- `webapp/src/components/RouteGuard.tsx` (new)
- `webapp/src/App.tsx` (integrated route guard usage)
- `webapp/src/services/api.ts` (send `x-user-type` header)
- `webapp/server/index.mjs` (auth parsing update and `requireMode` middleware)
- `subroadmap.md` (item: Security & Access Control — Route Guards + Mode Guard)
- `roadmap.md` (Security note added)

### Verification
- Dev server running at `http://localhost:5178/`.
- Previewed `/client` and `/supplier/admin`; no browser errors observed.
- Guards respect `localStorage:mpsone_user_type` and `mpsone_role`; unauthorized states redirect to the configured fallback.

### Notes
- Vite proxy continues to route `/api/*` to backend; mode enforcement requires presence of `x-user-type` in requests.
- Backend verification of mode guards is aligned for PR and docs flows; broader endpoint coverage will follow per roadmap.

## v0.1.33 (2025-11-12) — Performance: Virtualize Long Lists

## v0.1.34 (2025-11-12) — Performance: Image Optimization

### Highlights
- Added `OptimizedImage` component with `loading="lazy"`, `decoding="async"`, and `fetchPriority` defaults.
- Replaced direct `<img>` usage in `QRCode` to leverage optimized loading.
- Verified PO Preview and Client dashboard render with no errors.

### Affected Files
- `webapp/src/components/UI/OptimizedImage.tsx` (new component)
- `webapp/src/components/UI/QRCode.tsx` (updated to use OptimizedImage)
- `subroadmap.md` (new item: Performance Optimization — Image Optimization)
- `roadmap.md` (Image Optimization marked completed)

### Verification
- Previewed `http://localhost:5177/client`; no browser errors observed.
- PO Preview attempted; no terminal errors detected; QR fallback remains robust.

### Notes
- Real image assets (WebP/AVIF) to be wired when available; current optimization targets generated images (QR) and defaults.

### Highlights
- Enabled row virtualization for PR List using built-in `DataTable` virtualization.
- Reduced DOM work and improved scroll performance on `/procurement/pr`.
- Confirmed Document Manager virtualization remains intact; no regressions.
- Updated roadmap to reflect virtualization completed per SOP.

### Affected Files
- `webapp/src/pages/procurement/PRList.tsx` (enable `virtualize`, set `height`/`rowHeight`)
- `subroadmap.md` (new item: Performance Optimization — Virtualize Long Lists)
- `roadmap.md` (add completed bullet under Performance)

### Verification
- Previewed `/procurement/pr` on dev server; no browser errors observed.
- Scrolling remains smooth; selection and bulk actions are accessible.

### Notes
- Overscan leverages `computeOverscan('prList')` from `webapp/src/config.ts`.
- Document Manager virtualization already present; verified alongside PR List.

## v0.1.32 (2025-11-12) — Performance: Code Splitting Verification

### Highlights
- Verified router-wide code splitting using `React.lazy` with unified `Suspense` skeleton fallback.
- Confirmed heavy routes render via lazy loading without visual or accessibility regressions.
- Updated roadmap to mark code splitting complete per SOP.

### Affected Files
- `webapp/src/App.tsx` (lazy imports and `Suspense` fallback)

### Verification
- Previewed `/client`, `/supplier/reporting`, `/client/quotes/:id`, and `/procurement/po/preview` in dev.
- No browser errors observed; chunks loaded correctly with skeleton.

### Notes
- Dev server started on `http://localhost:5174/` (port auto-selected); behavior consistent with prior setup.


## v0.1.31 (2025-11-12) — RBAC Frontend Enforcement (Scope Expansion)

### Highlights
- Expanded RBAC gating across core pages for consistent enforcement.
- QuoteComparison: Approve Quote gated by `evaluate:quotes`; Generate PO gated by `create:po`.
- PO Preview: Print/Save PDF gated by `create:po`.
- Delivery Notes: Corrections input disabled unless `confirm:delivery`.
- Order Tracker: Added gated “Mark as Paid” button (`mark:payment`) after invoiced stage.

### Affected Files
- `webapp/src/pages/client/QuoteComparison.tsx`
- `webapp/src/pages/POPreview.tsx`
- `webapp/src/pages/DeliveryNotes.tsx`
- `webapp/src/pages/OrderTracker.tsx`

### Notes
- Visual theme unchanged; accessible states via `aria-disabled`/`disabled`.
- Roles read from `localStorage` (`mpsone_user_type`, `mpsone_role`); backend alignment to follow.

## v0.1.25 (2025-11-12)

## v0.1.26 (2025-11-12)

### Highlights
- Motion & Accessibility for Interactions:
  - Introduced motion variables (`--motion-fast`, `--motion-medium`, `--motion-slow`, `--ease-standard`, `--ease-emphasized`).
  - Applied motion scale to cards, buttons, and sidebar transitions (transform, box-shadow, color/border changes).
  - Added global `prefers-reduced-motion` media query to minimize animations/transitions and disable shimmer/fade heaviness for accessibility.

### Affected Files
- `webapp/src/index.css`

### Notes
- Verified on `/settings`, `/notifications`, and `/comms`; hover/active feel smooth and consistent.
- Reduced-motion mode honored; heavy motion is suppressed while focus visibility remains intact.

### Highlights
- Layout Ergonomics & Navigation Clarity:
  - Added accent border utility classes: `.accent-border`, `.accent-border-left`, `.accent-border-top` using module gradient border-image.
  - Applied accent borders to Settings and Notifications main cards for clearer visual grouping.
  - Refined sidebar ghost ergonomics with slight translate on hover and persistent focus-visible outlines.

### Affected Files
- `webapp/src/index.css`
- `webapp/src/pages/Settings.tsx`, `webapp/src/pages/Notifications.tsx`

### Notes
- UI preview verified on `/settings` and `/notifications` in light/dark modes; interactions feel smooth with clear accents.

## v0.1.27 (2025-11-12)

### Highlights
- Pillar Separation kick-off (frontend):
  - Added active Pillar context indicator to the topbar using module theme variables.
  - Guarded QuickSearch suggestions by active pillar to minimize cross-pillar “social bleed”.
  - Visually de-emphasized out-of-context sidebar items while preserving navigation and accessibility.
  - Added client-only route guards for `/procurement/pr` and `/procurement/pr/new` to enforce mode separation.
  - Introduced `PillarProvider` to derive pillar from routes and tag analytics spans/events.
  - Extended procurement guards: client-only for `/procurement/workflow` and `/procurement/po/preview`; supplier-only for `/procurement/quote-builder`.
 - Added pillar-scoped storage helper (`pillarStorage`) and adopted for gating keys: `mpsone_po_from_quote`, `mpsone_quote_accepted`, `mpsone_audit_trail`, `mpsone_pr_sent` (read via namespaced with legacy fallback; writes dual).

### Storage Adoption Extension (pillar-scoped)
- Extended `pillarStorage` adoption beyond initial gating keys to cover additional procurement and supplier caches:
  - PR List: `mpsone_pr_draft`, `mpsone_audit_trail`, `mpsone_suppliers`, `mpsone_pr_sent`
  - Navigation: `mpsone_pr_sent` in Topbar and Sidebar
  - Order Tracking: `mpsone_po_from_quote`, `mpsone_available_to_invoice`
  - Delivery Notes: dynamic `mpsone_delivery_notes_${poId}`, plus `mpsone_po_from_quote`, `mpsone_available_to_invoice`
  - Supplier Reporting: `mpsone_available_to_invoice`, `mpsone_delivery_notes_${poId}`
  - Client Quote Comparison: dynamic `mpsone_quotes_${prId}`, plus `mpsone_pr_sent`, `mpsone_audit_trail`

### Affected Files (extension)
- `webapp/src/pages/procurement/PRList.tsx`
- `webapp/src/components/Layout/Topbar.tsx`
- `webapp/src/components/Layout/Sidebar.tsx`
- `webapp/src/pages/OrderTracker.tsx`
- `webapp/src/pages/DeliveryNotes.tsx`
- `webapp/src/pages/supplier/Reporting.tsx`
- `webapp/src/pages/client/QuoteComparison.tsx`

### Notes (verification)
- Previewed `/procurement/pr`, `/procurement/workflow`, `/procurement/po/preview`, `/supply/order-tracker`, `/inventory/delivery-notes`, and `/supplier/reporting`; no browser or terminal errors observed.
- Import style fixed to `import * as pillarStorage` across modules to match helper exports.

### Tests
- Playwright e2e coverage expanded:
  - Guard redirects for `/procurement/po/preview` (missing seed) and `/procurement/quote-builder` (supplier without approved PR).
  - Runs via `npm run test:e2e` against preview server; 9 tests passing locally.
 - Analytics console verification is dev-only and validated manually during development sessions.

### Affected Files
- `webapp/src/components/Layout/Topbar.tsx`
- `webapp/src/components/Layout/Sidebar.tsx`
- `webapp/src/index.css`
- `permissionsandpage.md`
- `webapp/src/components/PillarProvider.tsx`
- `webapp/src/App.tsx`
 - `webapp/src/services/pillarStorage.ts`
 - `webapp/src/pages/client/QuoteComparison.tsx`
 - `webapp/src/pages/POPreview.tsx`

### Notes
- Previewed `/procurement/pr` to confirm indicator, QuickSearch filtering, and sidebar de-emphasis without console errors.
- Verified client-only guards on `/procurement/pr` and `/procurement/pr/new` in dev.
- Pillar-tagged analytics visible in dev console; no runtime errors.
 - Verified guard behavior and storage isolation via previews on `/procurement/workflow`, `/procurement/po/preview`, and `/procurement/quote-builder`.

### Highlights
- Client/Supplier Mode Toggle & Context Reset:
  - Added explicit segmented toggle in Topbar to switch `mpsone_user_type` between Client and Supplier.
  - On switch, clears pillar-scoped procurement caches to prevent cross-mode bleed.
  - Navigates to mode-specific landing to force a clean layout/state reset.
 - Mode-Aware Navigation:
   - QuickSearch gated by active mode — client-only entries shown in Client mode; supplier-only entries shown in Supplier mode.
   - Sidebar hides client-only procurement items in Supplier mode to avoid redirect noise.

### Affected Files
- `webapp/src/components/Layout/Topbar.tsx`
 - `webapp/src/components/Layout/Sidebar.tsx`

### Notes
- Previewed `/procurement/workflow` after adding the toggle; no browser or terminal errors observed.
 - Previewed `/supplier/reporting` to verify Sidebar and QuickSearch mode gating; no errors observed.

### Highlights
- Mode-Aware Dashboards:
  - Added mode-aware routing for dashboards: `/client` is accessible only in Client mode; Supplier mode redirects to `/supplier/admin`.
  - Enforced Supplier mode requirement on supplier admin routes (Admin, Invitations, People, Reporting, Email).
  - Simplified Supplier Admin dashboard actions to show only supplier-relevant action (New Quote); hid client-only actions (New PR, New PO).

### Affected Files
- `webapp/src/App.tsx`
- `webapp/src/pages/supplier/AdminDashboard.tsx`

### Notes
 - Previewed `/client` and `/supplier/admin`; dashboards render cleanly with mode-aware routing and actions. No browser or terminal errors observed.
 - Verified Client Dashboard shows only client-specific actions (Quick PR, budget utilization, documents, invoice overview); no supplier-only actions appear.

### Highlights
- Direct URL Access Blocking:
  - Implemented an env-gated check in `webapp/src/main.tsx` to block direct deep-link access.
  - In production (`VITE_BLOCK_DIRECT_URL=1`), non-whitelisted direct entries redirect to `VITE_APP_URL` (https://mps-one.com/).
  - Development remains unaffected (`VITE_BLOCK_DIRECT_URL=0`) to allow deep-link previews.

### Affected Files
- `webapp/src/main.tsx`
- `webapp/.env.production`
- `webapp/.env.development`

### Notes
- Verified dev preview remains functional on `/client` and `/supplier/reporting` with no unintended redirects.

## v0.1.24 (2025-11-12)

### Highlights
- Joyful Layout Polish:
  - Added card hover micro-interactions with subtle lift and shadow; dark mode glow refined.
  - Introduced global ghost button hover/focus styles with soft fill and glow.
  - Added reusable `page-title` gradient text class; removed inline styles in Settings and Notifications.
  - Dev: suppressed notifications proxy calls when offline to avoid Vite proxy errors.

### Affected Files
- `webapp/src/index.css`
- `webapp/src/pages/Settings.tsx`, `webapp/src/pages/Notifications.tsx`
- `webapp/src/services/notifications.ts`

### Notes
- UI preview verified on `/notifications` and `/comms` with no browser errors.
- Terminal proxy errors for `/api/notifications` are suppressed in offline mode via `getOfflineMode()` guard.

## v0.1.22 (2025-11-12)

### Highlights
- Documentation modernization and onboarding polish:
  - Added Developer Quickstart to `README.md` (dev, preview, E2E, WSL Docker SOP).
  - Appended onboarding troubleshooting to `docs/FAQ.md` (Playwright `winldd`, deep route base, proxy errors, ports, WSL-only Docker).
  - Mirrored troubleshooting entries to `docs/id/FAQ.md`.

### Affected Files
- `README.md`
- `docs/FAQ.md`
- `docs/id/FAQ.md`

### Notes
- Non-UI changes; no preview required.
- Playwright tests verified locally (7 passed); deep-route preview uses `--base=/` per Quickstart.

## v0.1.23 (2025-11-12)

### Highlights
- Observability Enhancements (Phase 7 start):
  - Added minimal OpenTelemetry-like spans for route navigation and actions (behind env flags).
  - Created `docs/OBSERVABILITY.md` with SLOs, setup, env flags, and verification.
  - Added dashboard templates under `ops/observability/` for Grafana/Tempo and Jaeger.

### Affected Files
- `webapp/src/services/monitoring.ts`
- `webapp/src/App.tsx`
- `docs/OBSERVABILITY.md`
- `ops/observability/grafana-tempo-dashboard.json`
- `ops/observability/jaeger-dashboard.json`

### Notes
- Instrumentation is optional; enable with `VITE_OTEL_ENABLED=true` and set `VITE_OTEL_EXPORT_URL`.
- Verified dev navigation on `/comms` and `/procurement/pr` with no console errors.

## v0.1.21 (2025-11-12)

### Highlights
- Security & Access: Created `permissionsandpage.md` as the single source of truth (SSOT) for routes, features, required permissions, roles, mode constraints, and pillar tagging.
- Roadmap: Marked the matrix file as created; future PRs must reference matrix row IDs.

### Affected Files
- `permissionsandpage.md`
- `roadmap.md`

### Notes
- Non-UI change; no preview required. Aligns with current roles (Admin, PIC Operational, PIC Procurement, PIC Finance; Supplier Admin, Supplier PIC Procurement, Supplier PIC Finance) and key routes.
- QA and PR templates should start referencing matrix IDs for new features/routes.

## v0.1.20 (2025-11-12)

### Highlights
- Offline parity & sync reconciliation for Communications and core routes.
  - Added client-side offline queue for documents and messages; idempotency via SHA-256.
  - Extended mock services to include thread metadata (`labels`, `archived`) and persisted `/api/docs` list/upload flows for parity.
  - Wired `/comms` to enqueue when offline or network down, with optimistic UI updates and auto-flush on `online`.
  - Reconciliation status badge displayed on `/comms` showing pending items.

### Affected Files
- `webapp/src/services/offlineQueue.ts`
- `webapp/src/services/mock.ts`
- `webapp/src/services/api.ts`
- `webapp/src/pages/CommunicationHub.tsx`

### Notes
- UI preview verified: `/comms`, `/procurement/pr`, `/notifications`, `/settings`.
- Dev analytics endpoint may 404; non-blocking and does not affect functionality.

## v0.1.19 (2025-11-12)

### Highlights
- Communications: attachments persistence and rich editor serialization.
  - Frontend: composer now uploads attachments via `POST /api/docs/upload` with `type="EmailAttachment"` and links them to the current thread; shows pre-send removable chips and upload progress.
  - Frontend: rich editor serializes to a safe HTML subset (bold, italic, underline, links, mentions, line breaks) and renders as HTML; formatting survives reload.
  - Frontend: labels and archive toggles added; archived threads are hidden by default with a “Show” toggle.
  - Services: added `apiUploadDoc` and `apiListDocs` in `webapp/src/services/api.ts` with offline parity in `webapp/src/services/mock.ts`.

### Affected Files
- `webapp/src/pages/CommunicationHub.tsx`
- `webapp/src/services/api.ts`, `webapp/src/services/mock.ts`

### Notes
- UI preview verified on `/comms` in light/dark modes; no console or terminal errors observed.
- Backend schema unchanged; labels/archive persisted client-side for now per roadmap scope.

## v0.1.18 (2025-11-12)

### Highlights
- Theme & Accessibility (Neon VNS): refined disabled states for buttons to align with Neon SOP (reduced opacity, pointer-events disabled, theme-specific bases for dark/light). Verified global focus indicators, button variants, sidebar active/hover, and module page headers.

### Affected Files
- `webapp/src/index.css`

### Notes
- UI preview verified on `/settings`, `/notifications`, and `/procurement/pr` in light/dark modes. No console or terminal errors observed.

## v0.1.17 (2025-11-12)

### Highlights
- Communications (Gmail-like parity, step 2):
  - Database: added `subject` column to `email_thread` via `0018_email_thread_subject.sql`.
  - Backend: thread endpoints now accept and return `subject` (`POST /api/email/thread`, `GET /api/email/thread/:id`, `GET /api/email/threads`).
  - Frontend: composer sends `subject` on thread creation; subject displays in thread header. Composer enhanced with toolbar, mentions, drag-and-drop, and shortcuts.
  - i18n: added English/Indonesian keys for `Cc`, `Bcc`, and `Subject`.
- Docs: DB Setup updated (EN/ID and public mirrors) with migration import/verify steps for `email_thread.subject`.

### Affected Files
- `db/migrations/0018_email_thread_subject.sql`
- `webapp/server/index.mjs`
- `webapp/src/pages/CommunicationHub.tsx`
- `webapp/src/services/api.ts`, `webapp/src/services/mock.ts`
- `webapp/src/components/I18nProvider.tsx`
- `docs/DB_SETUP.md`, `docs/id/DB_SETUP.md`
- `webapp/public/docs/DB_SETUP.md`, `webapp/public/docs/id/DB_SETUP.md`

### Ops
- WSL: `bash scripts/import-migrations.sh` then `bash scripts/verify-db.sh`; confirm `subject VARCHAR(255)` exists on `email_thread` via phpMyAdmin.
- Restart backend after applying migration to ensure new column is available to queries.

### Notes
- UI preview verified the Communications page loads with subject field, Cc/Bcc toggles, toolbar, mentions hints, and drag-and-drop attachments.
- Further Gmail parity items (rich editor, full attachments flow, thread metadata) are queued per roadmap.

## v0.1.16 (2025-11-12)

### Highlights
- Phase 6 (Release & Scale) kick-off:
  - Deployment: added a Staging Verification Checklist and a practical Rollback Playbook to `DEPLOY.md`.
  - Monitoring: introduced lightweight client-side error capture and route view analytics.
  - Docs: updated `USER_GUIDE.md` with Monitoring & Analytics setup and verification steps.

### Affected Files
- `DEPLOY.md`
- `webapp/src/services/monitoring.ts`
- `webapp/src/main.tsx`
- `webapp/src/App.tsx`
- `docs/USER_GUIDE.md`

### Ops
- Optional: set `VITE_ANALYTICS_URL` in `.env.production` (or staging env) to POST minimal event payloads.
- Verify in dev: open DevTools to observe `[analytics]` logs on route changes and error events.

### Notes
- Monitoring hooks are lightweight and dev-friendly; they log to console in development and POST if an endpoint is configured.
- No visual/UI changes; verified app loads and routes continue to function under instrumentation.

## v0.1.15 (2025-11-11)

### Highlights
- Email Integrations (Phase 4 start):
  - Endpoints: `POST /api/email/oauth/start`, `GET /api/email/oauth/callback`, `GET /api/email/accounts`, `DELETE /api/email/accounts/:id`, `POST /api/email/sync`.
  - Courier Webhooks: `POST /api/webhooks/courier/:vendor` upserts tracking status/events.
- Database:
  - `0015_email_oauth.sql` — `email_account` and `email_sync_state` tables.
  - `0016_courier_tracking.sql` — `shipment_tracking` table with unique `(vendor, tracking_no)`.
- Docs:
  - `docs/EMAIL.md` and `docs/id/EMAIL.md` updated with OAuth, sync job, and courier webhook sections.
  - `docs/DB_SETUP.md` and `docs/id/DB_SETUP.md` note new migrations and verification.

### Affected Files
- `webapp/server/index.mjs`
- `db/migrations/0015_email_oauth.sql`
- `db/migrations/0016_courier_tracking.sql`
- `docs/EMAIL.md`, `docs/id/EMAIL.md`
- `docs/DB_SETUP.md`, `docs/id/DB_SETUP.md`

### Ops
- WSL: `bash scripts/import-migrations.sh` then `bash scripts/verify-db.sh`; confirm tables in phpMyAdmin.
- Smoke test endpoints locally on `http://localhost:3001` via Vite proxy or direct.

### Notes
- OAuth endpoints are dev stubs pending provider wiring; tokens stored in `token_json`.
- Shipment tracking endpoint stores webhook events JSON and latest status; integrate provider mappings next.

## v0.1.14 (2025-11-11)

### Highlights
- Backend Auth/RBAC: parsed bearer/dev tokens and attached `email`/`role`; `requireRole` now enforced across protected routes.
- Audit Trail: introduced `audit_log` table and server-side audit inserts for PR, email thread, social, and invite actions.
- Server-side tables: added pagination/filters on `/api/pr` and `/api/users` via `limit`, `offset`, `status`, `q`, and `sort`.
- Document storage: `/api/docs` list with filters; `/api/docs/upload` stores `hash_sha256`, `storage_provider`, `storage_key`, and AV scan stub fields (`scan_status`, `scan_vendor`, `scan_at`).
- Database: `0014_audit_and_doc_scan.sql` adds `audit_log` and document columns for secure storage and AV scan metadata.
- Docs: updated DB Setup (root and in-app) with Phase 3 schema changes and verification steps.

### Affected Files
- `webapp/server/index.mjs`
- `db/migrations/0014_audit_and_doc_scan.sql`
- `docs/DB_SETUP.md`
- `webapp/public/docs/DB_SETUP.md`

### Ops
- WSL: `bash scripts/import-migrations.sh` then `bash scripts/verify-db.sh`; verify via phpMyAdmin at `http://localhost:8081/`.
- Restart the dev server to pick up auth middleware and new endpoints.

### Notes
- Auth parsing supports dev headers (`x-email`, `x-role`) and dev bearer pattern `Bearer dev.<type>.<role>.<code>` for local testing; production uses `mpsone_jwt`.
- AV scan is stubbed; integrate ClamAV or vendor per roadmap when infra is ready.
- Endpoints align with existing UI flows; frontend guards remain minimal and compatible.

## v0.1.11 (2025-11-11)

### Highlights
- Backend API: implemented social features endpoints aligned to frontend contracts:
  - `GET /api/users` — list users (name, email, role).
  - `POST /api/users/follow` / `POST /api/users/unfollow` — follow/unfollow by email; respects block constraints.
  - `POST /api/users/block` / `POST /api/users/unblock` — manage block relations; removes conflicting relationships.
  - `GET /api/users/:email/relationships` — returns `following` and `followers` email arrays.
  - `GET /api/users/:email/blocks` — returns `blocked` and `blockedBy` email arrays.
  - `POST /api/users/invite` — create invite with token (7‑day expiry).
  - `GET /api/users/:email/invites` — list invites for target email.
  - `PUT /api/users/invites/:id` — update status (supports `accepted`, `expired`, `declined`).
  - `DELETE /api/users/invites/:id` — cancel invite.
  - `POST /api/users/conv-blocked` — check conversation participants for any block relation.
- Database: added migrations for social features and enum alignment:
  - `0011_social_features_fix.sql` — aligns to singular `user` schema; creates `user_relationships`, `user_blocks`, `user_invites`; extends `user` with `nickname` and `status`.
  - `0012_invites_enum_declined.sql` — extends invite status enum with `declined`.
- Docs: updated DB Setup (EN/ID) to include social migrations and verification queries; reinforced WSL import/verify steps.

### Affected Files
- `webapp/server/index.mjs`
- `db/migrations/0011_social_features_fix.sql`
- `db/migrations/0012_invites_enum_declined.sql`
- `webapp/public/docs/DB_SETUP.md`
- `webapp/public/docs/id/DB_SETUP.md`

### Notes
- Endpoints use email lookups against `user`; migrations ensure tables exist even if prior plural `users` schema isn’t present.
- Follow requests are rejected when any block exists in either direction.
- Invite status supports `declined` to mirror frontend behavior; existing records remain compatible.

## v0.1.12 (2025-11-11)

### Highlights
- Database: `0013_invites_add_from_email.sql` adds `from_email` to `user_invites` plus index for efficient lookups.
- Backend: invite endpoints updated to store inviter email and list invites in `{ sent, received }` shape for People Directory.
- Docs: DB Setup (EN/ID) updated with 0013 and verification query.

### Affected Files
- `db/migrations/0013_invites_add_from_email.sql`
- `webapp/server/index.mjs`
- `webapp/public/docs/DB_SETUP.md`
- `webapp/public/docs/id/DB_SETUP.md`

### Notes
- Existing invites remain valid; new invites will include `from_email`.
- People Directory UI now aligns with backend without OFFLINE mocks.

## v0.1.13 (2025-11-11)

### Highlights
- Database: Make `0009_email_thread_context.sql` idempotent (safe re-imports).
- Database: Deprecate `0010_user_social_features.sql` to a no-op; social schema uses 0011+.
- Ops: Full migration import now succeeds end-to-end; verification passes.

### Affected Files
- `db/migrations/0009_email_thread_context.sql`
- `db/migrations/0010_user_social_features.sql`

### Notes
- `0011_social_features_fix.sql` and `0013_invites_add_from_email.sql` remain source of truth for social tables and invite fields.
- If you previously ran 0010, ensure no duplicate tables exist; our scripts import idempotently going forward.

## v0.1.10 (2025-11-11)

### Highlights
- PR Approval Gating (UI + Route Guards):
  - Quote Builder link is disabled with tooltip for suppliers until an Approved PR is sent to them (Sidebar + Topbar QuickSearch).
  - Client Quote Comparison (`/client/quotes/:prId`) guarded; redirects if PR not Approved.
  - PR List actions gated: “Send PR to suppliers” requires Approved; “Compare quotes” disabled until Approved, with localized tooltips.
  - Added i18n keys for gating messages (EN/ID) and “Compare quotes” label.
- Enforced role-aware guards for `/docs` and `/comms`: requires `mpsone_user_type` (`client` or `supplier`), otherwise redirects to `/login/client`.
- Added client-side guard for Quote Comparison: `/client/quotes/:prId` now requires the target PR to be `Approved`.
- Minor: consolidated supplier guard helper; ensured `QuoteBuilder` remains restricted to suppliers with PR context.
 - Prefilled PO Preview from accepted quote context: reads `mpsone_po_from_quote` and surfaces PR and supplier in header; switches to layout B and shows PR number column.
- Added gated "Create Invoice" action in Supplier Reporting: button disabled with tooltip when `invoice.amount > deliveredAmount` per PO, reflecting Delivery Notes corrections.
- Added invoice creation modal in Supplier Reporting: shows remaining deliverable (from Delivery Notes gate), enforces disabled submit when exceeding gate, and appends the new invoice to the current view.
- Modal now includes Delivery References table sourced from `localStorage:mpsone_delivery_notes_${poId}` to show item-level context (received, correction, available).
 - Accessibility: modal now traps focus, sets initial focus to the Amount field, supports Escape-to-close, and includes ARIA labelling for title and description.
 - Accessibility: added global "Skip to Content" link anchored to `#main-content` to improve keyboard navigation and meet WCAG AA; verified focus-visible indicators in sidebar and inputs.
 - Accessibility: `<html lang>` now reflects the active i18n language (EN/ID) via provider effect, improving screen reader behavior and SEO semantics.
 - Accessibility: Sidebar navigation items now include descriptive `aria-label`s; active route retains `aria-current`, improving screen reader navigation.
 - Accessibility: Breadcrumbs now use semantic `nav > ol > li` structure with `aria-current` on the final crumb for better assistive tech support.
 - Accessibility: Forms now link errors via `aria-describedby` with `aria-invalid` across PR Create inputs; improves screen reader clarity and focus context.
 - Accessibility: Supplier Reporting invoice modal adds inline validation for Amount and Due Date with `aria-describedby` error messages; submit disabled based on validation.
 - Accessibility: Disabled contrast improved for buttons and inputs in `index.css` across light/dark themes using `--border` background and readable text colors.
- Theme: Smooth theme switching added — backgrounds, borders, and text now transition (`background-color`, `color`, `border-color` at 0.3s) across key surfaces (body, sidebar, topbar, cards, headers, inputs). Topbar toggle persists preference and respects OS detection via `ThemeProvider`.
- Minor: Topbar i18n — added translation keys for theme toggle, language toggle, settings, logout, logged‑in label, and offline mock badge (EN/ID); tooltips and aria‑labels now fully localized.
 - UI Theme: Outline buttons now use module-specific gradients with hover micro‑interactions (scale 1.02, soft glow in light, neon glow in dark) and 20% opacity fill; aligns with Neon SOP across modules.
 - UI Theme: Button variants (primary, secondary, success, danger) updated with Neon micro‑interactions — hover adds scale(1.02) with soft/neon glow; active uses darker state with scale(0.98); verified on `/procurement/pr-create` and `/procurement/workflow`.
- Accessibility: Focus-visible parity for buttons — added :focus-visible styles for outline/primary/secondary/success/danger with appropriate glow across themes; verified on `/procurement/pr-create` and `/supplier/reporting`.

- Delivery Notes: computed and persisted `available_to_invoice` and delivered amount per PO; UI labels localized (EN/ID) for headers and table columns.
- Supplier Reporting: localized invoice creation modal (title, remaining deliverable, delivery references, empty state) and gated action tooltip; button text now uses i18n.

- Quote Comparison: added "Reject Quote" action with audit logging and status badge update (`rejected`).
- PO Preview: added route guard requiring accepted quote context; redirects to Workflow or Quote Comparison when missing/mismatched.
- I18n: added translation keys for quote actions and PO generation labels (EN/ID).

### Affected Files
- `webapp/src/App.tsx`
 - `webapp/src/pages/client/QuoteComparison.tsx`
 - `webapp/src/pages/POPreview.tsx`
 - `webapp/src/pages/supplier/Reporting.tsx`
 - `webapp/src/components/Layout/Sidebar.tsx`
 - `webapp/src/components/Layout/Topbar.tsx`
 - `webapp/src/components/I18nProvider.tsx`
 - `webapp/src/pages/procurement/PRCreate.tsx`
 - `webapp/src/index.css`

### Notes
- Guards align with roadmap-driven lifecycle and roles/permissions; documents and communications are no longer accessible without a known user type.
- Quote comparison respects procurement gating; non-approved PRs are redirected to the workflow overview.
 - PO Preview now reflects conversion context from accepted quotes; sample items remain until backend provides item-level data.
 - Supplier Reporting now enforces delivery → invoice gating at action level with a disabled state and tooltip for insufficient delivered totals.

## v0.1.9 (2025-11-10)

### Highlights
- Mirrored updated DB setup docs to in-app Doc Viewer (`webapp/public/docs` and `webapp/public/docs/id`) for easier access to local Docker + WSL steps.
- Improved Windows PowerShell migration script to auto-start Docker Compose and import idempotently (`mysql --force`).
- Added README wishlist entries for quick access: Doc Viewer tile for Local DB, one-click Dev Tools action to start/import/verify, and phpMyAdmin deep link.
- Added a formal SOP for Docker Engine + WSL under `.trae/rules/project_rules.md` aligning local DB operations with scripts and compose setup.

### Affected Files
- `webapp/public/docs/DB_SETUP.md`
- `webapp/public/docs/id/DB_SETUP.md`
- `scripts/import-migrations.ps1`
- `README.md`
- `.trae/rules/project_rules.md`

### Notes
- PowerShell script now starts the stack if `mpsone-db` isn’t running and uses `--force` to safely re-run migrations.
- In-app docs present the same local Docker guidance as root docs; Help can link directly for quicker onboarding.
- SOP centralizes procedures (start/import/verify/stop/reset) and troubleshooting for Windows + WSL workflows.

## v0.1.8 (2025-11-10)

### Highlights
- Added local MySQL + phpMyAdmin stack (Docker + WSL) with a named volume (`mpsone-db-data`) and exposed ports (`3306`, `8081`).
- Introduced `scripts/import-migrations.sh` to auto-start containers and import versioned SQL with `mysql --force` for idempotent re-runs.
- Made `db/migrations/0006_schema_alignment.sql` fully idempotent using `INFORMATION_SCHEMA` checks and prepared statements for columns and indexes.
- Added `scripts/verify-db.sh` to validate seed counts and PR columns/indexes (`title`, `description`, `budget_code`, `approver`, `idx_pr_status`, `idx_pr_need_date`).
- Updated documentation: README local Docker setup; DB Setup docs to include local stack instructions.

### Affected Files
- `db/docker-compose.yml`
- `db/migrations/0006_schema_alignment.sql`
- `scripts/import-migrations.sh`
- `scripts/verify-db.sh`
- `README.md`, `docs/DB_SETUP.md`, `docs/id/DB_SETUP.md`

### Notes
- phpMyAdmin runs at `http://localhost:8081/` with `PMA_ABSOLUTE_URI` set to ensure correct redirects.
- Local DB credentials (development only): database `mpsone_dev`, user `mpsone_dev` (password `devpass`), root password `rootpass`.
- Migrations are safe to re-run; guards prevent duplicate columns/keys and index creation.
- Use WSL to run scripts to avoid PowerShell quoting issues; see README for commands.

## v0.1.7 (2025-11-10)

### Enhancements
- Wired compact `AuditTimeline` component to `PRList` and `client/QuoteComparison` to surface recent audit events per PR.
- Tied `DeliveryNotes` entries into `supply/OrderTracker` pipeline: auto-advance to “Delivered” when delivery gate exists; summary panel with PO, delivered amount, and available qty.
- Extended `supplier/Reporting` with filters to segment by payment status (`paid`, `neutral`, `waiting`, `next`, `over‑due`) and due window (`≤7d`, `≤14d`, `≤30d`, `over‑due`); export buttons respect current view.

### Affected Files
- `webapp/src/components/UI/AuditTimeline.tsx`
- `webapp/src/pages/procurement/PRList.tsx`
- `webapp/src/pages/client/QuoteComparison.tsx`
- `webapp/src/pages/OrderTracker.tsx`
- `webapp/src/pages/supplier/Reporting.tsx`
- `README.md`

### Notes
- Audit entries are read from `localStorage:mpsone_audit_trail`, keyed as `PR:<id>`; displayed compactly with actor/type/role.
- Delivery gating reads `localStorage:mpsone_available_to_invoice[poId] = { availableQty, deliveredAmount }`.
- Payment status derivation remains consistent with Neon palette badges; filter logic uses `due_date` and `paid_at` for category mapping and window calculations.

## v0.1.6 (2025-11-10)

### Highlights
- Implemented PR approval gating with role-based actions and client-side audit trail stubs.
- Added “Approve Quote” and “Generate PO” actions on client quote comparison; linked to PO preview context.
- Introduced Delivery Notes UI to capture corrections and enforce invoice gating via available-to-invoice quantities.
- Integrated payment status logic into supplier Reporting and client dashboard with color-coded due-date handling.
- Extended DocumentManager with entity typing and role-aware permissions.
- Added `/inventory/delivery-notes` route and sidebar navigation.

### Affected Files
- `webapp/src/pages/procurement/PRList.tsx`
- `webapp/src/pages/client/QuoteComparison.tsx`
- `webapp/src/pages/DeliveryNotes.tsx`
- `webapp/src/App.tsx`
- `webapp/src/components/Layout/Sidebar.tsx`
- `webapp/src/pages/supplier/Reporting.tsx`
- `webapp/src/pages/client/ClientDashboard.tsx`
- `webapp/src/pages/DocumentManager.tsx`
- `README.md`

### Notes
- Audit trail entries are stored in `localStorage:mpsone_audit_trail` and include actor, timestamp, and action details for PR approvals and PO generation.
- Payment status derivation uses `due_date` and `paid_at` to produce: `paid`, `neutral`, `waiting payment (yellow)`, `next payment (green)`, and `over‑due (red)`; badges are color-coded consistently with the Neon Corporate palette.
- Delivery corrections persist `available_to_invoice` per PO; Reporting respects the invariant `sum(invoice.amount) ≤ sum(delivered.amount)`.

### Preview & QA
- Run dev server:
```
cd webapp
npm ci
npm run dev
```
- Verify PR approval gating in `PRList`, quote approval and PO generation in `QuoteComparison`, corrections in `DeliveryNotes`, status badges in `Reporting`, and overview widget in `ClientDashboard`.

## v0.1.5 (2025-11-10)

### Highlights
- Identity policy enforced: Admin must submit 2 NPWPs (Company NPWP as account ID; Personal NPWP for responsibility). Non-admin users submit 1 Personal NPWP as their account ID.
- All accounts now collect and persist Display Name and Nickname; Topbar displays identity next to role and user type.
- Signup updated to collect Company NPWP, Personal NPWP, Display Name, and Nickname for admins.
- CodeLogin converted to two-step flow: validate code then collect identity (NPWP and names) with admin-specific requirements.
- Onboarding shows badges for Company NPWP and Personal NPWP for Admin.
- Documentation updated (EN/ID) to reflect NPWP rules and name requirements under User Guide and Roles & Permissions.

### Affected Files
- `webapp/src/pages/Signup.tsx`
- `webapp/src/pages/CodeLogin.tsx`
- `webapp/src/pages/client/Onboarding.tsx`
- `webapp/src/components/Layout/Topbar.tsx`
- `docs/USER_GUIDE.md`, `docs/ROLES_PERMISSIONS.md`
- `docs/id/USER_GUIDE.md`, `docs/id/ROLES_PERMISSIONS.md`

### Notes
- Admin account ID maps to Company NPWP digits; non-admin account ID maps to Personal NPWP digits.
- Display Name and Nickname are required for all accounts to improve collaboration context and audit trails.

## v0.1.4 (2025-11-10)

### Highlights
- Sidebar now adapts by user type: Supplier Admin sees supplier-side pages; Client Admin sees client-side pages (with Corporate Onboarding). Non-admin client users do not see onboarding.
- Onboarding route gated to Admin only; directories keep add actions disabled for non-admin roles.
- Signup/Onboarding: added Company + NPWP fields, NPWP validation (15/16 digits), persisted NPWP as admin user ID; NPWP displayed on Corporate Onboarding.
- Documentation updated to emphasize role-based workflow alignment; removed temporary "development full access" notes.

### Affected Files
- `webapp/src/components/Layout/Sidebar.tsx`
- `webapp/src/App.tsx`
- `webapp/src/pages/Signup.tsx`
- `webapp/src/pages/client/Onboarding.tsx`
- `webapp/src/pages/SupplierDirectory.tsx`, `webapp/src/pages/ClientDirectory.tsx`
- `docs/ROLES_PERMISSIONS.md`, `docs/USER_GUIDE.md`, `docs/WORKFLOWS.md`
- `docs/id/ROLES_PERMISSIONS.md`, `docs/id/USER_GUIDE.md`, `docs/id/WORKFLOWS.md`

### Notes
- Front-end enforces the agreed procurement lifecycle and role gating. Admin owns corporate onboarding and invitations; Procurement manages PRs and PO conversion; Operational handles PR creation and receiving corrections; Finance approves PRs and processes payments. Suppliers operate quotes, deliveries, and invoicing based on approved PRs.

## v0.1.3 (2025-11-10)

### Highlights
- Upgraded global search in Topbar: fuzzy matching, recent destinations, and quick actions (Ctrl+/ to open; arrow keys + Enter to select).
- Virtualized PR list using `DataTable` windowing with tuned `overscan=8` for smoother scrolling.
- Virtualized Document Manager grid; increased overscan rows to 3 to reduce card pop-in while scrolling.
- Fixed internationalization syntax errors in `I18nProvider.tsx` that blocked the dev server build.

### Affected Files
- `webapp/src/components/Layout/Topbar.tsx`
- `webapp/src/pages/procurement/PRList.tsx`
- `webapp/src/pages/DocumentManager.tsx`
- `webapp/src/components/I18nProvider.tsx`
- `webapp/src/components/UI/DataTable.tsx` (uses `overscan` prop)

### Deployment Notes
- No backend changes. Front-end SPA only.
- Verified dev preview is running (`npm run dev`) and accessible at local URL.

### Post-Deploy Checks
- Press `Ctrl + /` to open search; try fuzzy queries like `rep`, `lifecy`, `quote po`.
- Confirm recents populate after selections and appear when query is empty.
- Fast-scroll PRList and Document Manager to validate smooth virtualization without visible pop-in.

## v0.1.2 (2025-11-09)

### Highlights
- Added in-app Help Center (`/help`) and Markdown Doc Viewer.
- Mirrored user documentation to `webapp/public/docs` for in-app viewing.
- Implemented bilingual toggles across docs; added `docs/DB_SETUP.md` and `docs/id/DB_SETUP.md`.
- Inserted Help link into sidebar navigation for supplier and client.

### Affected Files
- `webapp/src/pages/HelpCenter.tsx`
- `webapp/src/pages/DocViewer.tsx`
- `webapp/src/App.tsx`
- `webapp/src/components/Layout/Sidebar.tsx`
- `docs/DB_SETUP.md`, `docs/id/DB_SETUP.md`
- `webapp/public/docs/DB_SETUP.md`, `webapp/public/docs/id/DB_SETUP.md`

### Deployment Notes
- Docs are served from `public/docs` and included in the build.
- Ensure deep links like `/help` render via SPA routing (`.htaccess`).

### Post-Deploy Checks
- Open `/help` and verify Help Center loads.
- From Help, open a doc (e.g., DB Setup) and confirm bilingual toggle works.
- Validate no 404s for `assets/*` and that `public/docs/*.md` are accessible.

## v0.1.1 (2025-11-09)

### Highlights
- UI theming consistency across dark and light modes.
- Replaced hardcoded gradients/colors with theme variables.
- Unified button styles (`primary`, `secondary`, `outline`) and micro-interactions.
- Standardized `status-badge` and `progress-bar` components.
- Module-aware accents using `--module-color` and `--module-gradient-end`.
- Updated `OfflineIndicator` to use theme-driven gradients and text variables.
- README wishlist: added `/login/client` friendly message and unknown redirect logging notes.

### Affected Files
- `webapp/src/pages/Login.tsx`
- `webapp/src/pages/Signup.tsx`
- `webapp/src/pages/CodeLogin.tsx`
- `webapp/src/pages/QuoteBuilder.tsx`
- `webapp/src/pages/procurement/PRCreate.tsx`
- `webapp/src/pages/DocumentManager.tsx`
- `webapp/src/pages/CommunicationHub.tsx`
- `webapp/src/pages/supplier/Reporting.tsx`
- `webapp/src/pages/supplier/EmailDashboard.tsx`
- `webapp/src/pages/supplier/AdminDashboard.tsx`
- `webapp/src/components/OfflineIndicator.tsx`

### Deployment Notes
- This project deploys manually (no CI/CD). See `DEPLOY.md` for environment variables and hosting steps.
- Recommended steps:
  -
```
cd webapp
npm ci
npm run build
```
  - Upload the `webapp/dist/` contents to your hosting target
  - Ensure `VITE_APP_URL` and other envs are correct for your domain.

### Post-Deploy Checks
- Toggle theme and verify buttons, badges, progress bars, headers, and module accents render correctly.
- Validate `/login` and `/signup` flows and confirm no hardcoded hex colors remain in components.
# Changelog

## [Unreleased] - 2025-11-10

Enhancements
- Topbar: mengembalikan tombol toggle tema (☀️/🌙) dan bahasa (EN/ID) sebagai tombol terpisah di Topbar.
- Topbar: mengubah Bantuan, Logout, dan Settings menjadi ikon saja dengan tooltip dan `aria-label` untuk aksesibilitas.
- Topbar: menambahkan indikator terpusat “Logged in as” yang menampilkan tipe pengguna (Supplier/Client) dan peran (mis. Admin).
- Settings: merapikan dropdown dengan fokus pada overscan per modul (Documents/PR), toggle High Performance, daftar shortcut, dan tombol “Reset to defaults”.
- Performance: menambahkan preferensi High Performance yang meningkatkan overscan dan menambah debounce pada pembaruan UI berat (QuickSearch). Pengaturan ini persisten via localStorage.
- Overscan: menambahkan fine-tuner per modul (Documents vs PR list) dan menerapkan `computeOverscan` ke `DocumentManager` dan `PRList`.
- README: menambahkan bagian “Wishlist” yang mendokumentasikan fitur Settings, High Performance, dan fine-tuning overscan.

Technical
- `config.ts`: menambahkan `getHighPerformance`, `setHighPerformance`, `computeOverscan`, dan `getDebounceMs` untuk kontrol persistensi dan perhitungan dinamis.
- `Topbar.tsx`: menambahkan Settings card baru, debounce pencarian berdasarkan preferensi performa, menyederhanakan kontrol tema/bahasa di Topbar.
- `App.tsx`, `PRList.tsx`, `DocumentManager.tsx`: mengadopsi overscan terhitung berdasarkan preferensi.

Preview & QA
- Dev server (Vite) diverifikasi berjalan di `http://localhost:5173/`; UI baru (icon-only dan indikator login) ditinjau tanpa error di browser.

### Added
- Playwright E2E tests for core routes (PR List, Quote Comparison, PO Preview, Delivery Notes, Order Tracker, Document Manager, Communication Hub).
- CI workflow (`.github/workflows/e2e.yml`) builds the webapp and runs Playwright tests on push/PR.

### Notes
- E2E tests seed localStorage to satisfy route guards and assert structural selectors (e.g., `.main`, `.page-header`).

## v0.1.12 (2025-11-11)

### Highlights
- Verified backend in WSL with Docker Engine: imported SQL migrations and validated DB contents via scripts and phpMyAdmin.
- Confirmed live endpoints with real data: `/api/health` (db=true), `/api/pr` list/create/update, `/api/email-thread` create/list/append, `/api/docs` list.
- Auditing integrated across PR, threads, and user actions; documents upload endpoint returns `scan_status: scanned` (demo stub).
- Frontend dev server started and reachable at `http://localhost:5173/` via Vite proxy to backend.

### Affected Files
- `webapp/server/index.mjs` (routes verified: auth, PR, email-thread, users, docs)
- `scripts/import-migrations.sh`, `scripts/verify-db.sh` (used for DB verification)
- `db/migrations/0001–0014` (imported in WSL)
- `docs/DB_SETUP.md` (WSL guidance referenced)

### Deployment Notes
- Backend runs inside WSL to reach MySQL on `localhost:3306` under Docker Engine.
- Use `wsl` terminals to run Node via `nvm` and start the backend (`npm run server`) with dev DB env vars.
- Frontend uses Vite proxy (`VITE_API_BASE=/api`) to route `/api/*` to `http://localhost:3001`.

### Post-Deploy Checks
- `GET /api/health` returns `{"ok":true,"version":"8.0.x","db":true}`.
- `GET /api/pr?limit=5` returns rows; `POST /api/pr` and `PUT /api/pr/:id` succeed and write audit logs.
- `POST /api/email-thread` and `POST /api/email-thread/:id/messages` succeed; `GET` shows updated `messages_json`.
- `GET /api/docs` returns non-empty rows; `POST /api/docs/upload` creates a document entry with `scan_status`.
## 2025-11-11 — Phase 4: FX Rates & Tax Utilities
- Added DB migration `0017_fx_rates.sql` with `fx_rate(rate_date, base_ccy, quote_ccy, rate, source, created_at)` and unique constraint on `(rate_date, base_ccy, quote_ccy)`.
- Implemented backend endpoints with caching and per‑day lock:
  - `POST /api/fx/refresh` — dev/manual refresh to populate sample rates.
  - `GET /api/fx/latest?base=IDR&quote=USD` — latest rate from DB or cache.
  - `GET /api/fx/history?base=IDR&quote=USD&days=N` — historical series over N days.
- Updated docs:
  - `docs/DB_SETUP.md` and `docs/id/DB_SETUP.md` with migration, WSL import/verify steps, and sample queries.
  - `docs/REPORTING.md` and `docs/id/REPORTING.md` with FX endpoints usage and caching/locking notes.
- Verified stack:
  - WSL Docker Compose started `mpsone-db` and `mpsone-phpmyadmin`; migrations imported via `bash scripts/import-migrations.sh`.
  - Smoke tests extended in `scripts/smoke-test.mjs` and passed for FX endpoints and Phase 4 email/courier routes.
## 2025-11-12 — Phase 5: Performance & Accessibility
- Added `VirtualList` component for card/grid virtualization.
- Refactored `PeopleDirectory` to use `VirtualList` (smooth scrolling for large lists).
- Confirmed route-level code splitting via `React.lazy` in `App.tsx` for heavy pages.
- Previewed `/admin/people` and `/procurement/pr`; no console errors; theme intact.
- Accessibility: Added global `:focus-visible` outlines (2px, module color), enhanced skip-link styling, ARIA label for People search, and keyboard shortcut `/` to focus search.

## 2025-11-12 — Phase 6: Analytics Collector (Dev)
- Backend: added lightweight analytics endpoints for local verification
  - `POST /api/analytics` ingests `{ name, data, ts, url, ua }` into an in-memory buffer
  - `GET /api/analytics?limit=N` returns recent events (disabled in production)
- Frontend: monitoring now defaults to `${VITE_API_BASE}/analytics` when `VITE_ANALYTICS_URL` is not set
- Emissions: `app_boot` on startup and `route_view` on navigation
- Docs: `DEPLOY.md` updated with an “Analytics Collector (Local Dev)” section and notes
- Verified end-to-end: events appear via `GET /api/analytics?limit=5` after visiting `/procurement/pr`
## 2025-11-12 — Phase 7 Kickoff: Settings & Notifications

Added Settings page (`/settings`) with theme (Light/Dark/System), language (EN/ID), and notification preferences (in‑app/email). Implemented Notification Center (`/notifications`) with unread counts, module accents, and mark‑as‑read/unread actions. Extended ThemeProvider to support `system` mode following OS preference. Topbar now shows a dynamic notification bell with unread count and navigates to the Notification Center.

Database
- New migration `0019_user_preferences_and_notifications.sql` adds `user_preferences` and `notifications` tables with appropriate indexes and FKs.

Docs
- Updated `docs/DB_SETUP.md` and `docs/id/DB_SETUP.md` with schema details and import/verify steps. Mirrored updates in `webapp/public/docs`.

Affected Files
- `webapp/src/pages/Settings.tsx`
- `webapp/src/pages/Notifications.tsx`
- `webapp/src/components/ThemeProvider.tsx`
- `webapp/src/components/Layout/Topbar.tsx`
- `webapp/src/App.tsx`
- `db/migrations/0019_user_preferences_and_notifications.sql`

## v0.1.28 (2025-11-12) — E2E Core Procurement Flow Coverage

Highlights
- Added full end-to-end Playwright test for Procurement lifecycle: PR → Quote → PO → Delivery → Invoice.
- Validates supplier sending, quote approval, PO generation, delivery corrections, invoice gating and creation.

Details
- New test `webapp/e2e/core-procurement-flow.spec.ts` seeds client mode and suppliers, uses demo PR rows, and drives UI:
  - PR List: sends Approved PR to suppliers.
  - Quote Comparison: approves a quote, generates PO, navigates to PO Preview.
  - Delivery Notes: adjusts corrections; sets `mpsone_available_to_invoice` and `mpsone_delivery_notes_{poId}`.
  - Supplier Reporting: opens Create Invoice modal, asserts over-amount validation, then creates a valid invoice.

Affected Files
- `webapp/e2e/core-procurement-flow.spec.ts`
- `roadmap.md`
- `subroadmap.md`

Notes (verification)
- Runs locally with `npm run test:e2e`; CI picks up under existing workflow.
- Flow relies on pillar-scoped storage and demo data; no backend required.

## v0.1.29 (2025-11-12) — Docs Modernization & Onboarding

Highlights
- Added onboarding guides in English and Indonesian with Quickstart steps and GIF placeholders.
- Clarified Developer Quickstart references and linked onboarding from README.

Affected Files
- `docs/ONBOARDING.md`
- `docs/id/ONBOARDING.md`
- `README.md`

Notes
- No UI changes; documentation improves clarity and onboarding velocity.

## v0.1.30 (2025-11-12) — RBAC Frontend Enforcement (Foundation)

Highlights
- Introduced a centralized frontend permissions helper based on mode (Client/Supplier) and role.
- Applied non-invasive gating: disabled states with `aria-disabled` on key actions.

Affected Files
- `webapp/src/services/permissions.ts`
- `webapp/src/pages/procurement/PRList.tsx`
- `webapp/src/pages/supplier/Reporting.tsx`

Notes
- Roles read from `localStorage:mpsone_role` with sensible defaults per mode.
- Backend enforcement will follow; this change is frontend-only and preserves layout.
