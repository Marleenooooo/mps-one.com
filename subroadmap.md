# Subroadmap — Phase 7: Core Rule Enforcement — Pillar Separation (kick-off)

Item: Enforce zero data/navigation/UI bleed between pillars; Procurement-only for now, Social deferred
Status: Completed

Acceptance Criteria
- Procurement routes are fully namespaced under `/procurement/*` with clear context indicators.
- Social routes are deferred; no social UI appears in procurement contexts.
- Navigation and UI elements reflect current pillar; switching pillars performs a clean layout/state reset.

Plan & Alignment
- Audit routes and top navigation to ensure context indicators and no cross-pillar bleed.
- Introduce lightweight context flag in UI state for current pillar; guard visibility on menus/buttons.
- Verify roles in `permissionsandpage.md` align with pillar separation.

Tasks
- [x] Audit UI for any social elements in procurement pages and hide/defer them.
- [x] Add pillar context indicator in topbar and enforce namespaced routes.
- [x] Update `permissionsandpage.md` references for pillar separation and verify route mappings.
- [x] Preview `/procurement/*` flows to confirm clean separation and context cues.
- [x] Update `CHANGELOG.md` after verification.

Notes
- Verified via preview on `/procurement/pr`, `/procurement/po/preview`, and `/procurement/quote-builder`; no console or terminal errors observed.
- Keep changes minimal and focused on visibility/guarding; defer actual Social route work per roadmap.

---

# Subroadmap — Performance: Proper Caching & Service Worker

Item: Implement immutable asset caching and a service worker for runtime caching
Status: Completed

Acceptance Criteria
- Fingerprinted assets under `dist/assets/*` are served with `Cache-Control: public, max-age=31536000, immutable`.
- A lightweight service worker registers in production and:
  - Uses cache‑first for fingerprinted static assets (`/assets/*`).
  - Uses network‑first with fallback for HTML navigations (`/index.html`, route requests).
  - Uses stale‑while‑revalidate for same‑origin API `GET` requests under `/api/*`.
- Preview shows SW registered without console errors; offline reload serves cached shell.
- Documentation is updated in `CHANGELOG.md` and `docs/DB_SETUP.md` (SOP reference) as needed.

Plan & Alignment
- Strengthen Apache caching via `webapp/public/.htaccess` for immutable assets.
- Add `public/sw.js` implementing the caching strategies above; register from `src/main.tsx` only in production.
- Build and preview to validate registration, caching behavior, and error‑free UI.
- Update `roadmap.md` and mark Performance items completed when verified.

Tasks
- [x] Update `.htaccess` with immutable caching headers for assets.
- [x] Add `public/sw.js` with cache‑first (assets), network‑first (HTML), stale‑while‑revalidate (API GET).
- [x] Register SW in `src/main.tsx` for production builds.
- [x] Build and preview; verify SW, caching, and no errors.
- [x] Update `CHANGELOG.md` and mark roadmap/subroadmap.

Notes
- Keep service worker minimal and framework‑agnostic to avoid coupling. Aligns with Vite build output and existing preview flow.

# Subroadmap — Performance Optimization: Image Optimization

Item: Optimize images (lazy loading, async decoding, proper sizing)
Status: Completed

Acceptance Criteria
- Replace direct `<img>` usages with `OptimizedImage` for lazy loading and async decoding.
- QR code image in PO Preview uses optimized attributes; renders without layout shift.
- Previews of `/procurement/po/preview` and `/client` show no console/terminal errors.
- Roadmap and changelog updated to reflect completion.

Plan & Alignment
- Create `OptimizedImage` component in `components/UI` with `loading="lazy"`, `decoding="async"`, `fetchPriority` defaults.
- Replace `<img>` in `QRCode` to leverage `OptimizedImage`.
- Verify PO Preview page where QR code is displayed.

Tasks
- [x] Create `OptimizedImage` component with sensible defaults.
- [x] Replace `<img>` in `webapp/src/components/UI/QRCode.tsx` with `OptimizedImage`.
- [x] Preview `/procurement/po/preview` and `/client` for errors and layout consistency.
- [x] Update `roadmap.md` and add `CHANGELOG.md` entry.

Notes
- Current assets are minimal and mostly generated (QR); pipeline support for WebP/AVIF can be added later when real images are introduced.

# Subroadmap — Phase 7: Docs Modernization & Onboarding Polish

Item: Modernize docs with Quickstart, onboarding guide with GIF placeholders, and troubleshooting polish
Status: Completed

Acceptance Criteria
- README contains a concise Developer Quickstart that matches WSL/Docker SOP and Playwright setup.
- New `docs/ONBOARDING.md` (EN) and `docs/id/ONBOARDING.md` (ID) provide step-by-step onboarding with links and GIF placeholders.
- FAQ updated or referenced to cover onboarding troubleshooting (preview base path, Playwright install, port conflicts, offline mode).
- Changes reflected in `CHANGELOG.md`; roadmap item marked completed.

Plan & Alignment
- Add onboarding docs under `docs/` with sections: environment setup, first run, switching modes, core flow walkthrough, and troubleshooting pointers.
- Link onboarding from README and User Docs list; keep README focused on product vision.
- Verify no UI changes required; run smoke scripts if applicable.

