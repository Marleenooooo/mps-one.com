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
