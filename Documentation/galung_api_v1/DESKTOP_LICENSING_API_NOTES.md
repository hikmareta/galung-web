# Galung Desktop Licensing API — Security Protocol Notes v1.0

## Purpose

Secure Windows activation for Galung Basic/Pro. Desktop application remains usable temporarily offline for a maximum of **336 hours** since successful online refresh, **never** past effective paid/grace entitlement validity.

**Phase 00 draft update:** Admin issuance commits a signed license issuance artifact and claimable entitlement revision before device activation. This marks `entitlement_ready_at`; device-bound offline JWS issuance happens later on activation/validation. The companion OpenAPI 1.1.0-draft.1 and `database/003_phase00_contract_delta.sql` are proposed contracts, not deployed behavior.

## Protocol phases

1. **Admin issuance:** finance verification was recorded independently; license manager explicitly issues. Sign using private signing key in signing service or protected secrets store; persist public license ID, token key ID, immutable feature-policy snapshot; distribute one-time activation secret via authenticated My Galung claim or another controlled process.
2. **Activation:** owner first claims a one-time activation secret. Desktop requests a challenge bound to license, purpose and device public key, then posts license public ID, secret, challenge ID, key and signed proof. Server checks license, plan, current subscription/grace, max devices, ownership, rate limits and replay prevention. Store only hash of activation secret. Create device + license_activation transactionally. Return signed offline entitlement and a scoped, rotating device-bound refresh credential once.
3. **Validation:** use scoped rotating credential (`Authorization: Bearer ...`) with a fresh purpose-bound challenge and device-key proof. Server validates credential, device activation, current policy/version, license state, server-side time; atomically rotates credential and issues replacement signed offline entitlement. Exact retry uses bounded encrypted response recovery; any other reuse revokes the family.
4. **Offline use:** desktop verifies signature using embedded trusted public signing keys; validates audience/product, license ID, device binding, issued time, not-before, deadline, feature grants, issuer and key ID; protect against system-clock rollback best-effort. No networking required while token valid.
5. **Device deactivation:** authenticated customer dashboard or device client submits deactivate. Revoke refresh credential and device activation; note previously issued offline token can remain usable until its bounded expiry.
6. **Expiration/renewal:** after paid end, only 72h grace policy applies. Renewal later than expiry begins at entitlement-ready timestamp following approved payment. Existing activation may refresh with newly signed entitlement after renewal, subject to issue/version management.

## Required signed claims (conceptual, not final serialization)

`iss, aud=galung-desktop, kid, license_id, activation_id, device_binding_digest, plan_code, policy_version, features, issued_at, not_before, offline_valid_until, entitlement_end_at, nonce_or_token_id`.

Use established signing algorithm and JOSE/COSE library (e.g., EdDSA), not custom cryptography. Define canonical encoding/algorithm allowlist, public key rotation and compromised-key recovery. Keep signing private key **never** on client.

## Acceptance invariants

- `offline_valid_until <= last_server_validation_at + 336h`.
- `offline_valid_until <= effective_entitlement_end_at`.
- Grace end equals paid end + 72h (for non-revoked subscriptions where grace is permitted).
- No new activation above max devices (race-safe transaction).
- A device cannot validate using another activation's refresh credential.
- Copying a token to a different device fails device-binding checks.
- A revoked activation cannot refresh online, while old offline entitlement cannot be instantly revoked without connectivity. Communicate this operational limitation.
- Rate-limit key guessing and all activation retries; no raw fingerprint or activation secret in logs.
- Network outage during a concert does not force an otherwise valid local token to fail.

## Explicit unresolved decisions

Device-binding attestation mechanism compatible with Windows/privacy, key storage (DPAPI/Windows credential vault), refresh-token transport and rotation, acceptable clock rollback behavior, manufacturer code signing process, secure initial license delivery and recovery policy require threat-model review before release.
