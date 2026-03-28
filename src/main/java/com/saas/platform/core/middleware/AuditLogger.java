package com.saas.platform.core.middleware;

import com.saas.platform.modules.audit.AuditLog;
import com.saas.platform.modules.audit.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AuditLogger {

    private final AuditLogRepository auditLogRepository;

    public void log(String action, String entityType, String entityId, String userId, String details) {
        AuditLog log = new AuditLog();
        log.setId(UUID.randomUUID().toString());
        log.setTenantId(TenantContext.getCurrentTenant());
        log.setUserId(userId);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        log.setCreatedAt(LocalDateTime.now());
        log.setTimestamp(LocalDateTime.now());
        
        auditLogRepository.save(log);
    }
}