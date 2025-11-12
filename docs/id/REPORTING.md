Bahasa: [English](../REPORTING.md) | [Bahasa Indonesia](REPORTING.md)

# Pelaporan

## Ikhtisar
- Analisis spending, performa vendor, dan utilisasi anggaran lintas departemen.

## Laporan Utama
- Spending per departemen/vendor/periode.
- Durasi lifecycle PO dan performa pengiriman.
- Distribusi status pembayaran (paid, waiting, next, overdue).
- Preview jadwal pembayaran berikutnya (hijau) dengan countdown di dashboard.

## Ekspor
- Tabel dan grafik siap ekspor dengan filter.

## Konsistensi
- Perhitungan status pembayaran konsisten di dashboard & laporan menggunakan `due_date` dan `paid_at`.

## Kurs Valuta untuk Pelaporan

Untuk konversi mata uang yang konsisten pada invoice dan ringkasan laporan, backend menyimpan kurs harian per pasangan mata uang.

- Tabel sumber: `fx_rate (rate_date, base_ccy, quote_ccy, rate, source)` dengan unique `(rate_date, base_ccy, quote_ccy)`.
- Endpoint:
  - `GET /api/fx/latest?base=IDR&quote=USD` — kurs terbaru beserta tanggalnya.
  - `GET /api/fx/history?base=IDR&quote=USD&days=30` — deret waktu untuk grafik.
  - `POST /api/fx/refresh` — isi/perbarui manual (dev); hanya Admin.
- Caching & Locking: cache TTL in‑memory untuk latest; satu refresh per pasangan per hari.

Panduan penggunaan:
- Konversi total laporan memakai kurs pada tanggal dokumen (contoh: tanggal invoice).
- Untuk grafik, gunakan endpoint history dan selaraskan sumbu X ke `rate_date`.
- Jika `latest` tidak ditemukan, tampilkan pesan UI jelas dan fallback aturan konversi lokal.
