-- Migration 0013: Add inviter email to user_invites
-- Purpose: Support People Directory UI (sent/received) by storing `from_email`

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- Add from_email column if missing
SET @has_from := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_invites' AND COLUMN_NAME = 'from_email'
);
SET @sql := IF(@has_from = 0,
  'ALTER TABLE `user_invites` ADD COLUMN `from_email` VARCHAR(255) NULL AFTER `email`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Helpful index for queries
SET @has_idx := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_invites' AND INDEX_NAME = 'idx_invite_from_email'
);
SET @sql := IF(@has_idx = 0,
  'ALTER TABLE `user_invites` ADD INDEX `idx_invite_from_email` (`from_email`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

