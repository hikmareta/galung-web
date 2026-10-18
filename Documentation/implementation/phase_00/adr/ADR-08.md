# ADR-08: Modular TypeScript architecture

**Status:** PROPOSED  
**Decision owners:** Tech Lead, Security  
**Recorded:** 2026-10-18, Asia/Jakarta

## Context

Galung Phase 00 requires a reviewable choice before production contracts are frozen. Sources: IMPLEMENTATION_HANDOFF.md §2; DEVELOPMENT_ROADMAP.md Phase 01.

## Proposed decision

Use pnpm workspace, Next.js web/admin, NestJS modular monolith, PostgreSQL, Prisma after compatibility review, Redis/BullMQ and private S3-compatible storage.

## Alternatives and unresolved questions

Stable dependency versions and Prisma/schema compatibility are Phase 01 selections after Gate A.

## Consequences and validation

Update the affected SQL/OpenAPI/licensing/UI contracts through the reviewed delta in `../CONTRACT_DELTA_SPEC.md`; preserve historical records, require authorization and idempotency where applicable, and run the linked negative, concurrency and boundary tests before implementation acceptance. This document is not test evidence.

## Approval record

| Reviewer | Decision/date | Evidence |
|---|---|---|
| Tech Lead, Security | Pending unless the status above explicitly records a limited approved principle | Written review required |
