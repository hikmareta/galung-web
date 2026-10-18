# One-to-One Reconciliation Backlog — Phase 00

Source IDs are reproduced from `galung_api_v1/SCHEMA_ALIGNMENT_NOTES.md` (ALIGN) and `galung_development_v1/CONTRACT_RECONCILIATION_BACKLOG.md` (CR). This table tracks **all 33 items individually**. `OPEN` means owner approval, contract application, and verification are still outstanding. `PRINCIPLE APPROVED; DELTA OPEN` records the Product Owner's two-person MFA decision while the technical contract remains open. C IDs refer to `CONTRACT_CONFLICT_REPORT.md`; D sections refer to `CONTRACT_DELTA_SPEC.md`.

| Source ID | Source requirement / gap | Priority | Linked finding | Decision owner | Proposed artifact | Closure evidence required | Status |
|---|---|---|---|---|---|---|---|
| ALIGN-01 | Authorization | P0 | C-09 | Security/Tech Lead | ADR-01; D-01 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-02 | Desktop | P0 | C-03/C-05 | Security/Desktop Lead | ADR-05; D-04 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-03 | Issuance delivery | P0 | C-03 | Security/Product | ADR-05; D-04 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-04 | Renewal | P0 | C-04 | Product/Security | ADR-04; D-03 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-05 | Pricing currency | P0 | C-07 | Finance/Product | ADR-02; D-02 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-06 | Bank reconciliation | P1 | C-07/C-12 | Finance/Legal | ADR-02; D-02 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-07 | Proof upload | P0 | C-10 | Security/Tech Lead | D-05 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-08 | Promo | P1 | C-16 | Product/Finance | D-02 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-09 | Tax / legal | P0 | C-14 | Legal/Product | D-01/D-02 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-10 | Device model | P0 | C-03/C-17 | Security/Desktop Lead | ADR-05; D-04 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-11 | Subscription updates | P0 | C-02/C-11 | Product/Tech Lead | ADR-06; D-03 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-12 | Plan policy | P1 | C-06 | Product/Desktop Lead | ADR-06; D-04 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-13 | CMS | P1 | C-16 | UX/Tech Lead | D-05 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-14 | Admin lifecycle | P0 | C-08 | Finance/Security | ADR-03; D-02 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | PRINCIPLE APPROVED; DELTA OPEN |
| ALIGN-15 | Email | P1 | C-16 | Operations/Tech Lead | D-05 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-16 | Proof revision | P0 | C-10 | Security/Tech Lead | D-05 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-17 | Backend error mapping | P0 | C-01/C-15 | Tech Lead/UX | D-02/D-06 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| ALIGN-18 | Release | P1 | C-16 | Security/Release Lead | D-05 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| CR-01 | Choose production identity/session, MFA, CSRF, recovery model | P0 | C-09 | Security/Tech Lead | ADR-01; D-01 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| CR-02 | Add one-time activation claims and secret hashing | P0 | C-03 | Security/Desktop Lead | ADR-05; D-04 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| CR-03 | Add device public keys, thumbprints, proof-of-possession and challenge nonce | P0 | C-03 | Security/Desktop Lead | ADR-05; D-04 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| CR-04 | Define rotated refresh credentials and replay resistance | P0 | C-03 | Security/Desktop Lead | ADR-05; D-04 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| CR-05 | Add signing public key registry, key IDs, rotation, protect private signing keys externally | P0 | C-05 | Security/Desktop Lead | ADR-05; D-04 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| CR-06 | Resolve renewal against existing license despite issuance-request unique constraints | P0 | C-04 | Product/Security | ADR-04; D-03 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| CR-07 | Freeze canonical desktop route names and signed entitlement OpenAPI schema | P0 | C-03/C-05/C-15 | Security/Tech Lead | D-04/D-06 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| CR-08 | Add entitlement-ready ledger event and safe subscription start rule | P0 | C-02/C-11 | Product/Tech Lead | ADR-06; D-03 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| CR-09 | Choose supported settlement currencies, fees/FX tolerance and bank matching controls | P0 | C-07 | Finance/Product | ADR-02; D-02 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| CR-10 | Bank change request and two-person approval API/migrations | P0 | C-08 | Finance/Security | ADR-03; D-02 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | PRINCIPLE APPROVED; DELTA OPEN |
| CR-11 | Add user legal consent versions and country-dependent terms/tax handling | P0 | C-14 | Legal/Product | D-01/D-02 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| CR-12 | Design secure private upload lifecycle, file scanning and proof revisions | P0 | C-10 | Security/Tech Lead | D-05 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| CR-13 | Finish RBAC, error state mapping and audit/outbox contract | P0 | C-01/C-09/C-15 | Security/Tech Lead | D-01/D-02/D-06 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| CR-14 | Choose promo rounding and quota policy, account for versioned prices | P1 | C-13/C-16 | Product/Finance | D-02 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |
| CR-15 | CMS media/revisions and signed software release publishing | P1 | C-16 | UX/Tech Lead | D-05 | Signed decision + reviewed SQL/OpenAPI/licensing diff + linked contract/test evidence | OPEN |

## Closure protocol

For each row record reviewer, decision date, contract version, exact changed locations, test command/output, and rollback strategy. A proposal alone never changes `OPEN` to `CLOSED`. P0 rows are Gate A blockers; P1 rows remain feature/release blockers where their functionality is required. See `PHASE_00_ACCEPTANCE_REPORT.md` for current gate verdict.
