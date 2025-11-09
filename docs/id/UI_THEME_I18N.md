Bahasa: [English](../UI_THEME_I18N.md) | [Bahasa Indonesia](UI_THEME_I18N.md)

# Tema UI & Internationalisasi

## Sistem Tema
- Tema Light & Dark dengan transisi halus.
- Preferensi disimpan melalui localStorage; deteksi OS pada pemuatan pertama.
- Navigasi visual memakai warna modul untuk orientasi pengguna.

### Palet Mode Gelap (utama)
- Background `#0A0F2D`, Surface `#1A1F3A`, Teks Utama `#FFFFFF`.
- Warna modul: Procurement `#00F0FF`, Finance `#FF00E5`, Inventory `#39FF14`, Reports `#FFB800`, Alerts `#FF2A50`.

### Palet Mode Terang (utama)
- Background `#FFFFFF`, Surface `#F8FAFF`, Teks Utama `#0A0F2D`.
- Warna modul: Procurement `#0077FF`, Finance `#B84DB8`, Inventory `#00A86B`, Reports `#FF8A00`, Alerts `#FF4444`.

### Interaksi
- Tombol primer/sekunder memakai gradasi dengan efek glow.
- Indikator fokus: `outline: 2px solid [module-color]; outline-offset: 2px`.

## Preferensi Bahasa (i18n)
- Didukung: Inggris (`en`) dan Indonesia (`id`).
- Key penyimpanan: `mpsone_lang` (utama) dan `lang` (legacy) untuk kompatibilitas.
- Default pengguna baru: `id` untuk Indonesia, selainnya `en` (berdasarkan geo).
- Ganti bahasa di topbar; preferensi dicache lokal antar sesi.

## Troubleshooting
- Untuk reset tema/bahasa, hapus key di localStorage lalu refresh.
