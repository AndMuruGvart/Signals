# PRD 004: Orchestrator

## Goal

Provide an orchestrator skill that makes broad product requests executable through atomic, context-efficient tasks.

## Acceptance Criteria

- The orchestrator requires decomposition before implementation.
- Each slice has a clear verification step.
- Small-model work is preferred for localized tasks.
- Broad subagent tasks are blocked by hook policy.
- Final handoff reports deltas, blockers, and exact verification status.
