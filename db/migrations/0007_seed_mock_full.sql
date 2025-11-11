-- 0007_seed_mock_full.sql
-- Comprehensive mock data covering multi-delivery and invoice payment statuses.
-- Run after 0001..0006.

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- Resolve base client and create additional suppliers
SET @client_company_id := (SELECT id FROM company WHERE name='MPS One Demo' LIMIT 1);
INSERT INTO company (name) VALUES ('Supplier Alpha') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO company (name) VALUES ('Supplier Beta')  ON DUPLICATE KEY UPDATE name=name;
SET @supplier_alpha := (SELECT id FROM company WHERE name='Supplier Alpha' LIMIT 1);
SET @supplier_beta  := (SELECT id FROM company WHERE name='Supplier Beta'  LIMIT 1);

-- Departments and requester
SET @dept_proc := (SELECT id FROM department WHERE company_id=@client_company_id AND name='Procurement' LIMIT 1);
SET @requester := (SELECT id FROM user WHERE company_id=@client_company_id AND email='proc.pic@example.com' LIMIT 1);

-- Helper: create an approved PR with one or more items
DROP TEMPORARY TABLE IF EXISTS tmp_prs;
CREATE TEMPORARY TABLE tmp_prs (code VARCHAR(32), pr_id BIGINT);

-- PR A (Approved, Hose, qty 120)
INSERT INTO pr (company_id, department_id, requester_id, status, title, need_date, description, budget_code, approver, items_json)
VALUES (@client_company_id, @dept_proc, @requester, 'approved', 'Hydraulic Hose', CURDATE(), 'High-pressure hoses for drills', 'OPS-2024', 'PIC_Procurement',
        JSON_ARRAY(JSON_OBJECT('item_code','HOSE-HP','description','Hydraulic Hose','unit','pcs','qty',120,'unit_price',75000)));
SET @pr_a := LAST_INSERT_ID();
INSERT INTO tmp_prs VALUES ('PR-A', @pr_a);

-- PR B (Approved, Valve, qty 60)
INSERT INTO pr (company_id, department_id, requester_id, status, title, need_date, description, budget_code, approver, items_json)
VALUES (@client_company_id, @dept_proc, @requester, 'approved', 'Pressure Valve', CURDATE(), 'Valves for pipeline maintenance', 'MAINT-2024', 'PIC_Procurement',
        JSON_ARRAY(JSON_OBJECT('item_code','VALVE-P','description','Pressure Valve','unit','pcs','qty',60,'unit_price',150000)));
SET @pr_b := LAST_INSERT_ID();
INSERT INTO tmp_prs VALUES ('PR-B', @pr_b);

-- Quotes from suppliers
INSERT INTO quote (supplier_id, client_company_id, pr_id, version, items_json, total, validity_start, validity_end)
VALUES
(@supplier_alpha, @client_company_id, @pr_a, 1, JSON_ARRAY(JSON_OBJECT('item_code','HOSE-HP','qty',120,'unit_price',75000)), 120*75000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(@supplier_beta,  @client_company_id, @pr_b, 1, JSON_ARRAY(JSON_OBJECT('item_code','VALVE-P','qty',60,'unit_price',150000)), 60*150000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY));

SET @quote_a := (SELECT id FROM quote WHERE pr_id=@pr_a LIMIT 1);
SET @quote_b := (SELECT id FROM quote WHERE pr_id=@pr_b LIMIT 1);

-- Convert to POs
INSERT INTO po (company_id, quote_id, status, terms, items_json)
VALUES
(@client_company_id, @quote_a, 'processing', 'Net 30', JSON_ARRAY()),
(@client_company_id, @quote_b, 'processing', 'Net 14', JSON_ARRAY());

SET @po_a := (SELECT id FROM po WHERE quote_id=@quote_a LIMIT 1);
SET @po_b := (SELECT id FROM po WHERE quote_id=@quote_b LIMIT 1);

-- PO Items
INSERT INTO po_item (po_id, item_code, description, unit, qty, unit_price)
VALUES
(@po_a, 'HOSE-HP',  'Hydraulic Hose', 'pcs', 120, 75000),
(@po_b, 'VALVE-P',  'Pressure Valve', 'pcs',  60, 150000);

SET @poi_a := (SELECT id FROM po_item WHERE po_id=@po_a LIMIT 1);
SET @poi_b := (SELECT id FROM po_item WHERE po_id=@po_b LIMIT 1);

