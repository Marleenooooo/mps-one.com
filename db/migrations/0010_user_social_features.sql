-- Migration 0010: (Deprecated) Social Features
-- This migration is intentionally left blank to avoid conflicts.
-- The social schema is implemented in 0011 and onward, aligned to the singular `user` table.
-- Keeping 0010 as a no-op preserves numbering and prevents import errors on systems
-- where `ALTER TABLE ... IF NOT EXISTS` isn’t supported.

