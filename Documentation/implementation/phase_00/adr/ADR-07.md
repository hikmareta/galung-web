# ADR-07: Canonical version and route governance

**Status:** PROPOSED  
**Decision owners:** Tech Lead, Product, QA  
**Recorded:** 2026-10-18, Asia/Jakarta

## Context

Galung Phase 00 requires a reviewable choice before production contracts are frozen. Sources: D-06; CR-07/13; ALIGN-17; API contract tests.

## Proposed decision

Publish a signed contract manifest with file hashes, API/DB/licensing versions, operation map, migration IDs and compatibility policy; freeze only after P0 closures and test evidence.

## Alternatives and unresolved questions

Current draft YAML/JSON parity is structural only; no handlers or migrations exist.

## Consequences and validation

Update the affected SQL/OpenAPI/licensing/UI contracts through the reviewed delta in `../CONTRACT_DELTA_SPEC.md`; preserve historical records, require authorization and idempotency where applicable, and run the linked negative, concurrency and boundary tests before implementation acceptance. This document is not test evidence.

## Approval record

| Reviewer | Decision/date | Evidence |
|---|---|---|
| Tech Lead, Product, QA | Pending unless the status above explicitly records a limited approved principle | Written review required |
