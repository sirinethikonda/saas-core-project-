# Research & Requirements Analysis

## 1. Multi-Tenancy Analysis

Multi-tenancy is a software architecture where a single instance of software serves multiple tenants. A tenant is a group of users who share a common access with specific privileges to the software instance. In our SaaS platform, we evaluated three common approaches:

### Comparison of Approaches

| Approach | Description | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **Database per Tenant** | Each tenant has their own separate database. | • Highest data isolation security<br>• Easy backup/restore per tenant<br>• No "noisy neighbor" effect | • High infrastructure cost<br>• Complex deployment & maintenance<br>• Resource inefficient for small tenants |
| **Schema per Tenant** | Shared database, but each tenant has a separate schema (namespace). | • Good logical isolation<br>• Shared hardware resources<br>• Moderate cost | • Complex migration management<br>• Database connection overhead<br>• Backup/restore per tenant is harder than DB-per-tenant |
| **Shared Schema (Discriminator)** | All tenants share same tables; rows distinguished by `tenant_id`. | • Lowest cost & resource usage<br>• Easiest to maintain & deploy<br>• Seamless scalability for many small tenants | • Lowest data isolation (risk of data leak)<br>• Requires strict application-level security<br>• Backup/restore per tenant is difficult |

### Selected Approaches: Shared Schema (Discriminator)

For this **SaaS Core Project**, we have selected the **Shared Schema** approach using a `tenant_id` discriminator column in every table (except global system tables).

**Justification:**
1.  **Simplicity & Speed**: This approach is the fastest to implement and deploy, fitting the timeline of a boilerplate project.
2.  **Resource Efficiency**: Since we are targeting a uniform distribution of small-to-medium tenants, a single database instance is far more cost-effective than provisioning hundreds of separate schemas or databases.
3.  **Modern tooling support**: Frameworks like Spring Boot (with Hibernate filters) make implementing the `tenant_id` filter transparent and robust, mitigating the security risks associated with shared schemas.
4.  **MySQL Compatibility**: MySQL's schema management is different from PostgreSQL's; the "Schema per Tenant" pattern is less idiomatic in MySQL than in PostgreSQL. Shared tables work natively and performantly.

## 2. Technology Stack Justification

### Backend: Java 17 + Spring Boot 3
*   **Why**: Spring Boot is the industry standard for enterprise Java applications. It provides robust dependency injection, security (Spring Security), and data access (Spring Data JPA) out of the box. Java 17 is the latest long-term support (LTS) version, offering performance improvements and modern syntax.
*   **Alternatives**: Node.js (Express/NestJS) or Python (Django/FastAPI). While faster to prototype, they lack the strict type safety and mature enterprise ecosystem of Spring, which is crucial for complex multi-tenant logic.

### Frontend: React 18 + Tailwind CSS
*   **Why**: React's component-based architecture is ideal for dynamic dashboards. Tailwind CSS allows for rapid UI development with a utility-first approach, making it easy to implement a consistent design system.
*   **Alternatives**: Angular or Vue. React was chosen for its massive ecosystem and flexibility.

### Database: MySQL 8.0
*   **Why**: Reliable, widely used relational database. It offers excellent read performance and is easy to containerize.
*   **Alternatives**: PostgreSQL. PostgreSQL is technically superior for complex queries and JSON handling, but MySQL was chosen based on specific constraint requirements for this project implementation.

### Authentication: JWT (JSON Web Tokens)
*   **Why**: Stateless authentication is essential for scalable REST APIs. JWTs allow us to embed the `tenant_id` and `role` directly into the token, enabling the backend to stateless-ly verify access without a database lookup on every request.
*   **Alternatives**: Session-based auth. Sessions require server-side state (Redis/DB), making horizontal scaling harder and adding latency.

### Containerization: Docker & Docker Compose
*   **Why**: Ensures consistency across development and production environments. "It works on my machine" is eliminated.

## 3. Security Considerations

For a multi-tenant system, security is paramount. We implemented the following measures:

1.  **Strict Data Isolation via Middleware**: We do not rely solely on developers remembering to add `WHERE tenant_id = ?`. A global Spring Security filter and Hibernate `@Filter` (or repository base methods) automatically enforce tenant isolation based on the JWT context.
2.  **Role-Based Access Control (RBAC)**: We enforce three distinct roles (Super Admin, Tenant Admin, User). API endpoints use `@PreAuthorize` annotations to ensure only authorized roles can perform sensitive actions (e.g., only Tenant Admins can add users).
3.  **Stateless Authentication with Expiry**: JWTs are signed with a strong secret and have a strict 24-hour expiration. No sensitive data (passwords) is ever stored in the token.
4.  **Password Hashing**: All passwords are hashed using **BCrypt** before storage. We never store plain-text credentials.
5.  **Input Validation & Sanitization**: All incoming requests are validated (e.g., email format, password length) to prevent injection attacks and ensure data integrity.
