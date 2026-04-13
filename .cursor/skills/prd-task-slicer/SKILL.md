---
name: prd-task-slicer
description: Use when a request is too broad and needs to be decomposed into atomic, low-context tasks that small models can execute safely.
---

# PRD Task Slicer

Use this skill whenever the user request spans several layers or several directories.

## Decomposition Rules

- Each task should target one outcome, one primary directory, and one verification step.
- Split by seam, not by chronology. Example seams: UI, API contract, infra, docs, AI layer.
- Prefer tasks that can be verified with one command.
- Avoid tasks that include multiple verbs like "build and test and document".

## Output Shape

For each task, produce:

- `slice`: short name
- `scope`: directory or files
- `done_when`: observable result
- `verify_with`: exact command or manual check
- `delegate_to`: smallest capable model/agent category

## Small-Model Bias

- Give repetitive or localized work to smaller models first.
- Reserve large-model context for orchestration, cross-cutting decisions, and conflict resolution.