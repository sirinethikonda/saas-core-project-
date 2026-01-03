# SAAS.CORE Multi-Tenant Project Management System

SAAS.CORE is a full-stack, multi-tenant SaaS application designed for project and team management. The architecture ensures strict data isolation by partitioning all data via a unique tenant identifier across the frontend, API layer, and database.

##Technical Stack

**Backend:**

* Java 17 with Spring Boot 3 (Spring Security, Spring Data JPA) for robust server-side logic and multi-tenant filtering.

**Frontend:**

* React 18 with Vite, Tailwind CSS for professional UI, and Lucide Icons.
Backend: Spring Boot 3 with Java 17 and Spring Security.

**Database:**

* PostgreSQL for persistent, relational data storage.

**Networking:**

* Axios with global interceptors for handling JSON Web Tokens (JWT) and tenant headers.

**Orchestration:**

 Docker and Docker-Compose for containerized deployment.
 
**Key Features**

* Dashboard Analytics: Real-time stats for total projects, task counts, and completion percentages based on the authenticated tenant.

* Multi-Tenant Isolation: Every API request automatically attaches an X-Tenant-ID header to ensure users only access their organization's data.

* Project Workspace: Tools for creating projects, inline title editing, and archiving initiatives.

* Task Management: Kanban-style categorization (Todo, In-Progress, Completed) with priority levels and due-date tracking.

* Team Administration: Role-Based Access Control (RBAC) allowing admins to manage members, while standard users access only assigned workspaces.

**Project Structure**

```
multi-tenant-saas-backend/
├── src/main/java/com/saas/platform/
│   ├── MultiTenantSaaSApplication.java    # Main Entry Point
│   │
│   ├── core/                              # Infrastructure & Cross-cutting concerns
│   │   ├── config/                        # Spring Configuration
│   │   │   ├── SecurityConfig.java        # Security & RBAC setup
│   │   │   ├── WebMvcConfig.java          # CORS & Interceptors
│   │   │   └── DatabaseConfig.java        # MySQL & JPA settings
│   │   ├── security/                      # JWT & Auth logic
│   │   │   ├── JwtService.java            # Token generation/validation
│   │   │   ├── JwtAuthFilter.java         # Token extraction from headers
│   │   │   └── UserDetailsServiceImpl.java# Spring Security integration
│   │   ├── middleware/                    # SaaS Specific Logic
│   │   │   ├── TenantContext.java         # ThreadLocal storage for tenant_id
│   │   │   └── TenantInterceptor.java     # Extracts subdomain/tenant_id from requests
│   │   ├── exception/                     # Global Error Handling
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   └── TenantNotFoundException.java
│   │   └── common/                        # Generic Utilities
│   │       ├── ApiResponse.java           # Standard {success, message, data}
│   │       └── AuditLogger.java           # Shared Audit Logging service
│   │
│   └── modules/                           # Feature-based business logic
│       ├── auth/                          # Login & Tenant Registration
│       │   ├── AuthController.java
│       │   ├── AuthService.java
│       │   └── dto/ (LoginRequest, RegisterRequest)
│       ├── tenant/                        # Subscription & Plan management
│       │   ├── Tenant.java                # Entity
│       │   ├── TenantRepository.java
│       │   ├── TenantController.java
│       │   └── TenantService.java
│       ├── user/                          # Team Member Management
│       │   ├── User.java                  # Entity
│       │   ├── UserRepository.java
│       │   └── UserController.java
│       ├── project/                       # Projects Module
│       │   ├── Project.java               # Entity
│       │   ├── ProjectRepository.java
│       │   ├── ProjectService.java
│       │   └── ProjectController.java
│       ├── task/                          # Tasks Module
│       │   ├── Task.java                  # Entity
│       │   ├── TaskRepository.java
│       │   └── TaskController.java
│       └── audit/                         # Audit Logs Module
│           ├── AuditLog.java              # Entity
│           └── AuditLogRepository.java
│
├── src/main/resources/
│   ├── db/migration/                      # Flyway or Liquibase scripts (Recommended)
│   │   └── V1__initial_schema.sql
│   ├── application.yml                    # Configuration (DB, JWT, Ports)
│   └── application-dev.yml                # Development specific settings
│
├── Dockerfile                             # Mandatory Docker instructions
├── docker-compose.yml                     # Multi-service orchestration
├── pom.xml                                # Maven Dependencies
└── .env.example                           # Environment variables template

```
**Prerequisites**

* Docker Desktop installed and running.
* Node.js (for local development only).
* Java 17 and Maven (for local backend     development).

##Steps to Run the Application

**1. Build and Start Containers**

    Navigate to the root directory where the docker-compose.yml file is located and run the following command to build the images and start the services: docker-compose up --build -d
    
**2. Access the Application**

      Frontend: http://localhost:3000

** 3. Initialize Organization**

 * Go to the registration page.

 * Register a new account. This automatically creates a new Tenant ID for your organization.

 * Log in with the newly created Admin credentials.
 
**4. Create Project and Tasks**

 * Navigate to the Projects page and select "Create New Project".

 * Enter project details and save.

 * Open the project and use the Task Modal to assign team tasks.
 
###API Integration Details

 * The system relies on a global interceptor to maintain security. Every outgoing request includes:

     Authorization: Bearer <JWT_TOKEN>

     X-Tenant-ID: The unique identifier for the organization.


###Development and Troubleshooting

**Save All Edited Files**
 * In Spring Tool Suite 4 (STS4), always use the Save All command or Ctrl + Shift + S to ensure both frontend logic and backend controllers are synchronized before rebuilding containers
 
**Handling Data Patterns** 

 * The frontend uses a robust data picker to handle various Spring Boot JSON response formats (wrapped or flat) to ensure the UI remains responsive and counts are accurate.

 
     

         

