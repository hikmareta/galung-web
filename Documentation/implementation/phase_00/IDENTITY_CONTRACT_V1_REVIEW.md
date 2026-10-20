# Identity-only contract v1.0 — review candidate

**Status:** REVIEW CANDIDATE, not approved/frozen. **Scope:** ODL-007, Phase 02 only. This document does not authorize production migration or commercial operations.

## Decision proposed for ADR-01

- **Identity source:** Galung application-owned email/password identities in PostgreSQL. Use a maintained, independently reviewed password-hashing implementation with Argon2id, per-password salts and configurable work factor; no custom cryptography. Keep the password verifier behind a replaceable adapter. A future external identity provider requires a separate ADR and migration.
- **Sessions:** 256-bit CSPRNG opaque bearer stored only as SHA-256 hash in `auth_sessions`. Browser receives a `__Host-` prefixed `Secure`, `HttpOnly`, `Path=/`, `SameSite=Lax` cookie; admin and customer sessions have separate audience/origin and cookie names. Rotate on authentication and privilege elevation. Check expiry, revocation, user status and current roles server-side for every protected request. Idle and absolute timeouts are configurable, with shorter admin limits; no hardcoded production values.
- **Email verification and recovery:** Single-use, short-lived random tokens stored only as hashes, purpose-bound to user and event. Request endpoints return non-enumerating responses; rate limits apply by account and network. Password reset revokes all sessions in the same transaction. Email change requires verification of the new address and a fresh privileged session. Delivery failures leave the action pending and auditable.
- **Admin MFA:** TOTP with encrypted seed held in protected backend storage and individually hashed, single-use recovery codes. No admin session is issued before MFA completion. Enrollment requires a verified first factor; factor replacement requires a fresh MFA step-up or documented two-person recovery procedure. Recovery must revoke existing admin sessions and be audited. WebAuthn is a future option, not an implicit fallback.
- **CSRF:** For authenticated browser mutations, require same-origin `Origin` check and a session-bound unpredictable token in `X-CSRF-Token`; reject missing/mismatched tokens with stable error. `GET /auth/csrf` issues a token only for a valid session. Public register/login/reset endpoints also validate allowed origin and content type; they remain rate-limited. Token rotates with session rotation/revocation.
- **Authorization:** Default deny. Role and permission checks are server-side; customer resource queries include owner predicates. Sensitive admin role/factor changes require fresh MFA, append-only audit event and explicit permission. No role is granted from request payloads.
- **Consent:** Registration records an exact published terms version and privacy-notice acknowledgement, with content digests. Legal text and retention policy require Legal approval before public account launch; Phase 02 may test with synthetic versions only.

## Exact contract delta to review

1. Keep `001_core_schema.sql` and `003_phase00_contract_delta.sql` immutable. Review `Documentation/database/005_identity_contract_candidate.sql`, which adds session audience, idle deadline, hashed CSRF secret and generation; challenge audience/purpose; factor and recovery-code constraints/indexes. It remains unapplied. No plaintext token, MFA seed or recovery code belongs in SQL/logs. Backfill/revocation, operational timeouts and rollback need a reviewed plan before any apply.
2. Review `Documentation/galung_api_v1/identity-openapi-candidate.json` as an identity-only overlay independent of the commercial draft. It adds MFA completion/recovery/enrollment and session list/revoke. Existing commercial draft operations cover register, login, logout, session, CSRF, email verification, password reset and step-up but require reviewer reconciliation for exact cookie/CSRF, error and ownership semantics. Profile and consent reads still require an exact delta before freeze. Do not present commercial OpenAPI `1.1.0-draft.2` as frozen.
3. Add deterministic tests for cross-account/IDOR, role revocation, MFA bypass, recovery-code replay, reset-token replay/races, CSRF, session fixation/rotation/revocation, concurrent logout/reset, rate-limit boundaries, audit and redaction. Test migration on PostgreSQL 16 and verify OpenAPI against handlers in Phase 02.

## Review and freeze record

| Required reviewer | Exact decision | Evidence |
|---|---|---|
| Security | Pending | Written review of provider, MFA/recovery, CSRF, session and SQL/OpenAPI delta |
| Tech Lead | Pending | Written architecture, migration and compatibility review |
| QA | Pending | Acceptance and negative-test matrix review |
| Product Owner | Pending | Explicit limited Phase 01 exit after reviewer evidence and PR revision |

**Freeze condition:** all three technical reviews approve the same versioned ADR/SQL/OpenAPI package, its file digests are recorded, and the Product Owner approves the limited handoff. Until then this is a concrete review candidate, not a frozen contract.