Tasks
- [x] Create `docs/ONBOARDING.md` and `docs/id/ONBOARDING.md` with Quickstart and GIF placeholders.
- [x] Update README to link onboarding and clarify Quickstart notes.
- [x] Mark roadmap item as completed.
- [x] Add `CHANGELOG.md` entry.
- [x] Verify docs render in `/public/docs` mirror where applicable.

Notes
- This modernization focuses on clarity and onboarding velocity; no UI changes.
- Verified links from README to onboarding guides; preview servers running for cross-check.


# Subroadmap — Phase 7: E2E Core Procurement Flow Coverage

Item: Add Playwright tests for full PR→Quote→PO→Delivery→Invoice flow
Status: Completed

Acceptance Criteria
- Test seeds suppliers and approved PR; sends PR to suppliers and seeds quotes.
- Client approves quote and generates PO; PO Preview renders without errors.
- Delivery Notes corrections update available-to-invoice gate for the PO.
- Supplier Reporting allows invoice creation within remaining deliverable; over-amount validation triggers error.
- Tests run via `npm run test:e2e` and pass locally; CI picks them up.

Plan & Alignment
- Implement `webapp/e2e/core-procurement-flow.spec.ts` covering end-to-end interactions and validations.
- Use localStorage seeding via init scripts; rely on existing mocks and demo data.
- Ensure selectors are resilient (role-based labels, stable texts) and neon theme unaffected.

Tasks
- [x] Seed suppliers and approved PR context; send PR to suppliers from PR List.
- [x] Approve quote in Quote Comparison and generate PO; navigate to PO Preview.
- [x] Update Delivery Notes corrections to unlock invoicing gate for PO-9821.
- [x] Create invoice in Supplier Reporting; verify over-amount error then successful creation.
- [x] Validate UI renders and no console/terminal errors during flow.
- [x] Update roadmap and changelog entries.

Notes
- Uses existing demo rows and mock storage; avoids backend dependencies.
- Gate keys: `mpsone_pr_sent`, `mpsone_quotes_{prId}`, `mpsone_po_from_quote`, `mpsone_available_to_invoice`, `mpsone_delivery_notes_{poId}`.
============================

# Subroadmap — Phase 7: Pillar Separation — Route Guards & State Isolation

Item: Extend procurement route guards and add pillar-scoped state/caches
Status: Completed

Acceptance Criteria
- All procurement routes enforce client-only or supplier-only access per role matrix.
- Direct URL access to guarded pages redirects appropriately to login or workflow.
- Ephemeral caches (e.g., PO seed, quote accepted map, audit trail) are namespaced per pillar.
- No browser or terminal errors upon preview across affected routes.

Plan & Alignment
- Wrap `/procurement/po/*`, `/procurement/quote-builder`, and `/procurement/workflow` with client/supplier guards.
- Introduce `pillarStorage` helper to namespace keys while maintaining legacy compatibility.
- Verify behavior via previews and update `CHANGELOG.md` and `roadmap.md`.

Tasks
- [x] Guard `/procurement/po/preview` with client-only procurement.
- [x] Wrap `/procurement/quote-builder` with supplier-only.
- [x] Guard `/procurement/workflow` with client-only procurement.
- [x] Add pillar-scoped storage helper and adopt for gating keys.
- [x] Preview affected routes to verify guards and no errors.
- [x] Update roadmap/subroadmap and changelog entries.

Notes
- Verified via preview on `/procurement/po/preview` and `/procurement/quote-builder`; redirects occur when preconditions are not met, without errors.

---

# Subroadmap — Phase 7: RBAC/ABAC Frontend Enforcement (Foundation)

Item: Introduce a frontend RBAC helper and apply gating to key actions
Status: Completed

Acceptance Criteria
- A centralized permissions helper exists to evaluate actions based on mode (Client/Supplier) and role.
- PRList buttons (Submit, Approve, Reject, Send to Suppliers, New PR) reflect permissions via enabled/disabled states with proper `aria-disabled`.
- Supplier Reporting “Create Invoice” button respects permissions and delivery gating.
- No console errors in previews; visual theme and accessibility remain intact.

Plan & Alignment
- Add `webapp/src/services/permissions.ts` mapping roles to actions.
- Wire helper into PRList and Supplier Reporting; start with non-invasive disabling (no layout changes).
- Update CHANGELOG with an entry summarizing the enforcement foundation.

Tasks
- [x] Create permissions helper with minimal matrix and context derivation from localStorage.
- [x] Gate PRList actions: New PR, Submit, Approve/Reject, Send to Suppliers.
- [x] Gate Supplier Reporting: Create Invoice button.
- [x] Update `CHANGELOG.md` with RBAC enforcement foundation.
- [x] Preview affected routes and verify no errors.

Notes
- Roles are read from `mpsone_role` in localStorage; defaults applied by mode when missing.
- Backend enforcement will follow per roadmap; this step is frontend-only.

---

# Subroadmap — Phase 7: RBAC/ABAC Frontend Enforcement (Scope Expansion)

Item: Expand RBAC gating to QuoteComparison, PO Preview, Delivery Notes, and Order Tracker
Status: Completed

Acceptance Criteria
- QuoteComparison: Approve Quote requires `evaluate:quotes`; Generate PO requires `create:po`.
- PO Preview: Print/Save PDF gated by `create:po`.
- Delivery Notes: Corrections input disabled unless `confirm:delivery`.
- Order Tracker: “Mark as Paid” button visible after invoiced stage and gated by `mark:payment`.
- No layout changes; only aria-disabled/disabled for gating; existing flows stay intact.

