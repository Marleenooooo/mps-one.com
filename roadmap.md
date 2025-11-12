Roadmap — From 0% to 100%

Goal
- Deliver a joyful, professional experience that connects companies/people and drives transactions through procurement.

Legend
- [x] Completed
- [~] In progress
- [ ] Planned

Phase 0 — Foundations (0–10%)
- [x] Establish Neon Corporate theme across core components (buttons, headers, badges).
- [x] Add i18n keys for navigation and Comms banner (`nav.people`, `nav.invitations`, `nav.comms`, `comms.blocked_banner`).
- [x] Align People Directory and User Profile action buttons to neon palette.
- [x] Introduce `.btn.success` and `.btn.danger` variants in `webapp/src/index.css`.
- [x] Centralize development SOP and theme in `.trae/rules/project_rules.md`.
- [x] Slim README to product vision (two pillars).

Phase 1 — Procurement Essentials (10–35%)
- [x] Client: `PRCreate` with autosave and attachments; `PRList` base listing.
- [x] Enforce PR approval gating in UI and route guards.
- [x] Quote approval and PO generation actions with audit trail entries.
 - [x] Delivery Notes UI for multi‑delivery and corrections; compute available‑to‑invoice.
 - [x] Invoicing UI linked to Delivery Notes; prevent over‑invoice; payment status logic.

Phase 2 — Social Graph MVP (35–55%)
- [x] People Directory (`/admin/people`) with follow/block/invite actions.
- [x] User Profile (`/people/:id`) with follower/following lists.
- [x] Communication Hub (blocked banner and muted inputs on block).
- [x] Backend API contract implemented for users/relationships/blocks/invites.
- [x] DB migrations applied to real DB; phpMyAdmin verified.

Phase 3 — Backend & Data Integrity (55–75%)
- [x] Auth, RBAC, and audit trail services.
- [x] Server‑side pagination/filters/export for tables.
- [x] Secure document storage and AV scanning.

Phase 4 — Integrations (75–85%)
- [x] Email sync (IMAP/SMTP OAuth) and courier webhooks for delivery tracking.
- [x] FX rates and tax utilities finalized; cache and daily locking.
 - [x] Communication Hub composer (/comms): To/Cc/Bcc, Subject persistence, toolbar, mentions, drag‑drop, shortcuts.

Phase 5 — Performance & Accessibility (85–95%)
- [x] Virtualize long lists; code splitting and lazy load heavy routes.
- [x] WCAG AA audit; focus management, ARIA detail, keyboard shortcuts.

Phase 6 — Release & Scale (95–100%)
- [x] Deployment hardening; staging checks; rollback playbooks.
- [x] Product analytics, error monitoring, and tracing.
- [x] Documentation polish and onboarding improvements.

Phase 7 — Post-Release Polishing (100–120%)
- [x] i18n consistency cleanup and translations QA (remove duplicates; EN/ID parity).
 - [x] Theme & accessibility refinements per Neon VNS (contrast, focus, hover/active states).
 - [x] Communications: attachments persistence and upload service; rich editor serialization; labels/archiving.
- [x] Notification Center and Settings (preferences: theme, language, notifications).
 - [x] Offline mode parity with mocks and sync reconciliation.
- [x] Performance profiling and tuning (memoization, code splitting, bundle size checks).
- [ ] E2E tests and CI coverage for core workflows (PR → Quote → PO → Delivery → Invoice).
 - [x] E2E tests and CI coverage for core workflows (PR → Quote → PO → Delivery → Invoice).
- [ ] Docs modernization and onboarding polish (quickstart, gifs, troubleshooting).
 - [x] Docs modernization and onboarding polish (quickstart, gifs, troubleshooting).
 - [x] Observability enhancements (SLOs, tracing dashboards, error budgets).
