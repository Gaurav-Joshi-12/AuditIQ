# Docker Basics to Advanced (AuditIQ Implementation)

## 1. What is Docker?
Docker is a tool that packages an application and all its dependencies (Java, Node.js, libraries) into a standardized unit called a **Container**. This guarantees that the software will always run exactly the same, regardless of whether it's on your Mac, a teammate's Windows machine, or an AWS server.

## 2. Images vs. Containers
- **Image:** A read-only template containing the instructions for creating a container (like a blueprint). Example: `postgres:16`.
- **Container:** A runnable instance of an image. If the image is the blueprint, the container is the actual house built from it.

## 3. Dockerfiles (Advanced Multi-Stage Builds)
In both our frontend and backend, we wrote `Dockerfile`s using a technique called **Multi-Stage Builds**. This drastically reduces the final size of the image.

**Example: The Backend Dockerfile**
1. **Stage 1 (Build):** We start from an image that has the full Java Development Kit (`eclipse-temurin:21-jdk`). We copy our source code in, and run `./gradlew bootJar` to compile the app.
2. **Stage 2 (Run):** We start fresh from a much smaller, lightweight image that only has the Java Runtime Environment (`eclipse-temurin:21-jre`). We copy the compiled `.jar` file from Stage 1 into Stage 2.
**Why?** The final image doesn't contain the bulky compiler, source code, or gradle caches. It only contains what is strictly necessary to run the app.

**Example: The Frontend Dockerfile**
1. **Stage 1 (Build):** We use `oven/bun:1` to install dependencies and run `bun run build`. This generates a static folder of HTML/JS/CSS called `dist`.
2. **Stage 2 (Serve):** We use `nginx:alpine` (an incredibly fast web server). We copy the `dist` folder into Nginx. The final image doesn't contain Bun or Node at all!

## 4. Docker Compose
While a `Dockerfile` builds a single container, `docker-compose.yml` orchestrates multiple containers.
In our `docker-compose.yml`, we define 3 services:
1. `postgres`
2. `backend`
3. `frontend`

**Key Concepts in our Compose file:**
- **Volumes (`pgdata:/var/lib/postgresql/data`):** Containers are ephemeral (they forget everything when restarted). We mapped a volume to Postgres so the database data is persisted permanently on your hard drive even if the container dies.
- **Depends_On:** We told Docker that the `backend` depends on `postgres`. Docker will wait to start the backend until Postgres is healthy and ready to accept connections.
- **Networking:** Docker automatically creates an internal network. The backend doesn't connect to `localhost:5432`, it connects to `postgres:5432`. Docker automatically resolves the word `postgres` to the correct container's internal IP address!

## 5. Important Docker Commands

| Command | Explanation |
|---|---|
| `docker compose up --build -d` | The golden command. `--build` forces a fresh compile. `-d` runs it in the background (detached). |
| `docker compose down` | Stops and removes all containers and networks. |
| `docker compose down -v` | Dangerous! Stops everything AND deletes the database volumes (wiping all data). |
| `docker ps` | Lists all currently running containers and their exposed ports. |
| `docker logs auditiq-backend` | Prints the console output (logs) of the backend. Add `-f` to follow the logs live. |
| `docker exec -it auditiq-postgres bash` | Opens a live interactive terminal *inside* the running database container. |
