-- 0009_email_thread_context.sql
-- Add context columns to email_thread for linking to PR/PO

ALTER TABLE email_thread
  ADD COLUMN pr_id BIGINT UNSIGNED NULL AFTER id,
  ADD COLUMN po_id BIGINT UNSIGNED NULL AFTER pr_id,
  ADD KEY idx_email_thread_pr (pr_id),
  ADD KEY idx_email_thread_po (po_id);

-- Note: Foreign keys omitted for flexibility; context linkage is optional.
-- Application logic will filter by pr_id/po_id to list threads by context.

