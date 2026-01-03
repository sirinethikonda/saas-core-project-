package com.saas.platform.modules.user;

import com.saas.platform.core.common.ApiResponse;
import com.saas.platform.core.middleware.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/tenants/{tenantId}/users")
    @PreAuthorize("hasAnyRole('ROLE_tenant_admin', 'ROLE_user')")
    public ApiResponse<?> listUsers(@PathVariable String tenantId) {
        String currentTenantId = TenantContext.getCurrentTenant();
        if (!currentTenantId.equals(tenantId)) {
            return ApiResponse.error("Access Denied: You cannot view users of another organization.");
        }
        return ApiResponse.success("Users fetched successfully", userService.getTenantUsers(tenantId));
    }

    @PostMapping("/tenants/{tenantId}/users")
    @PreAuthorize("hasRole('ROLE_tenant_admin')")
    public ApiResponse<?> createUser(@PathVariable String tenantId, @RequestBody User user) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.addUser(tenantId, user, adminEmail);
    }

    @PutMapping("/users/{userId}")
    @PreAuthorize("hasAnyRole('ROLE_tenant_admin', 'ROLE_user')")
    public ApiResponse<?> updateUser(@PathVariable String userId, @RequestBody User updates) {
        String currentTenantId = TenantContext.getCurrentTenant();
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.updateUser(userId, updates, currentTenantId, adminEmail);
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ROLE_tenant_admin')")
    public ApiResponse<?> deleteUser(@PathVariable String userId) {
        String tenantId = TenantContext.getCurrentTenant(); 
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.deleteUser(userId, tenantId, adminEmail);
    }
}