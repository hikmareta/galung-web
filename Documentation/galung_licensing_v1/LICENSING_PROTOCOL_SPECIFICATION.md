# GALUNG.ID — LICENSING PROTOCOL SPECIFICATION v1.0

**Status:** Phase 00 reconciled **draft**, pending Security/Desktop review and Gate A approval. **Scope:** Galung Basic and Pro Windows desktop, per-package configurable device seats, manual finance approval and separate admin license issuance. **Out of scope:** Song Library Premium and institutional seat delegation (future versions). **Canonical time:** UTC, RFC 3339 externally, PostgreSQL `timestamptz` internally. Companion drafts: `database/003_phase00_contract_delta.sql` and `galung_api_v1/openapi.yaml` 1.1.0-draft.1.

## 1. Authority and invariants

1. Admin **verifies funds actually settled** before finance approval; a proof image alone never grants access.
2. Finance approval creates an independently auditable **issuance request**; only authorized License Manager action issues a license (no automatic grant from upload or approval).
3. The server owns subscription, device limits, license state, revocation, and policy versions. The desktop must not treat UI, client-reported times, or plan names as authoritative.
4. Per-package max device count is configurable. Take a **versioned policy snapshot** when issuing a license, so later plan edits do not silently change existing grants.
5. Offline entitlement is valid at most **336 hours from last successful online validation**, bounded additionally by **effective entitlement end** (paid end + 72-hour grace if permitted), cryptographic token `exp`, and any lower admin-defined policy bound.
6. Grace is **72 hours** following paid expiration, not an extra subscription period. Post-expiry renewal begins at approved-payment-and-entitlement-ready activation time; renewals before expiry continue from previous paid end. Monthly and annual terms are exactly 720 and 8,760 elapsed UTC hours respectively; `paid_end_at` is exclusive.
7. Tokens signed earlier cannot be reliably revoked on an offline machine until local expiration or reconnect. Do not promise immediate offline revocation.
8. Wall-clock rollback on compromised offline Windows hosts cannot be perfectly prevented by software alone; record and flag suspicion, use secure monotonic measures where available, reduce exposure with 14-day short-lived grants. Do not pretend TPM/DPAPI makes physical attackers impossible.
9. `entitlement_ready_at` occurs after the authorized license revision and its server-signed issuance artifact are durably committed and claimable. It does **not** wait for customer device activation or a device-bound offline JWS. Device-bound tokens are created later for each activation/validation.

## 2. Roles and trust boundaries

- **Customer / My Galung**: authenticated account owner can view licenses, claim one-time enrollment secret, view devices, request allowed deactivation.
- **Finance Admin**: verify bank credit and approve payment; cannot sign licenses by virtue of finance role.
- **License Manager**: issue, suspend, revoke, reissue per policy; never obtains private signing keys.
- **Desktop client**: untrusted runtime on customer Windows computer; possesses device private key protected by Windows CNG key store (non-exportable, TPM-backed where available), validates public signature offline.
- **Licensing API**: authenticates scoped requests, enforces concurrency, persists state.
- **Signer service / KMS**: only trusted signing service accesses Ed25519 private signing key. Application code may ask service to sign narrowly scoped issuance tokens with audit.
- **Database**: source of truth; stores public identifiers, hash of secrets, device public-key thumbprint, token identifiers/events, not raw private key.

## 3. Cryptography and serialization (normative MVP proposal)

Signed offline entitlement: **compact JWS using EdDSA (Ed25519)** with protected header `{"alg":"EdDSA","typ":"galung-offline+jwt","kid":"..."}` and JSON payload. Follow JOSE library algorithm allowlist; reject `none`, algorithm substitution, untrusted dynamic `jku`/`x5u`, incorrect `typ`, duplicate claim keys and wrong issuer/audience. All timestamps are integer Unix seconds; use 128-bit+ random IDs for jti/nonce. No secrets in signed payload (JWS is readable).

**Required claims:** `iss`, `aud=galung-desktop`, `sub` (license public id), `jti`, `iat`, `nbf`, `exp`, `activation_id`, `device_key_thumbprint`, `product=galung-suite`, `edition=basic|pro`, `plan_policy_version`, `entitlements` (feature allowlist), `paid_end_at`, `effective_entitlement_end_at`, `last_online_validation_at`, `offline_deadline_at`, `license_revision`.

