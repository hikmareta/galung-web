# Phase 02 — Identity, RBAC & Account Security — acceptance report

Date: 2026-10-20. **Gate verdict: CLOSED for development handoff under ODL-009; NOT READY for public launch.** PostgreSQL 16, Redis, browser automation, and hosted CI checks passed. The Product Owner confirmed that the Tech Lead's approval represents Security and QA as well, and explicitly closed Phase 02 with two launch conditions outstanding: approved Legal content and official SMTP. No Phase 03 work was started; that phase will be developed in a separate session.

## Scope and contracts

The Product Owner approved Phase 01 exit and authorized Phase 02. ODL-008 freezes the identity-only package; the full commercial Gate A remains open. Frozen Phase 00 sources were left unchanged. `Documentation/galung_api_v1/identity-openapi-v2-review.json` is a proposed API overlay, not an approved production contract. SQL migrations `005_identity_contract_candidate.sql` and `006_identity_runtime.sql` are in the draft runner; production application is gated. No DEC-001–006 commercial values were invented.

## Implementation

- Registration records versioned Terms and Privacy evidence. Verification, resend, generic recovery, atomic one-use reset, Argon2id password hashing, and session revocation are implemented.
- Opaque audience-bound customer/admin sessions use secure cookies, idle and absolute expiry, CSRF validation, and origin separation. Customer reads and mutations are owner scoped. Identity actions are audited.
- Admin MFA supports TOTP enrollment, replay prevention, encrypted factor custody, single-use recovery codes, and live role checks.
- Redis-backed rate limits, encrypted mail outbox with retry, SMTP delivery component, profile/legal/privacy endpoints, stable errors, and bilingual account screens are implemented.
- Playwright covers mocked customer/admin journeys, keyboard/mobile behavior, automated WCAG 2.2 AA checks on login pages, and a live customer journey against API, PostgreSQL 16, and Redis.

Main code is under `apps/api/src/identity-*.ts`, `apps/web/app/`, and `apps/admin/app/`. Database and contract files are `Documentation/database/006_identity_runtime.sql` and `Documentation/galung_api_v1/identity-openapi-v2-review.json`. Operations include `scripts/verify-identity-db.ts`, staging grants, and `.github/workflows/ci.yaml`. Tests are under `apps/api/test/`, `tests/browser/`, and `tests/browser-integration/`.

Legal review drafts `DRAFT_TERMS_OF_USE_ID.md`, `DRAFT_PRIVACY_NOTICE_ID.md`, and `SMTP_SETUP_AND_ACCEPTANCE.md` were prepared after the Product Owner said approved text and SMTP were unavailable. They are not published policy, legal approval, or proof of delivery. Public registration remains disabled.

## Actual test evidence

| Check | Result |
|---|---|
| Local `pnpm exec turbo run lint typecheck test build --force` | **PASS, 19/19 tasks**, 2026-10-20. API 23 passed and one Redis test skipped locally; authorization 3 passed; config 5 passed; web/admin builds passed. This local run preceded the final browser additions; hosted CI below validates the final code. |
| Local Playwright mocked browser suite | **PASS, 5/5**. Customer and admin account journeys, failed logout, mobile keyboard/overflow, and automated axe login-page checks. Mocked API does not prove server behavior. |
| Hosted PostgreSQL 16 migration and identity verifier | **PASS** after applying migrations 005 and 006, including identity constraints. PostgreSQL 16/Docker were unavailable locally. |
| Hosted Redis rate-limit test | **PASS**, including an explicit one-test run against Redis. The local suite skips this test without Redis. |
| Hosted Playwright live integration | **PASS, 1/1**. Browser registration, email verification, login, password reset, old-session revocation, and new login against actual API, PostgreSQL 16, and Redis. The test reads tokens from the encrypted test outbox; it does not assert SMTP delivery. |
| Hosted full CI | [Run 39386061056](https://github.com/hikmareta/galung-web/actions/runs/39386061056) **PASS** at `d036ff2`: environment, migrations, DB checks, contract tests, lint, typecheck, unit/API tests, Redis, build, browser suites, and audit. |
| Hosted staging workflow | [Run 39386060978](https://github.com/hikmareta/galung-web/actions/runs/39386060978) **PASS** at `d036ff2`. This is a smoke workflow, not proof of production readiness. |
| `pnpm audit --audit-level high` | **PASS, exit 0** locally and in CI. Two moderate advisories remain in development test dependencies; zero high findings is not zero vulnerabilities. |
| Real SMTP delivery | **NOT RUN**: official sender/service and credentials have not been selected. |

Initial CI attempts uncovered missing synthetic outbox encryption config and a verifier cleanup-order error; both were fixed before the successful run. Browser testing exposed and led to fixes for registration form submission, 320px horizontal overflow, logout failure handling, missing admin auth security headers, and HTML titles. Earlier failing attempts are not counted as passes.

## Review, phase exit, and launch conditions

[PR #5](https://github.com/hikmareta/galung-web/pull/5) received an `APPROVED` review from `dhikandhika` on commit `a4c9605` at 2026-10-20 07:35 UTC and was merged into `codex/phase-01-owner-exit`. The Product Owner subsequently confirmed in this task that this Tech Lead approval also represents Security and QA. This is **one delegated approval covering three review roles**, not three separate GitHub approvals. Phase 01 [PR #4](https://github.com/hikmareta/galung-web/pull/4) is still open, so default-branch integration depends on its disposition.

The Product Owner explicitly approved Phase 02 development exit on 2026-10-20, with final Legal and SMTP decisions deferred until before public launch. This closes the phase's development gate only. The two outstanding launch conditions are:

1. Obtain Legal-approved Terms and Privacy versions/URLs; publish the approved content and verify versioned consent before enabling public registration.
2. Select and configure the official SMTP service and sender; validate actual bilingual verification/reset email delivery and links before enabling public registration or recovery for real users.

Manual assistive-technology checks and any resulting defects remain release QA work. Full commercial Gate A, production migration, and affected later feature gates remain open. Phase 03 has its own inputs and authorization; this decision does not approve commercial values or start Phase 03.

The draft migration revokes legacy sessions lacking new policy fields. For a failed staging rollout, disable `IDENTITY_ENABLED`, stop delivery, and revert the application release while retaining migration and audit history. Do not apply draft migrations to production until the remaining release gates are satisfied. Automated evidence cannot establish complete accessibility or SMTP delivery; public launch remains blocked by the two conditions above.
