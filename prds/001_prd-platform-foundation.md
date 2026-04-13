# PRD 001: Platform Foundation

## Goal

Create a repository that starts a Next.js frontend, NestJS backend, PostgreSQL database, and Prisma persistence layer from Docker Compose.

## Acceptance Criteria

- `docker compose up -d --build` starts the core application stack.
- UI is served on port 3000.
- API is served on port 3001.
- Prisma schema and migrations are versioned in the repo.
- Scenario runs persist in PostgreSQL.
