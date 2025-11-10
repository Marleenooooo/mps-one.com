-- 0005_seed_workflow.sql
-- One-click demo workflow: PR → Quote → PO → Delivery → Invoice
-- Safe to run once after 0001..0004 have been imported.

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- Resolve client (from 0002 seed) and ensure a demo supplier exists
SET @client_company_id := (SELECT id FROM company WHERE name='MPS One Demo' LIMIT 1);
INSERT INTO company (name) VALUES ('Demo Supplier')
ON DUPLICATE KEY UPDATE name = name;
SET @supplier_company_id := (SELECT id FROM company WHERE name='Demo Supplier' LIMIT 1);

-- Pick Procurement department and PIC requester
SET @dept_proc := (SELECT id FROM department WHERE company_id=@client_company_id AND name='Procurement' LIMIT 1);
SET @requester_id := (SELECT id FROM user WHERE company_id=@client_company_id AND email='proc.pic@example.com' LIMIT 1);

-- Create an approved PR (simple single item)
INSERT INTO pr (company_id, department_id, requester_id, status, need_date, items_json)
VALUES (
  @client_company_id,
  @dept_proc,
  @requester_id,
  'approved',
  CURDATE(),
  JSON_ARRAY(JSON_OBJECT('item_code','ITEM-01','description','Sample Item','unit','pcs','qty',100,'unit_price',50000))
);
SET @pr_id := LAST_INSERT_ID();

-- Supplier issues a Quote referencing the PR
INSERT INTO quote (supplier_id, client_company_id, pr_id, version, items_json, total, validity_start, validity_end)
VALUES (
  @supplier_company_id,
  @client_company_id,
  @pr_id,
  1,
  JSON_ARRAY(JSON_OBJECT('item_code','ITEM-01','qty',100,'unit_price',50000)),
  100*50000,
  CURDATE(),
  DATE_ADD(CURDATE(), INTERVAL 30 DAY)
);
SET @quote_id := LAST_INSERT_ID();

-- Client converts to PO (quote_id is NOT NULL per schema)
INSERT INTO po (company_id, quote_id, status, terms, items_json)
VALUES (@client_company_id, @quote_id, 'processing', NULL, JSON_ARRAY());
SET @po_id := LAST_INSERT_ID();

-- Add one PO item
INSERT INTO po_item (po_id, item_code, description, unit, qty, unit_price)
VALUES (@po_id, 'ITEM-01', 'Sample Item', 'pcs', 100, 50000);
SET @po_item_id := LAST_INSERT_ID();

-- Create a delivery note
INSERT INTO delivery_note (po_id, shipped_at, tracking_no, items_json, confirmed_by, confirmed_at, corrections_json)
VALUES (@po_id, NOW(), 'TRK-001', JSON_ARRAY(), NULL, NOW(), NULL);
SET @dn_id := LAST_INSERT_ID();

-- Deliver 50 pcs, confirmed 50
INSERT INTO delivery_item (delivery_note_id, po_item_id, qty_shipped, qty_confirmed, qty_correction)
VALUES (@dn_id, @po_item_id, 50, 50, 0);
SET @delivery_item_id := LAST_INSERT_ID();

-- Create an invoice for the confirmed delivery; due in 7 days
INSERT INTO invoice (company_id, po_id, delivery_refs_json, amount, due_date, status, paid_at)
VALUES (@client_company_id, @po_id, JSON_ARRAY(@dn_id), 50*50000, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'neutral', NULL);
SET @invoice_id := LAST_INSERT_ID();

-- Link invoice to delivery item with matching amount
INSERT INTO invoice_item (invoice_id, delivery_item_id, amount)
VALUES (@invoice_id, @delivery_item_id, 50*50000);

-- Verification helpers (run separately in phpMyAdmin):
-- SELECT * FROM v_po_item_delivery_totals WHERE po_id=@po_id;
-- SELECT * FROM v_po_invoice_totals WHERE po_id=@po_id;
-- SELECT invoice_id, derived_status, due_date, paid_at FROM v_invoice_status WHERE invoice_id=@invoice_id;

