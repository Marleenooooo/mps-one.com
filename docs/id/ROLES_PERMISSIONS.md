Bahasa: [English](../ROLES_PERMISSIONS.md) | [Bahasa Indonesia](ROLES_PERMISSIONS.md)

# Peran & Hak Akses

Peran: `Admin`, `PIC Operational`, `PIC Procurement`, `PIC Finance`.

## Matriks Akses (Ringkas)
- Pembuatan PR: Operational/Procurement.
- Persetujuan PR: Finance/Admin.
- Pembuatan Quote: sisi pemasok (klien meninjau).
- Pembuatan PO: Procurement/Admin dari quote yang diterima.
- Konfirmasi pengiriman: penerima klien (PIC departemen atau role yang ditunjuk).
- Pengelolaan invoice & pembayaran: Finance.

## Catatan
- Pertahankan audit trail untuk tiap transisi: aktor, timestamp, komentar.
- Terapkan approval gating di UI/API: hanya PR yang disetujui terlihat oleh pemasok dan dapat dikonversi ke quote.

### Modul Admin (mode Pemasok, wajib Admin)
- `/admin/vendor-risk` — Penilaian Risiko Vendor
- `/admin/budget-forecasting` — Peramalan Anggaran
- `/admin/contract-negotiation` — Negosiasi Kontrak
- `/admin/supplier-performance` — Tinjauan Performa Pemasok
- `/admin/payment-reconciliation` — Rekonsiliasi Pembayaran

## Kebijakan Penyelarasan Alur Kerja
- Front-end menegakkan akses berbasis peran sesuai siklus pengadaan.
- Admin: konfigurasi korporat (Corporate Onboarding), undangan, menerbitkan PO dari quote yang diterima.
- PIC Procurement: mengelola PR, meninjau quote pemasok, mengonversi quote diterima menjadi PO.
- PIC Operational: membuat PR, membantu penerimaan dan koreksi pengiriman.
- PIC Finance: menyetujui PR, meninjau invoice, memproses pembayaran.
- Sisi pemasok: menerima PR yang disetujui, mengirim quote, memproses pengiriman (Delivery Letter), dan menerbitkan invoice berdasarkan pengiriman yang dikonfirmasi.

### Kebijakan Identitas (NPWP & Nama)
- Admin: wajib menyediakan 2 NPWP — NPWP Perusahaan (ID akun) dan NPWP Pribadi (tanggung jawab).
- Non‑admin: menyediakan 1 NPWP Pribadi; menjadi ID akun pengguna.
- Semua akun: wajib memiliki display name dan nickname; digunakan di UI dan jejak audit.

### Matriks Persyaratan Identitas

| Peran                 | NPWP Perusahaan (ID Akun) | NPWP Pribadi | Display Name | Nickname |
|-----------------------|---------------------------|--------------|--------------|----------|
| Admin                 | Wajib                      | Wajib        | Wajib        | Wajib    |
| PIC Operational       | Tidak wajib                | Wajib        | Wajib        | Wajib    |
| PIC Procurement       | Tidak wajib                | Wajib        | Wajib        | Wajib    |
| PIC Finance           | Tidak wajib                | Wajib        | Wajib        | Wajib    |
| Pemasok (non-admin)   | Tidak wajib                | Wajib        | Wajib        | Wajib    |

Catatan:
- NPWP Perusahaan hanya berlaku untuk akun Admin dan disimpan sebagai pengenal akun tingkat perusahaan.
- NPWP Pribadi wajib untuk semua pengguna untuk identitas pribadi dan penelusuran tanggung jawab.
- Display Name dan Nickname ditampilkan di Topbar dan digunakan dalam log aktivitas untuk kejelasan.
