Bahasa: [English](../USER_GUIDE.md) | [Bahasa Indonesia](USER_GUIDE.md)

# Panduan Pengguna

Selamat datang di B2B Procurement Webapp. Panduan ini menjelaskan modul inti dan alur kerja sesuai lifecycle pengadaan dan perizinan.

## Navigasi
- Modul Procurement, Finance, Inventory, Reports diberi kode warna.
- Sidebar untuk modul; topbar memiliki toggle bahasa/tema dan aksi cepat.

## Purchase Request (PR)
- Buat PR dengan item, tanggal kebutuhan, dan anggaran. Ajukan untuk persetujuan.
- Status: `draft → submitted → approved | rejected`.
- Hanya PR `approved` yang terlihat oleh pemasok dan dapat diubah ke quote.

## Quote
- Pemasok mengirim quote dengan versi. Anda bisa meninjau, meminta perubahan, atau menerima versi.
- Simpan audit trail siapa/apa/waktu persetujuan.

## Konversi Quote → Purchase Order (PO)
- Terima versi quote yang benar, lalu klik `Convert to PO`.
- PO memuat pemasok/item/syarat dari quote yang diterima dan menerapkan guard (qty/harga cocok).
- Tautkan PO ke departemen dan anggaran.

## Pemrosesan & Pengiriman
- Mendukung banyak pengiriman per PO. Setiap pengiriman menghasilkan `Delivery Letter`.
- Klien mengonfirmasi penerimaan dan dapat mengoreksi qty pada delivery note.

## Penagihan & Pembayaran
- Invoice berdasarkan pengiriman yang dikonfirmasi dan dapat parsial.
- Status pembayaran memakai `due_date`, hari ini, dan `paid_at`.
  - `paid`, `neutral`, `waiting payment (yellow)`, `next payment (green)`, `over‑due (red)`.

## Invarian Utama
- Per item: `sum(delivery.qty) ≤ sum(po.qty)`.
- Per PO: `sum(invoice.amount) ≤ sum(delivered.amount)`.
- Koreksi pada delivery letter menyesuaikan qty yang dapat ditagih.

## Email & Komunikasi
- Template dengan aturan CC/BCC; pesan ditautkan ke PR/Quote/PO/Delivery/Invoice.

## Tema & I18N
- Mode gelap/terang dengan palet neon; toggle bahasa English/Indonesia.

## Pemecahan Masalah
- Reset tema/bahasa dengan menghapus `mpsone_lang` / `lang` di localStorage lalu refresh.