Plan & Alignment
- Import `canPerform` from `webapp/src/services/permissions.ts` and apply non-invasive gating.
- Keep UX consistent with neon theme; ensure accessible states via `aria-disabled`.
- Verify affected routes via preview with no console errors.
- Update CHANGELOG to capture expanded RBAC scope.

Tasks
- [x] Gate QuoteComparison approve/generate actions.
- [x] Gate PO Preview printing/export.
- [x] Gate Delivery Notes corrections.
- [x] Add gated “Mark as Paid” in Order Tracker.
- [x] Update CHANGELOG with affected files.
- [x] Preview affected routes and verify no errors.

Notes
- Roles read from `localStorage` (`mpsone_user_type`, `mpsone_role`). Backend enforcement to follow.
- Verified via live preview of `/client/quotes/:id`, `/procurement/po/preview`, `/inventory/delivery-notes`, and `/supply/order-tracker`.


# Subroadmap — Phase 7: Pillar Separation — Storage Isolation (Extension)

Item: Extend pillar-scoped storage to procurement and supplier caches
Status: Completed

Acceptance Criteria
- All relevant local caches for procurement/supplier are read/written via `pillarStorage`.
- Legacy keys continue to work via dual-write and namespaced read fallback.
- No browser or terminal errors across affected routes when preconditions are missing (redirects ok).

Plan & Alignment
- Replace `localStorage` with `pillarStorage` in PRList, Topbar, Sidebar, OrderTracker, DeliveryNotes, Supplier Reporting, and Client Quote Comparison.
- Maintain backward compatibility (dual-write, legacy fallback).
- Preview affected routes and update changelog.

Tasks
- [x] Namespace PRList caches: drafts, audit trail, suppliers, sent PRs.
- [x] Namespace navigation gating in Topbar and Sidebar.
- [x] Namespace Order Tracker gates: PO seed, invoice availability.
- [x] Namespace Delivery Notes: dynamic notes by PO, PO seed, invoice availability.
- [x] Namespace Supplier Reporting: invoice availability, delivery notes by PO.
- [x] Namespace Client Quote Comparison: quotes by PR, audit trail, sent PRs.
- [x] Preview `/procurement/pr`, `/procurement/workflow`, `/procurement/po/preview`, `/supply/order-tracker`, `/inventory/delivery-notes`, `/supplier/reporting`.
- [x] Update `CHANGELOG.md` after verification.

Notes
- Verified via previews; no errors observed. Import style aligned to `import * as pillarStorage`.

---

# Subroadmap — Phase 7: Pillar Separation — E2E Guards & Analytics

Item: Add minimal e2e checks for guard redirects and route analytics
Status: Completed

Acceptance Criteria
- Guarded routes redirect as expected when preconditions are missing.
- Route analytics emits a dev console payload on navigation.
- Tests run via `npm run test:e2e` and pass locally.

Plan & Alignment
- Add Playwright tests covering:
  - `/procurement/po/preview` redirects to workflow when seed is missing.
  - `/procurement/quote-builder` redirects to client login when supplier has no approved PR.
  - Route analytics logs `[analytics]` payload upon navigation to `/procurement/pr`.
- Keep tests lightweight; rely only on localStorage seeding.

Tasks
- [x] Implement redirect tests for PO Preview and Quote Builder.
- [x] Run e2e and confirm passing.

---

# Subroadmap — Phase 7: Security & Access Control — Route Guards + Mode Guard

Item: Standardize frontend route guards and add backend mode enforcement
Status: Completed

Acceptance Criteria
- Frontend protected routes redirect unauthorized users (mode/role) without errors.
- Backend enforces `Client`/`Supplier` mode via headers; unauthorized calls return 403.
- No regressions in PR CRUD and Docs upload flows.

Plan & Alignment
- Create `RouteGuard` component to centralize RBAC checks on routes.
- Extend backend auth parsing with `mode` and implement `requireMode([Client|Supplier])`.
- Apply `requireMode('Client')` to PR endpoints; update client requests to send `x-user-type`.
- Preview `/client` and `/supplier/admin` to validate guard behavior.

Tasks
- [x] Create `RouteGuard.tsx` and wrap key routes.
- [x] Update `server/index.mjs` with `mode` parsing and `requireMode`.
- [x] Update `src/services/api.ts` to include `x-user-type` header.
- [x] Preview `/client` and `/supplier/admin` for guard verification.
- [x] Update `roadmap.md` and add `v0.1.35` in CHANGELOG.

Notes
- Verified in dev preview: `/client` and `/supplier/admin` load without errors under correct mode/role; unauthorized states redirect via `RouteGuard`.
- Analytics console logs are dev-only; e2e runs in preview (production) mode, so analytics verification is manual in dev.

---

# Subroadmap — Phase 7: Pillar Separation — Mode Toggle & Context Reset

Item: Add explicit Client/Supplier mode switch in Topbar with clean state reset
Status: Completed

Acceptance Criteria
- Topbar shows a clear Client/Supplier toggle adhering to neon theme.
- Switching mode updates `mpsone_user_type` and triggers a layout reset.
- Pillar-scoped procurement caches are cleared on mode change to prevent cross-mode bleed.
- No console or terminal errors upon preview of procurement routes.

