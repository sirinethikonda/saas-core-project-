package com.saas.platform.modules.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    
    // Strict isolation for finding a single project
    Optional<Project> findByIdAndTenantId(String id, String tenantId);

    // List all projects for a specific tenant
    List<Project> findAllByTenantId(String tenantId);

    // Count projects to enforce subscription limits
    long countByTenantId(String tenantId);

    // Search by name within a tenant (Case-insensitive)
    List<Project> findByNameContainingIgnoreCaseAndTenantId(String name, String tenantId);
}