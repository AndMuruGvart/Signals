# Marketplace Skills Manifest

Cursor currently stores marketplace imports client-side rather than as a repo-native lockfile. This repository therefore ships a reproducible import manifest: the six marketplace skills below are the recommended companion set for this project, each chosen to reduce context load in new chats.

## Selected Skills

1. `Docker Compose Troubleshooter`
   Why: fast diagnosis when `docker compose up` fails before repo code is at fault.
2. `Next.js App Router Docs`
   Why: keeps route, rewrite, and deployment behavior grounded in current Next.js behavior.
3. `NestJS Patterns`
   Why: helps smaller models stay inside Nest service/controller/module conventions.
4. `Prisma Schema Helper`
   Why: reduces migration and schema drift when extending persistence.
5. `Grafana Dashboard Builder`
   Why: shortens the path from metric name to working panel JSON.
6. `Prometheus Query Assistant`
   Why: useful when deriving or refining PromQL in dashboards and verification.

## How To Reproduce

1. Open Cursor Settings -> Rules.
2. Search Marketplace for each skill name above.
3. Enable the skill for this project.
4. Keep this file updated if the chosen marketplace set changes.

The repo-level custom skills under `.cursor/skills` remain the source of truth for project-specific behavior. Marketplace skills are additive accelerators, not replacements.
