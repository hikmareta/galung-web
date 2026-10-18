# ADR-04: Persistent license identity and renewal revisions

**Status:** PROPOSED  
**Decision owners:** Product, Security, Desktop Lead  
**Recorded:** 2026-10-18, Asia/Jakarta

## Context

Galung Phase 00 requires a reviewable choice before production contracts are frozen. Sources: D-03; CR-06/08; ALIGN-04/11; LIC-REN-001–003.

## Proposed decision

Keep a logical license and append immutable issuance/renewal revisions linked to each approved source order. Renewals update the server-authoritative entitlement revision rather than multiplying active logical licenses. Device-bound JWS tokens are issued later for each activation/validation and have their own `jti` history; a license revision does not contain one shared token `jti`.

## Alternatives and unresolved questions

Alternative new-license-per-period needs an explicit ownership/device migration and deactivation design; current SQL cannot silently decide.

## Consequences and validation

Update the affected SQL/OpenAPI/licensing/UI contracts through the reviewed delta in `../CONTRACT_DELTA_SPEC.md`; preserve historical records, require authorization and idempotency where applicable, and run the linked negative, concurrency and boundary tests before implementation acceptance. This document is not test evidence.

## Approval record

| Reviewer | Decision/date | Evidence |
|---|---|---|
| Product, Security, Desktop Lead | Pending unless the status above explicitly records a limited approved principle | Written review required |
