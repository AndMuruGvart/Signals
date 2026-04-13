# PRD 002: Observability Demo

## Goal

Allow an interviewer to trigger scenarios from the UI and inspect the resulting metrics, logs, and errors.

## Acceptance Criteria

- Scenario execution emits Prometheus metrics.
- Scenario execution ships structured logs to Loki.
- `system_error` creates a captured error event.
- Grafana dashboard is provisioned from code.
- Manual verification is documented in a short demo walkthrough.
