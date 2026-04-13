---
description: Add a new Signal Lab scenario end to end.
argument-hint: <scenario-name>
---

Use the `observability-signal` and `prd-task-slicer` skills.

1. Add the scenario to the frontend catalog and backend implementation.
2. Ensure the scenario leaves metrics, logs, and persisted history.
3. Update Grafana assumptions if the new scenario changes labels or panel usefulness.
4. Validate the narrowest possible path and summarize changed files.
