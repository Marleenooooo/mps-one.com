-- 0006_schema_alignment.sql
-- Align DB schema with SPA app fields used in PRCreate and lifecycle.

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- Add optional title and description to PR to match UI (idempotent)
SET @has_title := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pr' AND COLUMN_NAME = 'title'
);
SET @sql := IF(@has_title = 0,
  'ALTER TABLE pr ADD COLUMN title VARCHAR(255) NULL AFTER requester_id',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_desc := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pr' AND COLUMN_NAME = 'description'
);
SET @sql := IF(@has_desc = 0,
  'ALTER TABLE pr ADD COLUMN description TEXT NULL AFTER need_date',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Optional: add budget_code and approver for future wiring
SET @has_budget_code := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pr' AND COLUMN_NAME = 'budget_code'
);
SET @sql := IF(@has_budget_code = 0,
  'ALTER TABLE pr ADD COLUMN budget_code VARCHAR(64) NULL AFTER description',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_approver := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pr' AND COLUMN_NAME = 'approver'
);
SET @sql := IF(@has_approver = 0,
  'ALTER TABLE pr ADD COLUMN approver VARCHAR(128) NULL AFTER budget_code',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Indexes to aid filtering (idempotent)
SET @has_idx_status := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pr' AND INDEX_NAME = 'idx_pr_status'
);
SET @sql := IF(@has_idx_status = 0,
  'ALTER TABLE pr ADD INDEX idx_pr_status (status)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_idx_need_date := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pr' AND INDEX_NAME = 'idx_pr_need_date'
);
SET @sql := IF(@has_idx_need_date = 0,
  'ALTER TABLE pr ADD INDEX idx_pr_need_date (need_date)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Safety: ensure payment has FK (if not already created in 0001)
-- Removed: FK already defined in 0001_init.sql (avoids duplicate constraint errors)

-- Safety: ensure delivery_item has FK to delivery_note (if not already created in 0003)
-- Removed: FK already defined in 0003_items_tables.sql (avoids duplicate constraint errors)

-- Note: This migration is additive and safe to run once.
