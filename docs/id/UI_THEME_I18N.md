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
 - Skip Link: terlihat saat fokus di kiri-atas; pengguna keyboard bisa lompat ke konten utama.
 - Pintasan keyboard: `/` fokus ke kolom pencarian People; Alt+Left/Right pindah halaman DataTable; Alt+P ekspor ke PDF.

## Preferensi Bahasa (i18n)
- Didukung: Inggris (`en`) dan Indonesia (`id`).
- Key penyimpanan: `mpsone_lang` (utama) dan `lang` (legacy) untuk kompatibilitas.
- Default pengguna baru: `id` untuk Indonesia, selainnya `en` (berdasarkan geo).
- Ganti bahasa di topbar; preferensi dicache lokal antar sesi.

### Tindakan Procurement (Label Terlokalisasi)
- Label Perbandingan Penawaran: `quotes.title`, `quotes.subtitle`, `quote.version`, `quote.total`, `quote.tax_rate`, `quote.discount`, `quote.valid_until`.
- Label tindakan: `action.approve_quote`, `action.reject_quote`, `po.generate_from_quote`.
- Kelompok label status: `status.label`, `actions.label`.
- Peringatan: `quote.approved_alert`, `quote.rejected_alert`.
- Tooltip penjaga: `gating.approval_required_compare`, `gating.approval_required_send`, `gating.quote_builder_disabled`.

### Catatan Pengiriman & Pelaporan (Supplier) — Key I18N
- Catatan Pengiriman:
  - `delivery.title`, `delivery.header_desc`, `delivery.po_label`, `delivery.delivered_amount`
  - `delivery.table.item`, `delivery.table.ordered`, `delivery.table.shipped`, `delivery.table.received`, `delivery.table.correction`, `delivery.table.available_to_invoice`
  - `delivery.invariant`, `delivery.correction_aria`
- Pelaporan Supplier:
  - `reporting.create_invoice`, `reporting.remaining_deliverable`, `reporting.delivery_references`, `reporting.no_delivery_records`, `reporting.insufficient_delivered_amount`
  - Status pembayaran: `reporting.status.paid`, `reporting.status.over_due`, `reporting.status.waiting`, `reporting.status.next`, `reporting.status.neutral`

Catatan
- Pastikan key baru tersedia di kamus `en` dan `id` pada `webapp/src/components/I18nProvider.tsx`.
- State UI mengikuti interaksi neon: glow saat hover, scale, dan indikator fokus yang aksesibel.

## Troubleshooting
- Untuk reset tema/bahasa, hapus key di localStorage lalu refresh.
