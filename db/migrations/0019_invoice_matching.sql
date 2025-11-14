-- 3-way/4-way invoice matching with OCR and exception workflows
-- Migration for invoice matching system

-- Invoice matching types and statuses
CREATE TABLE invoice_matching_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    required_documents JSON,
    matching_rules JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invoice matching header
CREATE TABLE invoice_matching (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    po_id INT,
    delivery_id INT,
    contract_id INT,
    matching_type ENUM('2-way', '3-way', '4-way') DEFAULT '3-way',
    status ENUM('pending', 'matched', 'exception', 'rejected', 'approved') DEFAULT 'pending',
    matching_score DECIMAL(5,2),
    exception_reason TEXT,
    ocr_confidence_score DECIMAL(5,2),
    ocr_extracted_data JSON,
    manual_override BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    override_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
    FOREIGN KEY (contract_id) REFERENCES contracts(id),
    FOREIGN KEY (override_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invoice matching details for line item comparisons
CREATE TABLE invoice_matching_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    matching_id INT NOT NULL,
    invoice_line_id INT,
    po_line_id INT,
    delivery_line_id INT,
    matched_quantity DECIMAL(10,2),
    matched_amount DECIMAL(12,2),
    variance_quantity DECIMAL(10,2),
    variance_amount DECIMAL(12,2),
    variance_percentage DECIMAL(5,2),
    tolerance_status ENUM('within_tolerance', 'variance', 'exception') DEFAULT 'within_tolerance',
    exception_type VARCHAR(50),
    resolution_action VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matching_id) REFERENCES invoice_matching(id),
    FOREIGN KEY (invoice_line_id) REFERENCES invoice_items(id),
    FOREIGN KEY (po_line_id) REFERENCES purchase_order_items(id),
    FOREIGN KEY (delivery_line_id) REFERENCES delivery_items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OCR processing logs
CREATE TABLE ocr_processing_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    file_name VARCHAR(255),
    file_size INT,
    ocr_provider VARCHAR(50),
    processing_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    confidence_score DECIMAL(5,2),
    extracted_fields JSON,
    error_message TEXT,
    processing_time_ms INT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exception workflow for invoice matching
CREATE TABLE invoice_matching_exceptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    matching_id INT NOT NULL,
    exception_type ENUM('price_variance', 'quantity_variance', 'missing_po', 'missing_delivery', 'duplicate_invoice', 'tax_discrepancy', 'ocr_error') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    description TEXT,
    suggested_action TEXT,
    assigned_to INT,
    status ENUM('open', 'in_review', 'resolved', 'rejected') DEFAULT 'open',
    resolution_notes TEXT,
    resolved_by INT,
    resolved_at TIMESTAMP NULL,
    sla_deadline TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (matching_id) REFERENCES invoice_matching(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Matching tolerance rules
CREATE TABLE matching_tolerance_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rule_name VARCHAR(100) NOT NULL,
    company_id INT,
    vendor_category_id INT,
    item_category_id INT,
    tolerance_type ENUM('quantity', 'amount', 'percentage') NOT NULL,
    tolerance_value DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3),
    min_amount DECIMAL(12,2),
    max_amount DECIMAL(12,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (vendor_category_id) REFERENCES vendor_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add OCR-related columns to invoices table
ALTER TABLE invoices 
ADD COLUMN ocr_status ENUM('not_processed', 'processing', 'completed', 'failed') DEFAULT 'not_processed',
ADD COLUMN ocr_confidence_score DECIMAL(5,2),
ADD COLUMN ocr_extracted_data JSON,
ADD COLUMN matching_status ENUM('not_matched', 'pending', 'matched', 'exception') DEFAULT 'not_matched',
ADD COLUMN matching_required BOOLEAN DEFAULT TRUE;

-- Add matching-related columns to existing tables
ALTER TABLE purchase_orders 
ADD COLUMN matching_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN matching_tolerance_percentage DECIMAL(5,2) DEFAULT 5.00;

ALTER TABLE deliveries 
ADD COLUMN matching_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN matching_reference VARCHAR(100);

-- Insert default matching types
INSERT INTO invoice_matching_types (name, description, required_documents, matching_rules) VALUES
('2-Way Match', 'Match invoice against purchase order', '["purchase_order", "invoice"]', '{"fields": ["vendor", "amount", "items"], "tolerance": 5}'),
('3-Way Match', 'Match invoice against purchase order and delivery receipt', '["purchase_order", "delivery_receipt", "invoice"]', '{"fields": ["vendor", "amount", "items", "quantity"], "tolerance": 3}'),
('4-Way Match', 'Match invoice against purchase order, delivery receipt, and contract', '["purchase_order", "delivery_receipt", "contract", "invoice"]', '{"fields": ["vendor", "amount", "items", "quantity", "contract_terms"], "tolerance": 2}');

-- Insert default tolerance rules
INSERT INTO matching_tolerance_rules (rule_name, tolerance_type, tolerance_value, currency) VALUES
('Standard Quantity Tolerance', 'percentage', 5.00, 'USD'),
('Standard Amount Tolerance', 'percentage', 2.00, 'USD'),
('High Value Amount Tolerance', 'amount', 100.00, 'USD'),
('Low Value Quantity Tolerance', 'percentage', 10.00, 'USD');

-- Create indexes for performance
CREATE INDEX idx_invoice_matching_invoice_id ON invoice_matching(invoice_id);
CREATE INDEX idx_invoice_matching_status ON invoice_matching(status);
CREATE INDEX idx_invoice_matching_po_id ON invoice_matching(po_id);
CREATE INDEX idx_invoice_matching_delivery_id ON invoice_matching(delivery_id);
CREATE INDEX idx_ocr_processing_logs_invoice_id ON ocr_processing_logs(invoice_id);
CREATE INDEX idx_invoice_matching_exceptions_status ON invoice_matching_exceptions(status);
CREATE INDEX idx_matching_tolerance_rules_active ON matching_tolerance_rules(is_active);