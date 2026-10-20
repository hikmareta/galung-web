# Licensing Protocol v1.0 — Required Schema/API Changes

**Status:** proposed delta, not applied migrations. Cross-check with `/galung_database_v1/001_core_schema.sql` and `/galung_api_v1/openapi.yaml` before implementing.

**Phase 00 update:** Actual repository paths are `Documentation/database/001_core_schema.sql` and `Documentation/galung_api_v1/openapi.yaml`. The additive `Documentation/database/003_phase00_contract_delta.sql` and OpenAPI 1.1.0-draft.2 now express proposed claims, challenges, device keys, rotating refresh credentials, signing-key registry, license revisions and per-device token issuance. They remain review drafts, not deployed migrations or a security signoff. Do not close the P0 request until PostgreSQL 16, API and Windows interoperability tests pass.

## Database migrations (P0)

1. `activation_claims`: UUID PK, license FK, creator user FK, hashed one-use secret, `expires_at`, `consumed_at`, created/updated timestamps, indexes by license and expiry.
2. `license_device_keys`: activation FK, public JWK / DER, digest of key, algorithm, active/revoked timestamps; unique active fingerprint per license (enforce transactionally).
3. `license_refresh_credentials`: activation FK, salted opaque secret hash, credential family UUID, issued_at, expires_at, rotated_at, consumed_at, reuse flag, revocation and attempt counters.
4. `license_challenges`: client/activation reference, unpredictable nonce hash, TTL, use-once field and replay prevention index.
5. `license_signing_keys`: key id, public JWK, environment, algorithm, status, created/published/retired dates. Store **no private signing key**.
6. `license_activations`: `last_online_validated_at`, current offline deadline, device key thumbprint, license revision; avoid using hardware fingerprint as the sole trust anchor.
7. `licenses`: edition, policy snapshot, max_devices, status, revision; guarantee active activation count never exceeds max device policy via serialized activation transaction.
8. Append-only license audit events and outbox for issue/rotate/revoke signals. Ensure sensitive fields are excluded from unprivileged analytics.

## API contract changes (P0)

- Confirm canonical activation route (current v1 desktop paths may differ). Add challenge endpoint, claim issue endpoint, customer device deactivation endpoint and explicit refresh-credential rotation response.
- Include JWS `kid`, `typ`, issuer/audience, version, all entitlement deadlines and signed feature list in a named OpenAPI schema.
- Define rate limit, `Idempotency-Key` behavior, one-time challenge use, nonce canonicalization and errors for each endpoint.
- Explicit authorization per operation; no cross-user access; no license issuance when finance approval absent.
- Add server-side ledger event that marks entitlement-ready and subscription start only when license issued/usable.

## Non-MVP (P1+)

- Institutional seat pool and role assignment; Song Library subscription; specialized long-term completely air-gapped activation files. Do not leak these into Release 1.
