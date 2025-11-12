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
$env:DB_HOST="srv1631.hstgr.io"; 
$env:DB_PORT="3306"; 
$env:DB_NAME="u485208858_mpsonedatabase"; 
$env:DB_USER="u485208858_mpsone"; 
$env:DB_PASSWORD="4Vi4Z55LDb^paD;u"; node ..\scripts\test-db-node.mjs 

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

---

## Migrasi & Verifikasi — subject di email_thread

Proyek ini memiliki file migrasi SQL di `db/migrations/`. Untuk fitur Komunikasi (paritas Gmail), kami menambahkan kolom `subject` ke tabel `email_thread`.

- File migrasi: `db/migrations/0018_email_thread_subject.sql`
- Kolom: `subject VARCHAR(255) NULL`

### Impor & Verifikasi (WSL)
1. Impor migrasi:
   ```bash
   bash scripts/import-migrations.sh
   ```
2. Verifikasi skema:
   ```bash
   bash scripts/verify-db.sh
   ```
3. Cek via MySQL/phpMyAdmin:
   ```sql
   SHOW COLUMNS FROM email_thread;
   ```
   Pastikan kolom `subject` ada dan dapat diakses.

### Penyesuaian Backend/API
- Setelah migrasi, restart backend agar query menggunakan kolom baru.
- Endpoint terdampak:
  - `POST /api/email/thread` — menerima `subject` opsional.
  - `GET /api/email/thread/:id` — mengembalikan `subject`.
  - `GET /api/email/threads` — menyertakan `subject` per thread.

### Penyesuaian Frontend/UI
- Composer mengirim `subject` saat membuat thread baru.
- Subject ditampilkan di header thread pada halaman Komunikasi.

## Catatan Keamanan
- Jangan menaruh `DB_HOST`, `DB_USER`, `DB_PASSWORD` di frontend.
- Gunakan user DB least-privilege dan rotasi password berkala.
- Aktifkan TLS untuk endpoint API dan enforce CORS ke origin frontend Anda.

## Quick Checks
- `.env` backend (inti):
```
DB_HOST=srv1631.hstgr.io   # atau 153.92.15.31
DB_PORT=3306
```
- Node: tes koneksi
```ts
import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'srv1631.hstgr.io',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'mpsone',
    password: process.env.DB_PASSWORD || 'GANTI',
    database: process.env.DB_NAME || 'mpsonedatabase',
  });
  const [rows] = await pool.query('SELECT 1 AS ok');
  console.log(rows);
}
main().catch(console.error);
```
- PHP (PDO): tes koneksi
```php
$dsn = 'mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT') . ';dbname=' . getenv('DB_NAME');
$pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASSWORD'), [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
$stmt = $pdo->query('SELECT VERSION() AS version');
print_r($stmt->fetch());
```

### Script Konektivitas (siap jalan)
- Node:
  - Install dependency sekali:
    - `cd webapp`
    - `npm i -D mysql2`
  - Set environment lalu jalankan:
    - PowerShell:
```
setx DB_HOST srv1631.hstgr.io
setx DB_PORT 3306
setx DB_NAME u485208858_mpsonedatabase
setx DB_USER YOUR_DB_USER
setx DB_PASSWORD YOUR_DB_PASSWORD
node ../scripts/test-db-node.mjs
```
- PHP:
  - Jalankan: `php scripts/test-db-php.php` (pastikan PHP CLI terpasang)


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

### Fase 4 — Tabel Email & Kurir
- Migrasi baru:
  - `db/migrations/0015_email_oauth.sql` — menambah `email_account` dan `email_sync_state`.
  - `db/migrations/0016_courier_tracking.sql` — menambah `shipment_tracking` dengan `vendor`, `tracking_no`, `status`, `events_json`.
- Import di WSL: jalankan ulang `bash scripts/import-migrations.sh` lalu `bash scripts/verify-db.sh`.
- Verifikasi di phpMyAdmin: tabel muncul; jalankan select cepat untuk melihat insert dari API.

### Verifikasi Skema

```
bash scripts/verify-db.sh
```

Pemeriksaan mencakup jumlah data demo dan keberadaan kolom & indeks penting pada PR (`title`, `description`, `budget_code`, `approver`, `idx_pr_status`, `idx_pr_need_date`).

### phpMyAdmin
- Buka `http://localhost:8081/`
- Login dengan `mpsone_dev` / `devpass` atau `root` / `rootpass`
- Gunakan Import untuk uji satu‑off; untuk konsistensi, lebih baik jalankan lewat skrip.
## 0019 — Preferensi Pengguna dan Notifikasi

Menambahkan tabel `user_preferences` dan `notifications` untuk mendukung halaman Pengaturan dan Pusat Notifikasi.

Skema
- `user_preferences(user_id FK, theme ENUM(light|dark|system), language ENUM(en|id), notify_inapp BOOL, notify_email BOOL, updated_at TIMESTAMP)`
- `notifications(id PK, user_id FK, module ENUM(procurement|finance|inventory|reports|alerts), title, body, type ENUM(info|warning|success|error), is_read BOOL, created_at TIMESTAMP)`

Impor Migrasi (WSL)
- Jalankan: `bash scripts/import-migrations.sh`
- Verifikasi: `bash scripts/verify-db.sh` dan phpMyAdmin (cek tabel & indeks baru)

Area Terpengaruh
- Backend API: `GET/PUT /api/user/preferences`, `GET/POST/PUT /api/notifications`
- Frontend UI: halaman `/settings` untuk tema/bahasa/preferensi notifikasi; halaman `/notifications` dengan jumlah belum dibaca dan aksi tandai baca.
## 0020 — Log Audit: active_mode

Penguatan guard backend berdasar mode dan pencatatan audit dengan `active_mode`.

- Migrasi: `db/migrations/0020_audit_active_mode.sql`
- Perubahan tabel (`audit_log`):
  - Menambah kolom `active_mode ENUM('Client','Supplier') NOT NULL DEFAULT 'Client'`
  - Menambah indeks `idx_audit_mode (active_mode, action, created_at)`

### Impor & Verifikasi (WSL)
1) Impor migrasi:
```
bash scripts/import-migrations.sh
bash scripts/verify-db.sh
```
2) Cek via MySQL/phpMyAdmin:
```
SHOW COLUMNS FROM audit_log;   -- pastikan active_mode ada
SHOW INDEX FROM audit_log;     -- pastikan idx_audit_mode ada
```

### Penyesuaian Backend
- `webapp/server/index.mjs`:
  - `logAudit(...)` kini menulis `active_mode` untuk setiap entri audit.
  - Endpoint PR (read) mewajibkan mode Client:
    - `GET /api/pr` dilindungi `requireMode(['Client'])`
    - `GET /api/pr/:id` dilindungi `requireMode(['Client'])`

### Contoh Query
```
-- Aksi PR per mode
SELECT active_mode, action, COUNT(*) cnt
FROM audit_log
WHERE action LIKE 'pr.%'
GROUP BY active_mode, action
ORDER BY active_mode, action;

-- FX refresh terbaru yang dilakukan dalam mode Client
SELECT actor_email, comment, created_at
FROM audit_log
WHERE action='fx.refresh' AND active_mode='Client'
ORDER BY created_at DESC LIMIT 20;
```
