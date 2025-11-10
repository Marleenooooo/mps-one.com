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

## Kebijakan Penyelarasan Alur Kerja
- Front-end menegakkan akses berbasis peran sesuai siklus pengadaan.
- Admin: konfigurasi korporat (Corporate Onboarding), undangan, menerbitkan PO dari quote yang diterima.
- PIC Procurement: mengelola PR, meninjau quote pemasok, mengonversi quote diterima menjadi PO.
- PIC Operational: membuat PR, membantu penerimaan dan koreksi pengiriman.
- PIC Finance: menyetujui PR, meninjau invoice, memproses pembayaran.
- Sisi pemasok: menerima PR yang disetujui, mengirim quote, memproses pengiriman (Delivery Letter), dan menerbitkan invoice berdasarkan pengiriman yang dikonfirmasi.