Plan & Alignment
- Implement a segmented control in Topbar to switch Client/Supplier modes.
- On toggle, clear key procurement caches via `pillarStorage.removeItem`.
- Navigate to mode-specific landing: Client → `/client/quotes`, Supplier → `/supplier/reporting`.
- Preview `/procurement/workflow` and client/supplier landings to verify.

Tasks
- [x] Add Topbar segmented toggle for Client/Supplier with accessible states.
- [x] Clear procurement caches on mode change (`pr_draft`, `pr_sent`, `quote_accepted`, `audit_trail`, `suppliers`, `po_from_quote`, `available_to_invoice`).
- [x] Navigate to mode-specific landing to reset layout.
- [x] Preview UI to confirm no errors and proper visual cues.
- [x] Update `CHANGELOG.md` after verification.

Notes
- Verified via preview on `/procurement/workflow`; mode toggle renders with gradient active state and no errors.

---

# Subroadmap — Phase 7: Pillar Separation — Mode-Aware Navigation

Item: Gate QuickSearch and Sidebar items by active Client/Supplier mode
Status: Completed

Acceptance Criteria
- QuickSearch only shows client-appropriate links/actions in Client mode and supplier-appropriate in Supplier mode.
- Sidebar hides client-only procurement items in Supplier mode (e.g., Workflow, PR list, PO Preview).
- No console or terminal errors upon preview on procurement and supplier routes.

Plan & Alignment
- Filter QuickSearch index by `mpsone_user_type` for client-only and supplier-only entries.
- Remove client-only entries from Supplier menu in Sidebar to reduce redirect noise.
- Preview `/procurement/workflow` and `/supplier/reporting` to validate.

Tasks
- [x] Gate Topbar QuickSearch actions/links by mode.
- [x] Hide client-only items from Supplier Sidebar.
- [x] Preview affected routes for errors.
- [x] Update `CHANGELOG.md`.

Notes
- Verified via preview on `/procurement/workflow` and `/supplier/reporting`; no errors observed; QuickSearch and Sidebar reflect mode correctly.

---

# Subroadmap — Phase 7: Pillar Separation — Mode-Aware Dashboards

Item: Gate dashboards and dashboard actions by active Client/Supplier mode
Status: Completed

Acceptance Criteria
- `/client` is only reachable in Client mode; Supplier mode redirects to `/supplier/admin`.
- Supplier Admin dashboard surface shows only supplier-relevant actions (e.g., New Quote); client-only actions (New PR, New PO) are hidden.
- No console or terminal errors on preview for both dashboards.

Plan & Alignment
- Add mode-aware routing for `/client` and supplier admin routes in `App.tsx`.
- Simplify Supplier Admin dashboard actions to reflect supplier context.
- Preview `/client` and `/supplier/admin` and verify clean rendering and behavior.

Tasks
- [x] Gate `/client` route to Client mode and redirect others to `/supplier/admin`.
- [x] Require Supplier mode on supplier admin/reporting/email routes.
- [x] Hide client-only actions on Supplier Admin dashboard, show only New Quote.
- [x] Preview `/client` and `/supplier/admin` for errors and visual checks.
- [x] Update `CHANGELOG.md` after verification.

Notes
- Verified via preview; dashboards render correctly with mode-aware routing and actions; no errors observed.
  - Client Dashboard verification: Only client-specific actions are present (Quick PR, budget, documents, invoice overview). No supplier-only actions (e.g., New Quote, Quote Builder) appear.

---

# Subroadmap — Performance & Reliability: Code Splitting & Dynamic Imports

Item: Verify and finalize React.lazy/Suspense-based code splitting across heavy routes
Status: Completed

Acceptance Criteria
- Heavy pages are loaded via `React.lazy` with a consistent `Suspense` fallback skeleton.
- Key routes (`/client`, `/supplier/reporting`, `/client/quotes/:id`, `/procurement/po/preview`) render without console/terminal errors when lazy-loaded.
- No visual regressions; neon theme skeletons match accessibility targets.
- Roadmap and changelog updated to reflect completion.

Plan & Alignment
- Audit router (`webapp/src/App.tsx`) for lazy imports and a unified `Suspense` fallback.
- Live-preview key routes to confirm chunk loading works and UI is error-free.
- Update `roadmap.md` (mark code splitting complete) and add `CHANGELOG.md` entry.

Tasks
- [x] Audit lazy routes and fallback skeleton in `App.tsx`.
- [x] Preview `/client`, `/supplier/reporting`, `/client/quotes/:id`, `/procurement/po/preview`.
- [x] Update `roadmap.md` status for the performance item.
- [x] Append `CHANGELOG.md` entry documenting verification and affected files.

Notes
- Verified via live previews on the listed routes; no browser errors observed and chunks load with the skeleton fallback.
- `App.tsx` already uses `React.lazy` broadly; this cycle confirms and documents the setup per SOP.

---

# Subroadmap — Performance Optimization: Virtualize Long Lists

Item: Virtualize heavy lists to reduce DOM work (PR List, Docs)
Status: Completed

Acceptance Criteria
- PR List uses virtualized rows with smooth scroll and accessible selection.
- Document Manager list remains virtualized with overscan tuned; no regressions.
- Previews of `/procurement/pr` and `/docs` show no console/terminal errors.
- Roadmap and changelog updated to reflect completion.

