# Galung.id — AI Developer Repository Instructions

You are working on Galung.id, a commercial music-software subscription and licensing platform.

## Mandatory Documentation

All authoritative project documentation is located under `Documentation/`.

Before making changes:

1. Read `Documentation/DOCUMENTATION_INDEX.md`.
2. Read `Documentation/PRODUCT_REQUIREMENTS.md`.
3. Read `Documentation/BUSINESS_RULES_AND_FLOWS.md`.
4. Read `Documentation/galung_development_v1/AI_DEVELOPMENT_RULES.md`.
5. Read `Documentation/galung_development_v1/DEVELOPMENT_ROADMAP.md`.
6. Read the current phase prompt under `Documentation/galung_development_v1/prompts/`.
7. Read relevant UI/UX, database, API, and licensing specifications for the task.

Follow references to supporting specifications and change-request documents.

Do not assume documentation is fully synchronized. Known gaps between database, API, and licensing specifications must be resolved before production implementation.

## Approved Product Decisions

- MVP products: Galung Basic and Galung Pro.
- Manual bank transfers only; no payment gateway.
- International manual bank transfers are supported.
- Payment verification is performed by authorized administrators.
- Payment approval and license issuance are separate operations.
- Device limits are configurable per plan.
- Maximum temporary offline licensing: 14 days.
- Subscription grace period: 72 hours.
- Late renewal begins a new period after approval and successful entitlement activation.
- Song Library Premium and institutional licensing are post-MVP.

## Engineering Standards

- Use the approved TypeScript, Next.js, NestJS, and PostgreSQL architecture.
- Preserve existing documentation and migration history.
- Apply strict input validation, authentication, RBAC, and audit logging.
- Never hardcode secrets, bank accounts, prices, or configurable license limits.
- Never bypass manual payment verification.
- Never invent test results.
- Keep implementation aligned with approved API and database contracts.
- Add automated tests for all critical business rules.

## Development Workflow

1. Identify the active development phase.
2. Read its complete prompt and dependencies.
3. Explain the proposed changes before implementing significant work.
4. Work only within the authorized phase.
5. Run relevant tests and document results.
6. Report modified files, risks, blockers, and acceptance criteria.
7. Stop at each phase approval gate.

## Current Starting Phase

Phase 00 — Contract Reconciliation & Technical Decisions.

Do not proceed to Phase 01 until Phase 00 has been approved.

## Communication

Respond to the product owner in Bahasa Indonesia.

Code, technical identifiers, and documentation may use English.