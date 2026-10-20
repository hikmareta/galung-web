# GALUNG.ID — DEVELOPMENT ROADMAP v1.0

**Status:** implementation planning; not a claim of completed software. **Baseline:** decisions DEC-001..DEC-006, PRD v1.0, UX v1.1, Database v1.0, API v1.0, Licensing v1.0. **Platform:** Windows desktop software + Next.js website/admin + NestJS API + PostgreSQL, TypeScript-first modular monolith. **Launch:** Galung Basic & Pro, Indonesian/international manual bank transfers, admin finance approval and separate license issuance.

## Binding policy invariants

- Licenses: device limits and entitlement features are configurable **per plan**, versioned and snapshotted at issuance. Never invent final values.
- Offline: signed device-bound entitlements valid no longer than **336 hours (14 days)** since last genuine online validation, additionally bounded by authorized paid access plus approved **72-hour grace**; no instant revocation guarantee on offline clients.
- On-time renewal: extends from existing term end. Late renewal: new period begins **after verified finance approval AND entitlement available**, never backdates or shortens term.
- Manual payment: uploaded proof is a claim, **not funds**. Only authorized finance verifies actual receipt; separate License Manager issues after approval. No third-party payment gateway.
- International customers: manual bank remittances; bank fee/FX mismatch requires explicit review; country does not imply multi-currency price support.
- MVP: Basic and Pro only. Song Library Premium and institutional seats are designed for later, not sold in Release 1.

## Phase table

| Phase | Workstream | Estimated active effort | Dependencies | Required release |
|---|---|---|---|---|
| 00 | Contract Reconciliation & Decisions | 2–3 weeks | PRD/API/DB/licensing alignment, finance/legal decisions, contract freeze | P0 |
| 01 | Engineering Foundation & CI/CD | 2–3 weeks | Approved phase 00 contracts | P0 |
| 02 | Identity, RBAC & Account Security | 2–3 weeks | Foundation + identity ADR | P0 |

**2026-10-18 scoped Gate A amendment selected (ODL-007):** Phase 02 may begin only after the Phase 01 exit is explicitly approved and a versioned identity SQL/OpenAPI/ADR contract receives Security, Tech Lead and QA review. This is an identity-only exception to the full Gate A dependency. The full commercial contract remains candidate and all non-identity Gate A P0 items continue to block their affected phases. Selection of the amendment is not itself a Phase 02 start authorization.

**2026-10-20 ODL-008:** Those limited entry conditions were met by reviewed and merged PR #3, the hashed identity package and the Product Owner's explicit Phase 01 exit decision. Phase 02 identity/RBAC/account-security work is authorized for a separate session. Commercial Gate A, production migration and other phase gates remain open.
| 03 | Catalog, Pricing, Bank Configuration & CMS | 3–4 weeks | Auth + schema versioned | P0 |
| 04 | Checkout, Orders & Invoices | 2–3 weeks | Catalog + identity + currencies approved | P0 |
| 05 | Payment Proof & Manual Finance Verification | 3–4 weeks | Orders + private storage + audit | P0 |
| 06 | Subscription & Entitlement Engine | 3–4 weeks | Approved payment ledger + plan policy | P0 |
| 07 | License Issuance, Signing & Security | 4–5 weeks | Subscription + canonical licensing protocol + key custody | P0 |
| 08 | Windows Device Activation & 14-Day Offline | 4–6 weeks | Issuance + desktop client repository available | P0 |
| 09 | My Galung, Installer Delivery & Notifications | 2–3 weeks | Subscription/licensing stable + Windows signed builds | P0 |
| 10 | Admin Operations, Reporting & Support | 2–3 weeks | Payments, licenses and customer portal | P0 |
| 11 | Security, Accessibility, QA & UAT | 3–4 weeks | All MVP paths implemented | P0 |
| 12 | Pilot Launch, Operations & Handover | 2–3 weeks | Release signoffs + production setup | P0 |
| 13 | Post-MVP Song Library & Institutions (NOT Release 1) | future | MVP stable + new approved PRD | P1 |

**Timeline guidance:** ranges are relative engineering estimates, not a calendar commitment. Parallelism only after contracts stabilize. Core MVP may take ~5–8 calendar months for a small qualified team including a Windows integration engineer, depending on decisions and test readiness; re-estimate after Phase 00. Phase 13 excluded from MVP timeline.

## Critical path and gates

1. **Gate A / Contract Freeze:** Resolve licensing changes + API/DB gaps P0, legal/finance policy, supported bank and currencies; publish canonical version manifest and ADRs.
2. **Gate B / Safe Money:** Checkout snapshots → proof intake → verified bank credits → single authorized approval → audit/outbox. No automatic payment settlement.
3. **Gate C / License:** Separate issue → device-bound activation → signature verification → offline boundary, renewal/grace and revocation tests.
4. **Gate D / Commercial MVP:** Signed Windows binary, dashboard, finance operational procedures, security/accessibility UAT, pilot + rollback.

## Phase definitions

