package com.saas.platform.modules.auth;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Session {
    @Id
    private String id;
    private String userId;
    private String tenantId;
    private String sessionToken;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
