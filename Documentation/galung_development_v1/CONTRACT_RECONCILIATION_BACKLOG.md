# CONTRACT_RECONCILIATION_BACKLOG.md

**Purpose:** close the already-documented gaps in API v1.0, PostgreSQL v1.0, and Licensing v1.0 before Phase 01 migrations freeze. **These are NOT yet applied changes.**

| ID | Required action | Affected contracts | Blocking gate |
|---|---|---|---|
| CR-01 | Choose production identity/session, MFA, CSRF, recovery model | DB/API/Auth | A |
| CR-02 | Add one-time activation claims and secret hashing | DB/API/License | A |
| CR-03 | Add device public keys, thumbprints, proof-of-possession and challenge nonce | DB/API/License | A |
| CR-04 | Define rotated refresh credentials and replay resistance | DB/API/License | A |
| CR-05 | Add signing public key registry, key IDs, rotation, protect private signing keys externally | DB/API/License | A |
| CR-06 | Resolve renewal against existing license despite issuance-request unique constraints | DB/API/Subscription | A |
| CR-07 | Freeze canonical desktop route names and signed entitlement OpenAPI schema | API/License | A |
| CR-08 | Add entitlement-ready ledger event and safe subscription start rule | DB/API/Subscription | A |
| CR-09 | Choose supported settlement currencies, fees/FX tolerance and bank matching controls | Product/DB/API/Finance | A |
| CR-10 | Bank change request and two-person approval API/migrations | DB/API/Admin | A |
| CR-11 | Add user legal consent versions and country-dependent terms/tax handling | DB/API/Legal | A |
| CR-12 | Design secure private upload lifecycle, file scanning and proof revisions | DB/API/Storage | A |
| CR-13 | Finish RBAC, error state mapping and audit/outbox contract | DB/API/Admin | A |
| CR-14 | Choose promo rounding and quota policy, account for versioned prices | Product/DB/API | B |
| CR-15 | CMS media/revisions and signed software release publishing | API/DB/CMS | D |

### Procedure

For each CR: create ADR, assign owner, propose exact SQL/Prisma/OpenAPI diff, add failing test, obtain reviewer signoff, implement migration and update all docs; record previous contract version and rollback strategy. Do not label changes as complete until applied and verified.
