Bahasa: [English](../ONBOARDING.md) | [Bahasa Indonesia](ONBOARDING.md)

# Panduan Onboarding

Panduan ini membantu Anda menyiapkan lingkungan lokal dan menjalankan alur inti pengadaan. Melengkapi Developer Quickstart di `README.md` dan SOP di `.trae/rules/project_rules.md`.

## 1) Persiapan Lingkungan
- Node (Windows): pastikan `node -v` ≥ 18 (workspace saat ini: `v24.11.0`).
- WSL2 Ubuntu-20.04: jalankan Docker Engine di dalam WSL saja.
- Git terpasang.

## 2) Jalankan Pertama Kali
```bash
cd webapp
npm ci
npm run dev
# Buka http://localhost:5173
```
Opsional preview + test:
```bash
npm run build -- --base=/
npm run preview        # http://localhost:4173
npx playwright install winldd
npx playwright test
```

## 3) Backend & DB (opsional bila diperlukan)
Jalankan di dalam WSL:
```bash
wsl -d Ubuntu-20.04
docker ps
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker run -d -p 8080:80 --name web nginx:alpine
docker ps
```
Migrasi:
```bash
bash scripts/import-migrations.sh
bash scripts/verify-db.sh
```

## 4) Ganti Mode (Client/Supplier)
- Gunakan toggle tersegmentasi di Topbar untuk beralih `Client` ↔ `Supplier`.
- Pergantian mode akan menghapus cache pilar agar tidak saling tercampur, lalu navigasi ke landing sesuai mode.

## 5) Walkthrough Alur Inti (Client → Supplier)
1. Client membuat dan menyetujui PR (`/procurement/pr`).
2. Kirim PR ke pemasok; pemasok membuat quote (`/procurement/quote-builder`).
3. Client membandingkan quote dan menerima salah satu (`/procurement/quote-comparison`).
4. Buat PO dan preview (`/procurement/po/preview`).
5. Catat pengiriman dan koreksi (`/inventory/delivery-notes`).
6. Supplier membuat invoice sesuai batas (`/supplier/reporting`).

Ilustrasi (placeholder):
- ![GIF: Buat & Setujui PR](../../webapp/public/docs/gifs/create-approve-pr.gif)
- ![GIF: Bandingkan Quote & Buat PO](../../webapp/public/docs/gifs/compare-quotes-generate-po.gif)
- ![GIF: Delivery Notes & Invoice](../../webapp/public/docs/gifs/delivery-invoice.gif)

## 6) Troubleshooting
- Preview blank di deep route: build ulang dengan `--base=/`, lalu `npm run preview`.
- Dependency Playwright `winldd` tidak ada: `npx playwright install winldd`.
- Error proxy ke `/api/*` saat preview/test wajar jika backend tidak berjalan.
- Konflik port: dev `5173`, preview `4173`, backend proxy `3001`.
- Lihat `docs/id/FAQ.md` untuk solusi onboarding lengkap.

## 7) Referensi
- `docs/id/WORKFLOWS.md`: langkah alur kerja dan guard.
- `docs/id/ROLES_PERMISSIONS.md`: peran dan matriks izin.
- `docs/id/UI_THEME_I18N.md`: tema neon dan pengaturan bahasa.
- `DEPLOY.md`: prosedur produksi.

