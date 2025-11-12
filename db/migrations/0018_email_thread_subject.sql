-- Add subject column to email_thread for Gmail-like parity
ALTER TABLE email_thread
  ADD COLUMN subject VARCHAR(255) NULL AFTER po_id;

-- Optional: index if subject is frequently filtered (not required now)
-- CREATE INDEX idx_email_thread_subject ON email_thread(subject);