Plan & Alignment
- Enable virtualization in `PRList` by toggling DataTable `virtualize` and setting `height`/`rowHeight`.
- Keep overscan via `computeOverscan('prList')`; reuse existing skeleton styles.
- Verify behavior on live preview and update docs accordingly.

Tasks
- [x] Turn on DataTable virtualization in `webapp/src/pages/procurement/PRList.tsx`.
- [x] Preview `/procurement/pr` and `/docs` for errors and feel.
- [x] Update `roadmap.md` to mark “Virtualize long lists” completed.
- [x] Append `CHANGELOG.md` entry with affected files and verification notes.

Notes
- `DocumentManager` already implements grid virtualization; this item focuses on PR List.
- Verified `/procurement/pr` preview; no console/terminal errors; smooth scroll observed.

---

# Subroadmap — Performance & Build: Bundle Analysis & Tree‑Shaking

Item: Integrate bundle visualizer, enable treeshake, inspect bundles, and document findings
Status: Completed

Acceptance Criteria
- Visualizer generates `dist/stats.html` after production build and is accessible via preview.
- Build enables Rollup treeshake with safe defaults to remove unused code paths.
- Bundle inspection confirms major vendor chunks and app chunks; no preview errors.
- Roadmap and changelog updated to reflect completion.

Plan & Alignment
- Add `rollup-plugin-visualizer` and wire into Vite build to output `dist/stats.html`.
- Enable `treeshake` options under `build.rollupOptions` and turn on `sourcemap`.
- Run `npm run build` and `npm run preview` to inspect `http://localhost:<port>/stats.html`.
- Update `roadmap.md` and `CHANGELOG.md` with a short summary of findings.

Tasks
- [x] Add visualizer plugin and treeshake to `webapp/vite.config.ts`.
- [x] Build app and open `dist/stats.html` via preview.
- [x] Verify no browser errors; note any large chunks for follow‑up.
- [x] Update `roadmap.md` and `CHANGELOG.md`.

Notes
- Verified via preview at `/stats.html` on the production build server; no browser errors.
- Keep changes minimal and focused on build configuration; avoid aggressive drops unless verified (e.g., `drop: ['console']` deferred).

---

# Subroadmap — Phase 7: Backend Mode Guards & Audit active_mode

Item: Persist active_mode in audit logs and enforce Client mode on PR reads
Status: Completed

Acceptance Criteria
- `audit_log` includes `active_mode ENUM('Client','Supplier')` with supporting index.
- Backend audit writes persist `active_mode` for all actions.
- `GET /api/pr` and `GET /api/pr/:id` are guarded by Client mode.
- DB docs updated with migration and verification steps; roadmap and changelog reflect changes.

Plan & Alignment
- Follow Front‑End ↔ Database Alignment Policy: schema designed, migration created under `db/migrations`, imported via WSL scripts; backend updated to log and guard; docs updated accordingly.

Tasks
- [x] Add migration `db/migrations/0020_audit_active_mode.sql` to create `active_mode` and `idx_audit_mode`.
- [x] Update `webapp/server/index.mjs` `logAudit(...)` to write `active_mode`.
- [x] Enforce Client mode on `GET /api/pr` and `GET /api/pr/:id` via `requireMode(['Client'])`.
- [x] Update `docs/DB_SETUP.md` and `docs/id/DB_SETUP.md` with migration notes and verification.
- [x] Update `CHANGELOG.md`, mark roadmap progress (mode‑sensitive audit logging completed).

Notes
- UI unchanged; backend enforcement and audit context strengthened.
- Import migrations via WSL (`bash scripts/import-migrations.sh`) and verify with `bash scripts/verify-db.sh` and phpMyAdmin.

---

# Subroadmap — Phase 7: Mode Guards Extension — PO Summary & Invoice Status

Item: Enforce Client mode on PO Summary and Invoice Status endpoints
Status: Completed

Acceptance Criteria
- `GET /api/po/summary` is accessible only in Client mode; Supplier mode returns 403.
- `GET /api/invoice/status` is accessible only in Client mode; Supplier mode returns 403.
- Backend server responds `200` for Client mode when DB is available; guards evaluate prior to DB work.
- Changelog updated; no UI changes required.

Plan & Alignment
- Extend `requireMode(['Client'])` to PO and invoice endpoints in `webapp/server/index.mjs`.
- Verify behavior via dev server and WSL Docker for DB readiness.
- Update `CHANGELOG.md` to reflect guard extension.

Tasks
- [x] Add `requireMode(['Client'])` to `GET /api/po/summary`.
- [x] Add `requireMode(['Client'])` to `GET /api/invoice/status`.
- [x] Start backend (`npm run server`) and WSL DB (`docker compose up -d`).
- [x] Verify Supplier mode returns 403 and Client mode returns 200 (DB up).
- [x] Update `CHANGELOG.md` with affected files and verification.

Notes
- Server listening at `http://localhost:3001`; DB reachability via WSL `mpsone-db` container.
- Guard behavior confirmed even when DB is down (403 for Supplier occurs pre-DB).

# Subroadmap — Phase 7: Layout — Workframe Grid Stability

Item: Ensure layout grid fills viewport and inner content scrolls correctly
Status: Completed

