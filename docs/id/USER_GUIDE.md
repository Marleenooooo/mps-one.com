Bahasa: [English](../USER_GUIDE.md) | [Bahasa Indonesia](USER_GUIDE.md)

# Panduan Pengguna

Panduan ini menjelaskan cara menggunakan Aplikasi B2B Procurement secara menyeluruh: memulai PR, menerima & menilai Quote, membuat PO, melacak pengiriman (Delivery Letter), mengelola Invoice & Pembayaran, serta kolaborasi melalui dokumen & percakapan.

## Audiens & Peran
- Admin: akses penuh lintas modul; dapat melakukan konfigurasi & override bila perlu.
- PIC Procurement: mengelola PR, meninjau Quote pemasok, mengonversi Quote yang diterima menjadi PO, memantau pesanan.
- PIC Operational: memulai PR dan membantu proses penerimaan; berkolaborasi pada koreksi.
- PIC Finance: menyetujui PR, meninjau syarat pembayaran, memproses invoice & pembayaran.

## Navigasi
- Sidebar mengelompokkan modul: Procurement, Finance, Inventory, Reports.
- Header halaman menggunakan warna modul untuk orientasi visual.
- Topbar menyertakan toggle bahasa dan tema.

### Modul Admin (mode Pemasok)
- Penilaian Risiko Vendor: `/admin/vendor-risk` — menilai risiko vendor dan flag kepatuhan.
- Peramalan Anggaran: `/admin/budget-forecasting` — perkiraan anggaran departemen.
- Negosiasi Kontrak: `/admin/contract-negotiation` — ruang kerja negosiasi.
- Tinjauan Performa Pemasok: `/admin/supplier-performance` — tinjau dan ekspor scorecard.
- Rekonsiliasi Pembayaran: `/admin/payment-reconciliation` — rekonsiliasi pembayaran dan item outstanding.

### Akses Berbasis Peran & Penyelarasan Alur Kerja
- Admin: Corporate Onboarding, undangan, dan dapat menerbitkan PO dari quote diterima.
- PIC Procurement: mengelola PR, meninjau quote pemasok, mengonversi quote diterima menjadi PO.
- PIC Operational: membuat PR dan mendukung penerimaan dengan koreksi.
- PIC Finance: menyetujui PR, meninjau invoice, memproses pembayaran.
- Admin Pemasok: akses halaman sisi pemasok (pengajuan quote, pengiriman, invoicing) sesuai PR yang disetujui.

### Aturan Identitas & NPWP
- Admin wajib mengirimkan dua nomor NPWP:
  - NPWP Perusahaan: menjadi ID akun admin; mewakili entitas korporat.
  - NPWP Pribadi: identitas tanggung jawab personal admin.
- Pengguna non‑admin mengirim satu NPWP Pribadi; ini menjadi ID akun mereka.
- Semua akun wajib memiliki display name dan nickname demi kolaborasi & audit yang jelas.

## Tema & Bahasa
- Tema: Light & Dark; preferensi disimpan (persisten).
- Bahasa: Inggris (`en`) atau Indonesia (`id`); preferensi disimpan di localStorage.
  - Pengguna baru dapat memperoleh default berdasarkan geolokasi (Indonesia → `id`, selain itu `en`).
  - Anda dapat mengganti bahasa kapan saja di topbar.

## Siklus Pengadaan
Pipeline status: `PR → Quote → PO → Processing → Shipped → Delivered → Invoiced → Paid`.

### 1) Purchase Request (PR)
- Buat PR: PIC departemen atau Procurement dapat memulai.
- Sertakan: departemen peminta, item (nama, qty, unit), tanggal kebutuhan, catatan anggaran.
- Ajukan untuk persetujuan: Finance/Admin menyetujui atau menolak.
- Guard: Hanya PR berstatus Approved yang terlihat oleh pemasok dan layak untuk quote.

### 2) Quote Pemasok
- Intake: PR yang Disetujui tersedia untuk penawaran pemasok.
- Versi Quote: pemasok dapat mengirim revisi; pilih & terima versi yang benar.
- Tinjau: validasi item, pajak/diskon, harga, masa berlaku.
- Terima: kunci versi quote yang dipilih untuk menjaga audit.