-- Deliveries for PO A: two shipments, partial invoicing
INSERT INTO delivery_note (po_id, shipped_at, tracking_no, items_json, confirmed_by, confirmed_at, corrections_json)
VALUES
(@po_a, NOW(), 'ALPHA-TRK-001', JSON_ARRAY(), NULL, NOW(), NULL),
(@po_a, NOW(), 'ALPHA-TRK-002', JSON_ARRAY(), NULL, NOW(), NULL);

SET @dn_a1 := (SELECT id FROM delivery_note WHERE po_id=@po_a AND tracking_no='ALPHA-TRK-001' LIMIT 1);
SET @dn_a2 := (SELECT id FROM delivery_note WHERE po_id=@po_a AND tracking_no='ALPHA-TRK-002' LIMIT 1);

INSERT INTO delivery_item (delivery_note_id, po_item_id, qty_shipped, qty_confirmed, qty_correction)
VALUES
(@dn_a1, @poi_a, 60, 60, 0),
(@dn_a2, @poi_a, 40, 38, 2); -- 2 corrected

-- Deliveries for PO B: single shipment, fully confirmed
INSERT INTO delivery_note (po_id, shipped_at, tracking_no, items_json, confirmed_by, confirmed_at, corrections_json)
VALUES (@po_b, NOW(), 'BETA-TRK-001', JSON_ARRAY(), NULL, NOW(), NULL);
SET @dn_b1 := LAST_INSERT_ID();

INSERT INTO delivery_item (delivery_note_id, po_item_id, qty_shipped, qty_confirmed, qty_correction)
VALUES (@dn_b1, @poi_b, 60, 60, 0);

-- Invoices covering different statuses
-- A1: partial invoice for PO A, due in 20 days (waiting)
INSERT INTO invoice (company_id, po_id, delivery_refs_json, amount, due_date, status, paid_at)
VALUES (@client_company_id, @po_a, JSON_ARRAY(@dn_a1), 60*75000, DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'neutral', NULL);
SET @inv_a1 := LAST_INSERT_ID();
INSERT INTO invoice_item (invoice_id, delivery_item_id, amount)
VALUES (@inv_a1, (SELECT id FROM delivery_item WHERE delivery_note_id=@dn_a1 LIMIT 1), 60*75000);

-- A2: partial invoice for second delivery, due in 3 days (next)
INSERT INTO invoice (company_id, po_id, delivery_refs_json, amount, due_date, status, paid_at)
VALUES (@client_company_id, @po_a, JSON_ARRAY(@dn_a2), 38*75000, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'neutral', NULL);
SET @inv_a2 := LAST_INSERT_ID();
INSERT INTO invoice_item (invoice_id, delivery_item_id, amount)
VALUES (@inv_a2, (SELECT id FROM delivery_item WHERE delivery_note_id=@dn_a2 LIMIT 1), 38*75000);

-- B1: full invoice for PO B, over-due and unpaid
INSERT INTO invoice (company_id, po_id, delivery_refs_json, amount, due_date, status, paid_at)
VALUES (@client_company_id, @po_b, JSON_ARRAY(@dn_b1), 60*150000, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'neutral', NULL);
SET @inv_b1 := LAST_INSERT_ID();
INSERT INTO invoice_item (invoice_id, delivery_item_id, amount)
VALUES (@inv_b1, (SELECT id FROM delivery_item WHERE delivery_note_id=@dn_b1 LIMIT 1), 60*150000);

-- B2: paid invoice example
INSERT INTO invoice (company_id, po_id, delivery_refs_json, amount, due_date, status, paid_at)
VALUES (@client_company_id, @po_b, JSON_ARRAY(@dn_b1),  1000000, DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'paid', NOW());
SET @inv_b2 := LAST_INSERT_ID();
INSERT INTO payment (invoice_id, amount, paid_at, method)
VALUES (@inv_b2, 1000000, NOW(), 'Transfer');

-- Optional: update PO statuses based on deliveries
UPDATE po SET status='delivered' WHERE id=@po_b;
UPDATE po SET status='processing' WHERE id=@po_a; -- still in process due to remaining qty

-- Quick sanity queries (copy into phpMyAdmin console to verify):
-- SELECT * FROM v_po_item_delivery_totals WHERE po_id IN (@po_a, @po_b);
-- SELECT * FROM v_po_invoice_totals WHERE po_id IN (@po_a, @po_b);
-- SELECT invoice_id, derived_status, due_date, paid_at FROM v_invoice_status WHERE invoice_id IN (@inv_a1, @inv_a2, @inv_b1, @inv_b2);

