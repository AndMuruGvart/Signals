---
name: demo-smoke-check
description: Use when preparing the 15-minute evaluator demo, validating the local stack, or producing a concise manual verification report.
disable-model-invocation: true
---

# Demo Smoke Check

Run this skill before handoff or when the user asks whether the repo is demo-ready.

## Checklist

1. Confirm Docker daemon availability before attempting `docker compose up -d --build`.
2. Validate static config first with `docker compose config`.
3. If the stack is up, verify in this order:
   - `http://localhost:3000` loads the UI.
   - Trigger `system_error` from the UI.
   - `http://localhost:3001/metrics` contains `signal_lab_scenario_runs_total`.
   - `http://localhost:3100` shows a structured log line.
   - `http://localhost:3000/grafana` loads the provisioned dashboard.
   - `http://localhost:3000/sentry` shows the captured error event.
4. Record blockers precisely. Distinguish code/config defects from environment prerequisites like Docker not running.

## Output Format

- `status`: ready, ready-with-prereq, or blocked
- `verified`: flat list of checks that passed
- `blocked_by`: exact missing prerequisite or failing step
- `next_action`: smallest action to get unstuck