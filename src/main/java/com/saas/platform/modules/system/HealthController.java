package com.saas.platform.modules.system;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/health")
    public Map<String, String> checkHealth() {
        Map<String, String> response = new HashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            response.put("status", "ok");
            response.put("database", "connected");
        } catch (Exception e) {
            response.put("status", "error");
            response.put("database", "disconnected");
        }
        return response;
    }
}