# Cursor AI Layer

## Why this exists

The assignment explicitly asks for a repository that Cursor can continue working in without manual explanations. The AI layer here is built around three ideas:

- constrain the stack and demo contract,
- keep context small by decomposing work into slices,
- make repeated workflows discoverable through skills, commands, and hooks.

## Rules

- `00-stack-guardrails.mdc`: prevents drift away from the required stack.
- `01-repo-map.mdc`: gives new chats a fast map of where concerns live.
- `02-observability-contract.mdc`: preserves the end-to-end signal path.
- `03-ai-layer-maintenance.mdc`: keeps the AI artifacts themselves from rotting.

## Skills

- `observability-signal`: focused workflow for metrics, logs, dashboards, and error capture.
- `demo-smoke-check`: deterministic demo verification for handoff.
- `prd-task-slicer`: converts broad asks into atomic slices suitable for smaller models.
- `orchestrator-prd-executor`: the context-economy orchestrator modeled after the requested PRD executor pattern.

## Commands

Commands are included because the assignment asks for them, even though newer Cursor versions increasingly prefer skills. These command files act as repeatable entry points for common workflows.

- `demo-smoke.md`
- `add-scenario.md`
- `audit-ai-layer.md`

## Hooks

- `dangerous-shell-guard.cjs`: blocks destructive shell commands.
- `secret-file-guard.cjs`: prevents accidental reads of sensitive files.
- `subagent-budget.cjs`: rejects broad subagent tasks and reinforces atomic delegation.

All hooks read stdin JSON via `_stdin-json.cjs` so empty or whitespace-only payloads never crash the process (Cursor treats missing hook output as failure when `failClosed` is set).

Together they provide real safety and context-discipline rather than decorative automation.

## Marketplace skills

Cursor stores marketplace installation state outside the repository, so the repo includes a reproducible manifest in `.cursor/marketplace-skills.md` with six recommended imports and their rationale.
