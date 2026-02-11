package com.saas.platform.modules.task;

import com.saas.platform.core.common.ApiResponse;
import com.saas.platform.core.middleware.AuditLogger;
import com.saas.platform.core.middleware.TenantContext;
import com.saas.platform.modules.project.Project;
import com.saas.platform.modules.project.ProjectRepository;
import com.saas.platform.modules.user.User; 
import com.saas.platform.modules.user.UserRepository;
import com.saas.platform.core.exception.ResourceNotFoundException;
import com.saas.platform.core.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuditLogger auditLogger;

    @Transactional
    public ApiResponse<?> createTask(String projectId, Task task) {
        String currentTenantId = TenantContext.getCurrentTenant();

        // 1. Fetch the project with Tenant Isolation check
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        
        if (!project.getTenantId().equals(currentTenantId)) {
            return ApiResponse.error("Unauthorized: Project belongs to another organization");
        }

        if (task.getAssignedTo() != null) {
            User assignedUser = userRepository.findById(task.getAssignedTo())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found"));

            String userTenant = assignedUser.getTenantId();
            
            if (userTenant == null || !userTenant.trim().equalsIgnoreCase(currentTenantId)) {
                return ApiResponse.error("Assigned user does not belong to your organization");
            }
        }
        
        // 4. If valid, proceed to save
        task.setId(UUID.randomUUID().toString());
        task.setProjectId(projectId);
        task.setTenantId(currentTenantId); // Enforce current tenant
        
        Task savedTask = taskRepository.save(task);
        auditLogger.log("CREATE_TASK", "Task created: " + task.getTitle());
        
        return ApiResponse.success("Task created successfully", savedTask);
    }

    // API 17: List Project Tasks with Isolation
    public ApiResponse<?> getTasksByProject(String projectId) {
        String currentTenantId = TenantContext.getCurrentTenant();
        
        // Verify project existence and ownership
        Project project = projectRepository.findById(projectId)
                 .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getTenantId().equals(currentTenantId)) {
             return ApiResponse.error("Unauthorized: Project belongs to another organization");
        }

        List<Task> tasks = taskRepository.findByProjectId(projectId);
        return ApiResponse.success("Tasks retrieved", tasks);
    }

    // API 18: Update Task Status with Isolation
    public ApiResponse<?> updateTaskStatus(String taskId, String status) {
        String currentTenantId = TenantContext.getCurrentTenant();
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        
        if (!task.getTenantId().equals(currentTenantId)) {
            return ApiResponse.error("Unauthorized: Task belongs to another organization");
        }

        task.setStatus(status);
        taskRepository.save(task);
        
        return ApiResponse.success("Status updated to " + status, task);
    }

    // API 19: Full Task Update with Isolation
    public ApiResponse<?> updateTask(String taskId, Task updates) {
        String currentTenantId = TenantContext.getCurrentTenant();
        
        Task existingTask = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!existingTask.getTenantId().equals(currentTenantId)) {
            return ApiResponse.error("Unauthorized: Task belongs to another organization");
        }

        if (updates.getTitle() != null) existingTask.setTitle(updates.getTitle());
        if (updates.getPriority() != null) existingTask.setPriority(updates.getPriority());
        if (updates.getDueDate() != null) existingTask.setDueDate(updates.getDueDate());
        
        taskRepository.save(existingTask);
        auditLogger.log("UPDATE_TASK", "Task ID " + taskId + " updated");
        
        return ApiResponse.success("Task updated successfully", existingTask);
    }

    // API 20: List All Tasks (Global for Super Admin, Tenant-scoped for others)
    public ApiResponse<?> getAllTasks() {
        if (SecurityUtils.hasRole("ROLE_super_admin")) {
            return ApiResponse.success("All system tasks retrieved", taskRepository.findAll());
        }

        String tenantId = TenantContext.getCurrentTenant();
        List<Task> tasks = taskRepository.findAllByTenantId(tenantId);
        return ApiResponse.success("Tenant tasks retrieved", tasks);
    }

    // API 21: Delete Task with Isolation
    @Transactional
    public ApiResponse<?> deleteTask(String taskId) {
        String currentTenantId = TenantContext.getCurrentTenant();
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        
        if (!task.getTenantId().equals(currentTenantId)) {
            return ApiResponse.error("Unauthorized: Task belongs to another organization");
        }

        taskRepository.delete(task);
        auditLogger.log("DELETE_TASK", "Task ID " + taskId + " deleted");
        
        return ApiResponse.success("Task deleted successfully", null);
    }
}