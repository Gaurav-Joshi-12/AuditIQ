# DTOs (Data Transfer Objects)

## 1. What is a DTO?
A DTO is a simple Java object used exclusively to transfer data between the frontend and the backend. 

## 2. Why not just send the Database Models?
If we return the full `User` entity from the database, we would accidentally send their hashed password to the frontend! By creating a specific `AuthResponse` DTO, we strictly control exactly what data leaves the server. Similarly, when logging in, we don't accept a full `User` object, we only accept a `LoginRequest` DTO containing just an email and password.

## 3. Lombok Annotations
Instead of writing hundreds of lines of getters, setters, and constructors, we use the **Lombok** library.
- **`@Data`:** Automatically generates getters, setters, `toString()`, and `equals()` behind the scenes.
- **`@Builder`:** Implements the Builder design pattern, allowing us to cleanly create objects like `AuthResponse.builder().token("xyz").role("ROLE_ORG").build();`
- **`@NoArgsConstructor` / `@AllArgsConstructor`:** Required by Spring/Jackson to automatically instantiate these objects when parsing incoming JSON.

## 4. Key DTOs in AuditIQ
- **`LoginRequest` / `AuthResponse`:** For authentication.
- **`QueryRequest` / `QueryResponse`:** For the RAG pipeline.
- **`PipelineResult` / `UploadResponse`:** To communicate the progress and results of the multi-agent audit pipeline.
