Bahasa: [English](../WORKFLOWS.md) | [Bahasa Indonesia](WORKFLOWS.md)

# Alur Kerja

Rincian langkah demi langkah dengan peran, guard, dan invarian.

## Purchase Request (PR)
- Status: `draft → submitted → approved | rejected`.
- Aktor: Operational/Procurement membuat; Finance/Admin menyetujui.
- Guard: Hanya PR `approved` yang terlihat oleh pemasok dan dapat dikonversi menjadi quote.
- Audit: catat transisi (aktor, timestamp, komentar).

## Intake & Penerimaan Quote
- Visibilitas: pemasok melihat PR yang disetujui saja.
- Konten quote: item, pajak/diskon, harga, masa berlaku; versi dilacak.
- Penerimaan: klien menandai versi tertentu sebagai diterima; penguncian versi mencegah ambiguitas.
- Audit: penerimaan dicatat beserta aktor & waktu.
 - Klien dapat mengirim satu PR ke banyak pemasok; quote dimiliki pemasok (klien meninjau/menyetujui, bukan menulis).

## Membuat Purchase Order (PO) dari Quote yang Diterima
- Inisiasi: PIC Procurement atau Admin.
- Prefill: pemasok, item, harga, pajak/diskon dari quote yang diterima.
- Lengkapi: jadwal pengiriman, syarat logistik, syarat pembayaran, incoterms, alamat, referensi (PR, Quote, Versi).
- Guard:
  - Tidak bisa membuat PO dari quote draft/tidak diterima.
  - Qty/harga harus cocok dengan quote yang diterima; penyimpangan butuh persetujuan ulang atau versi quote baru.
  - Peringatan anggaran bila melebihi alokasi.
  - Klien dapat membagi item ke beberapa pemasok, menghasilkan beberapa PO dari PR awal.
- Perubahan status: `PO → Processing`.
- Audit: pembuatan, pengeditan, penerbitan.

## Pengiriman & Penerimaan
- Mendukung banyak pengiriman per PO.
- Delivery Letter per pengiriman: qty kirim, nomor lacak, tanggal.
- Konfirmasi klien dengan koreksi: sesuaikan qty diterima sebenarnya.
- Invarian per item: `sum(delivery.qty) ≤ sum(po.qty)`.
 - Klien harus menambahkan pemasok terlebih dahulu sebelum mendistribusikan PR untuk intake multi-pemasok.

## Invoicing & Pembayaran
- Dasar: invoice mereferensikan satu atau lebih Delivery Letter yang dikonfirmasi (bisa parsial).
- Invarian per PO: `sum(invoice.amount) ≤ sum(delivered.amount)`.
- Logika status pembayaran (30 hari): diturunkan dari `due_date` dan `paid_at`.

## Pelaporan & Auditabilitas
- Analitik spending, performa vendor, utilisasi anggaran.
- Audit trail dipelihara pada semua transisi.

## Kontrol Akses (Ditegakkan)
- Hanya PR yang disetujui terlihat oleh pemasok dan layak untuk konversi quote.
- Admin menangani konfigurasi korporat dan dapat menerbitkan PO dari quote yang diterima.
- PIC Procurement mengoperasikan PR dan konversi PO.
- PIC Operational membuat PR dan menangani koreksi penerimaan.
- PIC Finance menyetujui PR serta memproses invoice/pembayaran.
