package com.saas.platform.modules.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
	boolean existsByIdAndTenantId(String id, String tenantId);
    // For Login
    Optional<User> findByEmail(String email);
    
    // For Multi-tenant Login validation
    Optional<User> findByEmailAndTenantId(String email, String tenantId);
    
    // API 9: List Tenant Users
    List<User> findAllByTenantId(String tenantId);
    
    // API 8: For Subscription Limit Check
    long countByTenantId(String tenantId);
    
    // For unique email check per tenant
    boolean existsByEmailAndTenantId(String email, String tenantId);
}