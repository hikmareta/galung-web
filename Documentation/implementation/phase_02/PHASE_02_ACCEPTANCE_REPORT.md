# Phase 02 — Identity, RBAC & Account Security — acceptance report

Date: 2026-10-20. **Gate verdict: BLOCKED for exit and deployment.** Identity implementation and local checks are substantially complete, but PostgreSQL 16/Redis validation, browser QA, approved Legal content, official SMTP configuration, and independent Security/Tech Lead/QA review remain outstanding. No Phase 03 work was started.

After the Product Owner confirmed Legal text and SMTP are not yet available, review drafts were added: `DRAFT_TERMS_OF_USE_ID.md`, `DRAFT_PRIVACY_NOTICE_ID.md`, and `SMTP_SETUP_AND_ACCEPTANCE.md`. They are not published policy, proof of legal approval, or proof of email delivery. No registration flag was enabled.

## Authorized scope and contract

Product Owner approved Phase 01 exit and authorized Phase 02. ODL-008 freezes the identity-only package; full commercial Gate A remains open. Frozen Phase 00 source files were left unchanged. `Documentation/galung_api_v1/identity-openapi-v2-review.json` reconciles the overlay with canonical OpenAPI as a review proposal, not an approved production contract. SQL `005_identity_contract_candidate.sql` plus new `006_identity_runtime.sql` are included only in the draft migration runner; production migration remains gated. No DEC-001–006 commercial values were invented or implemented.

## Completed implementation

- Registration with versioned Terms and Privacy evidence, email verification and resend, generic recovery request, atomic one-use reset, password hashing with Argon2id, and existing-session revocation.
- Opaque audience-bound sessions in secure cookies with idle and absolute expiry, CSRF validation, customer/admin origin separation, logout, session listing and revocation.
- Admin TOTP enrollment/completion, encrypted factor custody, TOTP replay rejection, single-use recovery codes, and live role checks. Customer data reads and mutations are owner scoped; audit events record identity actions.
- Redis-backed rate-limit implementation, encrypted email outbox with retry, SMTP delivery component, profile/legal/privacy endpoints, stable errors, and bilingual customer/admin account screens.
- Disposable PostgreSQL 16 verification script, least-privilege staging grants, and CI jobs for database and Redis checks.

## Files and migration IDs

Main code: `apps/api/src/identity-{security,store,http,errors,mail,delivery}.ts`, `apps/api/src/{module,main,authorization,request-log}.ts`, identity screens/styles/routes under `apps/web/app/` and `apps/admin/app/`. Contracts and operations: `Documentation/database/006_identity_runtime.sql`, `Documentation/galung_api_v1/identity-openapi-v2-review.json`, `scripts/{migrate,check-db,verify-identity-db,grant-staging-identity,build-identity-openapi.mjs}`, `.github/workflows/{ci,staging}.yaml`, `.env.example`, workspace dependency manifests. Tests: `apps/api/test/identity-*.test.ts` and `apps/api/test/fixtures/identity-schema.sql`.

## API contract delta

Review overlay defines register, verification, password reset, login/logout, CSRF/session, MFA, profile, sessions, legal evidence, and privacy request routes. Identity responses have stable error codes; one-use challenges are stored as hashes. The v2 overlay fixes nested response schema composition of the earlier overlay. Approval of this delta remains required before release.

## Test evidence

| Command/check | Actual result |
|---|---|
| `pnpm exec turbo run lint typecheck test build --force` (loopback access granted) | **PASS, exit 0; 19/19 tasks successful**, 2026-10-20 13:12–13:14 WIB. API: 23 passed, one Redis test skipped locally; authz 3 passed; config 5 passed. Web/admin have no test files and their Vitest tasks exit 0. Both Next.js production builds completed. |
| `node scripts/build-identity-openapi.mjs --check` | **PASS, exit 0.** |
| `git diff --check` | **PASS, exit 0**, line-ending warnings only. |
| `pnpm audit --audit-level high` | **NOT COMPLETED:** registry DNS `ENOTFOUND`; audit could not fetch advisories. |
| PostgreSQL 16 disposable validation `pnpm db:identity:verify` | **NOT RUN locally:** PostgreSQL 16/Docker unavailable. CI job added but has not been observed running. PGlite fixture tests do not establish PostgreSQL 16 migration compatibility. |
| Redis-backed rate-limit test | **SKIPPED locally:** Redis unavailable; CI is configured to run it with a Redis service. |
| Browser keyboard and bilingual journey QA | **NOT RUN.** API HTTP E2E covers registration, verification, reset, admin MFA, CSRF, ownership, origin separation, and email outbox behavior, but it is not browser QA. |
| Real SMTP delivery | **NOT RUN:** approved service and credentials absent. |

The first full suite attempt was blocked by local sandbox loopback `EACCES`; an unrestricted local-loopback rerun exposed an Argon2 test timeout under parallel load. The test timeout was raised to 30 seconds without changing password work factors; the subsequent full suite passed. These earlier failures are not counted as passes.

## Acceptance and remaining blockers

Automated API tests demonstrate cross-owner denial, admin MFA enforcement, CSRF, role revocation, one-use reset/recovery, encrypted delivery queue retry, and safe public responses. To request Phase 02 exit, still required:

1. Run full canonical migrations and identity verifier on disposable PostgreSQL 16; resolve SQL/privilege defects. Run Redis rate-limit test and full suite in hosted CI.
2. Obtain Legal-approved published Terms and Privacy versions/URLs and official SMTP sender/service. Validate actual bilingual email delivery and verification/reset links. Keep public registration disabled until configured.
3. Complete browser E2E and accessibility/keyboard QA on customer and admin flows, including recovery, logout, and session expiry.
4. Obtain Security, Tech Lead, and QA review of SQL 006, OpenAPI v2, key custody/rotation, least-privilege grants, and deployment configuration. Obtain Product Owner Phase 02 gate approval before Phase 03.

## Risk and rollback

The draft identity migration is additive except that it revokes legacy sessions lacking the new policy fields. On a failed staging rollout, disable `IDENTITY_ENABLED`, stop the delivery worker and revert the application release; retain migration and audit history for investigation rather than deleting user evidence. Do not apply these draft migrations to production until contract and migration approval. Unverified external dependencies and missing browser QA mean this report cannot claim no open security gaps or a closed phase.
