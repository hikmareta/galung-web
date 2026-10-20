# Phase 01 traceability

| Requirement | Source | Code / configuration | Test or evidence | State |
|---|---|---|---|---|
| Foundation apps | Roadmap Phase 01 | `apps/web`, `apps/admin`, `apps/api`, `pnpm-workspace.yaml` | Hosted CI/staging, forced Turbo build | Implemented |
| Environment validation | Phase 01 prompt; security NFR | `packages/config/src/index.ts`, `scripts/check-env.ts` | 3 config unit tests, hosted `check:env` | Implemented; persistent staging endpoint policy open |
| DB migrations | Phase 01 prompt; DB specification §9 | `scripts/migrate.ts`, `scripts/check-db.ts`, SQL `001`, `003`, `004` | Hosted PostgreSQL 16 apply/check; local PostgreSQL 15 concurrent runners, drift and injected failure rollback | Draft/test only; no production authorization |
| RBAC skeleton | Phase 01 prompt; ADR-08; API security | `packages/authz/src/index.ts`, `apps/api/src/authorization.ts` | 3 helper tests, 2 guard tests | Skeleton only; identity and object-query guards are Phase 02 |
| Health/readiness | Roadmap Phase 01; operations NFR | `apps/api/src/health.ts`, web/admin `/health`, operational OpenAPI | API liveness/readiness unit tests, operational contract test, hosted staging probes | Implemented for operational scope |
| Structured logging | Phase 01 prompt; API §logging | `apps/api/src/logger.ts`, `request-log.ts` | Logger redaction test; request ID middleware source review | Framework message redacted; request-log integration test open |
| CI, audit and secret scan | Roadmap Phase 01 | `.github/workflows/ci.yaml` | Hosted `verify`/`secrets`; local workflow check; dependency audit | Implemented; moderate dev advisories remain |
| Protected default branch | Roadmap Phase 01 | GitHub rule 85006403 | Live settings readback and screenshot in acceptance report | Implemented on public `main` |
| Staging isolation | Roadmap Phase 01 | `.github/workflows/staging.yaml` | Hosted ephemeral staging run and four health probes | Ephemeral only; persistent host decision open |
| DEC-001–006 safeguards | PRD/business rules | No commerce, payment, subscription or license handlers in Phase 01 | Source review; Phase 00 contract tests | Preserved by non-implementation; production terms still need reconciliation |
