# ADR-05: Device proof, refresh and signing keys

**Status:** PROPOSED  
**Decision owners:** Security, Desktop Lead  
**Recorded:** 2026-10-18, Asia/Jakarta

## Context

Galung Phase 00 requires a reviewable choice before production contracts are frozen. Sources: D-04; CR-02–05/07; ALIGN-02/03/10/12; LIC-DEV/SEC/OFF/KEY.

## Proposed decision

Use one-use activation claims, server challenge and device key PoP, rotating hashed refresh credentials, Ed25519 signed offline JWS and pinned public key registry. Private signing keys remain outside DB/client.

## Alternatives and unresolved questions

Device PoP algorithm and Windows support range remain TBD; P-256 is a candidate, not an approved format.

## Consequences and validation

Update the affected SQL/OpenAPI/licensing/UI contracts through the reviewed delta in `../CONTRACT_DELTA_SPEC.md`; preserve historical records, require authorization and idempotency where applicable, and run the linked negative, concurrency and boundary tests before implementation acceptance. This document is not test evidence.

## Approval record

| Reviewer | Decision/date | Evidence |
|---|---|---|
| Security, Desktop Lead | Pending unless the status above explicitly records a limited approved principle | Written review required |
