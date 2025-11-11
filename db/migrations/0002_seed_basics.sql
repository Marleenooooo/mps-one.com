-- 0002_seed_basics.sql
-- Seed minimal entities: one company, departments, and users for demo/testing

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- Idempotent company seed
INSERT INTO company (name)
SELECT 'MPS One Demo'
WHERE NOT EXISTS (
  SELECT 1 FROM company WHERE name='MPS One Demo'
);
SET @company_id := (SELECT id FROM company WHERE name='MPS One Demo' LIMIT 1);

-- Idempotent departments
INSERT INTO department (company_id, name, budget_remaining)
SELECT @company_id, 'Operations', 500000000.00
WHERE NOT EXISTS (
  SELECT 1 FROM department WHERE company_id=@company_id AND name='Operations'
);
INSERT INTO department (company_id, name, budget_remaining)
SELECT @company_id, 'Procurement', 300000000.00
WHERE NOT EXISTS (
  SELECT 1 FROM department WHERE company_id=@company_id AND name='Procurement'
);
INSERT INTO department (company_id, name, budget_remaining)
SELECT @company_id, 'Finance', 250000000.00
WHERE NOT EXISTS (
  SELECT 1 FROM department WHERE company_id=@company_id AND name='Finance'
);

SET @dept_ops  := (SELECT id FROM department WHERE company_id=@company_id AND name='Operations'  LIMIT 1);
SET @dept_proc := (SELECT id FROM department WHERE company_id=@company_id AND name='Procurement' LIMIT 1);
SET @dept_fin  := (SELECT id FROM department WHERE company_id=@company_id AND name='Finance'     LIMIT 1);

-- Idempotent users (email-based)
INSERT INTO user (company_id, department_id, name, email, role)
SELECT @company_id, @dept_ops, 'Ops PIC', 'ops.pic@example.com', 'PIC_Operational'
WHERE NOT EXISTS (
  SELECT 1 FROM user WHERE email='ops.pic@example.com'
);
INSERT INTO user (company_id, department_id, name, email, role)
SELECT @company_id, @dept_proc, 'Procurement PIC', 'proc.pic@example.com', 'PIC_Procurement'
WHERE NOT EXISTS (
  SELECT 1 FROM user WHERE email='proc.pic@example.com'
);
INSERT INTO user (company_id, department_id, name, email, role)
SELECT @company_id, @dept_fin, 'Finance PIC', 'finance.pic@example.com', 'PIC_Finance'
WHERE NOT EXISTS (
  SELECT 1 FROM user WHERE email='finance.pic@example.com'
);
INSERT INTO user (company_id, department_id, name, email, role)
SELECT @company_id, NULL, 'Admin', 'admin@example.com', 'Admin'
WHERE NOT EXISTS (
  SELECT 1 FROM user WHERE email='admin@example.com'
);
