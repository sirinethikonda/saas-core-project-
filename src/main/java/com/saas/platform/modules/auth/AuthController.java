package com.saas.platform.modules.auth;

import com.saas.platform.core.common.ApiResponse;
import com.saas.platform.core.security.CustomUserDetails;
import com.saas.platform.core.security.SecurityUtils;
import com.saas.platform.modules.auth.dto.LoginRequest;
import com.saas.platform.modules.auth.dto.TenantRegisterRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register-tenant")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<?> register(@Valid @RequestBody TenantRegisterRequest request) {
        return authService.registerTenant(request);
    }

    @PostMapping("/login")
    public ApiResponse<?> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // API 3: Get Current User (Me)
    @GetMapping("/me")
    public ApiResponse<?> getCurrentUser() {
        String email = SecurityUtils.getCurrentUserDetails() != null ? SecurityUtils.getCurrentUserDetails().getEmail() : null;
        if (email == null) {
            throw new org.springframework.security.access.AccessDeniedException("No authentication found");
        }
        return authService.getCurrentUser(email);
    }

    // API 4: Logout - Satisfies Requirement 3.1
    @PostMapping("/logout")
    public ApiResponse<?> logout() {
        return authService.logout();
    }
}