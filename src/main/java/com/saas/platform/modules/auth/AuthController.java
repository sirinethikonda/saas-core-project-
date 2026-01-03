package com.saas.platform.modules.auth;

import com.saas.platform.core.common.ApiResponse;
import com.saas.platform.modules.auth.dto.LoginRequest;
import com.saas.platform.modules.auth.dto.TentantRegisterRequest;
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
    public ApiResponse<?> register(@Valid @RequestBody TentantRegisterRequest request) {
        return authService.registerTenant(request);
    }

    @PostMapping("/login")
    public ApiResponse<?> login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // API 3: Get Current User (Me) - Satisfies Requirement 3.1
    @GetMapping("/me")
    public ApiResponse<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // auth.getName() returns the email stored in the JWT Subject
        return authService.getCurrentUser(auth.getName());
    }

    // API 4: Logout - Satisfies Requirement 3.1
    @PostMapping("/logout")
    public ApiResponse<?> logout() {
        return authService.logout();
    }
}