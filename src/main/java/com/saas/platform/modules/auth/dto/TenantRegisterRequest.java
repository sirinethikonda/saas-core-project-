package com.saas.platform.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantRegisterRequest {
    @NotBlank(message = "Tenant name is required")
    private String tenantName;

    @NotBlank(message = "Subdomain is required")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Subdomain can only contain lowercase letters, numbers, and hyphens")
    private String subdomain;

    @NotBlank(message = "Admin email is required")
    @Email(message = "Invalid email format")
    private String adminEmail;

    @NotBlank(message = "Admin password is required")
    private String adminPassword;

    @NotBlank(message = "Admin full name is required")
    private String adminFullName;
}
