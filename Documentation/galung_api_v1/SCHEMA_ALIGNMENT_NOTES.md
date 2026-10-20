# API ↔ PostgreSQL Alignment and Change Register

Baseline: `/mnt/data/galung_database_v1/001_core_schema.sql`. The API spec is **not** evidence these changes already exist in DB. Treat mismatches as work items before migrations freeze.

**Phase 00 update:** The actual repository baseline is `Documentation/database/001_core_schema.sql`. `Documentation/database/003_phase00_contract_delta.sql` and OpenAPI 1.1.0-draft.2 propose several P0 alignments, including activation claims/challenges/device keys/refresh credentials, license revisions, key registry, legal acceptance, and two-person MFA bank change. This register remains a closure checklist: a draft delta is **not** an approved, applied or tested migration. Product/Finance/Legal values and Windows/security interoperability remain open.

| ID | Area | Existing baseline | Engineering change / decision required | Severity |
|---|---|---|---|---|
| ALIGN-01 | Authorization | `auth_sessions`, roles/permissions present | CSRF storage/issuance, MFA factors and recovery are not modeled; select mature identity provider and migrations | P0 |
| ALIGN-02 | Desktop | `license_activations` has device and validation dates | Store hashed/revocable device-bound refresh credential, nonce/replay state, signing key id/version and issuance history; never return unrestricted bearer indefinitely | P0 |
| ALIGN-03 | Issuance delivery | `licenses.activation_secret_hash` exists | Define secure one-time secret issuance/recovery/rotation; admin can deliver via controlled portal, do not expose raw secret in GET list endpoints | P0 |
| ALIGN-04 | Renewal | `license_issuance_requests.order_id UNIQUE`; `licenses.issuance_request_id UNIQUE` | Support renewal against existing license without creating a new active license per renewal; add license issuance/renewal events or credential versions | P0 |
| ALIGN-05 | Pricing currency | `prices.currency_code`; `bank_accounts.supported_currency` | Define settlement currency coverage for international users; bank fee/FX exceptions need documented reconciliation rules, not implicit conversion | P0 |
| ALIGN-06 | Bank reconciliation | `bank_credits` and `payment_reviews` | Determine two-person control threshold and correction/reversal records; current unique reference applies to one account | P1 |
| ALIGN-07 | Proof upload | `file_assets.scan_status` | Upload intent and binary handoff require object storage lifecycle; orphan cleanup and immutable file metadata | P0 |
| ALIGN-08 | Promo | Existing `promotions` and scoped plans | Atomic redemption caps, explicit percent rounding and currency exponent, invoice snapshot | P1 |
| ALIGN-09 | Tax / legal | Invoice has amount snapshot | Terms/privacy consent history, invoice legal contents, country taxation rules require legal validation and additional consent records | P0 |
| ALIGN-10 | Device model | `devices` fingerprint_hash by owner | Define fingerprint derivation with user privacy/security review; token replay limits; concurrency enforcement | P0 |
| ALIGN-11 | Subscription updates | `subscription_periods.start_at >= payment_approved_at AND entitlement_ready_at` | On-time pre-expiry renewals compatible when future start >= both; compute future end with exact 720/8,760 elapsed hours | P0 |
| ALIGN-12 | Plan policy | `offline_max_hours <= 336`, `grace_hours=72` | System-wide product decision max 336h; choose whether each plan can set shorter offline duration or fixed 336h; initial MVP default 336h | P1 |
| ALIGN-13 | CMS | `cms_pages`, `cms_revisions` | Need workflow and role checks at service level, optimistic revisions; portfolio/media publication API remains uncontracted | P1 |
| ALIGN-14 | Admin lifecycle | `bank_account_change_requests` | Add proposal / dual approval / publish endpoint specs before bank account mutation feature is offered | P0 |
| ALIGN-15 | Email | `email_deliveries`, `outbox_events` | Email template and localization management, worker dedup, bounced/failed states policy | P1 |
| ALIGN-16 | Proof revision | `payment_submissions` uniqueness per order/revision | Race-safe sequence allocation with locking; file scan and authorization before submission | P0 |
| ALIGN-17 | Backend error mapping | PG enum `order_status` vs `payment_status` | Do not flatten all finance review substatuses into order.status; compose order/paymentSummary | P0 |
| ALIGN-18 | Release | `software_releases` references private file_assets | Require verified signed publisher binary, object checksum and presigned download; staging publish checks | P1 |

Suggested API additions before release candidate: `GET /auth/csrf`, MFA enrollment/recovery flows; bank-account change proposals and approval; `GET /admin/payment-submissions/{id}` with verified-bank-credit matching data; `GET /admin/license-issuance/{id}`; license secret claim endpoint; profile preferences; CMS media asset and portfolio management; public legal version consent tracking. Only implement features after contract + database update approval.
