Bahasa: [English](../DB_SETUP.md) | [Bahasa Indonesia](DB_SETUP.md)

# Setup Backend API & MySQL

Dokumen ini merangkum langkah dasar menyiapkan MySQL di Hostinger dan menghubungkan backend API. Kredensial database hanya boleh ada di backend — jangan pernah di frontend.

## Kredensial MySQL (Hostinger)
- Nama Database: `mpsonedatabase`
- Pengguna Database: `mpsone`
- Kata Sandi: buat kata sandi kuat di hPanel
- Host: dari hPanel Hostinger (mis. `srvXXXXXX.hstgr.cloud`)
- Port: `3306`

## Buat Database & Pengguna
1. Buka hPanel Hostinger → Databases → MySQL.
2. Buat database `mpsonedatabase`.
3. Buat pengguna `mpsone` dan beri akses FULL ke `mpsonedatabase`.
4. Catat `Host`, `Username`, dan setel `Password` yang kuat.

## Environment Backend (.env)
Set variabel berikut di service backend (Node, PHP, dll):

```
DB_HOST=srvXXXXXX.hstgr.cloud
DB_PORT=3306
DB_NAME=mpsonedatabase
DB_USER=mpsone
DB_PASSWORD=GANTI_DENGAN_PASSWORD_KUAT

# CORS / asal aplikasi
APP_ORIGIN=https://domain-frontend-anda
```

### Contoh Node (mysql2)
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

### Contoh PHP (PDO)
```php
$dsn = "mysql:host=" . getenv('DB_HOST') . ";port=" . getenv('DB_PORT') . ";dbname=" . getenv('DB_NAME');
$pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASSWORD'), [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
```

## Tabel Minimal (saran awal)
Skema ini sebagai awal untuk lifecycle pengadaan — sesuaikan sesuai kebutuhan.

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
- Frontend memanggil backend API di `VITE_API_BASE` (lihat `.env` di bawah).
- Konfigurasikan web server untuk proxy `/api/*` ke backend (Apache/Nginx atau routing Hostinger).

## Environment Frontend (Vite)
Tambahkan ke `.env.development` dan `.env.production`:

```
VITE_API_BASE=/api
```

Gunakan URL penuh jika perlu: `https://api.domain-anda.com`.

## Catatan Keamanan
- Jangan menaruh `DB_HOST`, `DB_USER`, `DB_PASSWORD` di frontend.
- Gunakan user DB least-privilege dan rotasi password berkala.
- Aktifkan TLS untuk endpoint API dan enforce CORS ke origin frontend Anda.

---

## Stack Docker Lokal (Windows + WSL)

Untuk pengembangan lokal tanpa hosting eksternal, jalankan MySQL dan phpMyAdmin via Docker Engine + WSL di Windows.

### Prasyarat
- Windows dengan WSL aktif (Ubuntu atau distro Linux setara).
- Docker Engine terpasang dan dapat dipakai di WSL (`docker version`).
- Path proyek: `D:\ProjectBuild\projects\mpsone\mpsone`.

### Menyalakan Stack DB
Di WSL:

```
cd /mnt/d/ProjectBuild/projects/mpsone/mpsone/db
docker compose up -d
```

Layanan:
- `mpsone-db` (MySQL 8) di `localhost:3306`
- `mpsone-phpmyadmin` di `http://localhost:8081/`

Kredensial lokal (khusus development):
- Database: `mpsone_dev`
- User: `mpsone_dev` / Password: `devpass`
- Root password: `rootpass`

Data disimpan pada named volume `mpsone-db-data`. Untuk wipe/reset total: `docker compose down -v`.

### Import Migrasi (idempotent)
Jalankan dari root proyek di WSL:

```
cd /mnt/d/ProjectBuild/projects/mpsone/mpsone
bash scripts/import-migrations.sh
```

Skrip memastikan kontainer aktif dan mengimpor seluruh SQL di `db/migrations/` menggunakan `mysql --force` sehingga aman untuk dijalankan berulang.

### Verifikasi Skema

```
bash scripts/verify-db.sh
```

Pemeriksaan mencakup jumlah data demo dan keberadaan kolom & indeks penting pada PR (`title`, `description`, `budget_code`, `approver`, `idx_pr_status`, `idx_pr_need_date`).

### phpMyAdmin
- Buka `http://localhost:8081/`
- Login dengan `mpsone_dev` / `devpass` atau `root` / `rootpass`
- Gunakan Import untuk uji satu‑off; untuk konsistensi, lebih baik jalankan lewat skrip.
