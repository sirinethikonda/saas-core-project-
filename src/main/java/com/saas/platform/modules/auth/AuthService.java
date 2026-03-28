package com.saas.platform.modules.auth;

import com.saas.platform.core.common.ApiResponse;
import com.saas.platform.core.middleware.AuditLogger;
import com.saas.platform.core.security.JwtService;
import com.saas.platform.core.security.SecurityUtils;
import com.saas.platform.modules.auth.dto.LoginRequest;
import com.saas.platform.modules.auth.dto.TenantRegisterRequest;
import com.saas.platform.modules.tenant.Tenant;
import com.saas.platform.modules.tenant.TenantRepository;
import com.saas.platform.modules.user.User;
import com.saas.platform.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class AuthService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogger auditLogger;

    @Transactional
    public ApiResponse<?> registerTenant(TenantRegisterRequest request) {
        String subdomain = request.getSubdomain().trim().toLowerCase();
        
        // 1. Check if subdomain is taken
        if (tenantRepository.existsBySubdomain(subdomain)) {
            return ApiResponse.error("Subdomain '" + subdomain + "' is already registered. Please use the Login endpoint.");
        }

        // 2. Check if admin email is already registered anywhere (to prevent confusion)
        if (userRepository.existsByEmail(request.getAdminEmail())) {
             return ApiResponse.error("Email '" + request.getAdminEmail() + "' is already registered. Please use Login or a different email.");
        }

        Tenant tenant = new Tenant();
        tenant.setId(UUID.randomUUID().toString());
        tenant.setName(request.getTenantName());
        tenant.setSubdomain(subdomain);
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
        admin.setIsActive(true); 
        userRepository.save(admin);

        auditLogger.log("TENANT_REGISTRATION", "tenant", tenant.getId(), admin.getId(), "Registered tenant: " + tenant.getName());

        return ApiResponse.success("Tenant registered successfully. You can now Login using your subdomain '" + subdomain + "'.", Map.of("tenantId", tenant.getId()));
    }

    public ApiResponse<?> login(LoginRequest request) {
        // 1. Check for Super Admin first (Global lookup)
        // This allows Super Admin to login even if the provided subdomain doesn't exist
        var potentialUser = userRepository.findFirstByEmailAndRole(request.getEmail(), "super_admin");
        
        if (potentialUser.isPresent()) {
            User user = potentialUser.get();
            if ("super_admin".equals(user.getRole())) {
                if (passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                    String token = jwtService.generateToken(user.getId(), user.getEmail(), null, user.getRole());
                    
                    Map<String, Object> data = new HashMap<>();
                    data.put("token", token);
                    data.put("expiresIn", 86400);
                    data.put("user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "role", user.getRole(),
                        "tenantId", "system" // Return "system" or null, frontend might expect a string
                    ));
                    return ApiResponse.success("Login successful", data);
                }
                // If password wrong, fall through to standard check or throw bad creds?
                // Better to throw bad creds here to avoid ambiguity if they *tried* to be super admin
                throw new org.springframework.security.authentication.BadCredentialsException("Invalid credentials");
            }
        }

        // 2. Standard Tenant-Scoped Login
        Tenant tenant = tenantRepository.findBySubdomain(request.getTenantSubdomain())
                .orElseThrow(() -> new com.saas.platform.core.exception.TenantNotFoundException("Tenant not found with subdomain: " + request.getTenantSubdomain()));

        User user = userRepository.findByEmailAndTenantId(request.getEmail(), tenant.getId())
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getTenantId(), user.getRole());
        
        // --- Added: Save Session to Database (Requirement 6) ---
        try {
            Session session = new Session();
            session.setId(UUID.randomUUID().toString());
            session.setUserId(user.getId());
            session.setTenantId(user.getTenantId());
            session.setSessionToken(token);
            session.setCreatedAt(LocalDateTime.now());
            session.setExpiresAt(LocalDateTime.now().plusDays(1));
            sessionRepository.save(session);
        } catch (Exception e) {
            // Log and continue if session save fails (non-critical for login success)
            System.err.println("Warning: Could not save session record: " + e.getMessage());
        }
        // --------------------------------------------------------

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
        auditLogger.log("USER_LOGOUT", "user", SecurityUtils.getCurrentUserId(), SecurityUtils.getCurrentUserId(), "User logged out");
        return ApiResponse.success("Logged out successfully", null);
    }
}