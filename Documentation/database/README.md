# Galung.id — Database Engineering Pack v1.0

**Date:** 2026-10-17 · **Status:** Design for technical review

## Files
1. `DATABASE_SCHEMA_SPECIFICATION.md` — Complete MVP database design, entities, integrity policy, payments/subscriptions/licensing lifecycle, migrations, security, extension boundaries.
2. `001_core_schema.sql` — PostgreSQL reference schema DDL for MVP. Review and test before production.
3. `002_future_extensions.sql` — Future conceptual table sketch only, not executable MVP migration.
4. `DATABASE_VALIDATION_CHECKLIST.md` — Migration and E2E review gates.
5. `003_phase00_contract_delta.sql` — additive Phase 00 reconciliation **draft** after `001`; not approved for production.
6. `004_fixed_subscription_terms.sql` — owner-selected fixed 30/365 elapsed-day **draft** after `003`; renames term fields and validates exact elapsed duration. `002_future_extensions.sql` is not in the MVP execution chain.

## Relationship to previous documentation
Intended as a new artifact in `documentation/` alongside PRD v1.0, Business Rules, UI/UX Screen Specification v1.1, and Acceptance Criteria. If two documents conflict, escalate to Product Management; do not silently choose an interpretation. The six final decisions from 2026-10-17 have priority.

## Recommended developer usage
1. Review data model with finance, licensing and security representatives.
2. Decide unresolved payment exceptions, auth implementation, real currency exponents, first production price and device limits.
3. Turn reference DDL into numbered migration files.
4. Execute migrations in an isolated PostgreSQL staging DB (not executed during document generation).
5. Implement transactions and concurrency constraints described in the specification.
6. Demonstrate every acceptance test before deploy.

**DO NOT** treat this reference DDL as a production approval or as proof that migrations have been executed.
