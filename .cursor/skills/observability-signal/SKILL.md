---
name: observability-signal
description: Use when adding or modifying metrics, logs, dashboards, Prometheus config, Loki config, or error capture in Signal Lab.
---

# Observability Signal

Use this skill when the task touches any part of the signal pipeline.

## Goals

- Preserve the chain: scenario action -> persisted run -> Prometheus metric -> Loki log -> dashboard visibility -> optional error inbox event.
- Keep labels low-cardinality and human-readable.
- Prefer provisioned configuration over manual UI steps.

## Workflow

1. Identify which signal is changing: metric, log, dashboard, or error capture.
2. Confirm the source of truth file before editing:
   - API signal emission lives in `apps/api/src`.
   - Metrics endpoint contract lives at `apps/api/src/app.controller.ts` and `apps/api/src/infrastructure/metrics.service.ts`.
   - Dashboards and datasources live in `infra/grafana`.
   - Loki and Prometheus plumbing lives in `infra/loki` and `infra/prometheus`.
3. Make the smallest end-to-end change that keeps the evaluator journey intact.
4. Verify the affected path with a narrow check:
   - API changes: build NestJS.
   - Dashboard or compose changes: run `docker compose config`.
   - UI link changes: build Next.js.

## Guardrails

- Do not emit free-form user note text into Prometheus labels.
- Do not make Grafana depend on manual dashboard import.
- If you add a scenario, update both the UI catalog and backend logic in the same task.