-- V2: Seed Data for Multi-Tenant SaaS Platform

-- 1. Super Admin Account
-- Password: Admin@123 (BCrypt hashed)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
VALUES ('super-admin-uuid', NULL, 'superadmin@system.com', '$2a$12$6kYf99FmQeI6S4lUvQ.jOe8D5U0Zg0U5L0U5L0U5L0U5L0U5L0U5L', 'System Administrator', 'super_admin', TRUE);

-- 2. Demo Tenant
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
VALUES ('demo-tenant-uuid', 'Demo Company', 'demo', 'active', 'pro', 25, 15);

-- 3. Tenant Admin for Demo Company
-- Password: Demo@123 (BCrypt hashed)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
VALUES ('demo-admin-uuid', 'demo-tenant-uuid', 'admin@demo.com', '$2a$12$7kYf99FmQeI6S4lUvQ.jOe8D5U0Zg0U5L0U5L0U5L0U5L0U5L0U5L', 'Demo Admin', 'tenant_admin', TRUE);

-- 4. Regular Users for Demo Company
-- Password: User@123 (BCrypt hashed)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
VALUES ('demo-user1-uuid', 'demo-tenant-uuid', 'user1@demo.com', '$2a$12$8kYf99FmQeI6S4lUvQ.jOe8D5U0Zg0U5L0U5L0U5L0U5L0U5L0U5L', 'John Doe', 'user', TRUE),
       ('demo-user2-uuid', 'demo-tenant-uuid', 'user2@demo.com', '$2a$12$8kYf99FmQeI6S4lUvQ.jOe8D5U0Zg0U5L0U5L0U5L0U5L0U5L0U5L0U5L', 'Jane Smith', 'user', TRUE);

-- 5. Sample Projects for Demo Company
INSERT INTO projects (id, tenant_id, name, description, status, created_by)
VALUES ('project-alpha-uuid', 'demo-tenant-uuid', 'Website Redesign', 'Complete redesign of the corporate website.', 'active', 'demo-admin-uuid'),
       ('project-beta-uuid', 'demo-tenant-uuid', 'Mobile App Development', 'Building a new iOS and Android app.', 'active', 'demo-admin-uuid');

-- 6. Sample Tasks
INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date)
VALUES ('task1-uuid', 'project-alpha-uuid', 'demo-tenant-uuid', 'Design homepage mockup', 'Create high-fidelity design for the new homepage.', 'in_progress', 'high', 'demo-user1-uuid', '2024-10-15'),
       ('task2-uuid', 'project-alpha-uuid', 'demo-tenant-uuid', 'Initial SEO audit', 'Analyze current site SEO performance.', 'todo', 'medium', 'demo-user2-uuid', '2024-10-20'),
       ('task3-uuid', 'project-beta-uuid', 'demo-tenant-uuid', 'Setup CI/CD pipeline', 'Configure GitHub Actions for automated builds.', 'todo', 'high', 'demo-admin-uuid', '2024-11-01'),
       ('task4-uuid', 'project-beta-uuid', 'demo-tenant-uuid', 'User Authentication module', 'Implement login and registration logic.', 'in_progress', 'high', 'demo-user1-uuid', '2024-11-10'),
       ('task5-uuid', 'project-beta-uuid', 'demo-tenant-uuid', 'Database schema design', 'Finalize tables and relationships for the mobile app.', 'completed', 'medium', 'demo-user2-uuid', '2024-10-05');
