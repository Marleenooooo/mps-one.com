-- Departmental budgets, threshold routing, and escalations
-- Migration ID: 0018_departmental_budgets
-- Created: 2025-11-14

-- Departments table
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    manager_id INT,
    budget_currency VARCHAR(3) DEFAULT 'IDR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_company_departments (company_id),
    INDEX idx_department_code (code),
    UNIQUE KEY unique_company_department_code (company_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Department budgets table
CREATE TABLE department_budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    fiscal_year YEAR NOT NULL,
    total_budget DECIMAL(15,2) NOT NULL,
    utilized_budget DECIMAL(15,2) DEFAULT 0.00,
    committed_budget DECIMAL(15,2) DEFAULT 0.00,
    available_budget DECIMAL(15,2) GENERATED ALWAYS AS (total_budget - utilized_budget - committed_budget) STORED,
    currency VARCHAR(3) DEFAULT 'IDR',
    status ENUM('draft', 'active', 'closed', 'carried_over') DEFAULT 'draft',
    created_by INT NOT NULL,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_department_budgets (department_id, fiscal_year),
    UNIQUE KEY unique_department_year (department_id, fiscal_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Monthly budget breakdowns
CREATE TABLE department_budget_monthly (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_budget_id INT NOT NULL,
    month TINYINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    monthly_budget DECIMAL(15,2) NOT NULL,
    utilized_amount DECIMAL(15,2) DEFAULT 0.00,
    committed_amount DECIMAL(15,2) DEFAULT 0.00,
    FOREIGN KEY (department_budget_id) REFERENCES department_budgets(id) ON DELETE CASCADE,
    INDEX idx_budget_monthly (department_budget_id, month),
    UNIQUE KEY unique_budget_month (department_budget_id, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budget categories for tracking different types of expenses
CREATE TABLE budget_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) NOT NULL,
    description TEXT,
    parent_category_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_category_id) REFERENCES budget_categories(id) ON DELETE SET NULL,
    INDEX idx_company_categories (company_id),
    UNIQUE KEY unique_company_category_code (company_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Department budget allocations by category
CREATE TABLE department_budget_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_budget_id INT NOT NULL,
    category_id INT NOT NULL,
    allocated_amount DECIMAL(15,2) NOT NULL,
    utilized_amount DECIMAL(15,2) DEFAULT 0.00,
    committed_amount DECIMAL(15,2) DEFAULT 0.00,
    FOREIGN KEY (department_budget_id) REFERENCES department_budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE RESTRICT,
    INDEX idx_budget_category (department_budget_id, category_id),
    UNIQUE KEY unique_budget_category (department_budget_id, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Threshold routing rules for budget approval workflows
CREATE TABLE budget_threshold_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    department_id INT NULL,
    category_id INT NULL,
    min_amount DECIMAL(15,2) DEFAULT 0.00,
    max_amount DECIMAL(15,2) NULL,
    approval_workflow_id INT NOT NULL,
    escalation_enabled BOOLEAN DEFAULT TRUE,
    escalation_days INT DEFAULT 3,
    escalation_workflow_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (approval_workflow_id) REFERENCES approval_workflow(id) ON DELETE RESTRICT,
    FOREIGN KEY (escalation_workflow_id) REFERENCES approval_workflow(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_company_thresholds (company_id),
    INDEX idx_department_category (department_id, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budget requests (linking PRs to budget consumption)
CREATE TABLE budget_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pr_id INT NOT NULL,
    department_budget_id INT NOT NULL,
    category_id INT NOT NULL,
    requested_amount DECIMAL(15,2) NOT NULL,
    approved_amount DECIMAL(15,2) NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    requested_by INT NOT NULL,
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pr_id) REFERENCES pr(id) ON DELETE CASCADE,
    FOREIGN KEY (department_budget_id) REFERENCES department_budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_pr_budget (pr_id),
    INDEX idx_department_budget (department_budget_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budget escalation tracking
CREATE TABLE budget_escalations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    budget_request_id INT NOT NULL,
    escalation_type ENUM('threshold_exceeded', 'budget_insufficient', 'approval_timeout', 'manual') NOT NULL,
    from_workflow_id INT NOT NULL,
    to_workflow_id INT NOT NULL,
    escalated_by INT NOT NULL,
    escalated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT NOT NULL,
    resolution TEXT,
    resolved_at TIMESTAMP NULL,
    resolved_by INT NULL,
    FOREIGN KEY (budget_request_id) REFERENCES budget_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (from_workflow_id) REFERENCES approval_workflow(id) ON DELETE RESTRICT,
    FOREIGN KEY (to_workflow_id) REFERENCES approval_workflow(id) ON DELETE RESTRICT,
    FOREIGN KEY (escalated_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_budget_escalations (budget_request_id),
    INDEX idx_escalation_type (escalation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add budget tracking columns to PR table
ALTER TABLE pr ADD COLUMN department_id INT NULL,
    ADD COLUMN budget_category_id INT NULL,
    ADD COLUMN budget_impact DECIMAL(15,2) NULL,
    ADD COLUMN budget_status ENUM('no_impact', 'pending_approval', 'approved', 'rejected', 'insufficient') DEFAULT 'no_impact',
    ADD FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    ADD FOREIGN KEY (budget_category_id) REFERENCES budget_categories(id) ON DELETE SET NULL,
    ADD INDEX idx_pr_department (department_id),
    ADD INDEX idx_pr_budget_category (budget_category_id),
    ADD INDEX idx_pr_budget_status (budget_status);

-- Insert sample data for testing
INSERT INTO departments (company_id, name, code, description) VALUES 
(1, 'Operations', 'OPS', 'Operations department'),
(1, 'Marketing', 'MKT', 'Marketing department'),
(1, 'IT', 'IT', 'Information Technology department'),
(1, 'Finance', 'FIN', 'Finance department');

INSERT INTO budget_categories (company_id, name, code, description) VALUES
(1, 'Office Supplies', 'OFFICE', 'Office supplies and stationery'),
(1, 'IT Equipment', 'IT-EQUIP', 'Computers, servers, and IT equipment'),
(1, 'Marketing Materials', 'MKT-MAT', 'Marketing and promotional materials'),
(1, 'Professional Services', 'PROF-SVC', 'Consulting and professional services'),
(1, 'Travel & Transportation', 'TRAVEL', 'Travel and transportation expenses'),
(1, 'Utilities', 'UTIL', 'Utilities and facility costs');