Language: [English](DB_SETUP.md) | [Bahasa Indonesia](id/DB_SETUP.md)

# Backend API & MySQL Setup

This project’s frontend is a React SPA. Database credentials must live on the backend only — never in the frontend. Below are the steps to configure MySQL on Hostinger and wire a backend API.

## MySQL Credentials (Hostinger)
- Database Name: `mpsonedatabase`
- Database User: `mpsone`
- Database Password: set a strong password in hPanel
- Host: from Hostinger hPanel (e.g., `srvXXXXXX.hstgr.cloud`)
- Port: `3306`

## Create the Database/User
1. Open Hostinger hPanel → Databases → MySQL.
2. Create database `mpsonedatabase`.
3. Create user `mpsone` and assign it to `mpsonedatabase` with ALL privileges.
4. Note the `Host`, `Username`, and set a strong `Password`.

## Backend Environment (.env)
Set these environment variables in your backend service (Node, PHP, etc.):

```
DB_HOST=srvXXXXXX.hstgr.cloud
DB_PORT=3306
DB_NAME=mpsonedatabase
DB_USER=mpsone
DB_PASSWORD=REPLACE_WITH_STRONG_PASSWORD

# CORS / app origin
APP_ORIGIN=https://your-frontend-domain
```

### Node (mysql2) Example
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
- Frontend will call the backend API at `VITE_API_BASE` (see `.env` below).
- Configure your web server to proxy `/api/*` to your backend (Apache/Nginx or Hostinger routing).

## Frontend Environment (Vite)
Add this to `.env.development` and `.env.production`:

```
VITE_API_BASE=/api
```

Use a full URL if you prefer: `https://api.your-domain.com`.

## Security Notes
- Do NOT put `DB_HOST`, `DB_USER`, `DB_PASSWORD` in the frontend.
- Use least-privilege DB users and rotate passwords regularly.
- Enable TLS for API endpoints and enforce CORS to your frontend origin.

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

---

## Migrations & Verification — email_thread.subject

Migrations live under `db/migrations/`. For Communications (Gmail-like parity), we added a `subject` column to `email_thread`.

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
   Confirm `subject` exists.

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

### phpMyAdmin
- Open `http://localhost:8081/`
- Login with `mpsone_dev` / `devpass` or `root` / `rootpass`
- Prefer scripts for repeatable imports; phpMyAdmin Import is useful for one-off tests.

### WSL-only Backend (Docker Engine SOP)
When Docker Engine is available only inside WSL, run the backend in WSL so it can reach MySQL on `localhost:3306`.

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

Frontend can run from Windows PowerShell:

```
cd D:\ProjectBuild\projects\mpsone\mpsone\webapp
npm ci
npm run dev
```

Open `http://localhost:5173/` and visit `/dev/db-status` to confirm proxying and DB connectivity.

### Social Features Migrations

Ensure the following migrations are present and imported:

- `0011_social_features_fix.sql` — aligns social tables to singular `user` schema (creates `user_relationships`, `user_blocks`, `user_invites`; adds `nickname` and `status` to `user`).
- `0012_invites_enum_declined.sql` — extends `user_invites.status` with `declined`.
- `0013_invites_add_from_email.sql` — adds `from_email` to `user_invites` for sent/received views.

After import, confirm tables exist and basic queries succeed:

```
SELECT COUNT(*) FROM user_relationships;
SELECT COUNT(*) FROM user_blocks;
SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='user_invites' AND COLUMN_NAME='status';
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='user_invites' AND COLUMN_NAME='from_email';
```

---

## Phase 3 — Audit & Documents (Auth/RBAC, Audit Trail, AV Scan)

### New Schema (0014)
- `audit_log` table: captures actor, action, entity type/id, comment, timestamp.
- `document` table: adds `hash_sha256`, `storage_provider`, `storage_key`, `scan_status`, `scan_vendor`, `scan_at`.

### Verify
- phpMyAdmin: check `audit_log` exists and `document` shows new columns.
- API:
  - `GET /api/auth/me` → returns role/email (dev mode)
  - `GET /api/docs?type=Invoice&limit=10` → documents listing with pagination
  - `POST /api/docs/upload` → stubs upload, marks `scan_status=scanned`, writes audit

### Notes
- Minimal Auth/RBAC: role parsed from `Authorization: Bearer dev.<type>.<role>.<code>` or `x-role`.
- Core endpoints write audit entries for key actions.
## 0019 — User Preferences and Notifications

Adds `user_preferences` and `notifications` tables to support Settings and the Notification Center.

Schema
- `user_preferences(user_id FK, theme ENUM(light|dark|system), language ENUM(en|id), notify_inapp BOOL, notify_email BOOL, updated_at TIMESTAMP)`
- `notifications(id PK, user_id FK, module ENUM(procurement|finance|inventory|reports|alerts), title, body, type ENUM(info|warning|success|error), is_read BOOL, created_at TIMESTAMP)`

Import Migrations (WSL)
- Run: `bash scripts/import-migrations.sh`
- Verify: `bash scripts/verify-db.sh` and phpMyAdmin

Impacted Areas
- Backend API: `GET/PUT /api/user/preferences`, `GET/POST/PUT /api/notifications`
- Frontend UI: `/settings`, `/notifications` pages
