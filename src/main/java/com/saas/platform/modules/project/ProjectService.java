package com.saas.platform.modules.project;

import com.saas.platform.core.common.ApiResponse;
import com.saas.platform.core.middleware.AuditLogger;
import com.saas.platform.core.middleware.TenantContext;
import com.saas.platform.modules.tenant.Tenant;
import com.saas.platform.modules.tenant.TenantRepository;
import com.saas.platform.modules.task.TaskRepository;
import com.saas.platform.modules.project.ProjectRepository;
import com.saas.platform.core.security.SecurityUtils;
import com.saas.platform.core.exception.ResourceNotFoundException;
import com.saas.platform.core.exception.TenantNotFoundException;
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

    private final TaskRepository taskRepository;

    @Transactional
    public ApiResponse<?> createProject(Project project, String userId) {
        String tenantId = TenantContext.getCurrentTenant();
        
        // 1. Fetch Tenant to check limits
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new TenantNotFoundException("Tenant not found"));

        // 2. Enforce Subscription Limits
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
        
        // Initialize counts for new project
        savedProject.setTaskCount(0);
        savedProject.setCompletedTaskCount(0);

        // 4. Audit Log
        auditLogger.log("CREATE_PROJECT", "Project created: " + project.getName() + " by " + userId);

        return ApiResponse.success("Project created successfully", savedProject);
    }

    public List<Project> listAllProjects() {
        // Super Admin: View ALL projects
        if (SecurityUtils.hasRole("ROLE_super_admin")) {
             List<Project> allProjects = projectRepository.findAll();
             allProjects.forEach(this::populateTaskCounts);
             return allProjects;
        }

        // Regular User: View Tenant projects
        List<Project> projects = projectRepository.findAllByTenantId(TenantContext.getCurrentTenant());
        projects.forEach(this::populateTaskCounts);
        return projects;
    }

    private void populateTaskCounts(Project p) {
        long total = taskRepository.countByProjectId(p.getId());
        long completed = taskRepository.countByProjectIdAndStatusIgnoreCase(p.getId(), "completed");
        p.setTaskCount(total);
        p.setCompletedTaskCount(completed);
    }
    
    public ApiResponse<?> getProject(String id) {
        String tenantId = TenantContext.getCurrentTenant();
        Project project = projectRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        
        project.setTaskCount(taskRepository.countByProjectId(id));
        project.setCompletedTaskCount(taskRepository.countByProjectIdAndStatusIgnoreCase(id, "completed"));
        
        return ApiResponse.success("Project retrieved", project);
    }

    @Transactional
    public ApiResponse<?> updateProject(String id, Project updates, String userId) {
        String tenantId = TenantContext.getCurrentTenant();
        Project existing = projectRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found or unauthorized"));

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
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        
        projectRepository.delete(project);
        
        // FIXED: Changed from 5 arguments to 2 strings
        auditLogger.log("DELETE_PROJECT", "Project ID " + id + " deleted by user " + userId);
        
        return ApiResponse.success("Project deleted successfully", null);
    }
}