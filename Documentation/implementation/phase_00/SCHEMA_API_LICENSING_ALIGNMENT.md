# Schema ↔ API ↔ Licensing Alignment — Phase 00

Baseline: `database/001_core_schema.sql` reference DDL; `galung_api_v1/openapi.yaml` canonical draft with JSON export; `galung_licensing_v1/LICENSING_PROTOCOL_SPECIFICATION.md` proposed protocol. Paths below are relative to `Documentation/`. **No delta is applied.**

| Domain | Current SQL / OpenAPI | Required canonical delta and verification |
|---|---|---|
| Session/MFA/CSRF | `auth_sessions`, roles, permissions; `/auth/*` cookie security and `X-CSRF-Token` on mutations, no CSRF fetch or MFA ceremony. | Identity ADR; add provider-compatible factors/recovery/session controls and CSRF endpoint/schema; AUTH-004–008, ALIGN-01. |
| Money/order | `orders`, `order_items`, `invoices`, `prices`; `POST /orders` snapshots amount; published price intervals can overlap. | Non-overlap constraints/locked publish, supported ISO currency metadata, immutable tax/bank/legal snapshots and consent history; CHK-005–009, ALIGN-05/09. |
| Proof/credit | `file_assets`, `payment_submissions`, `bank_credits`, `payment_reviews`; upload intent/submission/approval endpoints. | Finalize upload scan state, revision locks, explicit bank-credit proof metadata, full-match or approved allocation ledger, immutable correction history; PAY-001–015, ALIGN-07/16/17. |
| Bank changes | `bank_account_change_requests` with distinct reviewer check; no matching API operations. | Proposal, approval, publish/read endpoints and step-up/dual control; immutable invoice replacement notice; ADM-003/004, ALIGN-14. |
| Subscription readiness | `subscription_periods` has timestamps and `source_order_id UNIQUE`; API renewal operation exists. | Append entitlement-ready event; explicit state transitions, period non-overlap, fixed 720/8,760-hour end policy, delayed issuance compensation; SUB-002–005/012/013, CR-08. |
| License renewal | `licenses.issuance_request_id UNIQUE` and issuance request unique order; API issue describes renewal but no revision DTO. | Add append-only revisions linking existing license/order, active license invariant and JWS revision; LIC-014, LIC-REN-001–003, ALIGN-04. |
| Enrollment | `activation_secret_hash`, `devices.fingerprint_hash` only; `/desktop/activations` request lacks challenge ID/public key; response lacks refresh credential. | `activation_claims`, `license_challenges`, `license_device_keys`; claim/challenge operations; one-use claim and request PoP. Keep public identifiers; hash secrets; LIC-DEV-001–003. |
| Refresh | `license_activations` timestamp/deadline; `/desktop/validations` bearer plus nonce but no modeled rotation. | Hashed refresh credential family, replay state, rotation response and crash-safe idempotent retry; LIC-SEC-004, LIC-OPS-002. |
| Signed entitlement | `SignedEntitlement` is opaque token + timestamps/features; protocol §3 requires strict compact JWS claims and `kid`; no signing-key registry. | Named JWS header/claims schema incl issuer, audience, jti, activation/device binding, edition, features, paid/grace/offline ends, revision; public-key registry; private key external; LIC-SEC-001–003, LIC-KEY-001/002. |
| Device/session caps | SQL policy stores both caps; only activation count modeled. | Transactional device cap; decide lease/heartbeat for simultaneous use and offline policy; LIC-004/010, C-17. |
| CMS/release | SQL generic CMS and release tables; OpenAPI page and release ops, gaps for media, consent, publish verification. | Versioned CMS media/portfolio API, rights/consent checks, signed installer verification and controlled download; WEB-006–008, LIC-020, ALIGN-13/18. |

## Canonical route decision needed

API v1 uses `/orders/{id}/payment-submissions`, `/me/subscriptions/{id}/renewal-orders`, `/admin/payment-submissions/{id}/approve`, `/admin/license-issuance/{id}/issue`, `/desktop/activations`, `/desktop/validations`. PRD §12 and UI screen API dependencies use other provisional names. Licensing protocol §10 aligns with desktop routes but adds `/me/licenses/{licenseId}/activation-claims` and `/desktop/challenges`; these are absent from current OpenAPI. Freeze one route set in reviewed OpenAPI and update UI/PRD mappings; do not create aliases silently.

## Delta migration plan (not executed)

1. `M00-A`: identity and legal consent tables/columns after identity provider choice; permissions and CSRF/MFA contract.
2. `M00-B`: price/policy interval exclusion, currency reference, bank change publication and explicit finance adjustment/allocation if approved.
3. `M00-C`: entitlement ledger, period overlap guard and license revisions preserving existing license identifiers.
4. `M00-D`: activation claims, device keys, challenges, refresh families, signing public-key registry and token metadata.
5. `M00-E`: upload/scan lifecycle, CMS consent/media and release signature metadata as feature dependencies require.

Each delta should be additive first, backfill from verified historic state if any, dual-read only when safe, and have forward-fix/rollback plan. No application or SQL migration was created in Phase 00.
