# Research & Requirements Analysis

## 1. Multi-Tenancy Analysis

Multi-tenancy is a fundamental software architecture where a single instance of a software application serves multiple customers, known as tenants. Each tenant is a group of users who share a common access with specific privileges to the software instance. In a SaaS (Software as a Service) environment, choosing the right multi-tenancy model is a critical decision that impacts data isolation, scalability, cost, and maintenance. We have analyzed three primary architectural patterns:

### Detailed Comparison of Approaches

| Approach | Description | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **Separate Database per Tenant** | Each tenant has its own physical database instance or a separate database within a shared server. | • **Maximum Isolation**: Zero risk of data leaking between tenants at the database level.<br>• **Customization**: Easier to implement tenant-specific database configurations or schemas.<br>• **Compliance**: Meets strict regulatory requirements for data sovereignty.<br>• **Backup/Restore**: Granular control over individual tenant data lifecycle. | • **High Cost**: Significant infrastructure overhead for maintaining hundreds of small databases.<br>• **Maintenance Nightmare**: Migrating 1,000 databases during a schema update is extremely complex.<br>• **Resource Underutilization**: Many small databases remain idle, wasting CPU and RAM. |
| **Separate Schema per Tenant** | Tenants share a single database server and instance but are logically separated into different namespaces (schemas). | • **Balanced Isolation**: Provides logical separation while sharing hardware resources.<br>• **Performance**: Better resource sharing than the separate database model.<br>• **Development**: SQL queries don't need to specify tenant ID filters manually. | • **Complexity**: Managing schema migrations across hundreds of schemas requires specialized tooling.<br>• **Connection Pooling**: Can lead to "connection exhaustion" if each schema requires its own pool.<br>• **Backup/Restore**: Harder to restore a single tenant compared to separate databases. |
| **Shared Database & Shared Schema (Discriminator Column)** | All tenants share the same database and the same set of tables. Rows are distinguished by a mandatory `tenant_id` column. | • **Cost Efficiency**: Lowest possible infrastructure cost. Ideal for high-volume, low-resource tenants.<br>• **Operational Simplicity**: A single database to monitor, backup, and migrate.<br>• **Seamless Scalability**: New tenants are added simply by inserting rows, no DDL operations required. | • **Isolation Risk**: A bug in the application layer could accidentally leak data between tenants.<br>• **"Noisy Neighbor" Effect**: A single high-traffic tenant can degrade performance for all others.<br>• **Global Backup**: Restoring a single tenant from a global backup is a complex manual process. |

### Chosen Strategy: Shared Schema (Discriminator Column)

For the **SaaS Core Project**, we have selected the **Shared Schema** approach. This decision was guided by several factors tailored to modern SaaS development:

1.  **Scale and Density**: Our target persona includes many small-to-medium organizations. Provisioning separate databases for each would lead to massive resource waste. The shared schema allows us to pack thousands of tenants onto a single optimized database cluster.
2.  **Developer Experience (DX)**: Using a discriminator column is the most "Spring-idiomatic" way to handle multi-tenancy. With Hibernate's `@Filter` or Spring Data JPA's custom base repositories, we can automatically append `WHERE tenant_id = ?` to every query, making the isolation transparent to the developer.
3.  **CI/CD Speed**: Database migrations (using Flyway or Liquibase) are significantly faster when applied to a single schema. This allows for rapid iteration and frequent releases, a hallmark of successful SaaS products.
4.  **Operational Monitoring**: Monitoring a single database instance with high-quality metrics is easier and more effective than monitoring a fragmented fleet of small databases. We can focus on optimizing indexes and query performance globally.

### Schema Migration Strategy
A critical challenge in Shared Schema multi-tenancy is managing zero-downtime migrations. Our strategy involves:
- **Forward-Compatible Changes**: Ensuring all DDL operations are backward compatible with the previous application version.
- **Asynchronous Data Refactoring**: For large-scale data changes, we use a "double-write" pattern or background batch jobs to avoid locking tables for all tenants simultaneously.
- **Pre-migration Validation**: Automated tests run migrations against a sanitized copy of production data before any deployment.

### Scalability Considerations
While the shared schema provides the highest density, we mitigate its limitations via:
- **Read-Write Splitting**: Using MySQL replication to offload read traffic to multiple read-replicas.
- **Sharding (Future Phase)**: If the single database reaches physical limits, we can "shard" by grouping subsets of tenants into different database clusters, effectively combining the Shared Schema and Separate Database models.