Acceptance Criteria
- `.layout` fills the viewport height on all routes; no broken frame where content exceeds viewport.
- `.content` allows inner grid/content to scroll without forcing overflow or collapsing the grid.
- Preview `/client`, `/procurement/workflow`, `/procurement/pr`, and `/supplier/reporting` with no console or terminal errors.
- Roadmap and changelog updated accordingly.

Plan & Alignment
- Minimal CSS fix in `webapp/src/index.css`: add `min-height: 100vh` to `.layout` and `min-height: 0` to `.content`.
- Verify responsive behavior at 1024px (narrow sidebar) and 768px (sidebar hidden) breakpoints.
- Confirm Topbar alignment and Breadcrumbs do not cause layout shift.

Tasks
- [x] Add `min-height: 100vh` to `.layout`.
- [x] Add `min-height: 0` to `.content`.
- [x] Run dev server and preview affected routes.
- [x] Update `CHANGELOG.md` entry and mark this subroadmap item completed.

Notes
- `html`, `body`, and `#app-root` already have `height: 100%`; this change ensures the grid container participates fully in viewport sizing.
- Verified via previews; no errors observed. Import style aligned to `import * as pillarStorage`.

---

# Subroadmap — Phase 7: Pillar Separation — E2E Guards & Analytics

Item: Add minimal e2e checks for guard redirects and route analytics
Status: Completed

Acceptance Criteria
- Guarded routes redirect as expected when preconditions are missing.
- Route analytics emits a dev console payload on navigation.
- Tests run via `npm run test:e2e` and pass locally.

Plan & Alignment
- Add Playwright tests covering:
  - `/procurement/po/preview` redirects to workflow when seed is missing.
  - `/procurement/quote-builder` redirects to client login when supplier has no approved PR.
  - Route analytics logs `[analytics]` payload upon navigation to `/procurement/pr`.
- Keep tests lightweight; rely only on localStorage seeding.

Tasks
- [x] Implement redirect tests for PO Preview and Quote Builder.
- [x] Run e2e and confirm passing.

---

# Subroadmap — Phase 7: Security & Access Control — Route Guards + Mode Guard

Item: Standardize frontend route guards and add backend mode enforcement
Status: Completed

Acceptance Criteria
- Frontend protected routes redirect unauthorized users (mode/role) without errors.
- Backend enforces `Client`/`Supplier` mode via headers; unauthorized calls return 403.
- No regressions in PR CRUD and Docs upload flows.

Plan & Alignment
- Create `RouteGuard` component to centralize RBAC checks on routes.
- Extend backend auth parsing with `mode` and implement `requireMode([Client|Supplier])`.
- Apply `requireMode('Client')` to PR endpoints; update client requests to send `x-user-type`.
- Preview `/client` and `/supplier/admin` to validate guard behavior.

Tasks
- [x] Create `RouteGuard.tsx` and wrap key routes.
- [x] Update `server/index.mjs` with `mode` parsing and `requireMode`.
- [x] Update `src/services/api.ts` to include `x-user-type` header.
- [x] Preview `/client` and `/supplier/admin` for guard verification.
- [x] Update `roadmap.md` and add `v0.1.35` in CHANGELOG.

Notes
- Verified in dev preview: `/client` and `/supplier/admin` load without errors under correct mode/role; unauthorized states redirect via `RouteGuard`.
- Analytics console logs are dev-only; e2e runs in preview (production) mode, so analytics verification is manual in dev.

---

# Subroadmap — Phase 7: Pillar Separation — Mode Toggle & Context Reset

Item: Add explicit Client/Supplier mode switch in Topbar with clean state reset
Status: Completed

Acceptance Criteria
- Topbar shows a clear Client/Supplier toggle adhering to neon theme.
- Switching mode updates `mpsone_user_type` and triggers a layout reset.
- Pillar-scoped procurement caches are cleared on mode change to prevent cross-mode bleed.
- No console or terminal errors upon preview of procurement routes.

Plan & Alignment
- Implement a segmented control in Topbar to switch Client/Supplier modes.
- On toggle, clear key procurement caches via `pillarStorage.removeItem`.
- Navigate to mode-specific landing: Client → `/client/quotes`, Supplier → `/supplier/reporting`.
- Preview `/procurement/workflow` and client/supplier landings to verify.

Tasks
- [x] Add Topbar segmented toggle for Client/Supplier with accessible states.
- [x] Clear procurement caches on mode change (`pr_draft`, `pr_sent`, `quote_accepted`, `audit_trail`, `suppliers`, `po_from_quote`, `available_to_invoice`).
- [x] Navigate to mode-specific landing to reset layout.
- [x] Preview UI to confirm no errors and proper visual cues.
- [x] Update `CHANGELOG.md` after verification.

Notes
- Verified via preview on `/procurement/workflow`; mode toggle renders with gradient active state and no errors.

---

# Subroadmap — Phase 7: Pillar Separation — Mode-Aware Navigation

Item: Gate QuickSearch and Sidebar items by active Client/Supplier mode
Status: Completed

Acceptance Criteria
- QuickSearch only shows client-appropriate links/actions in Client mode and supplier-appropriate in Supplier mode.
- Sidebar hides client-only procurement items in Supplier mode (e.g., Workflow, PR list, PO Preview).
- No console or terminal errors upon preview on procurement and supplier routes.

Plan & Alignment
- Filter QuickSearch index by `mpsone_user_type` for client-only and supplier-only entries.
- Remove client-only entries from Supplier menu in Sidebar to reduce redirect noise.
- Preview `/procurement/workflow` and `/supplier/reporting` to validate.

