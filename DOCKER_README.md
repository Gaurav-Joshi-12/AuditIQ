# Running AuditIQ with Docker

This guide explains how to run the entire AuditIQ stack (PostgreSQL + pgvector,
Spring Boot backend, React frontend) on any machine using Docker — no manual
installation of Java, Gradle, Node, PostgreSQL, or pgvector required.

---

## What You Need Before Starting

1. **Docker Desktop** — download from https://www.docker.com/products/docker-desktop
   - Mac (Apple Silicon / M1, M2, M3): choose the Apple Silicon version
   - Mac (Intel): choose the Intel chip version
   - Windows: choose the Windows version (requires WSL2, Docker's installer
     handles this automatically)
   - Open Docker Desktop after installing and wait for the whale icon in your
     menu bar / system tray to go steady (not animating) — this means it's
     ready to use

2. **A free Gemini API key** — required for the AI query/chatbot feature
   - Go to https://aistudio.google.com/apikey
   - Sign in with a Google account
   - Click "Create API Key"
   - Copy the key somewhere safe — you'll paste it in shortly

3. **Git** — to clone the repository
   - Mac: usually pre-installed; check with `git --version`
   - Windows: download from https://git-scm.com

That's everything. You do NOT need to install Java, Gradle, Node.js, Bun,
PostgreSQL, or pgvector separately — Docker handles all of this internally.

---

## Step 1 — Verify Docker Is Installed Correctly

Open a terminal (Terminal on Mac, PowerShell or Command Prompt on Windows)
and run:

```bash
docker --version
docker compose version
```

Both commands should print a version number with no errors. If either fails,
open Docker Desktop and make sure it's fully started, then try again.

---

## Step 2 — Clone the Repository

```bash
git clone https://github.com/your-username/auditiq.git
cd auditiq
```

(Replace the URL with the actual AuditIQ repository URL.)

After cloning, you should see this folder structure:

```
auditiq/
├── auditIq-backend/
├── auditIq-frontend/
├── docker-compose.yml
└── .env.example
```

---

## Step 3 — Add Your Gemini API Key

The project ships with a `.env.example` file as a template. You need to
create your own `.env` file from it:

**Mac/Linux:**
```bash
cp .env.example .env
```

**Windows (PowerShell):**
```powershell
copy .env.example .env
```

Now open `.env` in any text editor (TextEdit, VS Code, Notepad, etc.) and
replace the placeholder with your real key:

```
GEMINI_API_KEY=paste_your_actual_key_here
```

Save and close the file.

> **Why this step matters:** the `.env` file is intentionally excluded from
> git (see `.gitignore`) so that real API keys are never accidentally
> published. Every person running this project needs to provide their own key.

---

## Step 4 — Build and Start Everything

From the project root (the folder containing `docker-compose.yml`), run:

```bash
docker compose up --build
```

### What happens during this step

This single command will, in order:

1. Download the base images needed (PostgreSQL with pgvector pre-installed,
   Java 21, Node/Bun, nginx) — only happens once, cached afterward
2. Build the backend: compile the Spring Boot application using Gradle
   inside a temporary build container, then package it into a lightweight
   runnable image
3. Build the frontend: install dependencies and build the React app, then
   package the static output into a lightweight nginx image
4. Start the PostgreSQL container first, and wait until it reports healthy
5. Start the backend container, which connects to that PostgreSQL container,
   creates all required tables automatically, and seeds initial reference
   data (approved vendor list, demo company)
6. Start the frontend container, which serves the React app and connects to
   the backend

**First run takes around 3–6 minutes** depending on internet speed, since
base images need to download. Every run after that is much faster because
Docker caches what it's already built.

You'll see a continuous stream of logs from all three containers in your
terminal. This is normal — leave it running.

---

## Step 5 — Open the App

Once you see the backend log settle (no more new lines appearing, and no
error messages), open a browser and go to:

```
http://localhost:3000
```

You should see the AuditIQ login/dashboard screen. The frontend, backend,
and database are all now running inside isolated Docker containers and
talking to each other automatically.

---

## Step 6 — Try It Out

A good way to confirm everything works end-to-end:

1. Register or log in
2. Upload the sample dataset (a Tata Motors transactions CSV, included in
   the repo under a `/samples` or `/docs` folder if present)
3. Confirm the dashboard populates with flagged anomalies
4. Try the AI chatbot — ask something like *"any suspicious high value
   transactions?"* and confirm you get a grounded, data-based answer

If all of this works, the full stack is functioning correctly.

---

## Stopping the App

To stop all running containers (keeps your data):

```bash
docker compose down
```

To stop AND completely wipe the database (start fresh next time):

```bash
docker compose down -v
```

To start again later without rebuilding (faster, since images are already
built):

```bash
docker compose up
```

Only use `--build` again if you've pulled new code changes from git.

---

## Troubleshooting

**"Port already in use" error**
Something else on your machine is already using port 3000, 8080, or 5432.
Stop whatever that is, or edit the port numbers on the left side of the
`ports:` mappings in `docker-compose.yml` (e.g. change `"3000:80"` to
`"3001:80"` and access via `localhost:3001` instead).

**Backend container keeps restarting / crashing**
Run `docker compose logs backend` to see the actual error. The most common
cause is the database not being ready yet — this is normally handled
automatically by the healthcheck in `docker-compose.yml`, but very slow
machines may occasionally need a manual `docker compose up` retry.

**Chatbot says "RAG not configured"**
Your `.env` file is either missing, misnamed, or has a typo in the Gemini
key. Double-check `.env` (not `.env.example`) exists at the project root
and contains a valid key, then run `docker compose up --build` again.

**Changes to code aren't showing up**
Docker caches builds. If you've edited backend or frontend source code,
you must rebuild: `docker compose up --build`. Plain `docker compose up`
reuses the old build.

**Still stuck**
Run `docker compose logs` (no service name) to see output from all three
containers at once, which usually reveals which one is failing and why.

---

## Why Docker Instead of Manual Setup

Without Docker, running this project requires manually installing and
configuring Java 21, Gradle, PostgreSQL with the pgvector extension
enabled, and Node.js/Bun — each with their own version requirements and
setup quirks that vary by operating system. Docker packages all of these
dependencies, pre-configured and pinned to the correct versions, into
isolated containers — so the exact same environment runs identically on
any machine with Docker installed, regardless of what's already on that
machine.
