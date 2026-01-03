package com.saas.platform.core.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.saas.platform.core.middleware.TenantInterceptor;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor // This handles the injection of TenantInterceptor automatically
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    private final TenantInterceptor tenantInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // This registers our tenant identification logic for every request
        registry.addInterceptor(tenantInterceptor)
                .addPathPatterns("/**") // Apply to all routes
                .excludePathPatterns("/api/auth/**"); // Optionally exclude auth routes if needed
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Mandatory for Docker: Backend must accept requests from frontend container
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://frontend:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
    
}