### 3) Konversi Quote → Purchase Order (PO)
- Dari quote yang diterima, klik "Convert to PO".
- Prefill: pemasok, perusahaan klien, departemen, item, pajak/diskon dari quote.
- Lengkapi: jadwal pengiriman, syarat logistik, syarat pembayaran, incoterms, alamat.
- Referensi: tautkan PR ID, Quote ID, versi quote; tetapkan nomor PO.
- Validasi: total vs anggaran departemen; qty/harga harus sesuai quote yang diterima.
- Terbitkan PO: sistem membuat PO dan memajukan status ke `Processing`.

### 4) Pengiriman & Penerimaan
- Mendukung banyak pengiriman per PO.
- Setiap pengiriman memiliki Delivery Letter (Delivery Note): qty dikirim, nomor lacak, tanggal.
- Konfirmasi klien: penerima mengonfirmasi dan dapat mengoreksi selisih (rusak/hilang).
- Koreksi menyesuaikan jumlah yang dapat di-invoice.

### 5) Invoicing & Pembayaran
- Invoice diterbitkan berdasarkan pengiriman yang dikonfirmasi; invoicing parsial diperbolehkan.
- Invarian:
  - Per item: `sum(delivery.qty) ≤ sum(po.qty)`.
  - Per PO: `sum(invoice.amount) ≤ sum(delivered.amount)`.
- Status pembayaran (30 hari): `paid`, `neutral`, `waiting payment (yellow)`, `next payment (green)`, `over‑due (red)`.
  - Diturunkan dari `due_date`, tanggal saat ini, dan `paid_at`.

## Document Manager
- Simpan & versi dokumen: lampiran PR, quote, PDF PO, delivery letter, invoice.
- Operasi massal: unggah, unduh, pengaturan akses.
- Riwayat versi: pertahankan versi sebelumnya untuk audit.

## Communication Hub
- Percakapan in-app & cermin email untuk komunikasi pemasok/klien.
- Template dengan aturan CC/BCC per tipe klien; read receipts & @mentions.
- Lampirkan berkas langsung dari Document Manager.

## Reporting
- Pantau spending, performa vendor, utilisasi anggaran.
- Laporan siap ekspor dengan filter.
- Status pembayaran konsisten di dashboard & reporting.

## Audit Trail
- Setiap transisi & aksi kunci dicatat: aktor, timestamp, komentar.
- Contoh: persetujuan PR, penerimaan quote, pembuatan PO, konfirmasi pengiriman, invoicing, pembayaran.

## Ringkasan Validasi & Guard
- PR Approved diperlukan sebelum quote pemasok atau konversi PO.
- PO harus berasal dari quote yang diterima; perubahan item butuh quote baru atau re‑approval.
- Invoicing harus menghormati qty pengiriman yang dikonfirmasi dan koreksi.
- Peringatan anggaran jika total PO melebihi alokasi departemen.

## Tips & Troubleshooting
- Tema/bahasa tidak tersimpan? Hapus key `mpsone_lang` / `lang` di localStorage lalu refresh.
- Default bahasa salah? Gunakan toggle bahasa di topbar; preferensi akan disimpan.
- Dokumen besar? Gunakan operasi bulk & versi di Document Manager.
- Preview produksi: jalankan `npm run preview` untuk perilaku seperti produksi.

## Pemantauan & Analitik
- Penangkapan error: event global `window.error` dan `unhandledrejection` direkam.
- Analitik rute: page view dilacak pada setiap perpindahan rute.
- Aktifkan pengiriman ke backend dengan set `VITE_ANALYTICS_URL` (mis. endpoint staging) sebelum build.
- Verifikasi dev: buka DevTools untuk melihat log `[analytics]`; pastikan `route_view` dan error tampil.
- Privasi: hanya data minimal (nama event, path, timestamp, URL, user agent) yang dikirim.

## Mulai Cepat (Onboarding)
- Jalankan dev server: `npm run dev` di folder `webapp`.
- Login uji: gunakan menu Login Client/Supplier; tipe pengguna disimpan di localStorage.
- Navigasi modul: Procurement, Finance, Inventory, Reports via sidebar.
- Tema & bahasa: ubah dari topbar; preferensi persistent (disimpan lokal).
- Cek performa: buka `/procurement/pr` dan `/admin/people`; pastikan scroll halus dan tanpa error.

## Catatan
- Aplikasi saat ini adalah SPA front-end siap integrasi API; sejumlah alur menggunakan data demo hingga backend terhubung.
- Alur email & integrasi backend dirancang namun mungkin disimulasikan hingga tersambung.
