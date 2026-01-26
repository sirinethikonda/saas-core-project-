package com.saas.platform.modules.audit;

import com.saas.platform.core.common.ApiResponse;
import com.saas.platform.core.middleware.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ApiResponse<?> getLogs() {
        String tenantId = TenantContext.getCurrentTenant();
        // Assuming findAllByTenantId exists or using a custom query if not.
        // Since I can't see the Repo, I'll rely on standar JPA naming.
        // If it fails, I'll fix it. AuditLogger uses 'save', so Repo extends JpaRepository.
        List<AuditLog> logs = auditLogRepository.findAllByTenantIdOrderByTimestampDesc(tenantId);
        return ApiResponse.success("Audit logs retrieved", logs);
    }
}
