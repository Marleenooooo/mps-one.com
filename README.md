MPSOne — Two Pillars, One Experience

---

Essentials
- Connect companies and people meaningfully.
- Make transactions happen, repeatedly and reliably, through procurement.
- Achieve both with UX/UI/UIX/App that is convenient, reliable, accurate, and connects professionally and emotionally — with a joyful feel.

Principles
- Clarity: simple flows, consistent language, and accessible design.
- Confidence: accurate data, predictable states, and guardrails.
- Momentum: fast interactions, responsive feedback, and pleasant micro‑interactions.
- Connection: module colors guide context; human‑centered copy fosters trust.

Scope
- Procurement lifecycle and social networking are co‑equal.
- Every screen and interaction should reinforce the two pillars above.

Notes
- Technical procedures, theme specifications, WSL/Docker, and phpMyAdmin steps live in `.trae/rules/project_rules.md`.
- Deployment/production follows `DEPLOY.md`.

Core Domain (Internal)
- PR/Quote/PO/Delivery/Invoice API: `GET/POST /pr`, `/quotes`, `/po`, `/delivery-notes`, `/invoices`, `/payments`.
- Audit Trail: catat `actor`, `timestamp`, `comment` untuk tiap transisi status.
- RBAC/Permissions: role `Admin`, `PIC Operational`, `PIC Procurement`, `PIC Finance` untuk gating PR approval, quote visibility, invoicing.

Localization & Language
- Free‑first: `i18next` + `react-i18next` (runtime i18n, pluralization, ICU); bundle JSON `id` dan `en`, lazy load.
- Deteksi bahasa: `franc` (offline) + preferensi `localStorage`; fallback manual toggle.
- Machine translation (opsional): `LibreTranslate` (public/self-host). Alternatif: `Microsoft Translator` (free tier), `DeepL`/`Google` (paid).

Location & Personalization
- IP Geolocation: `ipapi.co` atau `ipinfo.io` (free tier) untuk negara/zona waktu default.
- Geocoding: `Nominatim` (OSM, free, rate‑limited) atau `LocationIQ` free tier; paid: `Google Geocoding`.
- Maps: `Leaflet` + OSM tiles; routing: `openrouteservice` free tier.
- Timezone/Calendar: `Luxon` atau `dayjs` + `Intl`; API cadangan: `worldtimeapi.org`.

Payments (ID‑First)
- Gateway: `Midtrans`, `Xendit`, `DOKU` (setup gratis, bayar per transaksi) — kartu, VA, e‑wallet (OVO/GoPay/DANA/ShopeePay), QRIS.
- Disbursements: `Flip for Business` atau `Xendit` Payouts.
- Invoice links: `Xendit Invoice` atau internal QRIS dynamic.
- Webhooks: update status invoice (`paid`, `over‑due`) konsisten 30‑day calendar.

Tax & Currency
- PPN: internal kalkulasi (`ppn_rate`, inklusif/eksklusif), rounding konsisten; endpoint internal `/tax/calc`.
- FX rates (free‑first): `exchangerate.host` atau `frankfurter.app`; paid: `Open Exchange Rates`.
- Cache harian; kunci kurs saat invoice dibuat.

Documents, Storage & Signatures
- Storage: `Cloudflare R2` atau `Supabase Storage` free tier; opsi self‑host: `MinIO`.
- Malware scan: `ClamAV` self‑host; spot check: `VirusTotal` API (free terbatas).
- PDF: client `pdfmake`/`jsPDF` (awal), backend `Puppeteer` (nanti); paid: `DocRaptor`.
- E‑Signature (ID): `PrivyID`, `DigiSign` (paid). Free‑first: QR JSON signatures + server validation.

Email, Messaging & Notifications
- Email transactional: `Brevo (Sendinblue)` free tier, `Resend`, `Mailjet`; murah: `AWS SES`.
- Sync mail: `Gmail API` / `Microsoft Graph` (consent). Unified (paid): `Nylas`.
- Push: `Firebase Cloud Messaging` (free). WhatsApp/SMS (nanti): `360dialog`, `Twilio`/`Vonage`.

Shipping & Tracking
- Aggregator: `AfterShip` atau `Ship24` free tier; lokal JNE/J&T/SiCepat jika tersedia.
- Routing & ETA: `openrouteservice`.

