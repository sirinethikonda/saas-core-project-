package com.saas.platform.modules.task;

import com.saas.platform.core.common.ApiResponse;
import com.saas.platform.core.middleware.AuditLogger;
import com.saas.platform.modules.project.Project;
import com.saas.platform.modules.project.ProjectRepository;
import com.saas.platform.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.util.List;
import com.saas.platform.modules.user.User; 
//Fix: Transactional cannot be resolved to a type
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuditLogger auditLogger;

    @Transactional
    public ApiResponse<?> createTask(String projectId, Task task) {
        // 1. Fetch the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new com.saas.platform.core.exception.ResourceNotFoundException("Project not found"));

        if (task.getAssignedTo() != null) {
            User assignedUser = userRepository.findById(task.getAssignedTo())
                    .orElseThrow(() -> new com.saas.platform.core.exception.ResourceNotFoundException("Assigned user not found"));

            String userTenant = assignedUser.getTenantId();
            String projectTenant = project.getTenantId();
            
            if (userTenant == null || projectTenant == null || !userTenant.trim().equalsIgnoreCase(projectTenant.trim())) {
                return ApiResponse.error("Assigned user does not belong to your organization");
            }
        }
        // 4. If valid, proceed to save
        task.setId(UUID.randomUUID().toString());
        task.setProjectId(projectId);
        task.setTenantId(project.getTenantId()); // Ensure task inherits project tenant
        
        Task savedTask = taskRepository.save(task);
        auditLogger.log("CREATE_TASK", "Task created: " + task.getTitle());
        
        return ApiResponse.success("Task created successfully", savedTask);
    }
    // API 17: List Project Tasks
    public ApiResponse<?> getTasksByProject(String projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        return ApiResponse.success("Tasks retrieved", tasks);
    }

    // API 18: Update Task Status (PATCH)
    public ApiResponse<?> updateTaskStatus(String taskId, String status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new com.saas.platform.core.exception.ResourceNotFoundException("Task not found"));
        
        task.setStatus(status);
        taskRepository.save(task);
        
        return ApiResponse.success("Status updated to " + status, task);
    }

    // API 19: Full Task Update
    public ApiResponse<?> updateTask(String taskId, Task updates) {
        Task existingTask = taskRepository.findById(taskId)
                .orElseThrow(() -> new com.saas.platform.core.exception.ResourceNotFoundException("Task not found"));

        if (updates.getTitle() != null) existingTask.setTitle(updates.getTitle());
        if (updates.getPriority() != null) existingTask.setPriority(updates.getPriority());
        if (updates.getDueDate() != null) existingTask.setDueDate(updates.getDueDate());
        
        taskRepository.save(existingTask);
        auditLogger.log("UPDATE_TASK", "Task ID " + taskId + " updated");
        
        return ApiResponse.success("Task updated successfully", existingTask);
    }
    // API 20: List All Tasks for Tenant
    public ApiResponse<?> getAllTasks() {
        String tenantId = com.saas.platform.core.middleware.TenantContext.getCurrentTenant();
        List<Task> tasks = taskRepository.findAllByTenantId(tenantId);
        return ApiResponse.success("All tasks retrieved", tasks);
    }

    // API 21: Delete Task
    @Transactional
    public ApiResponse<?> deleteTask(String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new com.saas.platform.core.exception.ResourceNotFoundException("Task not found"));
        
        taskRepository.delete(task);
        auditLogger.log("DELETE_TASK", "Task ID " + taskId + " deleted");
        
        return ApiResponse.success("Task deleted successfully", null);
    }
}