# ADR-06: Entitlement readiness and service clocks

**Status:** PROPOSED  
**Decision owners:** Product, Finance, Tech Lead  
**Recorded:** 2026-10-18, Asia/Jakarta

## Context

Galung Phase 00 requires a reviewable choice before production contracts are frozen. Sources: D-03/D-04; CR-08; ALIGN-11/12; SUB-003–005/010–014.

## Proposed decision

Readiness occurs when the authorized license/entitlement revision and its server-signed issuance artifact are durably committed, claimable in My Galung, and the server can start the activation ceremony. It does **not** wait for customer device activation or a device-bound offline JWS; those occur afterward. New/late term starts at max(finance approval, readiness); early renewal starts at prior paid end. Grace is 72 hours and offline at most 336 hours bounded by authorized end. The exact issuance-artifact serialization and client use must be frozen with the Desktop Lead.

## Alternatives and unresolved questions

Compensation for an early-approved renewal delayed past paid end, month-end arithmetic and suspension/refund treatment remain TBD.

## Consequences and validation

Update the affected SQL/OpenAPI/licensing/UI contracts through the reviewed delta in `../CONTRACT_DELTA_SPEC.md`; preserve historical records, require authorization and idempotency where applicable, and run the linked negative, concurrency and boundary tests before implementation acceptance. This document is not test evidence.

## Approval record

| Reviewer | Decision/date | Evidence |
|---|---|---|
| Product, Finance, Tech Lead | Pending unless the status above explicitly records a limited approved principle | Written review required |
