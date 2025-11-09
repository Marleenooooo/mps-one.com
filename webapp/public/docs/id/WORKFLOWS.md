Bahasa: [English](../WORKFLOWS.md) | [Bahasa Indonesia](WORKFLOWS.md)

# Alur Kerja

## Lifecycle Pengadaan
`PR → Quote → PO → Processing → Shipped → Delivered → Invoiced → Paid`

### Guard & Persetujuan
- Hanya PR approved yang terlihat ke pemasok dan bisa dikonversi ke quote.
- PO dibuat dari quote yang diterima.
- Invoice harus didukung oleh pengiriman yang dikonfirmasi.

### Pengiriman & Penagihan
- Banyak pengiriman per PO.
- Penagihan parsial berdasarkan qty pengiriman yang dikonfirmasi.

### Audit Trail
- Catat aktor, waktu, dan komentar untuk persetujuan PR, penerimaan quote, pembuatan PO, konfirmasi pengiriman, dan penagihan.