The Phase 00 OpenAPI draft names these claims in `OfflineEntitlementClaims`. Each device-bound JWS receives a unique `jti` recorded in `license_token_issuances`; `license_revisions` stores the signed issuance artifact and policy snapshot, **not** one shared JWS `jti`. The exact serialization and whether the desktop ever consumes the issuance artifact require Desktop/Security signoff.

Verifier MUST ensure `exp <= offline_deadline_at <= last_online_validation_at+1209600` AND `exp <= effective_entitlement_end_at`; verify `iat<=nbf<=exp` unless reasonable issuance clock skew explicitly allowed; enforce feature identifiers known to this build. `kid` resolves only to **pinned/curated Galung public keys** shipped with application or obtained through a separately authenticated, signed key-update chain. Never fetch a key URL from token headers. Signed token is scoped to *one activation* and *one device key thumbprint*.

**Proof-of-possession:** generate device Ed25519 keypair using Windows cryptographic APIs where feasible; server stores the registered public key and verifies signatures over canonical structured requests containing method, route, request body hash, nonce, server challenge/expiry, and activation id. Where a platform cannot securely support Ed25519 non-exportable keys, engineering must select a supported Windows CNG algorithm (e.g., P-256) and protocol revision explicitly; do not silently change formats. The separate device proof algorithm does not need to equal server-token algorithm.

## 4. Enrollment and activation ceremony

1. After independent finance approval, License Manager explicitly issues an authorized license revision and server-signed issuance artifact. When this is durably committed and claimable, entitlement becomes ready and the service clock can start. Customer then logs in on My Galung and claims a one-time secret for that issued license, accessible only after authorization. A short expiry (10 minutes is an example, not an approved value), one use, hash at rest, display once, rate limit and step-up are required by the draft contract.
2. Desktop creates a device asymmetric keypair in Windows CNG (TPM backing preferred where supported); obtains installation-local device identifier and friendly label. Do not use raw hardware serials/MAC as identity; optionally store salted coarse device indicators for support and anomaly detection.
3. Desktop requests a short-lived challenge bound to purpose, license or activation, and public-key thumbprint, then sends activation secret, license public id, generated public key and signature over the canonical request and challenge. Server validates payment/license/active-or-grace state, challenge one-time use, and seat limit in a serializable transaction or locked counter. Canonical request bytes and signature encoding must be frozen before implementation.
4. Create / reuse idempotent activation with unique `(license_id, device_public_key_thumbprint)` while active; prevent racing activations from exceeding `max_devices`.
5. Server signs an offline entitlement using server-authoritative timestamps and scoped features. Separately deliver rotating opaque refresh credential, bound to proof-of-possession for device key. Hash refresh credential in database; never embed refresh credential in JWS. Desktop stores encrypted refresh secret via DPAPI/Credential Manager, not plaintext project/config file.
6. Activation response returns public license/activation ids, compact JWS, refresh secret once, validation schedule, accepted policy and support-facing error codes. Log audit event without raw credentials.

## 5. Validation/refresh

- Client normally refreshes on startup if online and periodically (e.g., once daily, configurable; retry with backoff + jitter), **not** during time-critical playback.
- Refresh request uses the current opaque credential as bearer plus device-key signed proof including a server challenge, expiry and nonce; reject nonce replay and proof timestamp outside configured skew. Challenge creation is rate-limited and bound to activation, key and purpose.
- Server checks subscription/license state, policy revision, activation not deactivated, registered device public key, refresh-credential family status, max devices and risk flags. On success rotate refresh credential atomically and issue fresh offline JWS; invalidated old refresh tokens cannot be used again except narrowly defined safe network retry idempotency.
- If refresh fails due to network, use still-valid signed offline entitlement; if refused due to true revocation while connected, remove access after explicit validated response; distinguish 401/403/409/423/429/5xx.
- Exact retry after a lost success response may return the same rotated credential from a short-lived encrypted response cache bound to idempotency key and request hash. On other detected refresh reuse, revoke credential family and require re-enrollment or support review; write security alert. Never persist a raw refresh secret in SQL or logs.