Search & Data
- App search: `Meilisearch` atau `Typesense` (open‑source); paid: `Algolia`.
- Vendor enrichment: `OpenCorporates` (free terbatas) — riset ID registry resmi (kontrak).

Identity, Auth & Access
- Auth: `Keycloak` self‑host atau `Auth.js`; paid: `Auth0`, `Clerk`.
- RBAC/Policy: `Casbin` (open‑source).
- MFA & audit untuk aksi finansial.

Analytics & Monitoring
- Product analytics: `PostHog` (free/self‑host).
- Error monitoring: `Sentry` (free tier).
- Tracing: `OpenTelemetry` + `Grafana`/`Jaeger`.
- BI/Reporting: `Metabase` atau `Apache Superset`.

Feature Flags & Config
- `Unleash` atau `Flagsmith` (open‑source) untuk rollout bertahap.

Queues, Webhooks & Scheduling
- Queue: `BullMQ` (Redis) atau `RabbitMQ`.
- Webhooks: verifikasi HMAC, retry dengan exponential backoff.
- Scheduling: `node-cron` awal; `Temporal.io`/`Quartz` jika perlu orkestrasi.

Security & Compliance
- Secrets: `Doppler` free tier atau `Vault` self‑host; `.env` untuk dev.
- DLP/PII: `gitleaks` di dev; `Semgrep` (policy) nanti.
- TLS, audit immutable, konsistensi status pembayaran.

Quick Integration Plan
- Tahap 1: i18n (`i18next`), IP geo (`ipapi`), FX rates (`exchangerate.host`), email (`Brevo`), storage (`R2/Supabase`).
- Tahap 2: Payments (`Midtrans`/`Xendit`) + webhooks; search (`Meilisearch`); monitoring (`Sentry`).
- Abstraksi `services/` untuk klien API agar mudah migrasi ke backend.

Implementasi Saat Ini (beban ringan, free)
- Ditambahkan `src/services/`: `i18n` (preferensi bahasa via `localStorage` + `navigator`), `geo` (IP geolokasi via `ipapi` dengan timeout 2.5s dan cache 7 hari), `fx` (kurs via `exchangerate.host` dengan cache 24 jam).
- Tanpa dependensi baru; pemanggilan dilakukan secara lazy dan hasil di-cache agar tidak menambah waktu muat.

Contoh Implementasi Bahasa (Free‑First)
- `i18next` + `react-i18next` dengan lazy load bundle `id`/`en`.
- Deteksi via `franc`, default `id` untuk IP Indonesia, toggle manual, simpan di `localStorage`.
- Opsional: seeding terjemahan dengan `LibreTranslate`, review manusia untuk kualitas.

## Developer Quickstart

Set up the project quickly for local development, tests, and preview. Follow the WSL/Docker SOP for backend, and use Node on Windows for the frontend.

### Prerequisites
- `Node` ≥ v18 (installed on Windows; current: `v24.11.0`).
- `WSL2` Ubuntu-20.04 with Docker Engine (Docker commands run inside WSL only).
- Git installed (Windows or WSL).

### Frontend Development (SPA)
```
cd webapp
npm ci
npm run dev
# Open http://localhost:5173
```

### Preview Build + E2E Tests (Playwright)
```
cd webapp
npm run build -- --base=/
npm run preview            # Serves at http://localhost:4173
npx playwright install winldd
npx playwright test
```
- Deep-route assets require `--base=/` during build to avoid blank pages on preview.
- Proxy errors to `/api/*` during preview/tests are expected when backend is not running; core tests use `localStorage` mocks.

### Backend & DB in WSL (Docker SOP)
Run all Docker commands inside WSL:
```
wsl -d Ubuntu-20.04
docker ps
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker run -d -p 8080:80 --name web nginx:alpine
docker ps
```
Migrations (when backend/DB is in use):
```
bash scripts/import-migrations.sh
bash scripts/verify-db.sh
```

### Troubleshooting (quick)
- Playwright error `winldd missing`: `npx playwright install winldd` then re-run tests.
- Browser install hangs: cancel, re-run `npx playwright install`, then `npx playwright test`.
- Deep route 404/blank on preview: rebuild with `--base=/`.
- Ports: dev `5173`, preview `4173`, backend proxy `3001`. Stop conflicts.
- See `docs/FAQ.md` for more onboarding fixes.

## Dokumentasi Pengguna (User Documentation)

