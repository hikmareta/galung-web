# ADR-01: Identity, sessions, MFA and CSRF

**Status:** PROPOSED  
**Decision owners:** Security, Tech Lead  
**Recorded:** 2026-10-18, Asia/Jakarta

## Context

Galung Phase 00 requires a reviewable choice before production contracts are frozen. Sources: D-01; CR-01/13; ALIGN-01; AUTH-001–008.

## Proposed decision

Use a vetted identity provider or audited adapter with server-side opaque HttpOnly Secure SameSite sessions, CSRF protection on authenticated mutations, mandatory admin MFA and step-up for high-risk actions.

## Alternatives and unresolved questions

Provider and MFA recovery are TBD; hand-written password reset without review is rejected.

## Consequences and validation

Update the affected SQL/OpenAPI/licensing/UI contracts through the reviewed delta in `../CONTRACT_DELTA_SPEC.md`; preserve historical records, require authorization and idempotency where applicable, and run the linked negative, concurrency and boundary tests before implementation acceptance. This document is not test evidence.

## Approval record

| Reviewer | Decision/date | Evidence |
|---|---|---|
| Security, Tech Lead | Pending unless the status above explicitly records a limited approved principle | Written review required |
