package com.saas.platform.modules.user;

import com.saas.platform.core.common.ApiResponse;
import com.saas.platform.core.middleware.AuditLogger;
import com.saas.platform.modules.tenant.Tenant;
import com.saas.platform.modules.tenant.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogger auditLogger;

    // API 9: List Tenant Users
    public List<User> getTenantUsers(String tenantId) {
        return userRepository.findAllByTenantId(tenantId);
    }

    // API 8: Add User to Tenant
    @Transactional
    public ApiResponse<?> addUser(String tenantId, User userRequest, String adminId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        
        if (userRepository.countByTenantId(tenantId) >= tenant.getMaxUsers()) {
            return ApiResponse.error("User limit reached for your plan (" + tenant.getSubscriptionPlan() + ")");
        }

        if (userRepository.existsByEmailAndTenantId(userRequest.getEmail(), tenantId)) {
            return ApiResponse.error("Email already exists in this organization");
        }

        userRequest.setId(UUID.randomUUID().toString());
        userRequest.setTenantId(tenantId);
        
        // Use provided password or default
        String rawPassword = (userRequest.getPassword() != null && !userRequest.getPassword().isEmpty()) 
                             ? userRequest.getPassword() 
                             : "User@123";
        userRequest.setPasswordHash(passwordEncoder.encode(rawPassword)); 
        
        userRequest.setIsActive(true);
        
        User savedUser = userRepository.save(userRequest);
        auditLogger.log("CREATE_USER", "New user " + savedUser.getEmail() + " added by: " + adminId);
        
        return ApiResponse.success("User added successfully", savedUser);
    }

    // API 10: Update User Profile
    @Transactional
    public ApiResponse<?> updateUser(String userId, User updates, String tenantId, String adminId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Tenant Isolation Check (Consider allowing self-update if IDs match, typically handled by PreAuthorize but good to double check)
        if (!existingUser.getTenantId().equals(tenantId)) {
            return ApiResponse.error("Unauthorized: You cannot update a user from another organization");
        }

        if (updates.getFullName() != null) existingUser.setFullName(updates.getFullName());
        if (updates.getRole() != null) existingUser.setRole(updates.getRole());
        
        // Handle Password Update
        if (updates.getPassword() != null && !updates.getPassword().isEmpty()) {
            existingUser.setPasswordHash(passwordEncoder.encode(updates.getPassword()));
        }

        User savedUser = userRepository.save(existingUser);
        auditLogger.log("UPDATE_USER", "User " + userId + " updated by " + adminId);
        
        return ApiResponse.success("User updated successfully", savedUser);
    }

    // API 11: Delete User (ADDED THIS MISSING METHOD)
    @Transactional
    public ApiResponse<?> deleteUser(String userId, String tenantId, String adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Tenant Isolation Check
        if (!user.getTenantId().equals(tenantId)) {
            return ApiResponse.error("Unauthorized: User belongs to another organization");
        }

        // Prevent self-deletion
        if (userId.equals(adminId)) {
            return ApiResponse.error("Security violation: You cannot delete your own account");
        }

        userRepository.delete(user);
        auditLogger.log("DELETE_USER", "User ID " + userId + " deleted by: " + adminId);
        
        return ApiResponse.success("User deleted successfully", null);
    }
}