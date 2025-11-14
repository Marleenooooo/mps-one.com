-- Migration: Add default_mode to user_preferences
-- Aligns frontend Settings default mode selection with backend persistence

ALTER TABLE user_preferences
  ADD COLUMN default_mode ENUM('client','supplier') NULL DEFAULT NULL AFTER language;