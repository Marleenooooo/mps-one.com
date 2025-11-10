Bahasa: [English](../DB_SETUP.md) | [Bahasa Indonesia](DB_SETUP.md)

# Setup Backend API & MySQL

Dokumen ini merangkum langkah dasar menyiapkan MySQL di Hostinger dan menghubungkan backend API. Kredensial database hanya boleh ada di backend — jangan pernah di frontend.

## Kredensial MySQL (Hostinger)
- Nama Database: `mpsonedatabase`
- Pengguna Database: `mpsone`
- Kata Sandi: buat kata sandi kuat di hPanel
- Host: Hostname server MySQL kami adalah: `srv1631.hstgr.io` atau Anda bisa menggunakan IP ini sebagai hostname: `153.92.15.31`
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

## Opsi B — Migrasi SQL via phpMyAdmin
Gunakan file migrasi versi yang tersedia di repo ini.

Langkah:
- Masuk ke phpMyAdmin dan pilih database target (mis. `mpsone_dev`).
- Import file berikut secara berurutan:
  1. `db/migrations/0001_init.sql` (tabel inti)
  2. `db/migrations/0002_seed_basics.sql` (data demo, opsional)
  3. `db/migrations/0003_items_tables.sql` (tabel item-level)
  4. `db/migrations/0004_views_status.sql` (view agregasi)
   5. `db/migrations/0005_seed_workflow.sql` (demo sekali klik) — opsional
- Verifikasi tabel dan view muncul di tab Struktur.

Troubleshooting:
- Error kolom JSON → pastikan MySQL ≥ 5.7 atau MariaDB ≥ 10.2; jika perlu saya dapat menyiapkan skrip kompatibilitas menggunakan `TEXT`.
- Timeout impor → aktifkan partial import dan coba lagi; pecah file jika perlu.
 - Error foreign key pada `po.quote_id` → pastikan urutan impor benar dan jangan membuat PO tanpa `quote_id` yang valid (gunakan skrip 0005 jika ragu).
