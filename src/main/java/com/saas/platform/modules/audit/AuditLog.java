package com.saas.platform.modules.audit;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {
    @Id
    private String id;

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "user_id")
    private String userId;

    @Column(nullable = false)
    private String action; // e.g., 'CREATE_USER'

    @Column(name = "entity_type")
    private String entityType; // Was entity_type

    @Column(name = "entity_id")
    private String entityId;   // Was entity_id

    @Column(name = "ip_address")
    private String ipAddress;  // Was ip_address

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(columnDefinition = "TEXT")
    private String details;
    
    private LocalDateTime timestamp;
    
}