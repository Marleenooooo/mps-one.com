Language: [English](DB_SETUP.md) | [Bahasa Indonesia](id/DB_SETUP.md)

# Backend API & MySQL Setup

This project’s frontend is a React SPA. Database credentials must live on the backend only — never in the frontend. Below are the steps to configure MySQL on Hostinger and wire the backend API used by the app.

## MySQL Credentials (Hostinger)
- Database Name: `u485208858_mpsonedatabase`
- Database User: `u485208858_mpsone`
- Database Password: set a strong password in hPanel
- Host: `srv1631.hstgr.io` (or IP `153.92.15.31`)
- Port: `3306`

## Create the Database/User
1. Open Hostinger hPanel → Databases → MySQL.
2. Create database `mpsonedatabase`.
3. Create user `mpsone` and assign it to `mpsonedatabase` with ALL privileges.
4. Note the `Host`, `Username`, and set a strong `Password`.

## Backend Environment (.env)
Set these environment variables in your backend service (Node, PHP, etc.):

```
DB_HOST=srv1631.hstgr.io
DB_PORT=3306
DB_NAME=u485208858_mpsonedatabase
DB_USER=u485208858_mpsone
DB_PASSWORD=REPLACE_WITH_STRONG_PASSWORD

# CORS / app origin
APP_ORIGIN=https://your-frontend-domain
```

### Node (mysql2) Example (used in this repo)
```ts
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

Backend server file: `webapp/server/index.mjs` exposes:
- `GET /api/health` — MySQL `VERSION()` and `DATABASE()`
- `GET /api/po/summary` — rows from `v_po_item_delivery_totals`
- `GET /api/invoice/status` — rows from `v_invoice_status`

### PHP (PDO) Example
```php
$dsn = "mysql:host=" . getenv('DB_HOST') . ";port=" . getenv('DB_PORT') . ";dbname=" . getenv('DB_NAME');
$pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASSWORD'), [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
```

## Minimal Tables (starter suggestion)
This schema is a starting point for the procurement flow — adjust as needed.

```sql
-- Companies & Users
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role ENUM('Admin','PIC Operational','PIC Procurement','PIC Finance') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Purchase Requests → Quotes → POs → Orders
CREATE TABLE purchase_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  requester_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  status ENUM('Draft','Submitted','Quoted','PO','Processing','Shipped','Delivered','Invoiced','Paid') NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (requester_id) REFERENCES users(id)
);

CREATE TABLE quotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pr_id INT NOT NULL,
  vendor VARCHAR(255) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pr_id) REFERENCES purchase_requests(id)
);

CREATE TABLE purchase_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pr_id INT NOT NULL,
  quote_id INT,
  total DECIMAL(12,2) NOT NULL,
  status ENUM('Processing','Shipped','Delivered') NOT NULL DEFAULT 'Processing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pr_id) REFERENCES purchase_requests(id),
  FOREIGN KEY (quote_id) REFERENCES quotes(id)
);

CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  paid TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (po_id) REFERENCES purchase_orders(id)
);
```

## Frontend → Backend
- Frontend calls the backend API via `VITE_API_BASE`.
- In development, we use Vite’s proxy: frontend fetches `/api/*` and Vite forwards to `http://localhost:3001`.
- In production, set `VITE_API_BASE` to `/api` and configure your web server to proxy `/api/*` to your backend.

## Frontend Environment (Vite)
Add this to `.env.development` and `.env.production`:

```
VITE_API_BASE=/api
```

In development, the Vite proxy in `webapp/vite.config.ts` is:

```ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:3001', changeOrigin: true }
  }
}
```

Use a full URL if you prefer: `https://api.your-domain.com`.

## Local Development (quick start)

1) Start backend API (new terminal in `webapp`):

```
$env:DB_HOST="srv1631.hstgr.io"; $env:DB_PORT="3306"; $env:DB_NAME="u485208858_mpsonedatabase"; $env:DB_USER="u485208858_mpsone"; $env:DB_PASSWORD="REPLACE_WITH_STRONG_PASSWORD"; npm run server
```

2) Start frontend (another terminal in `webapp`):

---

## Migrations & Verification — email_thread.subject

This project ships SQL migrations under `db/migrations/`. For Communications (Gmail-like parity), we added a `subject` column to the `email_thread` table.

- Migration file: `db/migrations/0018_email_thread_subject.sql`
- Column: `subject VARCHAR(255) NULL`

### Import & Verify (WSL)
1. Import migrations:
   ```bash
   bash scripts/import-migrations.sh
   ```
2. Verify schema:
   ```bash
   bash scripts/verify-db.sh
   ```
3. Check via MySQL/phpMyAdmin:
   ```sql
   SHOW COLUMNS FROM email_thread;
   ```
   Ensure a `subject` column exists and is accessible.

### Backend/API Alignment
- After migration, restart the backend server so queries pick up the new column.
- Endpoints affected:
  - `POST /api/email/thread` — accepts optional `subject`.
  - `GET /api/email/thread/:id` — returns `subject`.
  - `GET /api/email/threads` — includes `subject` per thread.

### Frontend/UI Alignment
- Composer passes `subject` on new thread creation.
- Subject renders in the thread header on the Communications page.

```
npm run dev
```

3) Open the DB status page:

```
http://localhost:5173/dev/db-status
```

This page calls `/api/health`, `/api/po/summary`, and `/api/invoice/status` through the proxy and renders results.

### WSL-only Backend (Docker Engine SOP)
If Docker Engine is available only inside WSL, run the backend inside WSL so it can reach MySQL on `localhost:3306`.

WSL (Ubuntu) steps:

```
# 1) Open WSL (Ubuntu)
wsl -d Ubuntu-20.04

# 2) Install nvm and Node (once)
export NVM_DIR="$HOME/.nvm"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20

# 3) Import migrations and verify DB (from project root)
cd /mnt/d/ProjectBuild/projects/mpsone/mpsone
bash scripts/import-migrations.sh
bash scripts/verify-db.sh

# 4) Start backend with local dev env
cd /mnt/d/ProjectBuild/projects/mpsone/mpsone/webapp
export DB_HOST=127.0.0.1; export DB_PORT=3306; export DB_NAME=mpsone_dev; export DB_USER=mpsone_dev; export DB_PASSWORD=devpass
npm ci
npm run server
```

Frontend can still run from Windows PowerShell:

```
cd D:\ProjectBuild\projects\mpsone\mpsone\webapp
npm ci
npm run dev
```

Open `http://localhost:5173/` and visit `/dev/db-status` to confirm proxying and DB connectivity.

### Phase 4 — Email & Courier Tables
- New migrations:
  - `db/migrations/0015_email_oauth.sql` — adds `email_account` and `email_sync_state`.
  - `db/migrations/0016_courier_tracking.sql` — adds `shipment_tracking` with `vendor`, `tracking_no`, `status`, `events_json`.
- Import in WSL: re-run `bash scripts/import-migrations.sh` then `bash scripts/verify-db.sh`.
- Verify in phpMyAdmin: tables exist; run quick selects to confirm inserts from API.

## Security Notes
- Do NOT put `DB_HOST`, `DB_USER`, `DB_PASSWORD` in the frontend.
- Use least-privilege DB users and rotate passwords regularly.
- Enable TLS for API endpoints and enforce CORS to your frontend origin.
 - Never commit real passwords to the repository; use environment variables in your local shell or an untracked `.env.local`.

## Quick Checks
- Backend `.env` essentials:
```
DB_HOST=srv1631.hstgr.io   # or 153.92.15.31
DB_PORT=3306
```
- Node: connectivity test
```ts
import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'srv1631.hstgr.io',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'mpsone',
    password: process.env.DB_PASSWORD || 'REPLACE',
    database: process.env.DB_NAME || 'mpsonedatabase',
  });
  const [rows] = await pool.query('SELECT 1 AS ok');
  console.log(rows);
}
main().catch(console.error);
```
- PHP (PDO): connectivity test
```php
$dsn = 'mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT') . ';dbname=' . getenv('DB_NAME');
$pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASSWORD'), [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
$stmt = $pdo->query('SELECT VERSION() AS version');
print_r($stmt->fetch());
```

### Connectivity Scripts (ready to run)
- Node:
  - Install dependency once:
    - `cd webapp`
    - `npm i -D mysql2`
  - Set env in the current shell (do not persist secrets) and run:
    - PowerShell: `$env:DB_HOST="srv1631.hstgr.io"; $env:DB_PORT="3306"; $env:DB_NAME="u485208858_mpsonedatabase"; $env:DB_USER="YOUR_DB_USER"; $env:DB_PASSWORD="YOUR_DB_PASSWORD"; node ../scripts/test-db-node.mjs`
- PHP:
  - Run: `php scripts/test-db-php.php` (ensure PHP CLI installed)


## Option B — Scripted Migrations via phpMyAdmin
Use the versioned SQL migrations provided in this repo.

Steps:
- Log in to phpMyAdmin and select your target database (e.g., `mpsone_dev`).
- Import these files in order:
  1. `db/migrations/0001_init.sql` (core tables)
  2. `db/migrations/0002_seed_basics.sql` (optional demo data)
  3. `db/migrations/0003_items_tables.sql` (item-level tables)
  4. `db/migrations/0004_views_status.sql` (aggregation views)
   5. `db/migrations/0005_seed_workflow.sql` (one-click demo workflow) — optional
- Verify tables and views are created under the Structure tab.

Troubleshooting:
- JSON column errors → ensure MySQL ≥ 5.7 or MariaDB ≥ 10.2; if needed I can provide a compatibility script using `TEXT`.
- Import timeouts → enable partial import and retry; split files if necessary.
- Foreign key errors on `po.quote_id` → ensure you imported in order and do not insert a PO without a valid `quote_id` (use 0005 script if unsure).

---

## Local Docker Stack (Windows + WSL)

For local development without external hosting, you can run MySQL and phpMyAdmin via Docker Engine and WSL on Windows.

### Prerequisites
- Windows with WSL (Ubuntu or similar) enabled.
- Docker Engine installed and accessible within WSL (`docker version`).
- Project path: `D:\ProjectBuild\projects\mpsone\mpsone`.

### Start the DB Stack
In WSL:

```
cd /mnt/d/ProjectBuild/projects/mpsone/mpsone/db
docker compose up -d
```

Services:
- `mpsone-db` (MySQL 8) on `localhost:3306`
- `mpsone-phpmyadmin` at `http://localhost:8081/`

Local credentials (development only):
- Database: `mpsone_dev`
- User: `mpsone_dev` / Password: `devpass`
- Root password: `rootpass`

Data persists in a named volume `mpsone-db-data`. To wipe and reset: `docker compose down -v`.

### Import Migrations (idempotent)
Run from the project root in WSL:

```
cd /mnt/d/ProjectBuild/projects/mpsone/mpsone
bash scripts/import-migrations.sh
```

The script ensures containers are up and imports all SQL files in `db/migrations/` using `mysql --force` to continue past safe duplicates.

### Verify Schema

```
bash scripts/verify-db.sh
```

Checks include demo counts and presence of PR columns and indexes (`title`, `description`, `budget_code`, `approver`, `idx_pr_status`, `idx_pr_need_date`).

### WSL-only Environment Notes
- Some environments have Docker available only inside WSL2 Ubuntu-20.04 and not in Windows PowerShell.
- Run all Docker commands inside WSL: `wsl -d Ubuntu-20.04`.
- The PowerShell wrapper (`scripts/import-migrations.ps1`) requires Docker in PowerShell; if not recognized, use the WSL bash scripts above.
- If registry authentication is required, run `docker login` in WSL; never commit credentials.

### App Test with Local DB
Run the app against the local Docker MySQL for end-to-end testing.

1) Start DB and import migrations (in WSL):
```
cd /mnt/d/ProjectBuild/projects/mpsone/mpsone/db
docker compose up -d
cd /mnt/d/ProjectBuild/projects/mpsone/mpsone
bash scripts/import-migrations.sh
bash scripts/verify-db.sh
```

2) Start backend with local credentials:
WSL (bash):
```
cd /mnt/d/ProjectBuild/projects/mpsone/mpsone/webapp
export DB_HOST=127.0.0.1; export DB_PORT=3306; export DB_NAME=mpsone_dev; export DB_USER=mpsone_dev; export DB_PASSWORD=devpass; npm run server
```
PowerShell (if Docker also available there):
```
cd D:\ProjectBuild\projects\mpsone\mpsone\webapp
$env:DB_HOST="127.0.0.1"; $env:DB_PORT="3306"; $env:DB_NAME="mpsone_dev"; $env:DB_USER="mpsone_dev"; $env:DB_PASSWORD="devpass"; npm run server
```

3) Start frontend dev server:
```
cd D:\ProjectBuild\projects\mpsone\mpsone\webapp
npm run dev
```

4) Open the DB status page:
```
http://localhost:5173/dev/db-status
```
This page calls `/api/health`, `/api/po/summary`, and `/api/invoice/status` via the Vite proxy (`http://localhost:3001`).

### phpMyAdmin
- Open `http://localhost:8081/`
- Login with `mpsone_dev` / `devpass` or `root` / `rootpass`
- Prefer scripts for repeatable imports; phpMyAdmin Import is useful for one-off tests.

---

## Phase 3 — Audit & Documents (Auth/RBAC, Audit Trail, AV Scan)

### New Schema (0014)
- `audit_log` table:
  - Columns: `actor_email`, `action`, `entity_type`, `entity_id`, `comment`, `created_at`.
  - Indexes: actor, entity, action.
- `document` table augmented with:
  - `hash_sha256`: content hash for deduplication/integrity.
  - `storage_provider` / `storage_key`: object storage pointer (R2/Supabase/MinIO).
  - `scan_status` (`pending|scanned|infected|error`), `scan_vendor`, `scan_at`.

### Import & Verify (WSL)
1) Import migrations:
```
cd /mnt/d/ProjectBuild/projects/mpsone/mpsone
bash scripts/import-migrations.sh
```
2) Verify schema:
```
SELECT COUNT(*) FROM audit_log;
DESCRIBE document; -- confirm new columns exist
```
3) API checks:
```
GET /api/auth/me
GET /api/docs?type=Invoice&limit=10
POST /api/docs/upload { type, refId, url }
```

### Notes
- Auth/RBAC is minimal: role is parsed from `Authorization: Bearer dev.<type>.<role>.<code>` or header `x-role`.
- Key endpoints write audit entries: PR create/update/delete, follows/blocks, invites, email-thread changes, document upload.
### Phase 4 — FX Rates Table

New migration: `db/migrations/0017_fx_rates.sql`

- Table: `fx_rate`
  - `rate_date DATE NOT NULL`
  - `base_ccy CHAR(3) NOT NULL`
  - `quote_ccy CHAR(3) NOT NULL`
  - `rate DECIMAL(18,8) NOT NULL`
  - `source VARCHAR(64)`
  - `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  - `UNIQUE KEY uq_fx (rate_date, base_ccy, quote_ccy)`

WSL import & verify:

1) Import migrations:
   - `bash scripts/import-migrations.sh`
2) Verify via helper and phpMyAdmin:
   - `bash scripts/verify-db.sh`
   - Check `fx_rate` table exists; insert sample rows via API `/api/fx/refresh`.
3) Query samples:
   - Latest: `SELECT rate_date, rate FROM fx_rate WHERE base_ccy='IDR' AND quote_ccy='USD' ORDER BY rate_date DESC LIMIT 1;`
   - History: `SELECT rate_date, rate FROM fx_rate WHERE base_ccy='IDR' AND quote_ccy='USD' AND rate_date >= CURDATE() - INTERVAL 30 DAY ORDER BY rate_date ASC;`
## 0019 — User Preferences and Notifications

Adds `user_preferences` and `notifications` tables to support Settings and the Notification Center.

Schema
- `user_preferences(user_id FK, theme ENUM(light|dark|system), language ENUM(en|id), notify_inapp BOOL, notify_email BOOL, updated_at TIMESTAMP)`
- `notifications(id PK, user_id FK, module ENUM(procurement|finance|inventory|reports|alerts), title, body, type ENUM(info|warning|success|error), is_read BOOL, created_at TIMESTAMP)`

Import Migrations (WSL)
- Run: `bash scripts/import-migrations.sh`
- Verify: `bash scripts/verify-db.sh` and phpMyAdmin (check new tables and indexes)

Impacted Areas
- Backend API: `GET/PUT /api/user/preferences`, `GET/POST/PUT /api/notifications`
- Frontend UI: `/settings` page for theme/language/notification preferences; `/notifications` page with unread counts and mark‑as‑read.
## 0020 — Audit Log: active_mode

Strengthens audit logging with mode tracking and enforces Client mode on PR reads.

- Migration: `db/migrations/0020_audit_active_mode.sql`
- Table changes (audit_log):
  - Adds `active_mode ENUM('Client','Supplier') NOT NULL DEFAULT 'Client'`
  - Adds index `idx_audit_mode (active_mode, action, created_at)`

### Import & Verify (WSL)
1) Import migrations:
```
bash scripts/import-migrations.sh
bash scripts/verify-db.sh
```
2) Check via MySQL/phpMyAdmin:
```
SHOW COLUMNS FROM audit_log;          -- expect active_mode
SHOW INDEX FROM audit_log;            -- expect idx_audit_mode
```

### Backend Alignment
- `webapp/server/index.mjs`:
  - `logAudit(...)` now writes `active_mode` for every audit entry.
  - PR endpoints (reads) enforce Client mode:
    - `GET /api/pr` guarded by `requireMode(['Client'])`
    - `GET /api/pr/:id` guarded by `requireMode(['Client'])`

### Query Samples
```
-- PR actions by mode
SELECT active_mode, action, COUNT(*) cnt
FROM audit_log
WHERE action LIKE 'pr.%'
GROUP BY active_mode, action
ORDER BY active_mode, action;

-- Recent FX refreshes done in Client mode
SELECT actor_email, comment, created_at
FROM audit_log
WHERE action='fx.refresh' AND active_mode='Client'
ORDER BY created_at DESC LIMIT 20;
```
