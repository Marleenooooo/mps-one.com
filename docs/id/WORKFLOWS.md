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

### Persetujuan & Penolakan Quote (Klien)
- Tindakan: Setujui atau Tolak versi quote pemasok tertentu.
- Persistensi: transisi status disimpan dan ditampilkan sebagai badge UI (`accepted`, `rejected`, `pending`).
- Audit: menulis entri ke audit trail dengan aktor, peran, timestamp, serta konteks pemasok/versi.
- Guard: hanya PR yang `Approved` boleh membandingkan quote. Tombol yang dinonaktifkan menampilkan tooltip terlokalisasi.

### Generate PO dari Quote yang Diterima
- Titik masuk: dari quote berstatus `accepted`, tombol “Generate PO” aktif.
- Route Guard: `/procurement/po/preview` membutuhkan konteks quote diterima; jika tidak ada/tidak cocok, diarahkan kembali ke Workflow atau Quote Comparison.
- Prefill: pratinjau PO mengisi pemasok, PR, dan versi quote; item tetap contoh sampai backend terpasang.
- Audit: menghasilkan PO mencatat event (entitas `PR`, aksi `po_generate`).

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

### Guard UI + Rute (Klien & Pemasok)
- Quote Builder (Pemasok):
  - Guard rute: `/procurement/quote-builder` membutuhkan konteks pemasok dengan minimal satu PR `Approved` yang didistribusikan ke pemasok tersebut.
  - Gating UI: Sidebar dan Topbar QuickSearch menonaktifkan tautan dengan tooltip sampai syarat terpenuhi.
- Perbandingan Quote (Klien):
  - Guard rute: `/client/quotes/:prId` membutuhkan PR `Approved`; jika tidak, diarahkan ke workflow.
  - Gating UI: PR List menonaktifkan “Bandingkan penawaran” sampai `Approved`, dengan tooltip terlokalisasi.
- Pratinjau PO:
  - Guard rute: `/procurement/po/preview` membutuhkan konteks quote diterima (`mpsone_quote_accepted` + `mpsone_po_from_quote`).
  - Redirect: Konteks hilang → Workflow; tidak cocok → kembali ke Quote Comparison.
