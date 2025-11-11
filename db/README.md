# MPSONE Database Setup

This folder provides two ways to start database development:

## Option C — Local DB on this PC (Docker)

Requirements:
- Docker Desktop for Windows

Steps:
1. Open a terminal in this folder: `db/`.
2. Run: `docker compose up -d`.
3. phpMyAdmin: `http://localhost:8081/`
   - Server: `db`
   - User: `mpsone_dev`
   - Password: `devpass`
   - Database: `mpsone_dev` (pre-created by compose)
4. Import `migrations/0001_init.sql` via phpMyAdmin (Import tab) to create tables.

MySQL connection:
- Host: `localhost`
- Port: `3306`
- User: `mpsone_dev`
- Password: `devpass`

Notes:
- Charset: `utf8mb4`, Collation: `utf8mb4_unicode_ci`, Timezone: `Asia/Jakarta`.
- Data files persist under `db/data/` volume.

## Option B — Scripted migrations for phpMyAdmin

Use the migration scripts directly on a remote phpMyAdmin:
1. Log in to phpMyAdmin on your server.
2. Select target database (e.g., `mpsone_dev`).
3. Import these files IN ORDER:
   - `migrations/0001_init.sql` (core tables)
   - `migrations/0002_seed_basics.sql` (demo company, departments, users) — optional
   - `migrations/0003_items_tables.sql` (item-level tables)
   - `migrations/0004_views_status.sql` (aggregation views and derived status)
   - `migrations/0005_seed_workflow.sql` (one-click demo PR→Quote→PO→Delivery→Invoice) — optional
   - `migrations/0006_schema_alignment.sql` (adds PR title/description/budget/approver, indexes, FKs)
   - `migrations/0007_seed_mock_full.sql` (comprehensive mock data: multi-delivery, invoice statuses)
   - `migrations/0008_seed_docs_comms.sql` (Email threads and Document repository samples)

Benefits:
- Repeatable, reviewable, versioned changes.
- Easy to roll forward/backward using incremental files.

Rollback tips:
- If a step fails, re-run only the failed migration after fixing the issue.
- To remove demo data, delete inserted rows from `company`, `department`, and `user` where `name='MPS One Demo'`.
 - To remove the demo workflow (0005), delete rows created in order: `invoice_item` → `invoice` → `delivery_item` → `delivery_note` → `po_item` → `po` → `quote` → `pr`.

## Schema Overview (Initial)
- Tables: `company`, `department`, `user`, `pr`, `quote`, `po`, `delivery_note`, `invoice`, `payment`, `email_thread`, `document`.
- All tables include `created_at` and `updated_at`.
- Foreign keys link companies, departments, users, PRs, quotes, POs, deliveries, invoices, and payments.

### App Alignment (0006)
- `pr.title`, `pr.description` reflect SPA fields in PRCreate.
- `pr.budget_code`, `pr.approver` reserved for approvals gating.
- Indexes on `pr.status`, `pr.need_date` aid list filtering.

## Roadmap
- Add item-level tables (`po_item`, `delivery_item`, `invoice_item`) to enforce quantity and amount invariants via SQL.
- Add seed data scripts for roles and demo entities.
- Add further migrations for indexes, views, and triggers as needed.

## Quick Verification
- After importing 0007, run:
  - `SELECT * FROM v_po_item_delivery_totals;`
  - `SELECT * FROM v_po_invoice_totals;`
  - `SELECT invoice_id, derived_status, due_date, paid_at FROM v_invoice_status;`
  - `SELECT id, participants_json FROM email_thread ORDER BY id DESC LIMIT 3;`
  - `SELECT type, ref_id, url FROM document ORDER BY id DESC LIMIT 4;`
- Expect to see invoices across `paid`, `neutral`, `waiting`, `next`, `over_due` derived statuses.

