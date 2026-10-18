# PHASE 01 — ENGINEERING FOUNDATION & CI/CD

**Priority:** P0 | **Planning effort:** 2–3 weeks | **Dependencies:** Approved phase 00 contracts

## Ready-to-paste AI Developer implementation prompt

```text
You are implementing PHASE 01: Engineering Foundation & CI/CD for Galung.id. First read documentation/AI_DEVELOPMENT_RULES.md and the approved PRD, BUSINESS_RULES_AND_FLOWS, UI_UX_SCREEN_SPECIFICATION, DATABASE_SCHEMA_SPECIFICATION, canonical SQL migrations, API_SPECIFICATION/OpenAPI and LICENSING_PROTOCOL_SPECIFICATION. Inspect the current repository state; do not assume previous phases are implemented without verifying.

OBJECTIVE: Engineering Foundation & CI/CD.

IMPLEMENTATION BRIEF: Implement TypeScript stack with protected default branch, secret scanning, dependency audit, health/readiness, versioned docs, test fixtures, RBAC skeleton and application config.

PREREQUISITES: Approved phase 00 contracts. If a prerequisite is missing, create an actionable report and only perform safe independent scaffolding; do not bypass required finance/security approvals.

REQUIRED DELIVERABLES: pnpm monorepo; web/admin/api apps; PostgreSQL/Redis local; migrations tooling; env validation; CI; structured logging; staging deployment.

DEFINITION OF COMPLETE: Fresh clone boots with documented commands; CI lint/typecheck/build/tests; secrets absent from repository; staging isolation and health checks pass.

PROCESS:
1. Produce a task checklist and map to named requirement IDs, DEC-001..006 and affected contracts. Identify missing company-approved plan prices, feature entitlements, device limits, bank details, FX/fee/refund rules; never invent values.
2. Before coding, reconcile necessary database migrations and OpenAPI components against actual files; propose precise migrations and compatibility strategy.
3. Implement with explicit module ownership and server-side guards; create tests with predictable fixtures, no real personal information or real bank credentials.
4. Add negative and abuse tests: unauthorized access, duplicates/retry, stale revisions, malformatted input, time boundary, failure recovery and state mismatch as applicable.
5. Run relevant tests and include exact command/results; never write 'all tests pass' based on reasoning alone.
6. Update docs, release notes and ADRs. Return code changes, test evidence, blockers, rollback instructions and a phase gate verdict PASS/FAIL/BLOCKED.

NON-NEGOTIABLE: no third-party payment integration; uploaded payment proof never approves its own transaction; finance review and license issuance are separate authorized events; offline <=14 days and never past entitlement+grace; grace=72h; late renewal starts after approval+entitlement readiness; international manual transfers supported; MVP only Basic/Pro.
```

## Work breakdown and technical guidance

- **Implementation:** Implement TypeScript stack with protected default branch, secret scanning, dependency audit, health/readiness, versioned docs, test fixtures, RBAC skeleton and application config.
- **Artifacts:** pnpm monorepo; web/admin/api apps; PostgreSQL/Redis local; migrations tooling; env validation; CI; structured logging; staging deployment
- **Completion gate:** Fresh clone boots with documented commands; CI lint/typecheck/build/tests; secrets absent from repository; staging isolation and health checks pass.
- **Reviewers:** Product Owner, Technical Lead, QA; Finance for phases 00/03/04/05/10/12; Security for 00/01/02/07/08/11/12; Windows Lead for 07/08/09/11/12.

## Minimum acceptance tests

1. Happy path according to deliverables, with deterministic fixtures and exact output assertions.
2. Invalid input and missing required data return specified stable error codes.
3. Cross-customer and unauthorized-role requests denied, no sensitive metadata exposure.
4. Duplicate request, concurrency, and rollback tests on every stateful operation.
5. Boundary checks for subscriptions, payment money units and clocks where applicable.
6. Audit events and idempotent worker retries verified where applicable.
7. Functional UI paths accessible by keyboard; content bilingual where rendered.

## Handoff report template

```markdown
Phase: 01
Status: PASS / FAIL / BLOCKED
Completed scope:
Changes (files + migration IDs):
API contract diff:
Requirement IDs covered:
Test evidence (command, exit status, artifact):
Security/finance approvals:
Known gaps / rollback:
Next recommended phase:
```
