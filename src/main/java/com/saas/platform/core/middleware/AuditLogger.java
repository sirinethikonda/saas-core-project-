package com.saas.platform.core.middleware;

import com.saas.platform.modules.audit.AuditLog;
import com.saas.platform.modules.audit.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.UUID;

@Component // This tells Spring to manage this bean
@RequiredArgsConstructor
public class AuditLogger {

    private final AuditLogRepository auditLogRepository;

    public void log(String action, String details) {
        AuditLog log = new AuditLog();
        log.setId(UUID.randomUUID().toString());
        
        // Retrieve tenant ID from the context to satisfy Requirement 6
        log.setTenantId(TenantContext.getCurrentTenant());
        
        log.setAction(action);
        log.setDetails(details);
        log.setTimestamp(LocalDateTime.now());
        
        auditLogRepository.save(log);
    }
}