---

## 2. Technology Stack Justification

Selecting the right technology stack is about balancing mature reliability with developer productivity and performance.

### Backend: Java 17 + Spring Boot 3
*   **Why**: Java remains the backbone of enterprise software due to its performance, strict type safety, and massive ecosystem. Java 17 (LTS) introduces modern features like records and sealed classes that reduce boilerplate. Spring Boot 3 provides a production-ready framework that handles security, data access, and RESTful API patterns out of the box. Its support for AOT (Ahead-Of-Time) compilation and GraalVM makes it future-proof for cloud-native deployments.
*   **Alternatives**: While Node.js offers fast prototyping, the "callback hell" (even with async/await) and lack of robust multi-threaded processing make it less suitable for complex multi-tenant logic where data integrity is the highest priority.

### Frontend: React 18 + Tailwind CSS
*   **Why**: React's declarative nature and component-based architecture allow us to build complex, stateful UIs (like project dashboards) with ease. React 18's concurrent features ensure a smooth user experience even under heavy load. Tailwind CSS was chosen for its "utility-first" approach, which eliminates the need for writing custom CSS files and ensures a design system that is both consistent and highly performant due to its purge logic.
*   **Alternatives**: Angular provides a more rigid "batteries-included" framework, but React's flexibility and the availability of hooks make it more adaptable for the dynamic dashboards required in this SaaS.

### Database: MySQL 8.0
*   **Why**: MySQL 8.0 is a battle-tested relational database that offers excellent performance for read-heavy SaaS applications. Its support for JSON columns allows for semi-structured data where needed, while maintaining the rigor of a relational schema. MySQL's simple replication and backup tools make it ideal for the "Shared Schema" model we've chosen.
*   **Alternatives**: PostgreSQL is often touted as the "advanced" alternative. While true for complex spatial data or advanced indexing, MySQL is faster for simple, high-concurrency read/write operations typical of a task management system.

### Authentication & Authorization: JWT + Spring Security
*   **Why**: Statelessness is key to horizontal scaling. By using **JSON Web Tokens (JWT)**, we avoid the need for server-side sessions, reducing memory overhead and complexity. Spring Security provides a robust framework for implementing Role-Based Access Control (RBAC), ensuring that "Super Admins", "Tenant Admins", and "Users" can only access the resources they are authorized to see.
*   **Tenant Identification**: We embed the `tenantId` directly into the JWT payload. This ensures that every request is self-describing and the backend can immediately identify the tenant context without an extra database lookup.

---

## 3. Security Considerations

Security in a multi-tenant environment is not a single feature; it's a multi-layered strategy.

### Data Isolation Strategy
Our primary security goal is ensuring that Tenant A can never see Tenant B's data. We achieve this through:
1.  **Mandatory Filtering**: Every query executed by the JPA layer is automatically intercepted and appended with a `tenant_id` filter based on the authenticated user's context.
2.  **API Level Validation**: Even if a user knows a `projectId` from another tenant, the API will verify that the project belongs to the user's `tenantId` before returning any data.

### Authentication & Authorization
*   **Stateless JWT**: Tokens are signed with a HMAC SHA-256 secret. We enforce a 24-hour expiration to minimize the window of risk if a token is compromised.
*   **Composite Keys in App Logic**: Although the database uses UUIDs, our application logic often treats `(tenant_id, resource_id)` as the logical primary key for lookups.

### Communication & Storage
*   **Password Hashing**: We use **BCrypt** with a high cost factor (12) for all user passwords. We never store or log passwords in plain text.
*   **CORS Protection**: The backend is configured to only accept requests from our specific frontend domain, preventing cross-origin attacks.
*   **Audit Logging**: Every sensitive action (creating a project, deleting a user, changing a role) is recorded in the `audit_logs` table with the user's IP address and a timestamp. This provides a trail for investigating any suspicious activity.

### Infrastructure Security
*   **Docker Isolation**: Each service (DB, Backend, Frontend) runs in its own container with limited internal network exposure.
*   **Environment Variables**: Sensitive configuration (DB passwords, JWT secrets) is never committed to version control. It is injected via environment variables at runtime.
