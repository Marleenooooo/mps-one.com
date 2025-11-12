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

## Troubleshooting Onboarding

### Error Playwright: `winldd` tidak ditemukan
- Instal dependency loader Windows: `npx playwright install winldd`, lalu jalankan `npx playwright test`.

### Instalasi browser Playwright macet
- Batalkan proses, kemudian jalankan ulang: `npx playwright install` → `npx playwright test`.
- Jika terjadi lock, tutup terminal dan coba instal ulang.

### Preview Vite blank di deep route
- Build dengan base eksplisit: `npm run build -- --base=/`.
- Lalu `npm run preview` dan buka `http://localhost:4173`.

### Error proxy ke `/api/*` saat preview/test
- Ini wajar saat backend belum berjalan; test memakai data yang di-seed di `localStorage`.
- Abaikan pesan `http proxy error` untuk `/api/analytics`, `/api/notifications`, dll.

### Port dan konflik
- Dev server `5173`, Preview `4173`, Backend proxy `3001`.
- Hentikan proses yang bentrok atau ubah port sesuai kebutuhan.

### Docker tidak tersedia di Windows PowerShell
- Pakai WSL saja: `wsl -d Ubuntu-20.04`, lalu jalankan perintah Docker di dalam WSL.
- Lihat SOP di `.trae/rules/project_rules.md`.
