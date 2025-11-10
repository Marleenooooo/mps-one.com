Bahasa: [English](../WORKFLOWS.md) | [Bahasa Indonesia](WORKFLOWS.md)

# Alur Kerja

## Lifecycle Pengadaan
`PR → Quote → PO → Processing → Shipped → Delivered → Invoiced → Paid`

### Guard & Persetujuan
- Hanya PR approved yang terlihat ke pemasok dan bisa dikonversi ke quote.
- Quote dimiliki pemasok; klien meninjau/menyetujui, bukan membuat quote.
- Klien dapat mengirim satu PR ke banyak pemasok sekaligus untuk membandingkan harga/syarat.
- PO dibuat dari quote yang diterima; klien bisa membagi item ke beberapa pemasok dalam PO terpisah.
- Invoice harus didukung oleh pengiriman yang dikonfirmasi oleh klien.

### Pengiriman & Penagihan
- Banyak pengiriman per PO.
- Penagihan parsial berdasarkan qty pengiriman yang dikonfirmasi.

### Manajemen Pemasok (Klien)
- Klien harus menambahkan pemasok (akun aplikasi yang sudah ada) sebelum mendistribusikan PR.
- Gunakan Supplier Directory untuk mengelola koneksi dan visibilitas pemasok.

### Distribusi PR & Pelacakan (Klien)
- Aksi "Kirim PR ke pemasok" tersedia di daftar PR (aksi baris) dan halaman detail PR.
- Lacak `sent_to[]` per PR dengan ID pemasok dan timestamp; bisa dicerminkan ke thread email.
- Tambahkan pemasok terlebih dahulu; koneksi menggunakan model seperti pertemanan (pending → connected).

### Aturan Split PO & Skema Penomoran
- Izinkan pembagian kuantitas dalam satu line item ke beberapa pemasok.
- Format nomor PO: `PRNumber-<SplitIndexTotal>-SupplierNick[-Revision]`.
  - Contoh: `09857-320-MBERKAH@-A` artinya PR `09857`, PO ke-3 dari total 20 split, nickname pemasok `MBERKAH@`, revisi `A`.
- Anggaran: hanya peringatan; klien dapat mengatur `0` untuk tanpa batas anggaran (default `0`).

### Audit Trail
- Catat aktor, waktu, dan komentar untuk persetujuan PR, penerimaan quote, pembuatan PO, konfirmasi pengiriman, dan penagihan.
