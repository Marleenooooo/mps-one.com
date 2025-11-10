-- 0003_items_tables.sql
-- Item-level tables to enforce quantities and amounts per PO/Delivery/Invoice

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- PO Items
CREATE TABLE IF NOT EXISTS po_item (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  po_id BIGINT UNSIGNED NOT NULL,
  item_code VARCHAR(64) NOT NULL,
  description VARCHAR(255) NULL,
  unit VARCHAR(32) NULL,
  qty DECIMAL(18,3) NOT NULL,
  unit_price DECIMAL(18,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_po_item_po (po_id),
  KEY idx_po_item_code (item_code),
  CONSTRAINT fk_po_item_po FOREIGN KEY (po_id) REFERENCES po(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Delivery Items (per delivery note, referencing PO item)
CREATE TABLE IF NOT EXISTS delivery_item (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  delivery_note_id BIGINT UNSIGNED NOT NULL,
  po_item_id BIGINT UNSIGNED NOT NULL,
  qty_shipped DECIMAL(18,3) NOT NULL,
  qty_confirmed DECIMAL(18,3) NULL,
  qty_correction DECIMAL(18,3) NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_delivery_item_dn (delivery_note_id),
  KEY idx_delivery_item_poi (po_item_id),
  CONSTRAINT fk_delivery_item_dn FOREIGN KEY (delivery_note_id) REFERENCES delivery_note(id) ON DELETE CASCADE,
  CONSTRAINT fk_delivery_item_poi FOREIGN KEY (po_item_id) REFERENCES po_item(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invoice Items (invoice references confirmed delivery items)
CREATE TABLE IF NOT EXISTS invoice_item (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  invoice_id BIGINT UNSIGNED NOT NULL,
  delivery_item_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_invoice_item_invoice (invoice_id),
  KEY idx_invoice_item_delivery (delivery_item_id),
  CONSTRAINT fk_invoice_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE CASCADE,
  CONSTRAINT fk_invoice_item_delivery FOREIGN KEY (delivery_item_id) REFERENCES delivery_item(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

