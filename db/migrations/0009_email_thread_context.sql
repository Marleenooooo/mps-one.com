-- 0009_email_thread_context.sql
-- Add context columns to email_thread for linking to PR/PO (idempotent)

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- Add pr_id if missing
SET @has_pr := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'email_thread' AND COLUMN_NAME = 'pr_id'
);
SET @sql := IF(@has_pr = 0,
  'ALTER TABLE `email_thread` ADD COLUMN `pr_id` BIGINT UNSIGNED NULL AFTER `id`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add po_id if missing
SET @has_po := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'email_thread' AND COLUMN_NAME = 'po_id'
);
SET @sql := IF(@has_po = 0,
  'ALTER TABLE `email_thread` ADD COLUMN `po_id` BIGINT UNSIGNED NULL AFTER `pr_id`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add indexes if missing
SET @has_idx_pr := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'email_thread' AND INDEX_NAME = 'idx_email_thread_pr'
);
SET @sql := IF(@has_idx_pr = 0,
  'ALTER TABLE `email_thread` ADD KEY `idx_email_thread_pr` (`pr_id`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_idx_po := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'email_thread' AND INDEX_NAME = 'idx_email_thread_po'
);
SET @sql := IF(@has_idx_po = 0,
  'ALTER TABLE `email_thread` ADD KEY `idx_email_thread_po` (`po_id`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Note: Foreign keys omitted for flexibility; context linkage is optional.
-- Application logic will filter by pr_id/po_id to list threads by context.
