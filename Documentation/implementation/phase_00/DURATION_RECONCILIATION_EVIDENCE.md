# Fixed subscription term reconciliation evidence

**Date:** 2026-10-18 (Asia/Jakarta)
**Decision:** ODL-006 / ADR-10, option A.
**Status:** Tested candidate contract, **not** frozen or approved for production.

## Contract change

- Monthly = 720 elapsed UTC hours; annual = 8,760 elapsed UTC hours; paid end is exclusive and eligible grace is exactly 72 further elapsed hours.
- Source migrations 001 and 003 remain byte-for-byte unchanged. Draft 004 maps existing 1/12 identifiers to `term_days` 30/365 and rejects a historic paid period with an incompatible end instead of silently changing customer access. The physical old column/index names are removed or renamed in the resulting schema.
- OpenAPI 1.1.0-draft.2 uses `termDays` 30/365; UI, business, database, API, licensing and QA text now state the same duration.
- Full refund/delay-compensation policy, approved commercial values, Windows interoperability and contract freeze remain outside this decision.

## Executed checks

| Check | Result |
|---|---|
| `python3 Documentation/galung_api_v1/build_api.py` | PASS; 69 operations, 65 paths, 44 schemas, API draft.2 generated. |
| `python3 -m unittest Documentation/implementation/phase_00/verify_contracts.py -v` | PASS; 4 tests including `termDays` enum, absence of `billingMonths`, migration duration constraint and mapping. |
| `APP_ENV=test DATABASE_URL=<isolated local PostgreSQL> pnpm db:migrate` | PASS; 001, 003 and 004 applied in order. Local PostgreSQL 15.18 (Postgres.app); target PostgreSQL 16 CI run pending. |
| `APP_ENV=test DATABASE_URL=<isolated local PostgreSQL> pnpm db:check` | PASS; exact three migration IDs present. |
| `psql -v ON_ERROR_STOP=1 -f Documentation/implementation/phase_00/contract_constraint_checks.sql` | PASS; synthetic transaction rolled back. Month-end/leap/DST boundaries and invalid 31-day price / nonfixed period are checked, alongside exclusion and bank-control checks. First run failed because historic fixture used `interval '30 days'` across DST; fixture changed to `interval '720 hours'`, then rerun passed. |
| `python3 scripts/verify-workflow.py` | PASS; workflow structure checks. |
| `pnpm exec turbo run lint typecheck test build --force` | PASS; 19/19 tasks, zero cached, 18.148 seconds. |
| `git diff --check` and manifest digest verification | PASS; no whitespace errors, all manifest file hashes match. |

## Deployment and review limit

The migration runner still rejects production and requires explicit staging opt-in. These tests used a disposable local database, not customer data; no production migration, rollback of live data, pricing handler, or Windows client was tested. A staging CI run and cross-functional review are required before contract freeze. Phase 01 PR remains draft and Phase 02 has not started.
