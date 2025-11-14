-- Migration 0017: Multi-level approvals matrix with configurable steps and SLAs
-- Adds approval workflow configuration and tracking tables

-- Approval workflow templates (configurable multi-step approval processes)
CREATE TABLE IF NOT EXISTS approval_workflow (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  document_type ENUM('pr','po','invoice','contract') NOT NULL,
  department_id BIGINT UNSIGNED NULL,
  amount_min DECIMAL(18,2) NULL,
  amount_max DECIMAL(18,2) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_workflow_company (company_id),
  KEY idx_workflow_type (document_type),
  KEY idx_workflow_department (department_id),
  KEY idx_workflow_amount (amount_min, amount_max),
  CONSTRAINT fk_workflow_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE,
  CONSTRAINT fk_workflow_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Approval steps within workflows (defines the approval sequence)
CREATE TABLE IF NOT EXISTS approval_step (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  workflow_id BIGINT UNSIGNED NOT NULL,
  step_order INT NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  role_required ENUM('Admin','PIC_Operational','PIC_Procurement','PIC_Finance') NOT NULL,
  department_id BIGINT UNSIGNED NULL,
  min_amount DECIMAL(18,2) NULL,
  max_amount DECIMAL(18,2) NULL,
  sla_hours INT NOT NULL DEFAULT 24,
  is_parallel BOOLEAN NOT NULL DEFAULT FALSE,
  required_approvals INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_step_workflow (workflow_id),
  KEY idx_step_order (workflow_id, step_order),
  KEY idx_step_department (department_id),
  CONSTRAINT fk_step_workflow FOREIGN KEY (workflow_id) REFERENCES approval_workflow(id) ON DELETE CASCADE,
  CONSTRAINT fk_step_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL,
  UNIQUE KEY uk_workflow_order (workflow_id, step_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Individual approval instances (tracks actual approvals for documents)
CREATE TABLE IF NOT EXISTS approval_instance (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  workflow_id BIGINT UNSIGNED NOT NULL,
  document_type ENUM('pr','po','invoice','contract') NOT NULL,
  document_id BIGINT UNSIGNED NOT NULL,
  requester_id BIGINT UNSIGNED NOT NULL,
  current_step INT NOT NULL DEFAULT 1,
  status ENUM('pending','approved','rejected','escalated','cancelled') NOT NULL DEFAULT 'pending',
  amount DECIMAL(18,2) NULL,
  department_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_instance_workflow (workflow_id),
  KEY idx_instance_document (document_type, document_id),
  KEY idx_instance_requester (requester_id),
  KEY idx_instance_status (status),
  KEY idx_instance_department (department_id),
  CONSTRAINT fk_instance_workflow FOREIGN KEY (workflow_id) REFERENCES approval_workflow(id) ON DELETE CASCADE,
  CONSTRAINT fk_instance_requester FOREIGN KEY (requester_id) REFERENCES user(id) ON DELETE RESTRICT,
  CONSTRAINT fk_instance_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Approval actions (individual approval/rejection actions)
CREATE TABLE IF NOT EXISTS approval_action (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  instance_id BIGINT UNSIGNED NOT NULL,
  step_id BIGINT UNSIGNED NOT NULL,
  approver_id BIGINT UNSIGNED NOT NULL,
  action ENUM('approved','rejected','escalated','delegated') NOT NULL,
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_action_instance (instance_id),
  KEY idx_action_step (step_id),
  KEY idx_action_approver (approver_id),
  KEY idx_action_created (created_at),
  CONSTRAINT fk_action_instance FOREIGN KEY (instance_id) REFERENCES approval_instance(id) ON DELETE CASCADE,
  CONSTRAINT fk_action_step FOREIGN KEY (step_id) REFERENCES approval_step(id) ON DELETE RESTRICT,
  CONSTRAINT fk_action_approver FOREIGN KEY (approver_id) REFERENCES user(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SLA tracking and escalations
CREATE TABLE IF NOT EXISTS approval_sla (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  instance_id BIGINT UNSIGNED NOT NULL,
  step_id BIGINT UNSIGNED NOT NULL,
  sla_deadline TIMESTAMP NOT NULL,
  escalated_at TIMESTAMP NULL,
  escalation_reason VARCHAR(255) NULL,
  notified_users JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sla_instance (instance_id),
  KEY idx_sla_step (step_id),
  KEY idx_sla_deadline (sla_deadline),
  KEY idx_sla_escalated (escalated_at),
  CONSTRAINT fk_sla_instance FOREIGN KEY (instance_id) REFERENCES approval_instance(id) ON DELETE CASCADE,
  CONSTRAINT fk_sla_step FOREIGN KEY (step_id) REFERENCES approval_step(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add approval workflow reference to existing PR table
SET @has_approval_workflow_id := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pr' AND COLUMN_NAME = 'approval_workflow_id'
);
SET @sql := IF(@has_approval_workflow_id = 0,
  "ALTER TABLE pr ADD COLUMN approval_workflow_id BIGINT UNSIGNED NULL AFTER status, ADD KEY idx_pr_approval_workflow (approval_workflow_id), ADD CONSTRAINT fk_pr_approval_workflow FOREIGN KEY (approval_workflow_id) REFERENCES approval_workflow(id) ON DELETE SET NULL",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add approval instance reference to existing PR table
SET @has_approval_instance_id := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pr' AND COLUMN_NAME = 'approval_instance_id'
);
SET @sql := IF(@has_approval_instance_id = 0,
  "ALTER TABLE pr ADD COLUMN approval_instance_id BIGINT UNSIGNED NULL AFTER approval_workflow_id, ADD KEY idx_pr_approval_instance (approval_instance_id), ADD CONSTRAINT fk_pr_approval_instance FOREIGN KEY (approval_instance_id) REFERENCES approval_instance(id) ON DELETE SET NULL",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_approval_instance_composite ON approval_instance(workflow_id, status, current_step);
CREATE INDEX IF NOT EXISTS idx_approval_action_composite ON approval_action(instance_id, step_id, created_at);
CREATE INDEX IF NOT EXISTS idx_approval_sla_composite ON approval_sla(instance_id, sla_deadline, escalated_at);