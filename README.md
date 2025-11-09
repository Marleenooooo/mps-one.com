MPSOne B2B Procurement Suite — Dokumentasi Alur Kerja Klien & Pemasok (Supplier)

Ringkasan
- Aplikasi web ini menargetkan perusahaan tambang di Kalimantan dengan akun korporat multi‑user dan integrasi alur kerja pengadaan, email, serta pelacakan rantai pasok.
- Dokumen ini merangkum alur kerja komplit untuk Klien (corporate users) dan Pemasok (supplier/vendor), beserta keterbatasan saat ini agar implementasi dan ekspektasi operasional jelas.

Tujuan Produk
- Menyederhanakan proses PR → Quote → PO → Processing → Shipped → Delivered → Invoiced → Paid.
- Memberikan visibilitas status real‑time dan pusat komunikasi terpadu (in‑app + email).
- Memastikan UI/UX enterprise: navigasi jelas, tabel data kuat, formulir kompleks dengan validasi, dan aksesibilitas WCAG AA.

Ikhtisar Teknis Singkat
- Frontend React dengan tema Neon Corporate (dark & light), `useModule` untuk aksen per modul (Procurement, Finance, Inventory).
- Routing klien/supplier melalui `App.tsx`; komponen utama: ClientDashboard, Onboarding, PRCreate/PRList, QuoteBuilder, OrderTracker, DocumentManager, CommunicationHub.
- Auto‑save draft lokal (localStorage) pada Onboarding dan PRCreate dengan interval 60 detik.

Alur Kerja Klien (Corporate Users)
- Onboarding Perusahaan (`src/pages/client/Onboarding.tsx`)
  - Tab: Perusahaan, Hierarki, Peran, Anggaran.
  - Input data perusahaan, susun struktur, tetapkan role (Admin, PIC Operational, PIC Procurement, PIC Finance), alokasi anggaran per departemen.
  - Auto‑save draft per 1 menit; indikator “Draf tersimpan otomatis”.
- Dasbor Klien (`src/pages/client/ClientDashboard.tsx`)
  - Sambutan personal; ringkasan Order Tracking dengan `StatusPipeline` untuk melihat posisi keseluruhan.
  - Widget Quick PR: memulai pembuatan PR dengan cepat; indikator utilisasi anggaran.
  - Kartu Dokumen: akses cepat ke arsip (quote/PO/invoice/delivery proof).
- Pembuatan & Daftar PR (`src/pages/procurement/PRCreate.tsx`, `src/pages/procurement/PRList.tsx`)
  - PRCreate: form multi‑bagian, upload lampiran, auto‑save 60 detik.
  - PRList: daftar PR dengan status, sorting/filtering, tanpa duplikasi key pada StrictMode.
- Manajemen Dokumen (`src/pages/DocumentManager.tsx`)
  - Thumbnail, riwayat versi, seleksi bulk, unduh massal, kontrol akses (allowed/denied).
- Pelacakan Pesanan (`src/pages/OrderTracker.tsx`)
  - Pipeline visual dari PR ke Paid; ETA, countdown harian/jam/menit.
  - Info pengiriman (kurir, nomor lacak), upload bukti kirim (drag & drop, progress bar).
- Komunikasi & Email (`src/pages/CommunicationHub.tsx`)
  - Percakapan in‑app dengan read receipt (sent/delivered/read), @mentions, lampiran, simulasi sinkronisasi email.

Alur Kerja Pemasok (Supplier/Vendor)
- Quote Builder (`src/pages/QuoteBuilder.tsx`)
  - Tabel item (nama, qty, harga, total), kalkulasi pajak & diskon, pilih template, preview, kirim penawaran.
- Penerimaan & Pemrosesan PO
  - Setelah quote disetujui, pemasok menerima PO, memproses, hingga pengiriman.
  - Unggah bukti pengiriman, update status agar klien melihat perkembangan di OrderTracker.
