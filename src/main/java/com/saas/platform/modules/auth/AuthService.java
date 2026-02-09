package com.saas.platform.modules.auth;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.saas.platform.core.common.ApiResponse;
import com.saas.platform.core.security.JwtService;
import com.saas.platform.core.middleware.AuditLogger; // Now it will resolve
import com.saas.platform.modules.auth.dto.LoginRequest;
import com.saas.platform.modules.auth.dto.TentantRegisterRequest;
import com.saas.platform.modules.tenant.Tenant;
import com.saas.platform.modules.tenant.TenantRepository;
import com.saas.platform.modules.user.User;
import com.saas.platform.modules.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogger auditLogger;

    @Transactional
    public ApiResponse<?> registerTenant(TentantRegisterRequest request) {
        if (tenantRepository.existsBySubdomain(request.getSubdomain())) {
            return ApiResponse.error("Subdomain already exists");
        }

        Tenant tenant = new Tenant();
        tenant.setId(UUID.randomUUID().toString());
        tenant.setName(request.getTenantName());
        tenant.setSubdomain(request.getSubdomain());
        tenant.setSubscriptionPlan("free");
        tenant.setMaxUsers(5);
        tenant.setMaxProjects(3);
        tenant.setStatus("active");
        tenantRepository.save(tenant);

        User admin = new User();
        admin.setId(UUID.randomUUID().toString());
        admin.setTenantId(tenant.getId());
        admin.setEmail(request.getAdminEmail());
        admin.setPasswordHash(passwordEncoder.encode(request.getAdminPassword()));
        admin.setFullName(request.getAdminFullName());
        admin.setRole("tenant_admin");
        admin.setIsActive(true); // Fixed by adding field to User.java
        userRepository.save(admin);

        auditLogger.log("TENANT_REGISTRATION", "Registered tenant: " + tenant.getName());

        return ApiResponse.success("Tenant registered successfully", Map.of("tenantId", tenant.getId()));
    }

    public ApiResponse<?> login(LoginRequest request) {
        Tenant tenant = tenantRepository.findBySubdomain(request.getTenantSubdomain())
                .orElseThrow(() -> new com.saas.platform.core.exception.TenantNotFoundException("Tenant not found with subdomain: " + request.getTenantSubdomain()));

        User user = userRepository.findByEmailAndTenantId(request.getEmail(), tenant.getId())
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getTenantId(), user.getRole());
        
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("expiresIn", 86400);
        data.put("user", Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "tenantId", user.getTenantId()
        ));

        return ApiResponse.success("Login successful", data);
    }

    public ApiResponse<?> getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Tenant tenant = null;
        if (user.getTenantId() != null) {
            tenant = tenantRepository.findById(user.getTenantId())
                .orElseThrow(() -> new com.saas.platform.core.exception.TenantNotFoundException("Tenant not found"));
        }

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("email", user.getEmail());
        userData.put("fullName", user.getFullName());
        userData.put("role", user.getRole());
        userData.put("isActive", user.getIsActive());
        userData.put("tenant", tenant); 

        return ApiResponse.success("User profile", userData);
    }

    public ApiResponse<?> logout() {
        auditLogger.log("USER_LOGOUT", "User logged out");
        return ApiResponse.success("Logged out successfully", null);
    }
}