Tasks
- [x] Gate Topbar QuickSearch actions/links by mode.
- [x] Hide client-only items from Supplier Sidebar.
- [x] Preview affected routes for errors.
- [x] Update `CHANGELOG.md`.

Notes
- Verified via preview on `/procurement/workflow` and `/supplier/reporting`; no errors observed; QuickSearch and Sidebar reflect mode correctly.

---

# Subroadmap — Phase 7: Pillar Separation — Mode-Aware Dashboards

Item: Gate dashboards and dashboard actions by active Client/Supplier mode
Status: Completed

Acceptance Criteria
- `/client` is only reachable in Client mode; Supplier mode redirects to `/supplier/admin`.
- Supplier Admin dashboard surface shows only supplier-relevant actions (e.g., New Quote); client-only actions (New PR, New PO) are hidden.
- No console or terminal errors on preview for both dashboards.

Plan & Alignment
- Add mode-aware routing for `/client` and supplier admin routes in `App.tsx`.
- Simplify Supplier Admin dashboard actions to reflect supplier context.
- Preview `/client` and `/supplier/admin` and verify clean rendering and behavior.

Tasks
- [x] Gate `/client` route to Client mode and redirect others to `/supplier/admin`.
- [x] Require Supplier mode on supplier admin/reporting/email routes.
- [x] Hide client-only actions on Supplier Admin dashboard, show only New Quote.
- [x] Preview `/client` and `/supplier/admin` for errors and visual checks.
- [x] Update `CHANGELOG.md` after verification.

Notes
- Verified via preview; dashboards render correctly with mode-aware routing and actions; no errors observed.
  - Client Dashboard verification: Only client-specific actions are present (Quick PR, budget, documents, invoice overview). No supplier-only actions (e.g., New Quote, Quote Builder) appear.

---

# Subroadmap — Performance & Reliability: Code Splitting & Dynamic Imports

Item: Verify and finalize React.lazy/Suspense-based code splitting across heavy routes
Status: Completed

Acceptance Criteria
- Heavy pages are loaded via `React.lazy` with a consistent `Suspense` fallback skeleton.
- Key routes (`/client`, `/supplier/reporting`, `/client/quotes/:id`, `/procurement/po/preview`) render without console/terminal errors when lazy-loaded.
- No visual regressions; neon theme skeletons match accessibility targets.
- Roadmap and changelog updated to reflect completion.

Plan & Alignment
- Audit router (`webapp/src/App.tsx`) for lazy imports and a unified `Suspense` fallback.
- Live-preview key routes to confirm chunk loading works and UI is error-free.
- Update `roadmap.md` (mark code splitting complete) and add `CHANGELOG.md` entry.

Tasks
- [x] Audit lazy routes and fallback skeleton in `App.tsx`.
- [x] Preview `/client`, `/supplier/reporting`, `/client/quotes/:id`, `/procurement/po/preview`.
- [x] Update `roadmap.md` status for the performance item.
- [x] Append `CHANGELOG.md` entry documenting verification and affected files.

Notes
- Verified via live previews on the listed routes; no browser errors observed and chunks load with the skeleton fallback.
- `App.tsx` already uses `React.lazy` broadly; this cycle confirms and documents the setup per SOP.

---

# Subroadmap — Performance Optimization: Virtualize Long Lists

Item: Virtualize heavy lists to reduce DOM work (PR List, Docs)
Status: Completed

Acceptance Criteria
- PR List uses virtualized rows with smooth scroll and accessible selection.
- Document Manager list remains virtualized with overscan tuned; no regressions.
- Previews of `/procurement/pr` and `/docs` show no console/terminal errors.
- Roadmap and changelog updated to reflect completion.

Plan & Alignment
- Enable virtualization in `PRList` by toggling DataTable `virtualize` and setting `height`/`rowHeight`.
- Keep overscan via `computeOverscan('prList')`; reuse existing skeleton styles.
- Verify behavior on live preview and update docs accordingly.

Tasks
- [x] Turn on DataTable virtualization in `webapp/src/pages/procurement/PRList.tsx`.
- [x] Preview `/procurement/pr` and `/docs` for errors and feel.
- [x] Update `roadmap.md` to mark “Virtualize long lists” completed.
- [x] Append `CHANGELOG.md` entry with affected files and verification notes.

Notes
- `DocumentManager` already implements grid virtualization; this item focuses on PR List.
- Verified `/procurement/pr` preview; no console/terminal errors; smooth scroll observed.

---

# Subroadmap — Performance & Build: Bundle Analysis & Tree‑Shaking

Item: Integrate bundle visualizer, enable treeshake, inspect bundles, and document findings
Status: Completed

Acceptance Criteria
- Visualizer generates `dist/stats.html` after production build and is accessible via preview.
- Build enables Rollup treeshake with safe defaults to remove unused code paths.
- Bundle inspection confirms major vendor chunks and app chunks; no preview errors.
- Roadmap and changelog updated to reflect completion.

Plan & Alignment
- Add `rollup-plugin-visualizer` and wire into Vite build to output `dist/stats.html`.
- Enable `treeshake` options under `build.rollupOptions` and turn on `sourcemap`.
- Run `npm run build` and `npm run preview` to inspect `http://localhost:<port>/stats.html`.
- Update `roadmap.md` and `CHANGELOG.md` with a short summary of findings.

