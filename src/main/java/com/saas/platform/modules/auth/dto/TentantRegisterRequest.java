package com.saas.platform.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TentantRegisterRequest {
    @NotBlank(message = "Organization name is required")
    private String tenantName;

    @NotBlank(message = "Subdomain is required")
    private String subdomain;

    @Email(message = "Valid email is required")
    private String adminEmail;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String adminPassword;

    @NotBlank(message = "Admin full name is required")
    private String adminFullName;
}