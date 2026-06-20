# Spring Boot Basics & Architecture

## 1. What is Spring Boot?
Spring Boot is an extension of the Java Spring Framework. It eliminates boilerplate configuration, providing "opinionated defaults" so you can get a production-ready application up and running instantly. It comes with an embedded Tomcat web server.

## 2. Gradle vs Maven
We used **Gradle** (specifically the Kotlin/Groovy DSL) as our build tool. Like Maven, it manages dependencies (fetching libraries like PostgreSQL drivers or Spring Web from the internet). However, Gradle is generally faster than Maven because it uses incremental builds and a build cache.

## 3. The MVC Architecture
Spring Boot strictly follows the MVC (Model-View-Controller) pattern, though in a REST API, the "View" is just JSON data.
- **Model:** Entities mapped to the database (e.g., `User.java`, `Transaction.java`).
- **Controller:** The endpoints that accept HTTP requests (e.g., `AuthController.java`).
- **Service Layer:** We add an extra "Service" layer between Controllers and Models to hold our business logic.

## 4. Microservices Concept
While AuditIQ is currently a "Monolith" (one big backend), its internal architecture is designed like Microservices. 
We separated the AI Logic (`PipelineService`), the Database Logic (`Repositories`), and the File Handling (`UploadService`). If this application scales to millions of users, we could easily split the AI Pipeline into its own separate server (a true microservice).
