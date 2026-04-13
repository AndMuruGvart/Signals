# Demo Walkthrough

## Sentry vs this repo

The assignment flow says "open Sentry". Here that means the **local Sentry-compatible inbox** at `http://localhost:3000/sentry` (and the sink on port `8123`). There is no separate cloud Sentry project: the backend uses the Sentry SDK against this sink so reviewers can confirm error capture in one command.

## Fast path

1. Start Docker Desktop.
2. Run `docker compose up -d --build` from the repository root.
3. Open `http://localhost:3000`.
4. Submit the default `system_error` scenario.
5. Open the following pages in order:
   - `http://localhost:3001/metrics`
   - `http://localhost:3100`
   - `http://localhost:3000/grafana`
   - `http://localhost:3000/sentry`

## Expected outcome

- The UI history gets a new failed run.
- `signal_lab_scenario_runs_total` and `signal_lab_scenario_duration_ms` change in the metrics endpoint.
- Loki Viewer shows `Scenario failed` with the same scenario and run id.
- Grafana dashboard shows updated run count and recent logs.
- Error Inbox shows a captured exception for `system_error`.
