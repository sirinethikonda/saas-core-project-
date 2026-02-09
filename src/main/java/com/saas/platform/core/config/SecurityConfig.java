package com.saas.platform.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.saas.platform.core.middleware.TenantFilter;
import com.saas.platform.core.security.JwtAuthFilter;

import lombok.RequiredArgsConstructor;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final TenantFilter tenantFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Requirement: Stateless JWT
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Fixes Chrome Block
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Mandatory public access for Health Check and Auth
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/auth/register-tenant", "/api/auth/login").permitAll()
                
                // RBAC: Super Admin
                .requestMatchers(HttpMethod.GET, "/api/tenants").hasRole("super_admin")
                
                // RBAC: Tenant Admin / User Management
                .requestMatchers(HttpMethod.POST, "/api/tenants/*/users").hasRole("tenant_admin")
                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("tenant_admin")
                
                // Project & Task Management
                .requestMatchers("/api/projects/**", "/api/tasks/**").authenticated()
                
                .anyRequest().authenticated()
            );

        // Correct Filter Order: Auth Context must be established before Tenant check
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(tenantFilter, JwtAuthFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow the React frontend origin
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://frontend:3000", "http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Tenant-ID"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}