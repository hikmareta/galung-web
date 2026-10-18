# Licensing API Examples v1.0 — Illustrative wire contracts

All identifiers and tokens below are **examples**, not functioning credentials. JSON snippets should not be copied as hardcoded secrets. Validate requests with OpenAPI and update central API contract before implementation.

## 1. Activation claim (customer authenticated)

`POST /api/v1/me/licenses/{licenseId}/activation-claims` with `Idempotency-Key` and customer session. Returns once:
```json
{"claimId":"claim_example","activationSecret":"<one-time-random-secret>","expiresAt":"2026-10-18T11:10:00Z"}
```
Do not include secret in email URL, logs or browser analytics. One use and short expiry.

## 2. Device challenge

`POST /api/v1/desktop/challenges`
```json
{"purpose":"activate","licensePublicId":"GLG-EXAMPLE","devicePublicKeyJwk":{"kty":"EC","crv":"P-256","x":"<base64url>","y":"<base64url>"}}
```
Response:
```json
{"challengeId":"challenge_example","nonce":"<random>","expiresAt":"2026-10-18T11:05:00Z"}
```
Algorithm selection is tentative and must match actual Windows CNG support; do not assume Ed25519 device key support across supported OS range.

## 3. Activate

`POST /api/v1/desktop/activations`
```json
{"licensePublicId":"GLG-EXAMPLE","activationSecret":"<one-time-random-secret>","challengeId":"challenge_example","devicePublicKeyJwk":{"kty":"EC","crv":"P-256","x":"<base64url>","y":"<base64url>"},"deviceProof":"<base64url-signature>","deviceLabel":"Studio Laptop","clientVersion":"<signed-client-version>"}
```
Success `201`:
```json
{"activationId":"<activation-uuid>","signedToken":"<compact-signed-JWS>","refreshCredential":"<opaque-rotating-secret>","issuedAt":"2026-10-18T11:00:00Z","serverTime":"2026-10-18T11:00:00Z","offlineValidUntil":"2026-11-01T11:00:00Z","licenseRevision":1,"nextValidationRecommendedAt":"2026-10-19T11:00:00Z"}
```
`offlineValidUntil` is **minimum** of online+336h and signed effective entitlement end; above date assumes later subscription expiry.

## 4. Refresh with proof-of-possession

`POST /api/v1/desktop/validations`
```json
{"activationId":"<activation-uuid>","challengeId":"<challenge-uuid>","deviceProof":"<signature-over-canonical-request>","clientVersion":"<signed-client-version>"}
```
Send the current refresh credential as the `Authorization: Bearer` value, bound to the device proof. Success `200`: replace **both** offline entitlement and refresh credential atomically on client using crash-safe storage. Server must support exactly specified idempotent retry handling to avoid stranding clients after response loss.

## 5. Error envelope

`403`:
```json
{"error":{"code":"DEVICE_LIMIT_REACHED","message":"The device limit for this plan has been reached.","requestId":"req_example","retryable":false}}
```
`503` must be treated as connectivity failure; if valid offline entitlement exists, retain authorized offline operation. Do not imply billing or refresh automatically succeeds.
