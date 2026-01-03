package com.saas.platform.modules.tenant;

import com.saas.platform.core.common.ApiResponse;
import com.saas.platform.core.exception.TenantNotFoundException;
import com.saas.platform.core.middleware.AuditLogger;
import com.saas.platform.modules.user.UserRepository;
import com.saas.platform.modules.project.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final AuditLogger auditLogger;

    // API 5: Get Tenant Details with Ownership Validation
    public ApiResponse<?> getTenantById(String id, String currentUserId, String currentUserTenantId, String userRole) {
        // Business Logic: Prevent users from seeing other tenants unless Super Admin
        if (!id.equals(currentUserTenantId) && !"super_admin".equals(userRole)) {
            return ApiResponse.error("Unauthorized: Access to this tenant is denied.");
        }

        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new TenantNotFoundException("Tenant not found with ID: " + id));

        // Requirement: Include statistics
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.countByTenantId(id));
        stats.put("totalProjects", projectRepository.countByTenantId(id));

        Map<String, Object> data = new HashMap<>();
        data.put("tenant", tenant);
        data.put("stats", stats);

        return ApiResponse.success("Tenant details fetched", data);
    }

    // API 6: Update Tenant (Audit Log & Field Restrictions)
    @Transactional
    public ApiResponse<?> updateTenant(String id, Map<String, Object> updates, String userRole, String currentUserTenantId) {
        if (!id.equals(currentUserTenantId) && !"super_admin".equals(userRole)) {
            return ApiResponse.error("Unauthorized: Update access denied.");
        }

        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new TenantNotFoundException("Tenant not found"));

        // Requirement: Tenant Admin can only update 'name'
        if ("tenant_admin".equals(userRole)) {
            if (updates.containsKey("name")) {
                tenant.setName((String) updates.get("name"));
            }
            if (updates.size() > 1 || (updates.size() == 1 && !updates.containsKey("name"))) {
                return ApiResponse.error("Admins can only update the organization name.");
            }
        } 
        
        // Requirement: Super Admin can update plans and status
        if ("super_admin".equals(userRole)) {
            if (updates.containsKey("name")) tenant.setName((String) updates.get("name"));
            if (updates.containsKey("status")) tenant.setStatus((String) updates.get("status"));
            if (updates.containsKey("subscriptionPlan")) {
                String plan = (String) updates.get("subscriptionPlan");
                tenant.setSubscriptionPlan(plan);
                updatePlanLimits(tenant, plan); // Enforce Plan Limits logic
            }
        }

        Tenant savedTenant = tenantRepository.save(tenant);
        
        // Requirement 6: Audit log the update
        auditLogger.log("UPDATE_TENANT", "Tenant ID " + id + " updated by role: " + userRole);

        return ApiResponse.success("Tenant updated", savedTenant);
    }

    // API 7: List All Tenants with Pagination (Super Admin Only)
    public ApiResponse<?> getAllTenants(int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        return ApiResponse.success("Tenants fetched", tenantRepository.findAll(pageable));
    }

    private void updatePlanLimits(Tenant tenant, String plan) {
        switch (plan.toLowerCase()) {
            case "pro" -> { tenant.setMaxUsers(25); tenant.setMaxProjects(15); }
            case "enterprise" -> { tenant.setMaxUsers(100); tenant.setMaxProjects(50); }
            default -> { tenant.setMaxUsers(5); tenant.setMaxProjects(3); }
        }
    }
}