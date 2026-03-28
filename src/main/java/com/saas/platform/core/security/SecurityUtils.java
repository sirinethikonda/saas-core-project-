package com.saas.platform.core.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static CustomUserDetails getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            return (CustomUserDetails) authentication.getPrincipal();
        }
        return null;
    }

    public static String getCurrentUserId() {
        CustomUserDetails details = getCurrentUserDetails();
        return (details != null) ? details.getUserId() : null;
    }

    public static String getCurrentTenantId() {
        CustomUserDetails details = getCurrentUserDetails();
        return (details != null) ? details.getTenantId() : null;
    }

    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        // Normalize role name (e.g., adding ROLE_ if missing)
        String r = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals(r) 
                                            || grantedAuthority.getAuthority().equals(role));
    }
}
