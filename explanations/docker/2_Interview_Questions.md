# Docker Interview Questions & Answers

If an interviewer asks you about the Docker implementation in AuditIQ, use these detailed, convincing answers.

## Q1: Why did you choose to Dockerize this application?
**Answer:** "I Dockerized AuditIQ to eliminate the 'it works on my machine' problem and to streamline onboarding and deployment. Because this project relies on a very specific PostgreSQL extension (`pgvector`), expecting another developer to manually install Postgres 16 and compile the vector extension natively is error-prone. By orchestrating the frontend, backend, and `pgvector` database with Docker Compose, anyone can spin up the entire multi-tier architecture with a single `docker compose up` command. It also makes CI/CD and cloud deployment trivial."

## Q2: I see you used Multi-Stage Builds in your Dockerfiles. Why? What problem does that solve?
**Answer:** "Multi-stage builds allow me to keep my final production images incredibly lean and secure. For example, in the backend, I need the full JDK and Gradle daemon to compile the Spring Boot application, which is a massive image. In Stage 1, I perform the build. In Stage 2, I start from a much smaller JRE-only image and just copy the compiled `.jar` over. This strips out all the source code, build tools, and local caches from the final image. It drastically reduces the image size, speeds up deployments, and minimizes the security attack surface."

## Q3: How are the containers communicating with each other?
**Answer:** "Docker Compose automatically sets up a custom bridge network for the stack. This allows containers to communicate via DNS using their service names. So my Spring Boot backend connects to the database via `jdbc:postgresql://postgres:5432` instead of `localhost`. However, the frontend is a bit different; because the React code actually executes in the user's browser (outside of the Docker network), it still connects to `localhost:8082` to reach the backend API."

## Q4: Containers are ephemeral. How are you preventing data loss in your database if the container restarts?
**Answer:** "I used Docker Named Volumes. In my `docker-compose.yml`, I mapped a volume `pgdata` to `/var/lib/postgresql/data` inside the Postgres container. This tells the Docker Engine to store the database files directly on the host machine's filesystem. Even if I destroy the container or update the Postgres image, the data persists safely in that volume."

## Q5: How do you handle secrets and environment variables in Docker?
**Answer:** "I strictly avoid hardcoding secrets in the Dockerfile, as they would be exposed in the image layers. Instead, I use an `.env` file at the root of the project, which is safely added to `.gitignore`. My `docker-compose.yml` dynamically injects these variables (like the Gemini API Key) into the backend container at runtime using `${GEMINI_API_KEY}`. This keeps the images clean and secure."

## Q6: Why did you use Nginx for the frontend instead of just running the Node/Bun server?
**Answer:** "A React application built with Vite is ultimately just static HTML, CSS, and JS files. Running a full Node.js or Bun server just to serve static files is resource-heavy and unnecessary for production. Nginx is a highly optimized, lightweight web server built specifically for serving static assets. By using the `nginx:alpine` image, the frontend container consumes almost zero RAM and serves the UI significantly faster."
