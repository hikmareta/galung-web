# Contract Version Manifest — Phase 00 Aligned Draft Candidate

**Status:** CANDIDATE / NOT FROZEN. This is a reproducible inventory of the aligned Phase 00 draft, not a frozen production contract. Product Owner reports prices, features, device/concurrency limits, bank/currency/fee, tax/refund and legal-identity values are all **TBD** (2026-10-18). The Product Owner approved ADR-01–08 architecture/control direction and authorized draft alignment of SQL, OpenAPI and licensing; financial values remain TBD and Gate A remains pending.

| Contract | Actual file | Declared version | SHA-256 | Authority / gap |
|---|---|---|---|---|
| Product | `Documentation/PRODUCT_REQUIREMENTS.md` | v1.0 | `0256cce28cdea7eb15ea6e582b3803e50a2420395ee9ce3f1f7545030469664e` | Binding DEC-001–006; TBD values remain open |
| Business | `Documentation/BUSINESS_RULES_AND_FLOWS.md` | v1.0 | `107c8104c3e3a2da93924f5822f1449c4fc66546b701e50e3f12a79474b45c1d` | Binding transitions; exception policies open |
| UI/UX | `Documentation/UI_UX_SCREEN_SPECIFICATION.md` | header v1.0; roadmap says v1.1 | `b34a23cc26663f954018c19056573a0a9bf3f4b01b02f79d0f4f8c899e8e81d9` | Version discrepancy to resolve |
| Database narrative | `Documentation/database/DATABASE_SCHEMA_SPECIFICATION.md` | v1.0 draft | `4a669091a9c1047e9df9b856c456691c94e328cdf85760c9963ab10b0e91a567` | Aligned draft; migration remains candidate |
| Database SQL | `Documentation/database/001_core_schema.sql` | reference DDL | `dffa9eec52d8cf4a35acb85855b008d34f15740c77259f1892fc8f383b414eee` | Not migration-tested or approved |
| API narrative | `Documentation/galung_api_v1/API_SPECIFICATION.md` | v1.0 draft | `8d073b2e87cdf52f2d229213e5b967da28ec6020ef4126590b731acfcd20e5d7` | Aligned draft; no handler implementation |
| OpenAPI YAML | `Documentation/galung_api_v1/openapi.yaml` | OpenAPI 3.1.0; API 1.1.0-draft.1 | `3da5c2aa46d2c6017d8ea6e9b5b40fe201e4ca8bab597578107729747c8a5ec3` | Aligned draft; structurally verified |
| OpenAPI JSON | `Documentation/galung_api_v1/openapi.json` | OpenAPI 3.1.0; API 1.1.0-draft.1 | `a624c89ea3df1acfb28a99e45d144e3c258a928ea6d7f6e015a57a424c96de16` | Generated equivalent export |
| Licensing | `Documentation/galung_licensing_v1/LICENSING_PROTOCOL_SPECIFICATION.md` | v1.0 proposed | `ff89c4580b612708f97d942e9cff69a7c1fcfa91bcd2dfffdbec724fe0b80ffc` | Aligned draft; Windows interop pending |

| Database SQL delta | `Documentation/database/003_phase00_contract_delta.sql` | Phase 00 candidate | `97aa7a94ef3f8653dc4c5e11e20377b6e5a9b6160ee69ab6e547d24dd6625d33` | Additive draft; PostgreSQL 15 smoke passed previously; constraint test pending |

## Freeze prerequisites

1. Close each P0 in `RECONCILIATION_BACKLOG.md`, including exact D-01–D-06 revisions; record owner and verification evidence.
2. Record detailed cross-functional signoff on ADR-01–08; Product Owner approved architecture/control direction and ADR-03 two-person MFA principle. Resolve PRD TBD values before affected production feature can be enabled.
3. Review the aligned draft SQL delta, OpenAPI YAML/JSON and licensing wire contract together; run target PostgreSQL 16+ and Windows compatibility checks before freeze.
4. Record Product, Finance, Security, Desktop, QA and Tech Lead signatures and date. No signature is inferred from this document.

## Contract hierarchy

Approved DEC-001–006 and explicit owner decisions -> PRD/business rules -> signed ADRs/this manifest after freeze -> reconciled SQL/OpenAPI/licensing -> UI bindings -> phase prompts. The aligned SQL/OpenAPI/licensing files are candidate drafts, not frozen production contracts; Phase 01 remains gated.
