package com.saas.platform.modules.task;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tasks", indexes = {
    @Index(name = "idx_task_tenant_project", columnList = "tenant_id, project_id")
})
@Data
public class Task {
    @Id
    private String id;

    @Column(name = "project_id", nullable = false)
    private String projectId;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @NotBlank(message = "Task title is required")
    @Size(min = 3, max = 150, message = "Task title must be between 3 and 150 characters")
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status; // todo, in_progress, completed
    private String priority; // low, medium, high

    @Column(name = "assigned_to")
    private String assignedTo; // User UUID

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}