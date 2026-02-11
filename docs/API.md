# API Documentation

## Authentication Module

### 1. Register Tenant
*   **Endpoint:** `POST /api/auth/register-tenant`
*   **Auth:** Public
*   **Body:**
    ```json
    {
     "tenantName": "Sri Corp",
     "subdomain": "srinih",
     "adminFullName": "Siri",
     "adminEmail": "Email",
     "adminPassword": "Password"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Tenant registered successfully",
      "data": { "tenantId": "uuid..." }
    }
    ```

### 2. User Login
*   **Endpoint:** `POST /api/auth/login`
*   **Auth:** Public
*   **Body:**
    ```json
     {
      "email": "Email",
      "password": "Password",
      "tenantSubdomain": "srinih"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "token": "jwt.token.here",
        "user": { ... }
      }
    }
    ```

### 3. Get Current User
*   **Endpoint:** `GET /api/auth/me`
*   **Auth:** Bearer Token
*   **Response (200 OK):** Returns full user and tenant profile.

### 4. Logout
*   **Endpoint:** `POST /api/auth/logout`
*   **Auth:** Bearer Token
*   **Response (200 OK):** Logs out user (client should clear token).

---

## Tenant Management

### 5. Get Tenant Details
*   **Endpoint:** `GET /api/tenants/{id}`
*   **Auth:** Tenant Admin or Super Admin
*   **Response:** Tenant details including usage stats.

### 6. Update Tenant
*   **Endpoint:** `PUT /api/tenants/{id}`
*   **Auth:** Tenant Admin (name only) or Super Admin (all fields)
*   **Body:** `{ "name": "New Name" }`

### 7. List All Tenants
*   **Endpoint:** `GET /api/tenants`
*   **Auth:** Super Admin ONLY
*   **Response:** Paginated list of all tenants.

---

## User Management

### 8. Add User
*   **Endpoint:** `POST /api/tenants/{id}/users`
*   **Auth:** Tenant Admin
*   **Body:**
    ```json
    {
      "email": "User_Email",
      "fullName": "SiriNethi",
      "password": "User_Password",
      "role": "user"
    }
    ```

### 9. List Users
*   **Endpoint:** `GET /api/tenants/{id}/users`
*   **Auth:** Member of Tenant

### 10. Update User
*   **Endpoint:** `PUT /api/users/{id}`
*   **Auth:** Tenant Admin or Self (limited)

### 11. Delete User
*   **Endpoint:** `DELETE /api/users/{id}`
*   **Auth:** Tenant Admin

---

## Project Management

### 12. Create Project
*   **Endpoint:** `POST /api/projects`
*   **Auth:** Member of Tenant
*   **Body:** `{ "name": "Project X", "description": "..." }`

### 13. List Projects
*   **Endpoint:** `GET /api/projects`
*   **Auth:** Member of Tenant
*   **Params:** `?status=active&page=1`

### 14. Update Project
*   **Endpoint:** `PUT /api/projects/{id}`
*   **Auth:** Admin or Creator

### 15. Delete Project
*   **Endpoint:** `DELETE /api/projects/{id}`
*   **Auth:** Admin or Creator

---

## Task Management

### 16. Create Task
*   **Endpoint:** `POST /api/projects/{id}/tasks`
*   **Auth:** Member of Tenant
*   **Body:** `{ "title": "Fix bug", "assignedTo": "uuid..." }`

### 17. List Tasks
*   **Endpoint:** `GET /api/projects/{id}/tasks`
*   **Auth:** Member of Tenant

### 18. Update Task Status
*   **Endpoint:** `PATCH /api/tasks/{id}/status`
*   **Body:** `{ "status": "completed" }`

### 19. Update Task
*   **Endpoint:** `PUT /api/tasks/{id}`
*   **Body:** Full task object update.
