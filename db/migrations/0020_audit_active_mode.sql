-- 0020_audit_active_mode.sql
-- Add active_mode to audit_log and index for mode-based queries
-- Idempotent: checks INFORMATION_SCHEMA before altering.

-- Add column active_mode (Client|Supplier)
SET @tbl := 'audit_log';
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'active_mode'
);
SET @sql := IF(@exists = 0,
  "ALTER TABLE audit_log ADD COLUMN active_mode ENUM('Client','Supplier') NOT NULL DEFAULT 'Client' AFTER actor_email",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add index on active_mode
SET @idx_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND INDEX_NAME = 'idx_audit_mode'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE audit_log ADD KEY idx_audit_mode (active_mode, action, created_at)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Notes
-- - active_mode records whether the user acted as Client or Supplier.
-- - Combined index supports mode/action timeline queries.
