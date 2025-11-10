-- mpsone initial schema migration (0001_init)
-- Charset: utf8mb4, Collation: utf8mb4_unicode_ci, TZ: Asia/Jakarta

-- Note: This script assumes you are connected to the target database (e.g., mpsone_dev).
-- It will create core tables aligned to the procurement lifecycle.

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- Companies
CREATE TABLE IF NOT EXISTS company (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_company_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Departments
CREATE TABLE IF NOT EXISTS department (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  budget_remaining DECIMAL(18,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_department_company (company_id),
  CONSTRAINT fk_department_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users
CREATE TABLE IF NOT EXISTS user (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  department_id BIGINT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role ENUM('Admin','PIC_Operational','PIC_Procurement','PIC_Finance') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_email_company (company_id, email),
  KEY idx_user_company (company_id),
  KEY idx_user_department (department_id),
  CONSTRAINT fk_user_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Purchase Requests (PR)
CREATE TABLE IF NOT EXISTS pr (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  department_id BIGINT UNSIGNED NOT NULL,
  requester_id BIGINT UNSIGNED NOT NULL,
  status ENUM('draft','submitted','approved','rejected') NOT NULL DEFAULT 'draft',
  need_date DATE NULL,
  items_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pr_company (company_id),
  KEY idx_pr_department (department_id),
  KEY idx_pr_requester (requester_id),
  CONSTRAINT fk_pr_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE,
  CONSTRAINT fk_pr_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pr_requester FOREIGN KEY (requester_id) REFERENCES user(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quotes
CREATE TABLE IF NOT EXISTS quote (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  supplier_id BIGINT UNSIGNED NOT NULL,
  client_company_id BIGINT UNSIGNED NOT NULL,
  pr_id BIGINT UNSIGNED NOT NULL,
  version INT NOT NULL DEFAULT 1,
  items_json JSON NOT NULL,
  total DECIMAL(18,2) NOT NULL,
  validity_start DATE NULL,
  validity_end DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_quote_supplier (supplier_id),
  KEY idx_quote_client (client_company_id),
  KEY idx_quote_pr (pr_id),
  CONSTRAINT fk_quote_supplier FOREIGN KEY (supplier_id) REFERENCES company(id) ON DELETE RESTRICT,
  CONSTRAINT fk_quote_client FOREIGN KEY (client_company_id) REFERENCES company(id) ON DELETE RESTRICT,
  CONSTRAINT fk_quote_pr FOREIGN KEY (pr_id) REFERENCES pr(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Purchase Orders (PO)
CREATE TABLE IF NOT EXISTS po (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  quote_id BIGINT UNSIGNED NOT NULL,
  status ENUM('processing','shipped','delivered','invoiced','paid') NOT NULL DEFAULT 'processing',
  terms TEXT NULL,
  items_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_po_company (company_id),
  KEY idx_po_quote (quote_id),
  CONSTRAINT fk_po_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE RESTRICT,
  CONSTRAINT fk_po_quote FOREIGN KEY (quote_id) REFERENCES quote(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Delivery Notes (multi-shipment per PO)
CREATE TABLE IF NOT EXISTS delivery_note (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  po_id BIGINT UNSIGNED NOT NULL,
  shipped_at DATETIME NULL,
  tracking_no VARCHAR(255) NULL,
  items_json JSON NOT NULL,
  confirmed_by BIGINT UNSIGNED NULL,
  confirmed_at DATETIME NULL,
  corrections_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_dn_po (po_id),
  KEY idx_dn_confirmed_by (confirmed_by),
  CONSTRAINT fk_dn_po FOREIGN KEY (po_id) REFERENCES po(id) ON DELETE CASCADE,
  CONSTRAINT fk_dn_confirmed_by FOREIGN KEY (confirmed_by) REFERENCES user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invoices (partial, referencing confirmed deliveries)
CREATE TABLE IF NOT EXISTS invoice (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  po_id BIGINT UNSIGNED NOT NULL,
  delivery_refs_json JSON NULL, -- list of delivery_note.id referenced
  amount DECIMAL(18,2) NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('paid','neutral','waiting','next','over_due') NOT NULL DEFAULT 'neutral',
  paid_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_invoice_company (company_id),
  KEY idx_invoice_po (po_id),
  KEY idx_invoice_due_date (due_date),
  CONSTRAINT fk_invoice_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE RESTRICT,
  CONSTRAINT fk_invoice_po FOREIGN KEY (po_id) REFERENCES po(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments
CREATE TABLE IF NOT EXISTS payment (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  invoice_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  paid_at DATETIME NOT NULL,
  method VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payment_invoice (invoice_id),
  KEY idx_payment_paid_at (paid_at),
  CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email Threads
CREATE TABLE IF NOT EXISTS email_thread (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  participants_json JSON NOT NULL,
  messages_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documents
CREATE TABLE IF NOT EXISTS document (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  type VARCHAR(64) NOT NULL,
  ref_id BIGINT UNSIGNED NULL,
  version INT NOT NULL DEFAULT 1,
  url TEXT NOT NULL,
  can_access_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_document_type_ref (type, ref_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional views or future triggers can enforce invariants like:
-- 1) sum(delivery.qty) <= sum(po.qty)
-- 2) sum(invoice.amount) <= sum(delivered.amount)
-- These typically require item-level tables; JSON chosen for SPA-first flexibility.

