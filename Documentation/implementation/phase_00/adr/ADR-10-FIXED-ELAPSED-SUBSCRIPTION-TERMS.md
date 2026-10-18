# ADR-10 — Fixed elapsed subscription terms

**Status:** Product Owner decision recorded 2026-10-18; technical draft verified locally, not a Gate A freeze.

## Decision

A monthly term is exactly 30 × 24 elapsed hours (720 hours). An annual term is exactly 365 × 24 elapsed hours (8,760 hours). The server records UTC instants; the subscriber's or operator's timezone changes display only. `paid_end_at` is exclusive. Eligible grace ends exactly 72 elapsed hours later. Initial and late terms start at `greatest(payment_approved_at, entitlement_ready_at)`; an early renewal that is approved and ready before the current paid end starts at that previous exclusive end. An entitlement failure does not consume time. A renewal whose issuance crosses expiry is treated as late, with no backdating; any Galung-caused service adjustment still needs a separate approved policy and audit entry.

## Contract and compatibility

The original 001 and 003 SQL migrations remain unchanged. Candidate migration `004_fixed_subscription_terms.sql` converts stored cycle identifiers 1/12 into `term_days` 30/365 in prices, order items and subscription periods and enforces exact elapsed duration on period rows. Pre-existing period rows that do not match the fixed term stop migration for manual review; no automatic shortening or extension is safe. The draft OpenAPI uses `termDays` 30/365 instead of `billingMonths` 1/12 and advances to 1.1.0-draft.2. No commerce handler or external client implements the earlier draft. Price and order snapshots must be reviewed before any production backfill.

## Verification and open gate

PostgreSQL local migration and synthetic constraints, including DST and leap-date boundaries, and OpenAPI contract tests must pass. Security, Finance, Desktop, QA and Tech Lead still need to review the frozen contract package; financial/legal values and repo protection are separate blockers. This decision alone does not approve Phase 00, Phase 01 or Phase 02.
