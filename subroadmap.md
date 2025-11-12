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
- [x] Update `CHANGELOG.md` with test coverage note.

Notes
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