Dokumentasi end-user tersedia di folder `docs/`:

- `docs/USER_GUIDE.md`: Panduan menggunakan aplikasi dari awal hingga akhir.
- `docs/WORKFLOWS.md`: Alur kerja detail dengan guard dan invariant.
- `docs/ROLES_PERMISSIONS.md`: Peran dan matriks akses.
- `docs/UI_THEME_I18N.md`: Pengaturan tema dan preferensi bahasa.
- `docs/FAQ.md`: Tanya jawab umum dan troubleshooting.
- `docs/GLOSSARY.md`: Definisi istilah pengadaan.
- `docs/EMAIL.md`: Ringkasan CommunicationHub & template email.
- `docs/REPORTING.md`: Fitur pelaporan dan ekspor.
- `docs/DB_SETUP.md`: Catatan setup Backend API & MySQL.

Dokumen‑dokumen ini selaras dengan lifecycle pengadaan dan siap untuk integrasi backend di masa depan.

### Versi Bahasa Indonesia

Salinan berbahasa Indonesia tersedia di folder `docs/id/`:

- `docs/id/USER_GUIDE.md`
- `docs/id/WORKFLOWS.md`
- `docs/id/ROLES_PERMISSIONS.md`
- `docs/id/UI_THEME_I18N.md`
- `docs/id/FAQ.md`
- `docs/id/GLOSSARY.md`
- `docs/id/EMAIL.md`
- `docs/id/REPORTING.md`
- `docs/id/DB_SETUP.md`

### Pusat Bantuan & Penampil Dokumen (In‑App)

- Buka rute `/help` di aplikasi untuk akses cepat ke dokumentasi.
- Dokumen `.md` dicerminkan ke `webapp/public/docs` dan dapat dibaca langsung via Doc Viewer.
- Setiap dokumen memiliki toggle bahasa: "English" / "Bahasa Indonesia" di bagian atas.

---

## Front‑End UX Workflow Test Findings (Supplier/Admin/PIC)

This section documents end‑to‑end workflow simulations across roles, highlights UX/workflow/route/code flaws, and provides a concrete fix guide. It is intended as a practical checklist to align the SPA with the Procurement Lifecycle and Permissions rules.

### Supplier Admin: First Signup → Payment Received
- Entry: `Signup → /supplier/admin` then navigate via Sidebar to: `Procurement Workflow`, `PR List`, `Quote Builder`, `PO Preview`, `Order Tracker`, `Document Manager`, `Communication Hub`, `Reporting`.
- Observed flow:
  - Builds quotes in `QuoteBuilder`; preview and “Send Quote” alert work.
  - `PRList` shows PR rows and allows “Send PR to suppliers” for any status.
  - `POPreview` renders layouts and provides a numbering preview; printing/export works.
  - `OrderTracker` shows pipeline and delivery proof upload but does not model multi‑shipment Delivery Letters or Client corrections.
  - `DocumentManager` handles versions, bulk actions; no linkage to domain entities (PR/Quote/PO/Delivery/Invoice).
  - `CommunicationHub` simulates messaging/read receipts and attachments.
- Flaws (High → Low):
  - Approval gating missing: suppliers can interact without PR approval checks. “Send PR to suppliers” is available for Draft/Submitted rows; violates “Only approved PRs visible to suppliers and convertible to quotes”.
  - Multi‑delivery & partial invoicing absent: no Delivery Letter representation; no corrected quantities; no invoice gating based on confirmed deliveries.
  - Payment status logic unused: no 30‑day status colors (paid/neutral/waiting/yellow/next/green/over‑due/red) across dashboards; `DBStatus` fetches derived statuses but UI doesn’t surface them.
  - Audit trails missing: no actor/timestamp/comment on transitions (PR approval, quote acceptance, PO creation, delivery confirmation, invoicing).
  - Route gating inconsistent: `/docs` and `/comms` accessible to all; Document access flags are UI‑only and not role‑aware.
  - Lifecycle coherence: `OrderTracker` pipeline advances without guards; no link from delivery to invoice or payment marking.

### Client Admin: First Signup → Payment Received
- Entry: `Signup → /client` then optionally `Onboarding` (Admin only), `PR Create`, `PR List`, `Quote Comparison`, `PO Preview`, `Order Tracker`, `Document Manager`, `Communication Hub`.
- Observed flow:
  - `PRCreate` works with autosave and attachments; `PRList` auto‑injects draft.
  - `QuoteComparison` route exists and is role‑gated to client, but there is no explicit “approve quote → generate PO” action.
  - `POPreview` and `OrderTracker` function visually.
