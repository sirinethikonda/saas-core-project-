package com.saas.platform.core.middleware;

import com.saas.platform.modules.tenant.TenantRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class TenantInterceptor implements HandlerInterceptor {

    private final TenantRepository tenantRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 1. Logic to identify tenant by subdomain (e.g., demo.saas.com)
        String serverName = request.getServerName();
        String subdomain = null;

        if (serverName != null && serverName.contains(".")) {
            subdomain = serverName.split("\\.")[0];
        }

        // 2. If a subdomain is found, we verify it exists and optionally set context
        // Note: For authenticated APIs, JwtAuthFilter takes priority. 
        // This is useful for public tenant-specific branding or registration checks.
        if (subdomain != null && !subdomain.equals("www") && !subdomain.equals("localhost")) {
            final String finalSubdomain = subdomain;
            tenantRepository.findBySubdomain(finalSubdomain).ifPresent(tenant -> {
                // If not already set by JWT, set it here for public tenant routes
                if (TenantContext.getCurrentTenant() == null) {
                    TenantContext.setCurrentTenant(tenant.getId());
                }
            });
        }

        return true; // Continue request
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // Safety net: Always clear context after request completion
        TenantContext.clear();
    }
}