# Changelog

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
