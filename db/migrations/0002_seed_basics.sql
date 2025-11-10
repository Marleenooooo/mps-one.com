-- 0002_seed_basics.sql
-- Seed minimal entities: one company, departments, and users for demo/testing

SET NAMES utf8mb4;
SET time_zone = '+07:00';

INSERT INTO company (name) VALUES ('MPS One Demo');
SET @company_id := LAST_INSERT_ID();

INSERT INTO department (company_id, name, budget_remaining) VALUES
(@company_id, 'Operations', 500000000.00),
(@company_id, 'Procurement', 300000000.00),
(@company_id, 'Finance', 250000000.00);

SET @dept_ops  := (SELECT id FROM department WHERE company_id=@company_id AND name='Operations'  LIMIT 1);
SET @dept_proc := (SELECT id FROM department WHERE company_id=@company_id AND name='Procurement' LIMIT 1);
SET @dept_fin  := (SELECT id FROM department WHERE company_id=@company_id AND name='Finance'     LIMIT 1);

INSERT INTO user (company_id, department_id, name, email, role) VALUES
(@company_id, @dept_ops,  'Ops PIC',        'ops.pic@example.com',       'PIC_Operational'),
(@company_id, @dept_proc, 'Procurement PIC','proc.pic@example.com',      'PIC_Procurement'),
(@company_id, @dept_fin,  'Finance PIC',    'finance.pic@example.com',   'PIC_Finance'),
(@company_id, NULL,       'Admin',          'admin@example.com',         'Admin');

