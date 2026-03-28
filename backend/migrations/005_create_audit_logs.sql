-- UP: Create audit_logs table
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36),
    user_id VARCHAR(36),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255),
    entity_id VARCHAR(255),
    ip_address VARCHAR(45),
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DOWN: Drop audit_logs table
-- DROP TABLE IF EXISTS audit_logs;