## 6. Offline validation algorithm

Desktop applies ordered checks before enabling paid features:

1. Read locally cached compact JWS and allowlisted trusted signing public key selected by `kid`.
2. Strictly validate EdDSA signature and protected JOSE header, `iss`, `aud`, `typ`, product, version, expected activation and device key thumbprint.
3. Validate current time against `nbf`, `exp`, `offline_deadline_at`, `effective_entitlement_end_at`, with conservative clock-skew tolerance *for network exchange only*. Client MUST NOT extend `exp` due to skew.
4. Validate local device private-key possession; token text copied to a different device is insufficient.
5. Check anti-rollback anchors (last observed wall clock, monotonic elapsed where meaningful, sealed local state) and detect suspicious rollback. On ambiguity, avoid an indefinite grant; enter a limited, user-explained recovery state requiring online refresh.
6. Use the signed feature allowlist; if missing/invalid, fail closed for paid-only features while preserving ability to open/export own project data where product policy permits.
7. Ensure playback does not poll online servers synchronously; permission changes apply at safe interaction boundaries.

**Important:** local enforcement cannot be guaranteed against a sufficiently privileged attacker who patches the client. Defense-in-depth includes binary signing, obfuscation as optional friction, server audit and bounded local entitlements, not claims of unbreakable DRM.

## 7. Device deactivation/replacement

- Device self-deactivate: proof-of-possession request; revoke refresh family, set `deactivated_at`, append event. Customer portal deactivation requires authenticated user, confirmation and rate limits, with optional cooldown/replacement limits.
- The change is immediate on server, while previously issued offline JWS remains usable until expiry absent connectivity.
- Re-activation after deactivation should create a new activation lifecycle/revision; preserve historical audit; enforce max seats in transaction.
- Account recovery or lost-device replacements require support review controls, never disclose old private keys.

## 8. Subscription, grace and renewal boundary

- `paid_end_at` and `grace_end_at` stored as UTC instants. Grace end exactly `paid_end_at + 72h` when permitted; revoked/suspended status can override grace.
- `effective_entitlement_end_at=grace_end_at` for eligible active/grace subscriptions, otherwise paid end (or immediate suspension policy if online; previously offline signed grant remains bounded).
- Before-expiry renewal extends from prior paid end. After-expiry (including during grace if the paid term has ended) starts a fresh term only once payment approved *and* entitlement is ready; never backdate from old paid end.
- A renewal approved after paid expiry may replace the subscription period while retaining audit events. Device enrollment may be retained and revalidated; issue new JWS. Never 'extend' a signed offline JWS in-place.
- An existing logical license receives an immutable `license_revision` linked to the approved renewal order. An active device receives a new JWS referencing that revision after genuine online validation; the renewal does not require a new device enrollment merely to make the service period ready.
- If finance approves but license issuance fails, `pending_activation` case; job/operations queue resolves, without consuming subscription time.

## 9. Key lifecycle and compromise

- Signing keys are purpose-limited by environment (`dev`,`staging`,`prod`), issuer, and use; never reuse among environments.
- `kid` unique per version; publish curated public keys to clients; private keys in managed KMS/HSM when available, with restricted sign authorization, separation of duties and audit.
- Rotation procedure: provision next key -> distribute trusted public key via authenticated app update -> sign new entitlements with new key -> overlap old key for at most current token survival -> retire. Emergency compromise can force faster online recovery; **existing offline clients cannot instantly learn emergency revocation**.
- Never log activation, refresh, or signing secrets; rate-limit enrollment and API, redact headers; maintain key incident runbook.

## 10. Network APIs (aligned with API spec v1; confirm canonical paths during implementation)