- Komunikasi & Email
  - Gunakan CommunicationHub untuk komunikasi cepat antar PIC; lampiran dokumen teknis, konfirmasi pengiriman, notifikasi status.
- Manajemen Dokumen
  - Unggah/revisi quote, PO, invoice; kelola izin akses bila diperlukan.

Komponen Pendukung UI/UX & Navigasi
- Sidebar tetap dengan item aktif terkontrol (perbaikan untuk path dasar `/client` agar tidak ganda aktif).
- Breadcrumb, quick search, notifikasi, badge status, progress bar, skeleton loading, tooltip.
- Tabel data: row selection, bulk action, sorting/filtering/pagination (sebagian masih placeholder).

Integrasi Email & Komunikasi
- Visualisasi dua arah: status pesan (sent/delivered/read) dan lampiran dengan progress.
- Template email, CC/BCC per tipe klien (konfigurasi masih bersifat UI; belum backend).

Pelacakan Rantai Pasok
- Timeline status dan ETA dengan countdown.
- Antarmuka logistik (kurir, nomor lacak) dan aksi menuju portal pelacakan eksternal.
- Zona unggah untuk bukti pengiriman; indikator selesai dan notifikasi.

Manajemen Dokumen
- Thumbnail preview, riwayat versi, unduh massal, toggle akses.
- Banner proses unduh dengan progress agregat; aksi hapus bulk untuk item terpilih.

Dashboard & Pelaporan
- ClientDashboard: ringkasan order, progres, budget utilization.
- AdminDashboard/Reporting (supplier/admin): metrik kinerja, spending analytics, skor vendor, ekspor laporan (beberapa fitur masih konseptual di UI).

Keterbatasan / Disadvantages Saat Ini
- Tidak ada backend/persistensi server: data bersifat mock di memori; tidak aman untuk produksi.
- RBAC belum enforced di server: role hanya mempengaruhi visibilitas menu; tidak ada otorisasi tingkat API. ✔️ Front‑end: redirect home & guard rute supplier ditambahkan.
- Integrasi email/logistik masih dummy: hanya visualisasi/simulasi; belum sinkronisasi IMAP/SMTP atau webhook kurir nyata.
- Auto‑save lokal: draft disimpan di localStorage; tidak ada mekanisme konflik multi‑user atau kolaborasi real‑time.
- Ekspor CSV/PDF tabel belum implementasi penuh; beberapa kontrol masih placeholder. ✔️ Front‑end: ekspor CSV generik di DataTable (termasuk PRList & DocumentManager); PDF siap ekspor via jsPDF + html2canvas.
- Upload dokumen tidak melakukan pemeriksaan ukuran/virus; penyimpanan file belum terhubung ke storage aman. ✔️ Front‑end: validasi tipe/ukuran file dasar.
- Ketergantungan `Date.now()` untuk ID di beberapa tempat: risiko tabrakan rendah namun tetap ada; sebagian belum memakai `crypto.randomUUID()`. ✔️ Front‑end: util `uniqueId()` mengganti Date.now di PRCreate, PRList, QuoteBuilder, CommunicationHub, OrderTracker.
- Aksesibilitas sebagian: telah memakai warna kontras dan fokus indikator, namun audit WCAG AA lengkap (keyboard nav, ARIA detail, skip links) belum dilakukan. ✔️ Front‑end: skip‑link aktif, aria-sort pada tabel, landmark ARIA konsisten di halaman utama, dan shortcut keyboard (Alt+←/→ untuk halaman; Enter/Space untuk sorting).
- Performa UI: efek neon/glow dan skeleton dapat meningkatkan biaya render pada perangkat spesifikasi rendah.
- Pelacakan waktu/ETA: perhitungan sederhana; tidak mempertimbangkan zona waktu, hari libur, atau SLA logistik.
- Keamanan: belum ada sanitasi lampiran/teks komprehensif, tidak ada autentikasi multi‑faktor, belum ada rate limiting.
- Integrasi ke ERP/Finance: belum ada sinkronisasi PO/invoice ke sistem eksternal; semua alur masih frontend demo.
- I18n: label tersedia dasar; cakupan bahasa dan konsistensi terjemahan perlu diluaskan.
- Navigasi aktif: perbaikan `NavLink end` sudah untuk `/client`, namun rute dasar lain mungkin butuh penyesuaian serupa. ✔️ Front‑end: aktif tunggal untuk `/client` terverifikasi; intensitas hover di sidebar diturunkan agar tidak menyerupai state aktif.

