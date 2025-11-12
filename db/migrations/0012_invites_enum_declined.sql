-- Migration 0012: Extend invite status enum to include 'declined'

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- Update ENUM to handle declined responses
ALTER TABLE `user_invites`
  MODIFY COLUMN `status` ENUM('pending','accepted','expired','declined') NOT NULL DEFAULT 'pending';

