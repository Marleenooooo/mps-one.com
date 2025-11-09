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