Tasks
- [x] Add visualizer plugin and treeshake to `webapp/vite.config.ts`.
- [x] Build app and open `dist/stats.html` via preview.
- [x] Verify no browser errors; note any large chunks for follow‑up.
- [x] Update `roadmap.md` and `CHANGELOG.md`.

Notes
- Verified via preview at `/stats.html` on the production build server; no browser errors.
- Keep changes minimal and focused on build configuration; avoid aggressive drops unless verified (e.g., `drop: ['console']` deferred).

---

# Subroadmap — Phase 7: Backend Mode Guards & Audit active_mode

Item: Persist active_mode in audit logs and enforce Client mode on PR reads
Status: Completed

Acceptance Criteria
- `audit_log` includes `active_mode ENUM('Client','Supplier')` with supporting index.
- Backend audit writes persist `active_mode` for all actions.
- `GET /api/pr` and `GET /api/pr/:id` are guarded by Client mode.
- DB docs updated with migration and verification steps; roadmap and changelog reflect changes.

Plan & Alignment
- Follow Front‑End ↔ Database Alignment Policy: schema designed, migration created under `db/migrations`, imported via WSL scripts; backend updated to log and guard; docs updated accordingly.

Tasks
- [x] Add migration `db/migrations/0020_audit_active_mode.sql` to create `active_mode` and `idx_audit_mode`.
- [x] Update `webapp/server/index.mjs` `logAudit(...)` to write `active_mode`.
- [x] Enforce Client mode on `GET /api/pr` and `GET /api/pr/:id` via `requireMode(['Client'])`.
- [x] Update `docs/DB_SETUP.md` and `docs/id/DB_SETUP.md` with migration notes and verification.
- [x] Update `CHANGELOG.md`, mark roadmap progress (mode‑sensitive audit logging completed).

Notes
- UI unchanged; backend enforcement and audit context strengthened.
- Import migrations via WSL (`bash scripts/import-migrations.sh`) and verify with `bash scripts/verify-db.sh` and phpMyAdmin.

---

# Subroadmap — Phase 7: Mode Guards Extension — PO Summary & Invoice Status

Item: Enforce Client mode on PO Summary and Invoice Status endpoints
Status: Completed

Acceptance Criteria
- `GET /api/po/summary` is accessible only in Client mode; Supplier mode returns 403.
- `GET /api/invoice/status` is accessible only in Client mode; Supplier mode returns 403.
- Backend server responds `200` for Client mode when DB is available; guards evaluate prior to DB work.
- Changelog updated; no UI changes required.

Plan & Alignment
- Extend `requireMode(['Client'])` to PO and invoice endpoints in `webapp/server/index.mjs`.
- Verify behavior via dev server and WSL Docker for DB readiness.
- Update `CHANGELOG.md` to reflect guard extension.

Tasks
- [x] Add `requireMode(['Client'])` to `GET /api/po/summary`.
- [x] Add `requireMode(['Client'])` to `GET /api/invoice/status`.
- [x] Start backend (`npm run server`) and WSL DB (`docker compose up -d`).
- [x] Verify Supplier mode returns 403 and Client mode returns 200 (DB up).
- [x] Update `CHANGELOG.md` with affected files and verification.

Notes
- Server listening at `http://localhost:3001`; DB reachability via WSL `mpsone-db` container.
- Guard behavior confirmed even when DB is down (403 for Supplier occurs pre-DB).
--------------
---

# Subroadmap — Phase 8: Admin Managers Stabilization & i18n Cleanup

Item: Stabilize admin pages (RealTime, Suppliers, Scorecards, ERP Connectors, Document Integrations) and clean i18n duplicates
Status: Completed

Acceptance Criteria
- Admin pages compile cleanly with typed `DataTable` columns and no unsupported props.
- RealTime Manager uses memoized columns; rendering unified; stats reflect `connection_status`.
- Supplier Onboarding page exists and renders applications/KYC/compliance dashboards.
- i18n dictionaries contain onboarding keys once per language; no duplicate entries.

Plan & Alignment
- Normalize `DataTable` usage (`key/render`) and remove `loading/pagination` props where not supported.
- Replace brittle UI imports with stable adapters under `components/UI`.
- Align service types and property names across ERP/Document integrations for table keys.
- Add `SupplierOnboardingManager` to satisfy App import and route.
- Update docs: `UI_THEME_I18N.md` (EN/ID) — document onboarding keys; `CHANGELOG.md` — log stabilization work.

Tasks
- [x] RealTime Manager: memoize columns, unify status badges, clean duplicates.
- [x] Suppliers Manager: convert columns to `Column<T>`; fix badges/actions.
- [x] Supplier Scorecards: normalize columns and badge variants.
- [x] ERP Connectors: align keys (`success_count`, `last_triggered_at`, `processed_records`).
- [x] Document Integrations: align keys (`last_modified_at`, `confidence_score`, `processed_files`).
- [x] Add `SupplierOnboardingManager.tsx` with minimal dashboards and tables.
- [x] Remove duplicate i18n keys; verify EN/ID parity.
- [x] Update docs and changelog per SOP.

Notes
- No DB schema changes in this stabilization pass.
- Verified `npx tsc --noEmit` succeeds; pages render without type errors.