- [x] Joyful layout polish (micro-interactions, neon gradients/glow, card/bubble aesthetics, intuitive action placement and layout positions).
- [x] Layout ergonomics & navigation clarity (sidebar active/hover states, page header gradients, accent borders).
- [x] Motion & accessibility for interactions (smooth transitions, reduced-motion support, consistent focus/hover/active states).

  Core Rule Enforcement — Pillar Separation (Procurement now; Social deferred)
 - [~] Enforce zero data/navigation/UI bleed between pillars; handoff is explicit from People Directory (/admin/people) or Client/Supplier Directory pages (/client/suppliers, /supplier/clients) once Social routes exist.
  - [x] Pillar namespacing: Procurement under `/procurement/*`; Social routes deferred (planned: `/feed`, `/post/:id`, `/company/:id`, `/messages`).
 - [~] Isolate session/Redux/Context state per pillar (namespaced or separated) aligned to current roles: Admin, PIC Operational, PIC Procurement, PIC Finance.
   - Client-only guards applied: `/procurement/pr`, `/procurement/pr/new`, `/procurement/workflow`, `/procurement/po/preview`.
   - Supplier-only guard applied: `/procurement/quote-builder`.
   - Pillar-scoped storage introduced for gating keys (`mpsone_po_from_quote`, `mpsone_quote_accepted`, `mpsone_audit_trail`, `mpsone_pr_sent`) with legacy fallback.

  Strict Pillar Separation Audit (QA + Product Owner)
 - [ ] Social-only user cannot access any `/procurement/*` or see procurement tabs/buttons. (Deferred until Social routes exist.)
 - [ ] Procurement-only user: procurement accessible; `/feed` hidden or read-only (no create/comment actions). (Deferred until Social routes exist.)
 - [x] Mixed-role user context switch is explicit and clean: top nav shows current context; switch triggers full layout reset.

  Final Cross-Pillar Sign-off
 - [ ] QA tests all current personas: Client Admin; Client PIC Operational; Client PIC Procurement; Client PIC Finance; Supplier Admin; Supplier PIC Procurement; Supplier PIC Finance. (Social-only persona deferred until Social pillar routes exist.)
 - [ ] No procurement data/action reachable from social UI without switching context.
 - [ ] Analytics events, audit logs, notifications tag pillar correctly (Social vs Procurement).
 - [x] Update `permissionsandpage.md` with “Pillar” column (Social | Procurement | Both) and verify every row.
 - [ ] Product Owner + CTO walkthrough confirms separation is intentional and airtight.

  Security, Audit, User Flows, Permission Matrix & Accessibility (Target: 90–95%)
  A. Performance Optimization
  - [ ] Virtualize long lists (tanstack-virtual / react-window)
  - [ ] Code splitting + React.lazy/Suspense + dynamic imports for heavy chunks/libraries
  - [ ] Image optimization (WebP/AVIF, srcset/sizes, native lazy loading)
  - [ ] Bundle analysis + tree-shaking + removal of unused code
  - [ ] Proper caching (immutable assets, stale-while-revalidate for API where applicable)
  - [ ] Aggressive caching + service worker (planned; aligned with Vite build)

  B. Security & Access Control (RBAC + Context-Based Rules)
  - [ ] Full RBAC/ABAC implementation with enforcement on both frontend and backend
  - [ ] All routes protected via route guards / middleware / navigation guards
  - [ ] Component-level and UI-element-level permission checks (hide or disable if not allowed)
  - [ ] Every backend endpoint validates user role + current mode (Client/Supplier) → returns 403 if not authorized
  - [ ] Direct URL access fully blocked (always 403 or redirect to /unauthorized)
  - [ ] Auth provider RBAC integration (e.g., Auth0): tenant/app configured with RBAC and permissions in tokens; roles defined to match app — Admin, PIC Operational, PIC Procurement, PIC Finance, Supplier Admin, Supplier PIC Procurement, Supplier PIC Finance; permissions mapped (kebab-case) to procurement actions (e.g., create:pr, approve:pr, submit:quote, evaluate:quotes, create:po, confirm:delivery, create:invoice, mark:payment, switch:procurement-mode, view:audit-logs).
  - [ ] Post-login action populates claims for company_id and default/active procurement mode (client/supplier) so UI/guards can derive context.

  C. Permission & User Flow Matrix — Single Source of Truth
  - [x] File permissionsandpage.md created in repo root and kept up-to-date at all times
  - [x] Matrix contains: Route / Feature → URL → Required Permission(s) → Required Role(s) → Allowed in Client Mode → Allowed in Supplier Mode → Primary User Journey (from → action → to)
  - [ ] Every new page, route, or button that navigates must have its row added to permissionsandpage.md before implementation starts
  - [ ] PR description must reference the exact matrix row ID (e.g., “Implements PERM-127 & FLOW-089”) → PR rejected if missing
  - [ ] QA test cases must explicitly reference the matrix row being tested

  D. Procurement Context: Client vs Supplier Mode
  - [x] User can toggle between “Acting as Client” and “Acting as Supplier” (UI toggle + local session persistence; backend claims propagation deferred)
  - [x] Navigation, sidebar, dashboard, and available actions completely change based on active mode
    - [x] Dashboards gated by active mode: `/client` only in Client mode; supplier admin family routes require Supplier mode.
    - [x] Supplier Admin dashboard shows only supplier-relevant action (New Quote); hides client-only actions (New PR, New PO).
    - [x] Client dashboard actions are client-specific only (no supplier-only items shown).
  - [ ] Strict separation enforced by backend: a user in Supplier mode cannot access “Create Tender” or “Evaluate Bids”, and vice versa
  - [ ] All mode-sensitive actions logged with current mode context

  E. Audit Trail & Activity Logging
  - [ ] Immutable audit log for all procurement actions (tender creation, bid submission, evaluation, mode switch, etc.)
  - [ ] Log includes: timestamp, userId, companyId, IP, action, resourceId, old/new values, active mode (Client/Supplier)
  - [ ] Centralized logging + admin audit viewer with filters and CSV export; forward authentication provider logs to aggregator (e.g., ELK/Datadog) for compliance

  F. Accessibility — WCAG 2.2 AA
  - [ ] 100% Lighthouse / axe DevTools accessibility score (zero serious/critical issues)
  - [ ] Full keyboard navigation, focus management, ARIA live regions, proper contrast, semantic HTML
  - [ ] Tested with NVDA + VoiceOver on all flows

  G. Final Validation & Sign-off
  - [ ] permissionsandpage.md is 100% implemented — zero deviations
  - [ ] QA has tested every row in the matrix (positive + negative scenarios)
  - [ ] E2E tests (Cypress/Playwright) cover all critical flows defined in the matrix
  - [ ] Product Owner has performed UAT using permissionsandpage.md as checklist → written sign-off; Auth configuration reviewed and approved
  - [ ] Security scan + penetration testing passed; verify roles are not over-permissive and checks are complete
  - [ ] Final Lighthouse scores: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 95

Notes
- When an item in this roadmap is completed, reflect the status here and in `subroadmap.md`. Use checkmarks here for completed items.
 - Phase 3 verified (2025-11-11): Backend running in WSL; audit logs written on PR/thread/user actions; documents upload stub with scan status; pagination and filters present across PR, users, and docs.
 - Phase 4 Communications verified (2025-11-12): Subject column migrated; backend endpoints aligned; frontend wired; preview validated without errors.