Rekomendasi Peningkatan
- Tambah backend (API) dengan autentikasi, RBAC granular, audit trail, dan penyimpanan dokumen aman (S3/Blob + AV scanning).
- Ganti generator ID ke `crypto.randomUUID()` dan sediakan util `uniqueId()` bersama guard StrictMode untuk efek yang menambah data.
- Implementasi penuh tabel: server‑side pagination, filter, ekspor CSV/PDF.
- Integrasi email nyata (IMAP/SMTP OAuth) dan webhook kurir untuk status pengiriman real‑time.
- Simpan draft di server dengan konflik resolution; tambahkan manual save dan auto‑save adaptif.
- Lengkapi aksesibilitas: audit WCAG, fokus manajemen, ARIA detail, keyboard shortcuts.
- Optimasi performa: lazy load komponen non‑kritis, memoization, kurangi glow berat pada daftar panjang.
- Pelaporan: grafik spending, skor vendor, ekspor laporan siap audit.

Lokasi Berkas Penting
- `src/pages/client/ClientDashboard.tsx`: Dasbor klien, tracking ringkas, Quick PR, dokumen.
- `src/pages/client/Onboarding.tsx`: Form multi‑tab untuk registrasi korporat; auto‑save 60 detik.
- `src/pages/procurement/PRCreate.tsx`: Form PR dengan auto‑save; lampiran.
- `src/pages/procurement/PRList.tsx`: Daftar PR; kunci unik aman pada StrictMode.
- `src/pages/QuoteBuilder.tsx`: Builder penawaran dengan kalkulasi pajak/diskon, template, preview.
- `src/pages/OrderTracker.tsx`: Pipeline status, ETA, unggah bukti kirim.
- `src/pages/DocumentManager.tsx`: Arsip dokumen, riwayat versi, bulk unduh/akses.
- `src/pages/CommunicationHub.tsx`: Percakapan in‑app, read receipts, lampiran, simulasi email.

Catatan
- Dokumentasi ini fokus pada alur operasional end‑to‑end dari perspektif klien dan pemasok di frontend yang ada. Integrasi backend/eksternal akan mengubah beberapa langkah dan tanggung jawab sistem.

Wishlist (UI/UX & Integrasi)
- Tooltip peran di halaman login klien: tambahkan trigger ramah mobile (ikon info) dan opsi chip bantuan yang dapat di‑toggle.
- Aksesibilitas tooltip: tautkan `aria-describedby` ke dropdown peran, dukungan keyboard fokus/blur, dan pengumuman ARIA yang jelas.
- Kurangi “flicker”: debounce/hysteresis saat tooltip disembunyikan pada hover out.
- Panel “Invite User”: sambungkan ke endpoint nyata (POST `/admin/invites/create`, GET `/admin/invites`, POST `/admin/invites/:id/revoke`).
- Code Login: validasi via API (POST `/auth/provision/validate`), konsumsi single‑use (POST `/auth/provision/consume`), simpan JWT secara aman.
- Manage Invites: pagination, filter status (active/revoked/used), indikator waktu kedaluwarsa, dan aksi salin kode yang aksesibel.
 - Tampilkan pesan ramah di `/login/client` dengan tautan ke `mps-one.com` bagi pengguna yang belum memastikan perannya.
 - Catat redirect tidak dikenal untuk analitik guna mengukur minat dari non-pengguna.

## API Wishlist (Free‑First dengan Alternatif)

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
