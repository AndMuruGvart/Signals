---
name: orchestrator-prd-executor
description: Use when the user asks for a large PRD-driven change. This skill orchestrates atomic execution, context budgeting, and verification so smaller models can do most of the work.
disable-model-invocation: true
---

# Orchestrator PRD Executor

This skill is the repo's context-economy orchestrator. It is intentionally strict.

## Intake

1. Read the user's request and map it to the closest PRD or repo surface.
2. Extract acceptance criteria as concrete checks.
3. Refuse to start implementation until the work is sliced into atomic tasks.

## Planning Protocol

1. Produce a task ledger with at most 7 active slices.
2. Mark each slice as one of:
   - `small-model`: localized edit, straightforward config, simple doc update
   - `large-model`: cross-layer design, recovery from failing verification, unresolved conflicts
3. Ensure every slice has one verification step.

## Execution Protocol

1. Run only one in-progress slice at a time.
2. Delegate localized work first.
3. After each slice:
   - verify the exact contract,
   - update the ledger,
   - summarize only deltas,
   - trim context by referring back to files instead of re-explaining them.

## Guardrails

- Do not let subagents take broad tasks. The `subagentStart` hook should block them.
- Do not batch unrelated edits just because they are nearby.
- If runtime infrastructure is unavailable, continue repository work and record the environmental blocker separately.

## Completion

Close only when code, infra, AI layer, and docs all align with the acceptance criteria or when the exact blocker is external and explicit.