- Flaws:
  - Missing explicit actions for “Approve Quote” and “Generate PO from accepted quote”; lifecycle jump points are not implemented, causing route‑level gaps.
  - PR approval workflow not present (Submitted → Approved/Rejected) and not role‑gated to Finance/Admin as required.
  - Payment status and invoice links absent from client dashboard; cannot mark invoices paid; no 30‑day calendar visualization.
  - Document relationships not shown (e.g., PR→Quote→PO→Delivery→Invoice references).

### PIC Roles (Operational/Procurement/Finance)
- PIC Operational:
  - Can initiate PRs; however, the approval step is not enforced. Delivery confirmation UI is missing; cannot correct Delivery Letters.
- PIC Procurement:
  - Can manage PRs and quotes, but approval gates and “Convert to Quote”/“Approve Quote → Create PO” actions are not implemented as discrete steps.
- PIC Finance:
  - Lacks invoice/payments UI; cannot mark invoice `paid_at`; no calendar‑based status derivation shown anywhere; reporting does not include payment status segmentation.

### Route & Code Observations
- `App.tsx` gating:
  - `QuoteBuilder` gated by `mpsone_user_type === 'supplier'` only; should also check PR approval or present PR‑scoped quoting.
  - `Onboarding` gated to client Admin; fine.
  - `/docs` and `/comms` ungated; role‑aware access should be enforced.
- `PRList.tsx` flaws:
  - “Send PR to suppliers” button doesn’t validate `status === 'Approved'`.
  - No approve/reject actions or audit capture.
- `OrderTracker.tsx`:
  - Pipeline advances arbitrarily; no shipment entities; no client confirmation/correction; no invoice stage gating.
- `DocumentManager.tsx`:
  - `Doc` lacks `type/ref_id/version/url/company/permissions`; cannot model relationships or access policies.
- `DBStatus.tsx`:
  - Fetches `derived_status` but not integrated into dashboards; colors and due‑date categories missing.
- `POPreview.tsx`:
  - Visual only; no “Create PO” from accepted quote flow.

### Fix Guide (Prioritized)
- Approval & Gating
  - Enforce “Approved PR only” for supplier visibility and quote conversion in UI and route guards.
  - Add PR approval actions (Finance/Admin) with audit trail (actor, timestamp, comment).
- Quote → PO Conversion
  - Implement client action to approve a quote and generate a PO; link PO to department/budget; add audit trail entry.
- Delivery Notes & Corrections
  - Introduce `DeliveryNote` entities in UI (multi‑delivery per PO); show shipped vs received quantities and corrections; compute available‑to‑invoice.
- Invoicing & Payment Status (30‑Day Calendar)
  - Build invoice creation UI referencing corrected deliveries; enforce `sum(invoice.amount) ≤ sum(delivered.amount)`.
  - Surface per‑invoice status using `due_date`/`paid_at` with required color states and list grouping.
- Audit Trails
  - Add timeline components capturing transitions across PR/Quote/PO/Delivery/Invoice.
- Document Relationships & Permissions
  - Extend `DocumentManager` data model: `Document(id, type, ref_id, version, url, company_id, can_access)`; render entity‑linked views and role‑aware access.
- Route Guards & Role Awareness
  - Gate `/docs` and `/comms` based on role/company; ensure supplier sees only approved PRs and related docs.
- Lifecycle Coherence
  - Tie `OrderTracker` to delivery notes; enable client confirmation → unlock invoicing → payment marking; reflect stages consistently across dashboards.

### Acceptance Criteria for Fixes
- Guards: suppliers only see PRs with `status=Approved`; cannot quote on Draft/Submitted.
- Conversion: client can “Approve Quote” → “Generate PO” with audit trail.
- Delivery: per‑PO multiple delivery notes with corrections; UI shows per‑item totals and remaining.
- Invoicing: invoices reference delivery notes; prevent over‑invoice; payment status reflects 30‑day categories with colors.
- Documents: entity‑typed, versioned, permissioned; quick access by context.
- Routes: consistent role‑based access; no unauthorized navigation to finance/comms/docs.

