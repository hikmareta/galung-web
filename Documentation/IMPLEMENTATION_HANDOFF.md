# GALUNG.ID — IMPLEMENTATION HANDOFF & AI DEVELOPER RULES

**ID:** GLG-HOF-001 | **Version:** 1.0 | **Date:** 2026-10-17

## 1. Document precedence

1. Final approved decision register DEC-001..DEC-006 in `PRODUCT_REQUIREMENTS.md`.
2. Product requirements (`PRODUCT_REQUIREMENTS.md`).
3. Explicit business transitions and operational SOP (`BUSINESS_RULES_AND_FLOWS.md`).
4. Acceptance tests (`ACCEPTANCE_CRITERIA.md`).
5. UI/UX component specs and technical API/schema contracts once separately versioned.

If documents conflict, **do not silently select one**. Flag contradiction, propose resolution, update affected documents and obtain Product approval. All prices, device caps, bank account details and edition features marked TBD remain placeholders; production functionality must not invent them.

## 2. Recommended engineering stack

Monorepo (pnpm/Turborepo), Next.js + TypeScript public/customer frontend, separate Next.js admin frontend, NestJS REST/OpenAPI service, PostgreSQL and Prisma, Redis/BullMQ, S3-compatible private object storage, Docker deployment, GitHub Actions, Playwright/Vitest, OpenTelemetry-based logs/traces. Integrate desktop Windows using a versioned API and asymmetric signed licenses. Choose supported versions and audit dependencies during setup. Implement modular monolith; do not introduce microservices without demonstrated need.

## 3. Suggested repository layout

```text
galung-platform/
  apps/web/
  apps/admin/
  apps/api/
  packages/ui/
  packages/design-tokens/
  packages/api-client/
  packages/types/
  packages/validators/
  database/migrations/
  infrastructure/docker/
  documentation/
    PRODUCT_REQUIREMENTS.md
    BUSINESS_RULES_AND_FLOWS.md
    ACCEPTANCE_CRITERIA.md
    IMPLEMENTATION_HANDOFF.md
  .github/workflows/
```

## 4. Implementation sequence (dependencies matter)

| Phase | Core tasks | Deliverables | Exit gate |
|---|---|---|---|
| 0 Policy + UX | Finalize TBD decisions, user flows, design components, accessibility testing protocol | Approved values, clickable designs | Product/finance/UX signoff |
| 1 Foundation | Repo, environment, auth, RBAC, DB, CI, logging, private storage | Running local + staging | Auth/security base tests |
| 2 Catalog + CMS | Product Basic/Pro, price effective dates, bilingual pages, versioned content | Public pages | WEB & CHK catalog tests |
| 3 Checkout | Server price engine, immutable invoice, domestic/international transfer instructions | Orders, invoices | CHK tests |
| 4 Payments | Proof versioning, secure scan, finance bank credit check, review queue, atomic approval | Manual payment operations | PAY tests |
| 5 Subscription | Periods, renewal, 72h grace, reminders, recovery jobs | Subscription engine | SUB tests |
| 6 License | Policy snapshot, asymmetric signing, admin issue queue, device activation and 14d offline | Desktop integration | LIC tests |
| 7 Dashboard + Release | My Galung, status, downloads, signed Windows release | Customer self-service | DASH and LIC-020 |
| 8 Launch | Security, accessibility, data restore, finance reconcile, UAT | Production MVP | OPS + all P0 |

Phase boundaries can overlap only where data contracts and test fixtures are stable.

## 5. Task contract for AI Developer

For every task, provide a self-contained request with:

1. **Scope:** requirement IDs and exact files/modules permitted.
2. **Business logic:** state transitions, actor permissions, non-negotiable DEC rules.
3. **API/data contract:** request/response fields, schema changes and migrations.
4. **UI state:** loading, empty, error, success, pending and international/localized copies.
5. **Security:** authorization, validation, audit, idempotency and sensitive data handling.
6. **Tests:** linked AC IDs, happy path, abuse, concurrency, clock/boundary cases.
7. **Deliverables:** source code, migration, API docs, tests, changelog and demo steps.
8. **Do-not-do:** no gateways, no silent automated bank approval, no premium Song Library checkout in MVP.

## 6. Example global coding instruction

```text
You are implementing Galung.id commercial MVP.
Treat documentation/PRODUCT_REQUIREMENTS.md,
documentation/BUSINESS_RULES_AND_FLOWS.md, and
documentation/ACCEPTANCE_CRITERIA.md as mandatory requirements.
Do not invent final prices, device limits, bank beneficiary accounts,
feature entitlements, or unsupported currencies.
Keep payments manually verified by authorized finance staff.
Require separate authorized license issuance after approved payment.
Support Basic and Pro only at MVP.
Apply grace = 72 hours, bounded offline verification = 14 days,
and late renewal start = after payment approval and entitlement readiness.
Support domestic and international direct bank transfers.
Implement server-side permission checks, transactional state changes,
idempotency, immutable history, and meaningful tests.
When a task has a policy ambiguity, document the assumption as pending
and avoid irreversible production behavior until approved.
```

## 7. Definition of Done for each task

- Typecheck/lint/build pass.
- Unit and integration tests pass; targeted E2E added for user flows.
- Authorization tests confirm no cross-account access.
- Migrations are reversible or have rollback strategy.
- Business events durable and retry-safe.
- Logging avoids secrets and PII.
- Accessibility keyboard/semantic checks for UI changes.
- API contract and related doc IDs updated.
- Reviewer can reproduce result using steps and seed fixtures.
- Product/QA acceptance recorded.

## 8. Change request protocol

1. Create change note with problem, affected DEC/FR/NFR/AC IDs, scope, risk, backward compatibility and data migration implications.
2. Product/finance/security review if commerce, license or beneficiary affected.
3. Update docs first or within same reviewed change.
4. Update API schema, frontend status copy, admin workflow, migrations, test cases.
5. Run regression suite and record release note.

## 9. Before implementation begins: approval checklist

- [ ] Final real pricing and taxes approved.
- [ ] Basic/Pro feature entitlements approved.
- [ ] Device and simultaneous-session caps approved for each plan.
- [ ] Verified company beneficiary bank data and international remittance instructions available.
- [ ] Accepted invoice currency and fees/FX/short-payment policy approved.
- [ ] Refund, privacy retention, terms and customer disclosure approved.
- [ ] Finance and license admin assignment + MFA policy approved.
- [ ] Windows desktop team agrees signed-token and offline contracts.
- [ ] Release signing certificate strategy approved.
- [ ] First test customer group and approval process identified.

## 10. Deliverables following this PRD package

To remove remaining implementation ambiguity, produce separately versioned:
- `UI_UX_SCREEN_SPEC.md` (every screen, field, validation, mobile wireframe and state).
- `DATABASE_SCHEMA.md` (exact PostgreSQL SQL schema, keys, indexes and RLS/ACL approach).
- `API_SPECIFICATION.yaml` (OpenAPI with DTO examples, errors and RBAC).
- `LICENSING_PROTOCOL.md` (token schema, signing algorithms, server/device flows, threat model).
- `ADMIN_SOP.md` (finance bank review, reconciliation, refunds, issuer workflows).
- `SECURITY_TEST_PLAN.md` (threat models, upload abuse, concurrency, privileged operations).

Do not treat these future files as already implemented.
