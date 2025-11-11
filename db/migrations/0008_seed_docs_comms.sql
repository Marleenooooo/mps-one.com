-- 0008_seed_docs_comms.sql
-- Seed auxiliary modules: EmailThread and Document repository for demo.

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- Resolve key IDs from previous seeds
SET @client_company_id := (SELECT id FROM company WHERE name='MPS One Demo' LIMIT 1);
SET @supplier_alpha := (SELECT id FROM company WHERE name='Supplier Alpha' LIMIT 1);
SET @supplier_beta  := (SELECT id FROM company WHERE name='Supplier Beta'  LIMIT 1);

-- Pick any existing PO/PR for references
SET @pr_id := (SELECT id FROM pr ORDER BY id ASC LIMIT 1);
SET @po_id := (SELECT id FROM po ORDER BY id ASC LIMIT 1);
SET @dn_id := (SELECT id FROM delivery_note WHERE po_id=@po_id ORDER BY id ASC LIMIT 1);
SET @inv_id := (SELECT id FROM invoice WHERE po_id=@po_id ORDER BY id ASC LIMIT 1);

-- Email thread: sample conversation referencing PR and PO
INSERT INTO email_thread (participants_json, messages_json)
VALUES (
  JSON_ARRAY('proc.pic@example.com', 'admin@example.com', 'ops.pic@example.com', 'supplier@alpha.example.com'),
  JSON_ARRAY(
    JSON_OBJECT('id','m1','from','proc.pic@example.com','body',CONCAT('Please quote for PR ', @pr_id),'when', NOW(), 'status','sent'),
    JSON_OBJECT('id','m2','from','supplier@alpha.example.com','body','Quote attached. Valid 30 days.','when', NOW(), 'status','delivered'),
    JSON_OBJECT('id','m3','from','admin@example.com','body',CONCAT('PO created for PR ', @pr_id, ', PO ', @po_id), 'when', NOW(), 'status','read')
  )
);

-- Documents: sample entries across types and references
INSERT INTO document (type, ref_id, version, url, can_access_json)
VALUES
('PR', @pr_id, 1, 'https://example.com/docs/pr.pdf', JSON_ARRAY('PIC_Procurement','PIC_Finance','Admin')),
('PO', @po_id, 1, 'https://example.com/docs/po.pdf', JSON_ARRAY('PIC_Procurement','Admin')),
('DeliveryNote', @dn_id, 1, 'https://example.com/docs/delivery_note.pdf', JSON_ARRAY('PIC_Operational','PIC_Procurement','Admin')),
('Invoice', @inv_id, 1, 'https://example.com/docs/invoice.pdf', JSON_ARRAY('PIC_Finance','Admin'));

