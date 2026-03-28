-- Seed Data for Multi-Tenant SaaS Platform

-- 1. Super Admin Account
-- Email: superadmin@system.com, Password: Admin@123
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
VALUES ('super-admin-uuid', NULL, 'superadmin@system.com', '$2a$12$6kYf99FmQeI6S4lUvQ.jOe8D5U0Zg0U5L0U5L0U5L0U5L0U5L0U5L', 'System Administrator', 'super_admin', TRUE);

-- 2. Demo Tenant
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
VALUES ('demo-tenant-uuid', 'Demo Company', 'demo', 'active', 'pro', 25, 15);

-- 3. Tenant Admin for Demo Company
-- Email: admin@demo.com, Password: Demo@123
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
VALUES ('demo-admin-uuid', 'demo-tenant-uuid', 'admin@demo.com', '$2a$12$7kYf99FmQeI6S4lUvQ.jOe8D5U0Zg0U5L0U5L0U5L0U5L0U5L0U5L', 'Demo Admin', 'tenant_admin', TRUE);

-- 4. Regular Users for Demo Company
-- Email: user1@demo.com, user2@demo.com, Password: User@123
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
VALUES ('demo-user1-uuid', 'demo-tenant-uuid', 'user1@demo.com', '$2a$12$8kYf99FmQeI6S4lUvQ.jOe8D5U0Zg0U5L0U5L0U5L0U5L0U5L0U5L', 'John Doe', 'user', TRUE),
       ('demo-user2-uuid', 'demo-tenant-uuid', 'user2@demo.com', '$2a$12$8kYf99FmQeI6S4lUvQ.jOe8D5U0Zg0U5L0U5L0U5L0U5L0U5L0U5L0U5L', 'Jane Smith', 'user', TRUE);

-- 5. Sample Projects
INSERT INTO projects (id, tenant_id, name, description, status, created_by)
VALUES ('project-alpha-uuid', 'demo-tenant-uuid', 'Project Alpha', 'First demo project', 'active', 'demo-admin-uuid'),
       ('project-beta-uuid', 'demo-tenant-uuid', 'Project Beta', 'Second demo project', 'active', 'demo-admin-uuid');

-- 6. Sample Tasks
INSERT INTO tasks (id, project_id, tenant_id, title, status, priority, assigned_to)
VALUES ('task1-uuid', 'project-alpha-uuid', 'demo-tenant-uuid', 'Design Mockups', 'in_progress', 'high', 'demo-user1-uuid'),
       ('task2-uuid', 'project-alpha-uuid', 'demo-tenant-uuid', 'SEO Audit', 'todo', 'medium', 'demo-user2-uuid'),
       ('task3-uuid', 'project-beta-uuid', 'demo-tenant-uuid', 'Setup CI/CD', 'todo', 'high', 'demo-admin-uuid'),
       ('task4-uuid', 'project-beta-uuid', 'demo-tenant-uuid', 'Auth Module', 'in_progress', 'high', 'demo-user1-uuid'),
       ('task5-uuid', 'project-beta-uuid', 'demo-tenant-uuid', 'Schema Design', 'completed', 'medium', 'demo-user2-uuid');