### Phase 00 — Contract Reconciliation & Decisions

- **Scope:** Reconcile ALIGN-01..18 and licensing P0 changes, select session/MFA/CSRF model, finalize bank change dual control, define license renewal and entitlement-ready time; review pricing, supported currencies, device caps and edition entitlements without inventing values.
- **Inputs:** PRD/API/DB/licensing alignment, finance/legal decisions, contract freeze.
- **Outputs:** Canonical contract version matrix; approved ADRs; DB delta migrations plan; OpenAPI changes; requirement trace matrix.
- **Gate/exit:** No contradictory canonical schema/API claims; every P0 gap assigned, verified, and resolved or explicitly launch-blocking; Product, Security, Finance signatures.
- **Priority:** P0; **estimate:** 2–3 weeks.

### Phase 01 — Engineering Foundation & CI/CD

- **Scope:** Implement TypeScript stack with protected default branch, secret scanning, dependency audit, health/readiness, versioned docs, test fixtures, RBAC skeleton and application config.
- **Inputs:** Approved phase 00 contracts.
- **Outputs:** pnpm monorepo; web/admin/api apps; PostgreSQL/Redis local; migrations tooling; env validation; CI; structured logging; staging deployment.
- **Gate/exit:** Fresh clone boots with documented commands; CI lint/typecheck/build/tests; secrets absent from repository; staging isolation and health checks pass.
- **Priority:** P0; **estimate:** 2–3 weeks.

### Phase 02 — Identity, RBAC & Account Security

- **Scope:** Implement rate-limited identity endpoints, secure cookie/session and CSRF policy, role permissions, session revocation, user profile, terms acceptance and owner-scoped queries.
- **Inputs:** Approved Phase 01 foundation exit + reviewed and versioned identity ADR/SQL/OpenAPI contract under ODL-007. Full commercial Gate A remains required before implementing price, bank, checkout, payment, subscription, entitlement, licensing or desktop activation behavior.
- **Outputs:** Register/login/logout, email verification, password reset, admin MFA, sessions, role enforcement, audit.
- **Gate/exit:** Cross-tenant/IDOR tests deny access; admin MFA enforced; tokens and reset links cannot be replayed; login and recovery E2E pass.
- **Priority:** P0; **estimate:** 2–3 weeks.

### Phase 03 — Catalog, Pricing, Bank Configuration & CMS

- **Scope:** Implement effective-dated prices, immutable policy versions, authorized bank configuration via dual approval, published content preview/rollback; no Song Library subscription flows.
- **Inputs:** Auth + schema versioned.
- **Outputs:** Basic/Pro catalog, plan policies, pricing version/snapshot, bilingual marketing website, admin CMS, bank details approval.
- **Gate/exit:** Price race does not alter invoices; bank change without independent approval fails; public pages localized and keyboard usable.
- **Priority:** P0; **estimate:** 3–4 weeks.

### Phase 04 — Checkout, Orders & Invoices

- **Scope:** Implement invoice issuing transaction, immutable beneficiary and currency snapshots, duplicate submission protection, expiry/late transfer handling, tax/legal placeholders marked blocked until decisions.
- **Inputs:** Catalog + identity + currencies approved.
- **Outputs:** Domestic/international checkout, server quote engine, immutable orders/invoices, transfer instructions.
- **Gate/exit:** Tampered client total rejected; invoice consistency; country-specific forms; customer cannot view another invoice; no gateway/autodebit.
- **Priority:** P0; **estimate:** 2–3 weeks.

### Phase 05 — Payment Proof & Manual Finance Verification

- **Scope:** Use private object storage, scan status, restricted signed preview, finance bank ledger and unique credit match, maker/checker when threshold policy requires; append-only audit/outbox.
- **Inputs:** Orders + private storage + audit.
- **Outputs:** Secure proof upload, malware scanning, finance queue, bank credit matching, manual approval/rejection, reconciliation.
- **Gate/exit:** Proof alone never activates access; double approve and bank credit reuse fail; mismatches and international transfers remain review; failure recovery idempotent.
- **Priority:** P0; **estimate:** 3–4 weeks.

### Phase 06 — Subscription & Entitlement Engine

- **Scope:** Implement start when finance-approved and entitlement-ready, on-time extension from existing period end, post-expiry from newly ready time, temporal locks and queue-driven reminders.
- **Inputs:** Approved payment ledger + plan policy.
- **Outputs:** Subscription periods, renewals, 72h grace, entitlement-ready start, reminder events, finance-safe states.
- **Gate/exit:** Clock boundary tests incl DST, month-end, leap dates, fixed 720/8,760h and 72h; failed issuance never burns customer term; no double renewal from retry.
- **Priority:** P0; **estimate:** 3–4 weeks.

### Phase 07 — License Issuance, Signing & Security

