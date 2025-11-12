-- Phase 4: FX Rates & Tax Utilities
-- Create fx_rate table to store currency pair rates per date

CREATE TABLE IF NOT EXISTS fx_rate (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  rate_date DATE NOT NULL,
  base_ccy CHAR(3) NOT NULL,
  quote_ccy CHAR(3) NOT NULL,
  rate DECIMAL(18,8) NOT NULL,
  source VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_fx (rate_date, base_ccy, quote_ccy),
  KEY idx_fx_pair_date (base_ccy, quote_ccy, rate_date)
);

