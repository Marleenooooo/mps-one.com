Bahasa: [English](../EMAIL.md) | [Bahasa Indonesia](EMAIL.md)

# Email & Communication Hub

## Tujuan
- Memusatkan komunikasi pemasok-klien dengan percakapan in-app dan cermin email.

## Fitur
- Template dengan aturan CC/BCC per tipe klien.
- Read receipts, @mentions, berbagi berkas dari Document Manager.
- Thread percakapan ditautkan ke konteks PR/Quote/PO/Delivery/Invoice.

## Status
- Dirancang untuk integrasi; pada mode front-end, email dapat disimulasikan hingga backend tersambung.

---

## Fase 4 — Sinkronisasi Email & Webhook Kurir

### OAuth (IMAP/SMTP) — Stub Dev
- Mulai: `POST /api/email/oauth/start` dengan `{ provider, account_email }` → membuat `email_account` dan mengembalikan `authUrl` demo.
- Callback: `GET /api/email/oauth/callback?provider=&account_email=&code=` → memperbarui `token_json`.
- Akun: `GET /api/email/accounts` menampilkan akun; `DELETE /api/email/accounts/:id` menghapus.

### Job Sinkronisasi
- Pemicu manual (dev): `POST /api/email/sync` dengan `{ account_id }` → memperbarui `email_sync_state.last_synced_at`.
- Produksi: worker mengimpor email dan mengaitkannya ke `email_thread` berdasarkan konteks PR/PO.

### Webhook Kurir
- Endpoint: `POST /api/webhooks/courier/:vendor` dengan `{ tracking_no, po_id, status, events }`.
- Menyimpan/memperbarui `shipment_tracking` dengan `events_json` dan `status`.

### Basis Data
- `email_account` — provider, account_email, token_json.
- `email_sync_state` — account_id, last_synced_at, cursor.
- `shipment_tracking` — po_id, vendor, tracking_no, status, events_json.

### Verifikasi (WSL)
- Import: `bash scripts/import-migrations.sh` lalu verifikasi `bash scripts/verify-db.sh`.
- Uji API singkat: OAuth start/callback, daftar akun, sync manual; post sample webhook kurir.
