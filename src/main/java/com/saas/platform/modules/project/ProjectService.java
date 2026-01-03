package com.saas.platform.modules.project;

import com.saas.platform.core.common.ApiResponse;
import com.saas.platform.core.middleware.AuditLogger;
import com.saas.platform.core.middleware.TenantContext;
import com.saas.platform.modules.tenant.Tenant;
import com.saas.platform.modules.tenant.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TenantRepository tenantRepository;
    private final AuditLogger auditLogger;

    @Transactional
    public ApiResponse<?> createProject(Project project, String userId) {
        String tenantId = TenantContext.getCurrentTenant();
        
        // 1. Fetch Tenant to check limits
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        // 2. Enforce Subscription Limits (Requirement 5)
        long currentProjectCount = projectRepository.countByTenantId(tenantId);
        if (currentProjectCount >= tenant.getMaxProjects()) {
            return ApiResponse.error("Project limit reached for your " + tenant.getSubscriptionPlan() + " plan.");
        }

        // 3. Initialize Project
        project.setId(UUID.randomUUID().toString());
        project.setTenantId(tenantId);
        project.setCreatedBy(userId);
        if (project.getStatus() == null) project.setStatus("active");

        Project savedProject = projectRepository.save(project);

        // 4. Audit Log (Fixed to 2 arguments)
        auditLogger.log("CREATE_PROJECT", "Project created: " + project.getName() + " by " + userId);

        return ApiResponse.success("Project created successfully", savedProject);
    }

    public List<Project> listAllProjects() {
        return projectRepository.findAllByTenantId(TenantContext.getCurrentTenant());
    }

    @Transactional
    public ApiResponse<?> updateProject(String id, Project updates, String userId) {
        String tenantId = TenantContext.getCurrentTenant();
        Project existing = projectRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Project not found or unauthorized"));

        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());

        Project updated = projectRepository.save(existing);
        
        // FIXED: Changed from 5 arguments to 2 strings
        auditLogger.log("UPDATE_PROJECT", "Project ID " + id + " updated by user " + userId);
        
        return ApiResponse.success("Project updated successfully", updated);
    }

    @Transactional
    public ApiResponse<?> deleteProject(String id, String userId) {
        String tenantId = TenantContext.getCurrentTenant();
        Project project = projectRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        projectRepository.delete(project);
        
        // FIXED: Changed from 5 arguments to 2 strings
        auditLogger.log("DELETE_PROJECT", "Project ID " + id + " deleted by user " + userId);
        
        return ApiResponse.success("Project deleted successfully", null);
    }
}