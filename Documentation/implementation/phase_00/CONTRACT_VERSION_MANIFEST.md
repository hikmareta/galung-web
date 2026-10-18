# Contract Version Manifest — Phase 00 Aligned Draft Candidate

**Status:** CANDIDATE / NOT FROZEN. This is a reproducible inventory of the aligned Phase 00 draft, not a frozen production contract. Product Owner reports prices, features, device/concurrency limits, bank/currency/fee, tax/refund and legal-identity values are all **TBD** (2026-10-18). The Product Owner approved ADR-01–08 architecture/control direction and selected fixed 720/8,760-hour terms in ODL-006/ADR-10 and authorized draft alignment of SQL, OpenAPI and licensing; financial values remain TBD and Gate A remains pending.

| Contract | Actual file | Declared version | SHA-256 | Authority / gap |
|---|---|---|---|---|
| Product | `Documentation/PRODUCT_REQUIREMENTS.md` | v1.0 | `cb25c6077ca50bf441985e261e41f0ac207c068405b42c9b95c20416cdd403fc` | Binding DEC-001–006; TBD values remain open |
| Business | `Documentation/BUSINESS_RULES_AND_FLOWS.md` | v1.0 | `4a422bb4737008b07ebbef7061b701231aaab07806439a90738e52fd157fcb65` | Binding transitions; exception policies open |
| UI/UX | `Documentation/UI_UX_SCREEN_SPECIFICATION.md` | header v1.0; roadmap says v1.1 | `5ebed869ad040b311d164c98c24cb2976740a72a818d006cad8674bfdeecff2d` | Version discrepancy to resolve |
| Database narrative | `Documentation/database/DATABASE_SCHEMA_SPECIFICATION.md` | v1.0 draft | `c0599ce85f5eb96b3b45b29e665d11d90e955caeee24329a899bf0b28ad756d0` | Aligned draft; migration remains candidate |
| Database SQL | `Documentation/database/001_core_schema.sql` | reference DDL | `dffa9eec52d8cf4a35acb85855b008d34f15740c77259f1892fc8f383b414eee` | Not migration-tested or approved |
| API narrative | `Documentation/galung_api_v1/API_SPECIFICATION.md` | v1.0 draft | `b4249bc858c0fab2a958e58218a8e18b766ff82d29dc955f7822d8cdf0b43d12` | Aligned draft; no handler implementation |
| OpenAPI YAML | `Documentation/galung_api_v1/openapi.yaml` | OpenAPI 3.1.0; API 1.1.0-draft.2 | `a2ea8179814d4e7378bcba1e7608249849ab1498d8c6259ac50ecff555582876` | Aligned draft; structurally verified |
| OpenAPI JSON | `Documentation/galung_api_v1/openapi.json` | OpenAPI 3.1.0; API 1.1.0-draft.2 | `c3b7b9bf66ac8a352473e904edafef8249c599166018408ea8c74ccfc754dca0` | Generated equivalent export |
| Licensing | `Documentation/galung_licensing_v1/LICENSING_PROTOCOL_SPECIFICATION.md` | v1.0 proposed | `96f0d1399a99d16bd81132900e3c84360f19cf0088403e7780e125ec1b940476` | Aligned draft; Windows interop pending |

| Database SQL delta | `Documentation/database/003_phase00_contract_delta.sql` | Phase 00 candidate | `97aa7a94ef3f8653dc4c5e11e20377b6e5a9b6160ee69ab6e547d24dd6625d33` | Additive draft; PostgreSQL 15 smoke passed previously; constraint test pending |

| Fixed-term SQL delta | `Documentation/database/004_fixed_subscription_terms.sql` | Phase 00 candidate | `bb6e9abb554da370e9dbd50e3ac0d4497eeb09263ec98b0df797ca2eb327ac1b` | Converts 1/12 cycle identifiers to 30/365 elapsed days; local PostgreSQL migration and constraints passed; production approval pending |

## Freeze prerequisites

1. Close each P0 in `RECONCILIATION_BACKLOG.md`, including exact D-01–D-06 revisions; record owner and verification evidence.
2. Record detailed cross-functional signoff on ADR-01–08; Product Owner approved architecture/control direction and ADR-03 two-person MFA principle. Resolve PRD TBD values before affected production feature can be enabled.
3. Review the aligned draft SQL delta, OpenAPI YAML/JSON and licensing wire contract together; run target PostgreSQL 16+ and Windows compatibility checks before freeze.
4. Record Product, Finance, Security, Desktop, QA and Tech Lead signatures and date. No signature is inferred from this document.

## Contract hierarchy

Approved DEC-001–006 and explicit owner decisions -> PRD/business rules -> signed ADRs/this manifest after freeze -> reconciled SQL/OpenAPI/licensing -> UI bindings -> phase prompts. The aligned SQL/OpenAPI/licensing files are candidate drafts, not frozen production contracts; Phase 01 remains gated.
