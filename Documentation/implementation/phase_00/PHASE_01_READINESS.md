# Phase 01 Readiness — Gate A

**Can Phase 01 begin? No.** The explicit Phase 00 approval gate has not passed. `DEVELOPMENT_ROADMAP.md` §§Critical path, Phase 00–01 and the Phase 01 prompt require approved contracts before foundation work. The Product Owner has now supplied 17 policy answers plus clarifications (ODL-005), approved ADR-01–08 direction and authorized draft SQL/OpenAPI/licensing alignment (ODL-003). Fixed 30/365-day terms conflict with existing calendar-month contracts; refund substance, legal review, verified company/bank/price publication and target tests remain open. Gate A remains pending.

## Required before approval

1. Product Owner approves Basic/Pro entitlement matrix, per-plan device/concurrency limits, early/late renewal and delayed-issuance compensation, grace/suspension/refund behavior, MVP scope and user wording (PRD §§2–3,8; C-02/04/06/11/12/17/18).
2. Finance and Legal approve real beneficiary and bank capabilities, supported invoice/settlement currencies, FX/fee/underpayment and late-remittance/refund rules, tax/legal invoice contents, terms and retention. Finance signs bank dual control and verified-credit SOP (PRD §3.3; C-07/08/12/14).
3. Security and Desktop Lead approve identity/session/MFA/CSRF, Windows device key algorithm/support matrix, activation claim/PoP, refresh rotation, JWS key custody/rotation, clock rollback and revocation policy (licensing §§3–9,13; C-03/05/09).
4. Tech Lead reviews the aligned draft migration/OpenAPI/licensing files and candidate manifest, completes UI path mapping and test fixture plan, and resolves P0 ALIGN/CR items (roadmap Gate A; C-01–18).
5. QA verifies agreed acceptance map for auth ownership, finance concurrency, one-credit uniqueness, renewal clock, desktop replay/offline and 320px/ID–EN accessibility. No test pass may be claimed until run (`ACCEPTANCE_CRITERIA.md` §§1–10).

## Phase 01 scope once explicitly authorized

The Phase 01 prompt permits pnpm monorepo, web/admin/api foundations, PostgreSQL/Redis local, migration tooling, environment validation, CI, logging and staging health checks. Its gate requires fresh-clone boot, lint/typecheck/build/tests, secret absence and staging isolation evidence. Production site and business workflows belong to later phases. Phase 13 future Song Library/institutions remain excluded.

## Decision record needed

For every approval: decision ID, option, exact value or policy, affected PRD/SQL/OpenAPI/licensing/UX files, owner/reviewer, date, compatibility/migration impact and acceptance tests. A comment or this proposal is not a signed approval.