| Action | Method & suggested route | Auth | Idempotency / notes |
|---|---|---|---|
| Customer retrieves license | `GET /api/v1/me/licenses` | customer session | metadata only |
| Customer claims secret | `POST /api/v1/me/licenses/{licenseId}/activation-claims` | customer session + step-up | draft OpenAPI path; one-use claim |
| Device challenge | `POST /api/v1/desktop/challenges` | rate-limited pre-activation or device-bound refresh | challenge bound to purpose/key/license or activation |
| Activate | `POST /api/v1/desktop/activations` | one-time claim + device proof | idem key + unique active activation |
| Validate/refresh | `POST /api/v1/desktop/validations` | device refresh + proof | refresh rotation; replay detection |
| Self-deactivate | `POST /api/v1/desktop/deactivations` | device proof | idempotent |
| Portal deactivate | `POST /api/v1/me/devices/{deviceId}/deactivate` | customer session | idempotent |
| Admin issue | `POST /api/v1/admin/license-issuance/{id}/issue` | license manager | finance-approved prereq |
| Admin revoke | `POST /api/v1/admin/licenses/{id}/revoke` | licensed role + MFA | audited |

The Phase 00 OpenAPI draft now includes these paths and response schemas. It is not frozen or deployed. Do not create an undocumented shadow API.

## 11. Response errors and user experience

Use consistent `code`, `message`, `requestId`, `retryable` and optional `details`, with no sensitive disclosures: `LICENSE_NOT_ISSUED`, `LICENSE_REVOKED`, `LICENSE_SUSPENDED`, `SUBSCRIPTION_EXPIRED`, `GRACE_ENDED`, `DEVICE_LIMIT_REACHED`, `ACTIVATION_CLAIM_EXPIRED`, `INVALID_DEVICE_PROOF`, `DEVICE_REVOKED`, `TOKEN_SIGNATURE_INVALID`, `OFFLINE_WINDOW_ENDED`, `CLOCK_ROLLBACK_SUSPECTED`, `REFRESH_REUSE_DETECTED`, `RATE_LIMITED`, `SERVICE_UNAVAILABLE`. UI must distinguish retryable connectivity faults from definite denial, provide clear renewal / support action, and must not stop mid-performance if a valid offline grant exists.

## 12. Database contract deltas

Require or revise `license_activations` with device public key thumbprint/registration, token version/revision, last online verification; add `license_refresh_credentials` (hashed token, family id, status, rotated/reused at), `activation_claims` (hashed one-use secret, expires/consumed), `license_signing_keys` (kid, public key, status, environment; never private key), `license_challenges` (nonce, expires, used), `license_revisions` (signed issuance artifact/policy), and `license_token_issuances` (per-device JWS `jti`); preserve append-only `license_events`. `devices.fingerprint_hash` remains optional risk signal, not sole binding. All token issuance and credential rotation must produce audit/outbox events atomically where needed. `database/003_phase00_contract_delta.sql` is a review draft, not an approved migration.

## 13. Decisions pending before implementation

- Confirm available secure Windows CNG algorithms and whether TPM-backed non-exportable keys are mandatory or merely preferred on supported devices.
- Choose exact acceptance behavior upon suspected clock rollback; 14-day guarantee cannot be perfectly enforced against an attacker with full device control.
- Confirm refresh frequency, replacement cooldown, failure response under active concert playback, activation-claim channel and user step-up MFA.
- Set Basic/Pro `max_devices`, `max_concurrent_sessions` and feature-entitlement matrix in admin configuration.
- Define business treatment of grace during deliberate suspension, charge disputes, refunds; default no grace after explicit revocation.
- Decide whether app support includes older Windows versions lacking selected cryptographic APIs.

## 14. Operational service-level objectives (proposed, not committed)

- Online validation success target 99.9% monthly once measured; no online dependency in uninterrupted licensed playback.
- License issue job should be recoverable with idempotent replay; alert on backlog and approvals without issuance.
- Alert on activation brute force, impossible activation bursts, refresh-token reuse, signer failures and clock rollback anomalies.
- Run quarterly signer recovery and key-rotation drill in staging, annual tabletop compromise rehearsal.

## 15. References

- RFC 8725 JWT BCP https://www.rfc-editor.org/rfc/rfc8725
- RFC 8037 EdDSA in JOSE https://www.rfc-editor.org/rfc/rfc8037
- OWASP OAuth2 Cheat Sheet https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html
- Microsoft Windows CNG documentation https://learn.microsoft.com/en-us/windows/win32/seccng/cng-portal

These are design references; a real cryptographic implementation requires experienced review, interoperability tests, and threat modeling.
