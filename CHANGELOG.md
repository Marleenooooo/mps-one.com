# Changelog

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
  - `cd webapp && npm ci && npm run build`
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
