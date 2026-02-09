package com.saas.platform.modules.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    List<Task> findAllByProjectIdAndTenantId(String projectId, String tenantId);
    Optional<Task> findByIdAndTenantId(String id, String tenantId);
    List<Task> findByProjectId(String projectId);
    List<Task> findAllByTenantId(String tenantId);
    
    long countByProjectId(String projectId);
    long countByProjectIdAndStatusIgnoreCase(String projectId, String status);
}