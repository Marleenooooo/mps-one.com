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

## Option B — Scripted Migrations via phpMyAdmin
Use the versioned SQL migrations provided in this repo.

Steps:
- Log in to phpMyAdmin and select your target database (e.g., `mpsone_dev`).
- Import these files in order:
  1. `db/migrations/0001_init.sql` (core tables)
  2. `db/migrations/0002_seed_basics.sql` (optional demo data)
  3. `db/migrations/0003_items_tables.sql` (item-level tables)
  4. `db/migrations/0004_views_status.sql` (aggregation views)
- Verify tables and views are created under the Structure tab.

Troubleshooting:
- JSON column errors → ensure MySQL ≥ 5.7 or MariaDB ≥ 10.2; if needed I can provide a compatibility script using `TEXT`.
- Import timeouts → enable partial import and retry; split files if necessary.
