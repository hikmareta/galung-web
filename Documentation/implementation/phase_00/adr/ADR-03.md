# ADR-03: Two-person beneficiary change

**Status:** PRINCIPLE APPROVED; IMPLEMENTATION PROPOSED  
**Decision owners:** Product Owner, Finance, Security  
**Recorded:** 2026-10-18, Asia/Jakarta

## Context

Galung Phase 00 requires a reviewable choice before production contracts are frozen. Sources: D-02; CR-10; ALIGN-14; ADM-003/004.

## Proposed decision

A bank-beneficiary change needs MFA by two different authorized people before publication. Proposed workflow is request with MFA -> independent approval with MFA -> atomic publication of the exact approved proposal/version by the second actor, with audit and immutable invoice history. No direct account mutation or self-approval path is allowed.

## Alternatives and unresolved questions

Product Owner explicitly approved the two-person MFA principle in this chat on 2026-10-18. Exact roles, emergency recovery and endpoint design are not approved.

## Consequences and validation

Update the affected SQL/OpenAPI/licensing/UI contracts through the reviewed delta in `../CONTRACT_DELTA_SPEC.md`; preserve historical records, require authorization and idempotency where applicable, and run the linked negative, concurrency and boundary tests before implementation acceptance. This document is not test evidence.

## Approval record

| Reviewer | Decision/date | Evidence |
|---|---|---|
| Product Owner, Finance, Security | Pending unless the status above explicitly records a limited approved principle | Written review required |
