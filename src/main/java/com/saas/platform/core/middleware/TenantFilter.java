package com.saas.platform.core.middleware;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class TenantFilter extends OncePerRequestFilter {

    private static final String TENANT_HEADER = "X-Tenant-ID";

    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) 
                                    throws ServletException, IOException {
        
        String tenantId = request.getHeader(TENANT_HEADER);

        try {
            if (tenantId != null && !tenantId.isEmpty()) {
                // Set the tenant ID for the current thread
                TenantContext.setCurrentTenant(tenantId);
            }
            
            filterChain.doFilter(request, response);
            
        } finally {
            // CRITICAL: Clear context after request to prevent cross-tenant data leaking
            TenantContext.clear();
        }
    }
}