# ODL-007 identity package manifest — scoped Phase 02 baseline

**Status:** FROZEN FOR PHASE 02 IDENTITY IMPLEMENTATION ONLY by ODL-008 on 2026-10-20. These hashes identify the exact PR #3 review inputs. `@dhikandhika` approved head `08a271d` as Tech Lead, Security and QA ([review 1](https://github.com/hikmareta/galung-web/pull/3#pullrequestreview-5580814522), [review 2](https://github.com/hikmareta/galung-web/pull/3#pullrequestreview-5580831993)); the Product Owner then explicitly closed Phase 01. The source documents retain their pre-decision candidate headings so their reviewed hashes do not change. This scoped freeze is a development baseline, **not** production migration approval or full Gate A freeze.

| File | SHA-256 |
|---|---|
| `Documentation/implementation/phase_00/adr/ADR-01.md` | `f6fe04b834090bcc4190fab62c53e67b6afc773c35cec5ed421164e372255650` |
| `Documentation/implementation/phase_00/IDENTITY_CONTRACT_V1_REVIEW.md` | `208711561f9ace57ddc29dea8e98adc5518f324beaf4b24f5b8f511c511b6c72` |
| `Documentation/database/005_identity_contract_candidate.sql` | `d8effc4f70abac4afef2d1fc6814cdf80db53b166031852f38229f4b2bee5ef2` |
| `Documentation/galung_api_v1/identity-openapi-candidate.json` | `cfb6f7569820bf235e2fd7de285210df6fdec1a149863f48da4b04b1c2408b21` |

Commercial `CONTRACT_VERSION_MANIFEST.md` remains `CANDIDATE / NOT FROZEN`. Any change to a hashed source requires a versioned contract revision and review. Phase 02 must reconcile the identity overlay with canonical OpenAPI and verify the candidate SQL on PostgreSQL 16 before implementing/deploying identity behavior.
