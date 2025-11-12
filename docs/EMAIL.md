Language: [English](EMAIL.md) | [Bahasa Indonesia](id/EMAIL.md)

# Email & Communication Hub

## Purpose
- Centralize supplier-client communication with in-app messaging and email mirroring.

## Features
- Templates with CC/BCC rules per client type.
- Read receipts, @mentions, file sharing from Document Manager.
- Conversation threads linked to PR/Quote/PO/Delivery/Invoice contexts.

## Status
- Designed for integration; in front-end mode, email may be simulated until backend wiring.

---

## Phase 4 — Email Sync & Webhooks

### OAuth (IMAP/SMTP) — Dev Stubs
- Start: `POST /api/email/oauth/start` with `{ provider, account_email }` → creates an `email_account` and returns a fake `authUrl`.
- Callback: `GET /api/email/oauth/callback?provider=&account_email=&code=` → updates `token_json`.
- Accounts: `GET /api/email/accounts` lists connected accounts; `DELETE /api/email/accounts/:id` removes.

### Sync Job
- Manual trigger (dev): `POST /api/email/sync` with `{ account_id }` → updates `email_sync_state.last_synced_at`.
- In production, a worker ingests emails and associates them to `email_thread` by PR/PO context.

### Courier Webhooks
- Endpoint: `POST /api/webhooks/courier/:vendor` with `{ tracking_no, po_id, status, events }`.
- Stores/upserts into `shipment_tracking` with `events_json` and `status`.

### Database
- `email_account` — provider, account_email, token_json.
- `email_sync_state` — account_id, last_synced_at, cursor.
- `shipment_tracking` — po_id, vendor, tracking_no, status, events_json.

### Verification (WSL)
- Import: `bash scripts/import-migrations.sh` then verify `bash scripts/verify-db.sh`.
- API smoke tests: OAuth start/callback, list accounts, manual sync; post courier webhook sample.
