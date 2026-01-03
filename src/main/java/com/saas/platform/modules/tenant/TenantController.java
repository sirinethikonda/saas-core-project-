package com.saas.platform.modules.tenant;

import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.saas.platform.core.common.ApiResponse;
import com.saas.platform.core.middleware.TenantContext;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    // API 5: Get Tenant Details
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_super_admin', 'ROLE_tenant_admin')")
    public ApiResponse<?> getTenant(@PathVariable String id) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        String currentTenantId = TenantContext.getCurrentTenant();
        String userRole = getRoleFromContext();

        return tenantService.getTenantById(id, currentUserId, currentTenantId, userRole);
    }

    // API 6: Update Tenant
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_super_admin', 'ROLE_tenant_admin')")
    public ApiResponse<?> updateTenant(
            @PathVariable String id, 
            @RequestBody Map<String, Object> updates) {
        
        String currentTenantId = TenantContext.getCurrentTenant();
        String userRole = getRoleFromContext();

        return tenantService.updateTenant(id, updates, userRole, currentTenantId);
    }

    // API 7: List All Tenants (Super Admin Only)
    @GetMapping
    @PreAuthorize("hasRole('ROLE_super_admin')")
    public ApiResponse<?> listAllTenants() {
        // Business Logic Requirement: Only super_admin can see this list
        return ApiResponse.success("Feature coming soon for super_admin", null);
    }

    // Helper to extract role without [ROLE_] prefix for service logic
    private String getRoleFromContext() {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .map(r -> r.getAuthority().replace("ROLE_", ""))
                .findFirst()
                .orElse("user");
    }
}