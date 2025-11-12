-- 0014_audit_and_doc_scan.sql
-- Phase 3: Auth/RBAC & Audit services, document AV fields
-- Idempotent migration: creates `audit_log` and augments `document` for secure storage and scanning.

-- Audit Log table captures actor, action, entity context, and comment
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_email VARCHAR(255) NOT NULL,
  action VARCHAR(64) NOT NULL,
  entity_type VARCHAR(64) NULL,
  entity_id BIGINT UNSIGNED NULL,
  comment TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_actor (actor_email),
  KEY idx_audit_entity (entity_type, entity_id),
  KEY idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Document table: add secure storage and AV scanning fields (MySQL 8 supports IF NOT EXISTS)
-- Idempotent column adds using INFORMATION_SCHEMA checks
SET @tbl := 'document';

-- hash_sha256
SET @exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'hash_sha256');
SET @sql := IF(@exists = 0, 'ALTER TABLE document ADD COLUMN hash_sha256 VARCHAR(64) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- storage_provider
SET @exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'storage_provider');
SET @sql := IF(@exists = 0, "ALTER TABLE document ADD COLUMN storage_provider VARCHAR(32) NULL", 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- storage_key
SET @exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'storage_key');
SET @sql := IF(@exists = 0, "ALTER TABLE document ADD COLUMN storage_key VARCHAR(255) NULL", 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- scan_status
SET @exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'scan_status');
SET @sql := IF(@exists = 0, "ALTER TABLE document ADD COLUMN scan_status ENUM('pending','scanned','infected','error') NOT NULL DEFAULT 'pending'", 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- scan_vendor
SET @exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'scan_vendor');
SET @sql := IF(@exists = 0, "ALTER TABLE document ADD COLUMN scan_vendor VARCHAR(64) NULL", 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- scan_at
SET @exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'scan_at');
SET @sql := IF(@exists = 0, "ALTER TABLE document ADD COLUMN scan_at TIMESTAMP NULL", 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- index idx_document_hash
SET @idx_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND INDEX_NAME = 'idx_document_hash'
);
SET @sql := IF(@idx_exists = 0, 'ALTER TABLE document ADD KEY idx_document_hash (hash_sha256)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Notes:
-- - `hash_sha256`: content hash for deduplication/integrity checks.
-- - `storage_provider`/`storage_key`: pointer to object storage (R2/Supabase/MinIO).
-- - `scan_status`/`scan_vendor`/`scan_at`: AV scanning metadata.
-- - Existing `document` rows default to `scan_status='pending'` until marked.
