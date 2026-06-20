# Spring Boot Configurations

Configurations in Spring Boot define how the application behaves, connects to external services, and enforces global rules.

## 1. `application.properties`
This is the heart of our configuration. We set:
- **Database Connection:** URL (`jdbc:postgresql...`), username, and password.
- **Hibernate behavior:** `spring.jpa.hibernate.ddl-auto=update` tells Hibernate to automatically generate SQL schema based on our Java Entities.
- **File Upload Limits:** We allowed up to 50MB per file (`multipart.max-file-size=50MB`).
- **SMTP/Email:** Provided our Gmail credentials so the server can send reports.
- **Custom Secrets:** We defined `jwt.secret` and `gemini.api.key` here. In our Java code, we use `@Value("${gemini.api.key}")` to instantly inject these values into our classes.

## 2. `SecurityConfig.java`
As explained in the Security section, this class builds the `SecurityFilterChain`. It configures CORS (allowing our frontend to connect), disables CSRF, forces stateless sessions, and registers our `JwtFilter` to run before normal Spring Security checks.

## 3. `data.sql` and `schema.sql`
- **`schema.sql`:** Runs before Hibernate initializes. We used it to run `CREATE EXTENSION IF NOT EXISTS vector;` so the database supports embeddings.
- **`data.sql`:** Runs after Hibernate creates the tables. We used it to automatically insert a mock User (Gaurav) and a Company (Tata Motors) every time the app boots up, so we never start with an empty database.
