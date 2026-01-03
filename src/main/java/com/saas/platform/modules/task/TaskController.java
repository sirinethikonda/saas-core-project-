package com.saas.platform.modules.task;

import com.saas.platform.core.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // API 16: Create Task
    @PostMapping("/projects/{projectId}/tasks")
    public ApiResponse<?> createTask(@PathVariable String projectId, @RequestBody Task task) {
        return taskService.createTask(projectId, task);
    }

    // API 17: List Project Tasks
    @GetMapping("/projects/{projectId}/tasks")
    public ApiResponse<?> getTasks(@PathVariable String projectId) {
        return taskService.getTasksByProject(projectId);
    }

    // API 18: Update Task Status (PATCH)
    @PatchMapping("/tasks/{taskId}/status")
    public ApiResponse<?> updateStatus(@PathVariable String taskId, @RequestBody Task statusUpdate) {
        return taskService.updateTaskStatus(taskId, statusUpdate.getStatus());
    }

    // API 19: Update Task (PUT)
    @PutMapping("/tasks/{taskId}")
    public ApiResponse<?> updateTask(@PathVariable String taskId, @RequestBody Task task) {
        return taskService.updateTask(taskId, task);
    }
}