### Quick Test Scripts (Manual)
- Supplier Admin:
  - Sign up as supplier admin → open `QuoteBuilder` → attempt to quote without approved PR; expect UI to block and show guidance.
  - After client approves PR, quote and submit; client approves quote and generates PO; follow delivery and invoicing.
- Client Admin:
  - Create PR → submit for approval (Finance/Admin) → approve → convert incoming quote to PO → confirm deliveries → create invoices → mark payments.
- PIC Finance:
  - Approve PRs; view invoices by 30‑day calendar; mark `paid_at`; check color/status propagation in dashboards.

### Known Gaps to Address First
- Implement PR approval/gating in `PRList` and route guards.
- Add quote approval and PO generation actions in client flows.
- Model delivery notes and corrections; link to invoicing.
- Integrate payment status logic into UI with colors and due‑date handling.
- Introduce audit timeline components across lifecycle entities.

---

## Implemented Features (Nov 2025)

This release implements the prioritized fixes aligned with Procurement Lifecycle & Permissions:

- PR approval gating and audit trail stubs
  - `PRList` now supports `Submit`, `Approve`, and `Reject` based on role (Finance/Admin), and restricts “Send PR to suppliers” and quote comparison to `Approved` PRs only.
  - Client-side audit trail entries are recorded on PR status changes and key actions, persisted in `localStorage:mpsone_audit_trail`.
  - Compact UI timeline: `AuditTimeline` component is wired on `PRList` and `client/QuoteComparison` to visualize recent audit events (actor, timestamp, action) per PR.

- Quote approval and PO generation
  - `client/QuoteComparison` adds “Approve Quote” and “Generate PO” actions; actions write audit entries and seed `localStorage:mpsone_po_from_quote` for downstream PO preview.

- Delivery Notes UI with corrections and invoice gating
  - New `DeliveryNotes` page (Inventory) captures shipped vs. received quantities and corrections per PO item.
  - Calculates and persists `available_to_invoice` quantities to enforce `sum(invoice.amount) ≤ sum(delivered.amount)` gating in Reporting.
  - OrderTracker integration: `supply/OrderTracker` reads `mpsone_available_to_invoice` and auto-advances the pipeline to “Delivered” when deliveries exist; shows a summary panel (PO, delivered amount, available qty) with a link to `Delivery Notes`.

- Payment status logic integration
  - `supplier/Reporting` lists invoices with derived statuses based on `due_date` and `paid_at`: `paid`, `neutral`, `waiting payment (yellow)`, `next payment (green)`, `over‑due (red)`.
  - `client/ClientDashboard` now shows an “Invoice Status Overview” widget summarizing counts in the same color-coded categories.
  - New filters on `supplier/Reporting`: segment invoice rows by Status (`all`, `paid`, `neutral`, `waiting`, `next`, `over‑due`) and Due Window (`all`, `≤7d`, `≤14d`, `≤30d`, `over‑due`).

- DocumentManager entity typing and role-aware permissions
  - Documents now display `type` (PR, Quote, PO, DeliveryNote, Invoice, Payment) and `refId` linkage.
  - Access toggles are role-aware: Admin full control; Finance (Invoice/Payment); Procurement (PR/PO/Quote); Operational (PR/DeliveryNote); Supplier (Quote). Non-authorized roles see a “View-only” badge and cannot change access.

- Routes & navigation
  - Added `/inventory/delivery-notes` route and sidebar entries for relevant roles (client and supplier), ensuring multi-delivery and corrections are first-class.

### How to Test Quickly
- Approvals: Login as `PIC Finance` or `Admin`; in `PRList`, submit a draft, approve/reject; verify only `Approved` PRs enable “Send to suppliers” and “Compare Quotes”.
- Quote → PO: In `QuoteComparison`, approve a quote then click “Generate PO”; confirm audit entry and PO preview context from `localStorage`.
- Delivery Notes: Open `Delivery Notes`, enter corrections; verify available-to-invoice values appear and impact Reporting.
- Payment Statuses: Open `Reporting` (supplier) to see status badges; check `ClientDashboard` widget for aggregated status counts.
  - Filters: In `Reporting`, use Status and Due Window selectors to narrow invoice rows. Validate that “over‑due” shows unpaid invoices past due; `≤7d`/`≤14d`/`≤30d` show upcoming windows; exporting CSV/PDF respects filters.

See `CHANGELOG.md v0.1.6` for detailed file changes.
