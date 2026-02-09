package com.saas.platform.core.config;

import com.saas.platform.modules.project.Project;
import com.saas.platform.modules.project.ProjectRepository;
import com.saas.platform.modules.task.Task;
import com.saas.platform.modules.task.TaskRepository;
import com.saas.platform.modules.tenant.Tenant;
import com.saas.platform.modules.tenant.TenantRepository;
import com.saas.platform.modules.user.User;
import com.saas.platform.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("Database already seeded. Skipping...");
            return;
        }

        System.out.println("Seeding database...");

        // 1. Create Super Admin
        User superAdmin = new User();
        superAdmin.setId(UUID.randomUUID().toString());
        superAdmin.setEmail("superadmin@system.com");
        superAdmin.setFullName("System Super Admin");
        superAdmin.setPasswordHash(passwordEncoder.encode("Admin@123"));
        superAdmin.setRole("super_admin");
        superAdmin.setIsActive(true);
        superAdmin.setTenantId(null); // Super admin has no tenant
        userRepository.save(superAdmin);

        // 2. Create Demo Tenant
        Tenant demoTenant = new Tenant();
        demoTenant.setId(UUID.randomUUID().toString());
        demoTenant.setName("Demo Company");
        demoTenant.setSubdomain("demo");
        demoTenant.setStatus("active");
        demoTenant.setSubscriptionPlan("pro");
        demoTenant.setMaxUsers(25);
        demoTenant.setMaxProjects(15);
        tenantRepository.save(demoTenant);

        // 3. Create Tenant Admin
        User tenantAdmin = new User();
        tenantAdmin.setId(UUID.randomUUID().toString());
        tenantAdmin.setTenantId(demoTenant.getId());
        tenantAdmin.setEmail("admin@demo.com");
        tenantAdmin.setFullName("Demo Admin");
        tenantAdmin.setPasswordHash(passwordEncoder.encode("Demo@123"));
        tenantAdmin.setRole("tenant_admin");
        tenantAdmin.setIsActive(true);
        userRepository.save(tenantAdmin);

        // 4. Create Regular Users
        User user1 = createUser(demoTenant.getId(), "user1@demo.com", "User One");
        User user2 = createUser(demoTenant.getId(), "user2@demo.com", "User Two");

        // 5. Create Projects
        Project projectAlpha = createProject(demoTenant.getId(), tenantAdmin.getId(), "Project Alpha", "First demo project");
        Project projectBeta = createProject(demoTenant.getId(), tenantAdmin.getId(), "Project Beta", "Second demo project");

        // 6. Create Tasks
        createTask(projectAlpha, demoTenant.getId(), "Setup Environment", "low", user1.getId());
        createTask(projectAlpha, demoTenant.getId(), "Design DB Schema", "high", user1.getId());
        createTask(projectBeta, demoTenant.getId(), "Frontend Mockups", "medium", user2.getId());

        System.out.println("Database seeding completed successfully.");
    }

    private User createUser(String tenantId, String email, String fullName) {
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setTenantId(tenantId);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPasswordHash(passwordEncoder.encode("User@123"));
        user.setRole("user");
        user.setIsActive(true);
        return userRepository.save(user);
    }

    private Project createProject(String tenantId, String createdBy, String name, String description) {
        Project project = new Project();
        project.setId(UUID.randomUUID().toString());
        project.setTenantId(tenantId);
        project.setName(name);
        project.setDescription(description);
        project.setStatus("active");
        project.setCreatedBy(createdBy);
        project.setTaskCount(0);
        project.setCompletedTaskCount(0);
        return projectRepository.save(project);
    }

    private void createTask(Project project, String tenantId, String title, String priority, String assignedTo) {
        Task task = new Task();
        task.setId(UUID.randomUUID().toString());
        task.setProjectId(project.getId());
        task.setTenantId(tenantId);
        task.setTitle(title);
        task.setDescription("Auto-generated task definition");
        task.setStatus("todo");
        task.setPriority(priority);
        task.setAssignedTo(assignedTo);
        task.setDueDate(LocalDate.now().plusDays(7));
        taskRepository.save(task);
    }
}
