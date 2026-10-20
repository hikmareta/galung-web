# PHASE 02 — IDENTITY, RBAC & ACCOUNT SECURITY

**Priority:** P0 | **Planning effort:** 2–3 weeks | **Dependencies:** Foundation + identity ADR

**Gate amendment selected 2026-10-18 (ODL-007):** The Product Owner selected an identity-only path. Phase 02 implementation still requires explicit Phase 01 exit approval and a versioned identity ADR/SQL/OpenAPI package reviewed by Security, Tech Lead and QA. Full commercial Gate A remains open; no commercial, payment, subscription, licensing or desktop activation implementation is authorized by this selection.

**Gate update 2026-10-20 (ODL-008):** PR #3 head `08a271d` received Tech Lead/Security/QA approval, passed required checks and merged as `9d48ac2`. The Product Owner explicitly closed Phase 01 and authorized Phase 02 in a separate chat. The hashed identity package in `Documentation/implementation/phase_00/IDENTITY_CONTRACT_MANIFEST.md` is frozen for Phase 02 implementation scope only. Phase 02 must reconcile the identity overlay with canonical OpenAPI and test the candidate SQL before application. Full commercial Gate A and production migration approvals remain open.

## Ready-to-paste AI Developer implementation prompt

```text
You are implementing PHASE 02: Identity, RBAC & Account Security for Galung.id. First read documentation/AI_DEVELOPMENT_RULES.md and the approved PRD, BUSINESS_RULES_AND_FLOWS, UI_UX_SCREEN_SPECIFICATION, DATABASE_SCHEMA_SPECIFICATION, canonical SQL migrations, API_SPECIFICATION/OpenAPI and LICENSING_PROTOCOL_SPECIFICATION. Inspect the current repository state; do not assume previous phases are implemented without verifying.

OBJECTIVE: Identity, RBAC & Account Security.

IMPLEMENTATION BRIEF: Implement rate-limited identity endpoints, secure cookie/session and CSRF policy, role permissions, session revocation, user profile, terms acceptance and owner-scoped queries.

PREREQUISITES: Explicit Phase 01 foundation exit approval plus reviewed, versioned identity ADR/SQL/OpenAPI contract under ODL-007. Full commercial Gate A remains open and all non-identity functionality stays gated. If a prerequisite is missing, create an actionable report and only perform safe independent scaffolding; do not bypass required security approvals.

REQUIRED DELIVERABLES: Register/login/logout, email verification, password reset, admin MFA, sessions, role enforcement, audit.

DEFINITION OF COMPLETE: Cross-tenant/IDOR tests deny access; admin MFA enforced; tokens and reset links cannot be replayed; login and recovery E2E pass.

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

- **Implementation:** Implement rate-limited identity endpoints, secure cookie/session and CSRF policy, role permissions, session revocation, user profile, terms acceptance and owner-scoped queries.
- **Artifacts:** Register/login/logout, email verification, password reset, admin MFA, sessions, role enforcement, audit
- **Completion gate:** Cross-tenant/IDOR tests deny access; admin MFA enforced; tokens and reset links cannot be replayed; login and recovery E2E pass.
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
Phase: 02
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
