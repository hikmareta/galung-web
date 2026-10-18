# Galung.id — Development Roadmap & AI Developer Implementation Prompts v1.0

This package is a **planning and implementation handoff**, not generated executable software or proof of passing tests.

## Contents

- `DEVELOPMENT_ROADMAP.md` — phases 00–13, critical dependencies, gates and ownership.
- `AI_DEVELOPMENT_RULES.md` — paste-once global constraints for AI Developer/Codex.
- `prompts/PHASE_*.md` — individual copy-paste, bounded implementation prompts.
- `ACCEPTANCE_CRITERIA_AND_RELEASE_GATES.md` — must-pass tests and stage signoffs.
- `CONTRACT_RECONCILIATION_BACKLOG.md` — cross-document P0 inconsistencies to resolve first.

## Suggested repository installation

Copy these files into `galung-platform/documentation/` and `documentation/prompts/`. Copy approved existing PRD/UI/DB/API/licensing files from their prior packages. Do not copy stale drafts as if they are final.

## Suggested AI workflow

1. Paste `AI_DEVELOPMENT_RULES.md` as the project's standing instruction or link it in `AGENTS.md` if the coding agent follows that convention.
2. First send **only** `prompts/PHASE_00_*.md`.
3. Require the agent to audit actual files and produce an explicit contract reconciliation report. Approve ADRs and change requests.
4. Proceed to Phase 01 only once Gate A is documented. Each following phase must include test evidence and gate signoff.
5. Merge via reviewed pull requests; never blindly paste secrets or production bank details into AI chat/repository.

## Priority and launch scope

Phases 00–12 target the first commercial Basic/Pro release. Phase 13 is illustrative post-MVP only. Dependencies and staffing may require changes.
