# ADR-09 — Separate operational health contract

**Status:** Accepted for Phase 01 foundation only, pending Tech Lead review record.  
**Date:** 2026-10-18

## Context

The Phase 00 commercial OpenAPI draft contains unimplemented identity, finance and licensing operations and remains a candidate contract. Phase 01 needs health endpoints for CI and staging without implying that commercial operations are available.

## Decision

The Phase 01 API exposes only `/api/v1/health/live` and `/api/v1/health/ready`. Their contract is versioned separately in `apps/api/openapi/operational.yaml`. A test compares its paths and 503 code with handler metadata. The commercial OpenAPI draft remains unchanged. Both health routes are explicitly public under a global fail-closed permission guard; no other route becomes public by omission.

## Consequences

Readiness means PostgreSQL and Redis respond; it does not mean commerce or licensing is ready. Failure returns a stable `503 DEPENDENCY_UNAVAILABLE` envelope without dependency details. Phase 02 must integrate identity, scoped service/query authorization and commercial OpenAPI handlers under separate approval. Before production exposure, combine or cross-reference operational and commercial API documentation in a reviewed version manifest.
