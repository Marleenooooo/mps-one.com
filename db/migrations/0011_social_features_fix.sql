-- Migration 0011: Social Features aligned to singular `user` schema
-- Purpose: Create relationships/blocks/invites tables and extend `user` with optional fields.

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- Extend `user` table: nickname (optional) and status lifecycle
SET @has_nickname := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'nickname'
);
SET @sql := IF(@has_nickname = 0,
  'ALTER TABLE `user` ADD COLUMN `nickname` VARCHAR(120) NULL AFTER `role`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_status := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'status'
);
SET @sql := IF(@has_status = 0,
  "ALTER TABLE `user` ADD COLUMN `status` ENUM('active','invited','blocked') NOT NULL DEFAULT 'active' AFTER `nickname`",
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Relationships
CREATE TABLE IF NOT EXISTS `user_relationships` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `follower_id` BIGINT UNSIGNED NOT NULL,
  `followee_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_rel_follower` FOREIGN KEY (`follower_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rel_followee` FOREIGN KEY (`followee_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT `uq_rel` UNIQUE (`follower_id`, `followee_id`),
  INDEX `idx_rel_followee` (`followee_id`),
  INDEX `idx_rel_follower` (`follower_id`)
);

-- Blocks
CREATE TABLE IF NOT EXISTS `user_blocks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `blocker_id` BIGINT UNSIGNED NOT NULL,
  `blocked_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_blk_blocker` FOREIGN KEY (`blocker_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_blk_blocked` FOREIGN KEY (`blocked_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  CONSTRAINT `uq_blk` UNIQUE (`blocker_id`, `blocked_id`),
  INDEX `idx_blk_blocked` (`blocked_id`),
  INDEX `idx_blk_blocker` (`blocker_id`)
);

-- Invites
CREATE TABLE IF NOT EXISTS `user_invites` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL,
  `role` VARCHAR(64) NULL,
  `user_type` VARCHAR(64) NULL,
  `token` VARCHAR(128) NOT NULL,
  `status` ENUM('pending','accepted','expired') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NULL,
  UNIQUE KEY `uq_invite_email_token` (`email`, `token`),
  INDEX `idx_invite_status` (`status`)
);

-- Optional demo seed (commented)
-- INSERT INTO user_invites (email, role, user_type, token, status)
-- VALUES ('demo.user@example.com', 'Admin', 'client', 'INVITE_DEMO_TOKEN', 'pending');
