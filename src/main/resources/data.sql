-- Seed Data for SAAS.CORE Platform
-- Author: Konda Sri
-- Email: KondaSri@gmail.com

-- 0. Clean old data if any
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE tasks;
TRUNCATE TABLE projects;
TRUNCATE TABLE users;
TRUNCATE TABLE tenants;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Tenants
INSERT INTO tenants (id, name, subdomain, subscription_plan, max_users, max_projects)
VALUES 
('system-tenant', 'System Admin', 'system', 'enterprise', 999, 999),
('sri-corp-id', 'Sri Innovations', 'sri-innovations', 'pro', 25, 15);

-- 2. Users (Passwords are 'SecurePassword123!' encoded)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
VALUES 
('super-admin-uuid', 'system-tenant', 'KondaSri@gmail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Konda Sri', 'super_admin', true),
('tenant-admin-uuid', 'sri-corp-id', 'admin@sri-innovations.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Sri Admin', 'tenant_admin', true);

-- 3. Projects
INSERT INTO projects (id, tenant_id, name, description, status, created_by)
VALUES 
('proj-1-uuid', 'sri-corp-id', 'SaaS Implementation', 'Building core multi-tenant backend', 'active', 'tenant-admin-uuid');

-- 4. Tasks
INSERT INTO tasks (id, project_id, tenant_id, title, status, priority)
VALUES 
('task-1-uuid', 'proj-1-uuid', 'sri-corp-id', 'Setup Database Schema', 'completed', 'high'),
('task-2-uuid', 'proj-1-uuid', 'sri-corp-id', 'Implement JWT Auth', 'in_progress', 'medium');
