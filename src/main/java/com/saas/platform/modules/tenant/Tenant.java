package com.saas.platform.modules.tenant;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tenant {
    @Id
    private String id; // UUID

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String subdomain;

    @Column(nullable = false)
    private String status; // active, suspended, trial

    @Column(name = "subscription_plan", nullable = false)
    private String subscriptionPlan; // free, pro, enterprise

    @Column(name = "max_users", nullable = false)
    private Integer maxUsers;

    @Column(name = "max_projects", nullable = false)
    private Integer maxProjects;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}