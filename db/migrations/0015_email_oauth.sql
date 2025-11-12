-- Email OAuth & Sync State
CREATE TABLE IF NOT EXISTS email_account (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  account_email VARCHAR(255) NOT NULL,
  token_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_email_account_provider_email (provider, account_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS email_sync_state (
  account_id INT NOT NULL,
  last_synced_at DATETIME NULL,
  sync_cursor VARCHAR(255) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (account_id),
  CONSTRAINT fk_email_sync_account FOREIGN KEY (account_id) REFERENCES email_account(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