- **Scope:** Ed25519 signed bounded claims with kid/version/issuer/audience/device key/feature list; isolate private key; admin issue only after bank approval; idempotent issue/reissue/renewal.
- **Inputs:** Subscription + canonical licensing protocol + key custody.
- **Outputs:** Admin issue queue, signing service, license revisions, one-time claims, signed entitlement, audit.
- **Gate/exit:** Forged/tampered/replayed claims rejected; private key never shipped or logged; payment approval != issued; renewal updates correct license.
- **Priority:** P0; **estimate:** 4–5 weeks.

### Phase 08 — Windows Device Activation & 14-Day Offline

- **Scope:** Integrate Windows desktop client with secured key storage, replay resistance, limits by policy snapshot, max 336h offline but never past entitlement/grace, rollback-clock defense, reconnect/revoke sync.
- **Inputs:** Issuance + desktop client repository available.
- **Outputs:** Device claim/challenge/proof-of-possession, refresh rotation, signed cache, deactivation, bounded offline validation.
- **Gate/exit:** 14-day boundary tests, stolen token on another device denied, activation race respects seat cap, tampering and revocation online enforced; document offline limits.
- **Priority:** P0; **estimate:** 4–6 weeks.

### Phase 09 — My Galung, Installer Delivery & Notifications

- **Scope:** Build dashboard and release manager with SHA-256/codesigning checks, responsive status UI, private presigned downloads, retryable transactional emails and localization.
- **Inputs:** Subscription/licensing stable + Windows signed builds.
- **Outputs:** Customer dashboard, payment and license states, devices, secure official installer download, reminders, email.
- **Gate/exit:** End-to-end customer sees correct status; failed email leaves license available; unpublished binaries inaccessible; access checks pass.
- **Priority:** P0; **estimate:** 2–3 weeks.

### Phase 10 — Admin Operations, Reporting & Support

- **Scope:** Improve finance verification workspace, reports distinguish collected cash vs invoiced, redacted support views, exception queues for stuck jobs and reconciliation.
- **Inputs:** Payments, licenses and customer portal.
- **Outputs:** Unified work queues, immutable operations/audits, refund/correction workflows, finance reporting, support access.
- **Gate/exit:** Finance can reconcile credits; no unprivileged PII export; audit includes who/what/when/why; restart recovers interrupted work.
- **Priority:** P0; **estimate:** 2–3 weeks.

### Phase 11 — Security, Accessibility, QA & UAT

- **Scope:** Test negative flows, international transfer delays, concurrency, key rotation and clocks; conduct inclusive usability testing incl Deaf/hard-of-hearing participants with consent.
- **Inputs:** All MVP paths implemented.
- **Outputs:** Threat model review, penetration test, WCAG 2.2 AA audit, E2E test, load/restore drill, user/finance UAT.
- **Gate/exit:** Zero unresolved critical/high findings without formal acceptance; all P0 AC pass; audited restore and accessibility defects remediated.
- **Priority:** P0; **estimate:** 3–4 weeks.

### Phase 12 — Pilot Launch, Operations & Handover

- **Scope:** Use smoke tests with controlled small-volume transactions; launch Basic/Pro only, create incident/on-call and no manual database interventions without approvals.
- **Inputs:** Release signoffs + production setup.
- **Outputs:** Staged deployment, runbooks, monitoring, support SOP, bank verification SOP, rollback, pilot feedback, release checklist.
- **Gate/exit:** Paid order→bank verification→admin issuance→Windows activation verified in production; backup/restore readiness; rollback exercised.
- **Priority:** P0; **estimate:** 2–3 weeks.

### Phase 13 — Post-MVP Song Library & Institutions (NOT Release 1)

- **Scope:** Implement only after explicit separate scope approval, licensing/rights review and schema extension gate; prevent implicit Pro grants to Song Library Premium.
- **Inputs:** MVP stable + new approved PRD.
- **Outputs:** Separate Song Library subscriptions, free/premium content, institution seats and memberships.
- **Gate/exit:** Feature flags ensure no Song Library Premium checkout or institutional admin path in release 1; new AC required.
- **Priority:** P1; **estimate:** future.

## Cross-cutting rules

Every pull request must include linked requirement IDs, migrations if needed, generated OpenAPI update if public contract changes, explicit authorization, structured logs without secrets, unit/integration tests, edge cases, documented verification commands, and rollback steps. Use feature flags to keep unfinished operations hidden and server-disabled. Decisions marked TBD block production execution for that feature, never authorize placeholder bank accounts or prices.

## Required signoffs

- Product Owner: edition matrix, plan caps, subscription and user wording.
- Finance: beneficiary accounts, received-funds criteria, supported settlement currencies and fee shortfalls, refunds.
- Security/Tech Lead: identity and key custody, protocol, migrations, deployment readiness.
- Desktop Lead: Windows implementation and offline validation behavior.
- QA/UX/Accessibility: E2E and WCAG 2.2 AA test evidence.

## Traceability artifacts

Create `documentation/REQUIREMENT_TRACEABILITY.md` linking every DEC, PRD requirement, API operation, DB table/index, automated test, QA observation, and release gate. Maintain append-only ADRs in `documentation/adr/`. Mark accepted risk with reviewer and remediation date; do not conceal known defects.
