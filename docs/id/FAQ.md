Bahasa: [English](../FAQ.md) | [Bahasa Indonesia](FAQ.md)

# Tanya Jawab (FAQ)

## Apakah aplikasi ini sudah terhubung ke backend?
- Saat ini aplikasi adalah SPA front-end yang siap integrasi API. Beberapa alur memakai data demo hingga backend tersambung.

## Bagaimana cara mengonversi quote pemasok menjadi PO?
- Terima versi quote yang benar, lalu klik "Convert to PO". PO akan memuat pemasok/item/syarat dari quote dan menerapkan guard (qty/harga harus cocok).

## Mengapa bahasa saya default ke Indonesia?
- Pengguna baru di Indonesia mendapat `id` melalui petunjuk geolokasi. Anda bisa mengganti di topbar.

## Bagaimana status pembayaran dihitung?
- Diturunkan dari `due_date`, tanggal saat ini, dan `paid_at`: `paid`, `neutral`, `waiting payment (yellow)`, `next payment (green)`, `over‑due (red)`.

## Mengapa saya tidak bisa menagih lebih dari yang dikirim?
- Invarian: `sum(invoice.amount) ≤ sum(delivered.amount)`.

## Bisakah saya membagi satu quote menjadi beberapa PO?
- Bisa. Setiap PO harus mereferensikan subset versi quote yang diterima dan mengikuti guard/peringatan anggaran.

## Bagaimana cara reset tema/bahasa?
- Hapus key `mpsone_lang` / `lang` di localStorage. Refresh halaman.
