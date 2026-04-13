# Signal Lab Agent Notes

## Repo Map

- `apps/web` contains the Next.js UI with shadcn-style components, React Hook Form, and TanStack Query.
- `apps/api` contains the NestJS API, Prisma schema, Prometheus metrics endpoint, Loki log push, and Sentry-compatible error capture.
- `infra` contains Docker, Grafana, Loki, and Prometheus configuration.
- `.cursor` contains the AI layer requested in the assignment: rules, skills, commands, and hooks.

## Default Workflow

- Keep the required stack intact unless the user explicitly asks for a justified deviation.
- Prefer atomic changes that preserve the demo flow: UI button -> API run -> metrics/logs/errors -> dashboard visibility.
- After touching `apps/api`, validate build or targeted runtime behavior.
- After touching `apps/web`, validate the Next.js build.
- After touching `docker-compose.yml` or `infra`, run `docker compose config` before any broader verification.

## Demo Contract

- `system_error` must create a failed run, increment metrics, ship a structured log, and appear in the error inbox.
- The shortest evaluator path is documented in `README.md` and `docs/demo-walkthrough.md`.
