-- Payments Module: Payment runs, scheduling, reconciliation integrations

-- Payment methods configuration
CREATE TABLE payment_methods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    method_name VARCHAR(100) NOT NULL,
    method_type ENUM('bank_transfer', 'credit_card', 'digital_wallet', 'check', 'cash') NOT NULL,
    account_number VARCHAR(100),
    account_holder_name VARCHAR(200),
    bank_name VARCHAR(100),
    bank_code VARCHAR(20),
    routing_number VARCHAR(20),
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    processing_fee_percentage DECIMAL(5,2) DEFAULT 0.00,
    processing_fee_fixed DECIMAL(10,2) DEFAULT 0.00,
    daily_limit DECIMAL(15,2),
    monthly_limit DECIMAL(15,2),
    requires_approval BOOLEAN DEFAULT TRUE,
    approval_threshold DECIMAL(15,2),
    integration_provider VARCHAR(50), -- e.g., 'stripe', 'paypal', 'bank_api'
    integration_config JSON,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Payment runs (batches of payments)
CREATE TABLE payment_runs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    run_name VARCHAR(200) NOT NULL,
    run_date DATE NOT NULL,
    payment_method_id INT,
    status ENUM('draft', 'scheduled', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'draft',
    total_amount DECIMAL(15,2) DEFAULT 0.00,
    total_payments INT DEFAULT 0,
    processed_payments INT DEFAULT 0,
    failed_payments INT DEFAULT 0,
    scheduled_for TIMESTAMP,
    processed_at TIMESTAMP,
    approved_by INT,
    approved_at TIMESTAMP,
    executed_by INT,
    executed_at TIMESTAMP,
    failure_reason TEXT,
    reconciliation_status ENUM('pending', 'matched', 'discrepancy', 'resolved') DEFAULT 'pending',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (executed_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Individual payments within payment runs
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_run_id INT,
    invoice_id INT NOT NULL,
    vendor_id INT NOT NULL,
    payment_method_id INT,
    payment_reference VARCHAR(100) UNIQUE,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'scheduled', 'processing', 'completed', 'failed', 'cancelled', 'returned') DEFAULT 'pending',
    scheduled_date DATE,
    processed_date DATE,
    bank_reference VARCHAR(100),
    transaction_id VARCHAR(100),
    processing_fee DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(15,2) NOT NULL,
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    base_currency_amount DECIMAL(15,2) NOT NULL,
    failure_reason TEXT,
    reconciliation_status ENUM('pending', 'matched', 'discrepancy', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_run_id) REFERENCES payment_runs(id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);

-- Payment reconciliation records
CREATE TABLE payment_reconciliations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT NOT NULL,
    bank_statement_id INT,
    statement_date DATE,
    statement_amount DECIMAL(15,2),
    matched_amount DECIMAL(15,2),
    discrepancy_amount DECIMAL(15,2) DEFAULT 0.00,
    reconciliation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reconciled_by INT,
    status ENUM('pending', 'matched', 'discrepancy', 'resolved') DEFAULT 'pending',
    discrepancy_reason TEXT,
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    resolved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (reconciled_by) REFERENCES users(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id)
);

-- Bank statements for reconciliation
CREATE TABLE bank_statements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    account_id VARCHAR(100),
    statement_date DATE NOT NULL,
    opening_balance DECIMAL(15,2),
    closing_balance DECIMAL(15,2),
    total_credits DECIMAL(15,2) DEFAULT 0.00,
    total_debits DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    import_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    processed_at TIMESTAMP,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Bank statement transactions
CREATE TABLE bank_statement_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bank_statement_id INT NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    reference_number VARCHAR(100),
    transaction_type ENUM('credit', 'debit') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance DECIMAL(15,2),
    counterparty_name VARCHAR(200),
    counterparty_account VARCHAR(100),
    transaction_category VARCHAR(50),
    matched_payment_id INT,
    match_confidence DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_statement_id) REFERENCES bank_statements(id),
    FOREIGN KEY (matched_payment_id) REFERENCES payments(id)
);

-- Payment approval workflows
CREATE TABLE payment_approvals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_run_id INT NOT NULL,
    approver_id INT NOT NULL,
    approval_level INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'delegated') DEFAULT 'pending',
    comments TEXT,
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    delegated_to INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_run_id) REFERENCES payment_runs(id),
    FOREIGN KEY (approver_id) REFERENCES users(id),
    FOREIGN KEY (delegated_to) REFERENCES users(id)
);

-- Payment scheduling rules
CREATE TABLE payment_scheduling_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    rule_name VARCHAR(200) NOT NULL,
    rule_type ENUM('early_payment_discount', 'due_date', 'cash_flow', 'vendor_preference') NOT NULL,
    priority INT DEFAULT 1,
    conditions JSON,
    actions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Payment integration logs
CREATE TABLE payment_integration_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT,
    payment_run_id INT,
    provider_name VARCHAR(50) NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    request_payload JSON,
    response_payload JSON,
    status_code INT,
    status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
    error_message TEXT,
    retry_count INT DEFAULT 0,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (payment_run_id) REFERENCES payment_runs(id)
);

-- Add payment-related columns to existing tables
ALTER TABLE invoices ADD COLUMN payment_status ENUM('unpaid', 'partial', 'paid', 'overpaid') DEFAULT 'unpaid';
ALTER TABLE invoices ADD COLUMN paid_amount DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE invoices ADD COLUMN payment_due_date DATE;
ALTER TABLE invoices ADD COLUMN early_payment_discount_percentage DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE invoices ADD COLUMN early_payment_discount_days INT DEFAULT 0;

-- Add payment method references to vendors
ALTER TABLE vendors ADD COLUMN preferred_payment_method_id INT;
ALTER TABLE vendors ADD COLUMN payment_terms_days INT DEFAULT 30;
ALTER TABLE vendors ADD COLUMN early_payment_discount_rate DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE vendors ADD COLUMN bank_account_number VARCHAR(100);
ALTER TABLE vendors ADD COLUMN bank_routing_number VARCHAR(20);
ALTER TABLE vendors ADD COLUMN bank_name VARCHAR(100);

-- Create indexes for performance
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_vendor_id ON payments(vendor_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_scheduled_date ON payments(scheduled_date);
CREATE INDEX idx_payment_runs_status ON payment_runs(status);
CREATE INDEX idx_payment_runs_company_id ON payment_runs(company_id);
CREATE INDEX idx_bank_statements_company_id ON bank_statements(company_id);
CREATE INDEX idx_bank_statement_transactions_date ON bank_statement_transactions(transaction_date);
CREATE INDEX idx_payment_reconciliations_status ON payment_reconciliations(status);