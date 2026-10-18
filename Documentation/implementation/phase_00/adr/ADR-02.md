# ADR-02: Finance ledger and international settlement

**Status:** PROPOSED  
**Decision owners:** Finance, Product, Legal  
**Recorded:** 2026-10-18, Asia/Jakarta

## Context

Galung Phase 00 requires a reviewable choice before production contracts are frozen. Sources: D-02; CR-09/14; ALIGN-05/06/08; PAY-001–015.

## Proposed decision

Only independently verified credited funds can be approved. Use atomic one-credit allocation and append-only correction. Shortfall/FX cases stay exception until Finance policy is approved.

## Alternatives and unresolved questions

No currency, fee tolerance, refund or tax values are approved. Split allocations require a separately reviewed ledger.

## Consequences and validation

Update the affected SQL/OpenAPI/licensing/UI contracts through the reviewed delta in `../CONTRACT_DELTA_SPEC.md`; preserve historical records, require authorization and idempotency where applicable, and run the linked negative, concurrency and boundary tests before implementation acceptance. This document is not test evidence.

## Approval record

| Reviewer | Decision/date | Evidence |
|---|---|---|
| Finance, Product, Legal | Pending unless the status above explicitly records a limited approved principle | Written review required |
