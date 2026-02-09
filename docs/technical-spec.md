# Technical Specification

## 1. Project Structure

The project follows a standard Maven/Spring Boot structure for the backend and a Vite/React structure for the frontend.

### Backend Structure (`/backend`)
*   `src/main/java/com/saas/platform`
    *   `core/`
        *   `config/`: Configuration classes (Security, WebMvc, Database).
        *   `common/`: Shared utilities (ApiResponse, Constants).
        *   `exception/`: Global exception handling.
        *   `middleware/`: Interceptors and filters (JwtAuthFilter, TenantFilter).
        *   `security/`: JWT and UserDetails implementations.
    *   `modules/`
        *   `auth/`: Authentication logic (Login, Register).
        *   `tenant/`: Tenant management.
        *   `user/`: User management.
        *   `project/`: Project management.
        *   `task/`: Task management.
*   `src/main/resources`
    *   `db/migration/`: Flyway SQL migration scripts.
    *   `application.yml`: Main configuration file.

### Frontend Structure (`/frontend`)
*   `src/`
    *   `components/`: Reusable UI components (Navbar, Sidebar, Button, Input).
    *   `pages/`: Page components corresponding to routes (Login, Dashboard, Projects).
    *   `context/`: React Context for state management (AuthContext).
    *   `hooks/`: Custom hooks.
    *   `utils/`: Utility functions (API client).

## 2. Development Setup Guide

### Prerequisites
*   **Java 17+**: Required for the backend.
*   **Node.js 18+**: Required for the frontend.
*   **Docker Desktop**: Required for containerization and database.
*   **Maven 3.8+**: Build tool for Java.

### Environment Variables
Variables are managed via `.env` file or Docker Compose environment mapping.
*   `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database connection details.
*   `JWT_SECRET`: Secret key for signing tokens.
*   `FRONTEND_URL`: URL of the frontend (for CORS).

### Running Locally (Manual)
1.  **Database**: Start MySQL using Docker: `docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8.0`
2.  **Backend**:
    ```bash
    cd backend
    ./mvnw spring-boot:run
    ```
3.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

### Running with Docker (Recommended)
The entire stack can be launched with a single command:
```bash
docker-compose up -d --build
```
This will start:
*   MySQL Database (Port 5432 external -> 3306 internal)
*   Spring Boot Backend (Port 5000)
*   React Frontend (Port 3000)

### Testing
*   **Postman Collection**: Import the provided collection to test API endpoints.
*   **JUnit Tests**: Run backend tests with `./mvnw test`.
