-- 0004_views_status.sql
-- Aggregation views for delivery/invoice totals and derived payment status

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- Totals per PO item: ordered vs confirmed deliveries
CREATE OR REPLACE VIEW v_po_item_delivery_totals AS
SELECT
  poi.id AS po_item_id,
  poi.po_id,
  poi.item_code,
  poi.qty AS ordered_qty,
  COALESCE(SUM(GREATEST(di.qty_confirmed - COALESCE(di.qty_correction,0), 0)), 0) AS confirmed_qty
FROM po_item poi
LEFT JOIN delivery_item di ON di.po_item_id = poi.id
GROUP BY poi.id, poi.po_id, poi.item_code, poi.qty;

-- Totals per PO: delivered amount vs invoiced amount
CREATE OR REPLACE VIEW v_po_invoice_totals AS
SELECT
  p.id AS po_id,
  COALESCE(SUM(
    GREATEST(di.qty_confirmed - COALESCE(di.qty_correction,0),0) * poi.unit_price
  ), 0) AS delivered_amount,
  COALESCE((SELECT SUM(ii.amount)
            FROM invoice i
            JOIN invoice_item ii ON ii.invoice_id = i.id
            WHERE i.po_id = p.id), 0) AS invoiced_amount
FROM po p
LEFT JOIN po_item poi ON poi.po_id = p.id
LEFT JOIN delivery_item di ON di.po_item_id = poi.id
GROUP BY p.id;

-- Derived invoice status view (simple rules; adjust windows as needed)
-- Rules:
--  paid       : paid_at IS NOT NULL
--  over_due   : NOW() > due_date AND paid_at IS NULL
 --  next       : DATEDIFF(due_date, NOW()) BETWEEN 0 AND 7 AND paid_at IS NULL
 --  waiting    : DATEDIFF(due_date, NOW()) BETWEEN 8 AND 30 AND paid_at IS NULL
 --  neutral    : NOW() < DATE_SUB(due_date, INTERVAL 30 DAY) AND paid_at IS NULL
CREATE OR REPLACE VIEW v_invoice_status AS
SELECT
  i.id AS invoice_id,
  i.po_id,
  i.amount,
  i.due_date,
  i.paid_at,
  CASE
    WHEN i.paid_at IS NOT NULL THEN 'paid'
    WHEN NOW() > i.due_date THEN 'over_due'
    WHEN DATEDIFF(i.due_date, NOW()) BETWEEN 0 AND 7 THEN 'next'
    WHEN DATEDIFF(i.due_date, NOW()) BETWEEN 8 AND 30 THEN 'waiting'
    ELSE 'neutral'
  END AS derived_status
FROM invoice i;
