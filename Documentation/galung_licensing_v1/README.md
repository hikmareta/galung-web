# Galung.id Licensing Protocol Pack v1.0

This package follows Galung Product PRD v1.0, UI/UX v1.1, Database v1.0 and API v1.0. It contains a **proposal for review**, not an implemented signing service, runtime, database migration, or deployed API.

Phase 00 reconciliation drafts are `Documentation/database/003_phase00_contract_delta.sql`, `Documentation/galung_api_v1/openapi.yaml` 1.1.0-draft.2 and this package's revised protocol/examples. The original `001_core_schema.sql` remains intact. No Gate A approval or Windows interoperability is implied.

Read in order: `LICENSING_PROTOCOL_SPECIFICATION.md` -> `LICENSING_API_EXAMPLES.md` -> `SCHEMA_AND_API_CHANGE_REQUESTS.md` -> `THREAT_MODEL.md` -> `LICENSING_TEST_MATRIX.md`.

Project-specific immutable business decisions: Basic and Pro only for MVP; manual verified bank transfer; explicit admin issuance; configurable device policy by package; max offline 14 days; 72-hour grace; renewal after paid end starts when payment approved and entitlement ready; international customers allowed via manually verified bank transfers.

Engineering gates: approve protocol+threat model, patch DB+OpenAPI, implement server signing in protected key service, implement Windows key storage, run secure tests, perform human security review, verify actual Windows compatibility, then phase-gate release.
