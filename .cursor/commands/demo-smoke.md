---
description: Run the Signal Lab smoke demo and produce a pass or blocker summary.
argument-hint: [scenario]
---

Use the `demo-smoke-check` skill.

1. Default scenario is `system_error` unless the user specifies another one.
2. Validate Docker availability before attempting a full stack launch.
3. Run the shortest manual verification path from `docs/demo-walkthrough.md`.
4. Return only passed checks, blockers, and the smallest next action.
