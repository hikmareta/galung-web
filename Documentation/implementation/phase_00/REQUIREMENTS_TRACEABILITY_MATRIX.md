# Requirements Traceability Matrix — Phase 00

Each PRD FR has its own row, source line, proposed interface/persistence link and specified acceptance test. `planned` denotes a missing contract. Test IDs are **specifications, not executed evidence**. All implementation status is PENDING. Sources: `PRODUCT_REQUIREMENTS.md` §8, `ACCEPTANCE_CRITERIA.md` §§2–8, `galung_api_v1/openapi.json`, `database/001_core_schema.sql`, `CONTRACT_DELTA_SPEC.md`.

| Requirement | PRD line / requirement | API or operation | DB / contract | Specified test | Delta | Implementation |
|---|---|---|---|---|---|---|
| FR-01.01 | L128: Explain what Galung does in a clear hero with a main CTA to compare plans and an optional captioned demo. | `GET /public/pages/{slug}` | `cms_pages/cms_revisions` | WEB-001 | D-05 | PENDING |
| FR-01.02 | L129: Explicitly identify the purpose of visual cue-based music participation without implying that all Deaf people have the same needs. | `GET /public/pages/{slug}` | `cms_pages/cms_revisions` | WEB-004 | D-05 | PENDING |
| FR-01.03 | L130: Show plan feature comparison using the server-published product catalog, not hard-coded prices. | `GET /public/plans` | `products/plans/prices` | CHK-001 | D-02 | PENDING |
| FR-01.04 | L131: Portfolio entries have consent/rights tracking, images, description, date, organization attribution rules, preview, publish and archive. | `GET /public/portfolio` | `portfolio_items; consent missing` | WEB-008 | D-05 | PENDING |
| FR-01.05 | L132: Support Bahasa Indonesia and English; preserve language selection on checkout and transactional notices where templates exist. | `GET /public/pages/{slug}` | `cms_pages; locale` | WEB-002 | D-05 | PENDING |
| FR-01.06 | L133: All meaningful videos include caption/subtitle and textual transcript; no audio-only navigation; motion-reduction supported. | `GET /public/pages/{slug}` | `cms_revisions; media metadata missing` | WEB-004/005 | D-05 | PENDING |
| FR-01.07 | L134: Responsive mobile, tablet, desktop navigation, SEO metadata, canonical URLs, sitemap; dashboard/admin excluded from indexing. | `GET /public/pages/{slug}` | `cms_pages; SEO metadata` | WEB-009 | D-05 | PENDING |
| FR-02.01 | L138: Sign-up via email with verified ownership before ordering/licensing privileges. | `POST /auth/register; verification` | `users/auth_sessions` | AUTH-001 | D-01 | PENDING |
| FR-02.02 | L139: Login, logout, password reset with expiring one-time token, and rate limiting. | `POST /auth/login/logout/password-reset/*` | `users/auth_sessions; challenge missing` | AUTH-002/003/008 | D-01 | PENDING |
| FR-02.03 | L140: Profile stores legal billing name, contact email, country and optional company details; do not require unnecessary identity documents for standard purchase. | `GET /me; PATCH /me planned` | `users/orders` | AUTH-004 | D-01 | PENDING |
| FR-02.04 | L141: Admin MFA is mandatory; admin users have separate roles and sessions. | `MFA endpoints planned` | `auth_factors planned` | AUTH-006/007 | D-01 | PENDING |
| FR-02.05 | L142: Customer can see own records only; every API enforces object ownership/tenant boundary. | `owner-scoped GET /orders/{id}, /me/licenses/{id}` | `orders/licenses` | AUTH-004/005 | D-01 | PENDING |
| FR-02.06 | L143: Account deletion/export requests follow approved data retention and obligations; financial records may have legally justified retention. | `data export/deletion planned` | `users/audit_logs; retention policy missing` | OPS-004 | D-01 | PENDING |
| FR-03.01 | L147: Basic and Pro are independently described catalog entries with eligible billing periods monthly and yearly. | `GET /public/plans` | `products/plans/prices` | CHK-001/002 | D-02 | PENDING |
| FR-03.02 | L148: Store effective-dated prices and immutable price snapshot on order; never retroactively change an issued invoice. | `POST /orders` | `prices/order_items/invoices` | CHK-007 | D-02 | PENDING |
| FR-03.03 | L149: Device and concurrent-session policies configurable per plan; version applied when license is issued. | `POST /admin/plans/{id}/policies` | `plan_policy_versions/licenses` | LIC-010 | D-04 | PENDING |
| FR-03.04 | L150: Feature entitlements are server-authoritative; UI-only feature hiding is not enforcement. | `POST /admin/license-issuance/{id}/issue` | `plan_policy_versions/licenses` | LIC-002/003 | D-03 | PENDING |
| FR-03.05 | L151: Promotions store eligibility, usage cap, effective dates, and stacking rule; price engine recalculates on server. | `POST /admin/promotions; POST /orders` | `promotions/promotion_redemptions` | CHK-003/004 | D-02 | PENDING |
| FR-03.06 | L152: Tax, total, discount and currency display clearly. International checkout requires customer acknowledgment of transfer fees and invoice currency. | `POST /orders; GET /orders/{id}/invoice` | `orders/invoices/bank_accounts` | CHK-008/009 | D-02 | PENDING |
| FR-04.01 | L156: Authenticated customer selects exactly one subscription product/term per MVP checkout unless multi-line accounting is fully supported; model may support future multi-line. | `POST /orders` | `orders/order_items` | CHK-001/002 | D-02 | PENDING |
| FR-04.02 | L157: Create globally unique order and invoice identifiers; use idempotency key for checkout mutation. | `POST /orders` | `orders/invoices/idempotency_keys` | CHK-006 | D-02 | PENDING |
| FR-04.03 | L158: Payment instructions show official bank beneficiary/account, supported transfer currency, required reference, total due and due date; bank instructions snapshotted with invoice. | `GET /orders/{id}/invoice` | `invoices/bank_accounts` | CHK-009/PAY-014 | D-02 | PENDING |
| FR-04.04 | L159: Pending/expired/cancelled orders do not activate rights. New order is required for expired quote unless finance explicitly revalidates a late transfer. | `POST /orders/{id}/cancel` | `orders` | SUB-001 | D-02 | PENDING |
| FR-04.05 | L160: Generate downloadable invoice/receipt, with company identity, items, currency, amount, tax presentation and payment status; do not claim tax invoice status unless legally appropriate. | `GET /orders/{id}/invoice` | `invoices/file_assets` | CHK-009 | D-02 | PENDING |
| FR-04.06 | L161: Store events in append-only history, prevent order/status reversal through simple deletion. | `GET /orders/{id}` | `orders/audit_logs/outbox_events` | ADM-006 | D-02 | PENDING |
| FR-05.01 | L165: Accept JPG/PNG/PDF proof under configured size limit; validate content and scan before any staff preview; store privately. | `POST /payment-assets/upload-intents; /orders/{id}/payment-submissions` | `file_assets/payment_submissions` | PAY-009 | D-05 | PENDING |
| FR-05.02 | L166: Collect bank sender name, sent date/time and timezone, amount, currency, transfer reference, and optional bank/remittance identifier. | `POST /orders/{id}/payment-submissions` | `payment_submissions` | PAY-010/012 | D-02 | PENDING |
| FR-05.03 | L167: Proof submission changes payment claim state only, never paid status, subscription, or license. | `POST /orders/{id}/payment-submissions` | `payment_submissions/orders` | PAY-001/002 | D-02 | PENDING |
| FR-05.04 | L168: Finance queue provides filters by domestic/international, age, amount mismatch, status, customer, and order. | `GET /admin/payments/queue` | `payment_submissions/payment_reviews` | ADM-001 | D-02 | PENDING |
| FR-05.05 | L169: Finance admin explicitly verifies actual credited bank funds using bank-sanctioned records outside this system; log credit date, received amount/currency, reference and checker identity. | `POST /admin/bank-credits` | `bank_credits/payment_reviews` | PAY-003 | D-02 | PENDING |
| FR-05.06 | L170: Match full due amount after currency conversion and fees according to documented policy. Partial/short payment routes to an exception review, not approval. | `POST /admin/payment-submissions/{id}/approve` | `bank_credits/payment_reviews` | PAY-011/013 | D-02 | PENDING |
| FR-05.07 | L171: Permit revision request with reason, rejection with reason, or approval. Reviewer cannot silently overwrite submitted evidence; new submission version instead. | `POST /admin/payment-submissions/{id}/needs-revision` | `payment_submissions/payment_reviews` | PAY-006 | D-05 | PENDING |
| FR-05.08 | L172: Approval transaction is atomic/idempotent and rejects double approval or use of same actual bank credit for multiple orders without authorized split allocation. | `POST /admin/payment-submissions/{id}/approve` | `bank_credits/payment_reviews/idempotency_keys` | PAY-004/008/015 | D-02 | PENDING |
| FR-05.09 | L173: Approval publishes a durable provisioning event and creates a pending license issuance work item; does **not** itself assert license already issued. | `POST /admin/payment-submissions/{id}/approve` | `license_issuance_requests/outbox_events` | PAY-003/007 | D-03 | PENDING |
| FR-05.10 | L174: High-risk payment or account change may require second checker according to configured threshold; mandatory dual authorization for bank beneficiary edits recommended. | `bank change API planned` | `bank_account_change_requests/audit_logs` | ADM-003/004 | D-02 | PENDING |
| FR-06.01 | L178: Start paid service only after verified payment plus successful entitlement issuance/activation readiness. | `POST /admin/license-issuance/{id}/issue` | `entitlement_events planned/subscription_periods` | SUB-002/003 | D-03 | PENDING |
| FR-06.02 | L179: Monthly/yearly periods are exactly 720/8,760 elapsed UTC hours; display localized dates/timezones. | `GET /me/subscriptions/{id}` | `subscription_periods` | SUB-005 | D-03 | PENDING |
| FR-06.03 | L180: For early renewal, preserve remaining paid term and extend from previous paid term's end. | `POST /me/subscriptions/{id}/renewal-orders` | `subscription_periods` | SUB-004 | D-03 | PENDING |
| FR-06.04 | L181: For renewal after paid expiration, new service starts when payment is approved and entitlement is ready; never retroactively bill expired gap. | `POST /me/subscriptions/{id}/renewal-orders` | `subscription_periods` | SUB-012/013 | D-03 | PENDING |
| FR-06.05 | L182: Allow grace for exactly 72 hours after paid expiry, maintaining policy-defined last entitlement; grace ends at exclusive timestamp. | `GET /me/subscriptions/{id}` | `subscriptions/subscription_periods` | SUB-010/011 | D-03 | PENDING |
| FR-06.06 | L183: Notifications H-14/H-7/H-3 and at expiry, with deduplication and delivery tracking; renewal never charges automatically. | `GET /me/notifications` | `notifications/email_deliveries` | SUB-006 | D-05 | PENDING |
| FR-06.07 | L184: Cancel auto-renew is not a meaningful action without auto-renew; label actions as renewal reminders, request cancellation, or no further renewal, with clear period effects. | `POST /me/subscriptions/{id}/renewal-orders` | `orders/subscriptions` | SUB-007 | D-03 | PENDING |
| FR-06.08 | L185: Suspension or fraud revocation are explicit admin actions with reason, approval and audit. | `POST /admin/licenses/{id}/revoke` | `licenses/license_events/audit_logs` | SUB-014 | D-03 | PENDING |
| FR-07.01 | L189: License manager issues from payment-approved, provisioning-ready order; no issuance for unverified claims except specifically audited complimentary/manual exception flow (deferred by default). | `POST /admin/license-issuance/{id}/issue` | `license_issuance_requests/licenses` | LIC-001/014 | D-03 | PENDING |
| FR-07.02 | L190: Signed license payload includes ID, customer, plan and feature entitlement version, device limits, issued time, effective time, end time and status metadata. | `SignedEntitlement schema revision planned` | `licenses/license_revisions planned` | LIC-002/003 | D-04 | PENDING |
| FR-07.03 | L191: Private signing key never leaves backend protected storage; desktop validates with public key, algorithm allowlist and signed token integrity. | `signing key registry planned` | `license_signing_keys planned` | LIC-006/007 | D-04 | PENDING |
| FR-07.04 | L192: Online activation enforces device cap and refreshes last-online-validation on successful genuine validation. | `POST /desktop/activations; /desktop/validations` | `license_activations/device keys planned` | LIC-004/010 | D-04 | PENDING |
| FR-07.05 | L193: Offline authorization valid up to 14 days from last genuine online validation and **no later than authorized access end**, including applicable grace; if clock integrity cannot be trusted, fail safely with recoverable guidance. | `POST /desktop/validations` | `license_activations/subscription_periods` | LIC-011–015 | D-04 | PENDING |
| FR-07.06 | L194: Device revoke/deactivate and recovery are audited; cap cannot be bypassed by retry/concurrent calls. | `POST /me/licenses/{id}/devices/{deviceId}/deactivate` | `license_activations/license_events` | LIC-016 | D-04 | PENDING |
| FR-07.07 | L195: Admin creates/publishes license, customer sees it in My Galung, email is queued; email failure cannot invalidate issued license. | `POST /admin/license-issuance/{id}/issue` | `licenses/outbox_events/email_deliveries` | LIC-009/017 | D-03 | PENDING |
| FR-07.08 | L196: License key must not be exposed in general logs, analytics, or email subject; masked by default in UI with explicit reveal. | `GET /me/licenses/{id}` | `licenses/activation_claims planned` | DASH-003 | D-04 | PENDING |
| FR-07.09 | L197: Expired subscription does not destroy user projects; desktop applies feature restriction based on documented plan entitlement behavior. | `GET /me/subscriptions/{id}` | `subscription_periods/licenses` | LIC-005 | D-03 | PENDING |
| FR-07.10 | L198: Desktop releases use signed installer, SHA-256 integrity and authenticated download/metadata as appropriate. | `GET /public/releases/latest; /me/downloads` | `software_releases/file_assets` | LIC-020 | D-05 | PENDING |
| FR-08.01 | L202: Dashboard shows product, status, paid expiry, grace expiry if relevant, payment order status and license issuance progress. | `GET /me/subscriptions; /orders` | `subscriptions/orders/licenses` | DASH-001/002/004 | D-03 | PENDING |
| FR-08.02 | L203: View invoices, bank instructions locked to respective order, payment submission history, and review reason. | `GET /orders/{id}/invoice; payment-submissions` | `invoices/payment_submissions` | DASH-001 | D-02 | PENDING |
| FR-08.03 | L204: View licenses and registered devices, permitted deactivation, current cap and last successful online validation time. | `GET /me/licenses/{id}/devices` | `licenses/license_activations` | DASH-003 | D-04 | PENDING |
| FR-08.04 | L205: Download official Windows installer/release notes; preserve trusted distribution even when subscription expired where policy allows reinstall. | `GET /me/downloads; /me/downloads/{id}/ticket` | `software_releases/file_assets` | LIC-020 | D-05 | PENDING |
| FR-08.05 | L206: Create manual renewal checkout from existing subscription. | `POST /me/subscriptions/{id}/renewal-orders` | `orders/subscriptions` | SUB-007 | D-03 | PENDING |
| FR-08.06 | L207: Notifications avoid false claims like “license sent” while issuance is pending. | `GET /me/notifications` | `notifications/email_deliveries` | DASH-002 | D-05 | PENDING |
| FR-09.01 | L211: Admin summary highlights payment review backlog, pending issuance, failed jobs, expiring subscriptions, and exceptions; never present made-up business data. | `GET /admin/payments/queue; /admin/license-issuance/queue` | `payment_submissions/license_issuance_requests` | ADM-001/002 | D-02 | PENDING |
| FR-09.02 | L212: User, order, payment and license search/filter/detail; export restricted to authorized roles with audit. | `GET /admin/orders; /admin/audit-logs` | `orders/audit_logs` | AUTH-005/ADM-006 | D-01 | PENDING |
| FR-09.03 | L213: Manage prices, promotions, plan policy versions, effective dates and publication approvals. | `POST /admin/plans/{id}/policies; /prices; /promotions` | `plan_policy_versions/prices/promotions` | ADM-005 | D-02 | PENDING |
| FR-09.04 | L214: Manage pages, localized copy, sections, navigation, portfolio, FAQ, media, legal policies with draft/preview/publish/revert. | `admin CMS endpoints` | `cms_pages/cms_revisions/portfolio_items` | WEB-006–008 | D-05 | PENDING |
| FR-09.05 | L215: Bank account edits require elevated authority, MFA/re-auth and immutable audit; issued invoices retain original account snapshot unless formal replacement instruction issued. | `bank change API planned` | `bank_account_change_requests/invoices` | ADM-003/004 | D-02 | PENDING |
| FR-09.06 | L216: License queue supports issue/retry/revoke with mandatory reason and clear original transaction linkage. | `GET /admin/license-issuance/queue; issue; revoke` | `license_issuance_requests/licenses` | ADM-002 | D-03 | PENDING |
| FR-09.07 | L217: Releases dashboard supports channel, version, platform, file integrity hash, publishing state and rollback of availability. | `POST /admin/software-releases` | `software_releases/file_assets` | LIC-020 | D-05 | PENDING |
| FR-09.08 | L218: RBAC checks occur in API, not only admin menu visibility. | `all /admin/*` | `roles/permissions/user_roles` | AUTH-005 | D-01 | PENDING |
| FR-10.01 | L222: Event-driven transactional email templates for account verification, orders, proof receipt, review result, license issued, renewal reminders, grace and expiry. | `outbox-driven notifications` | `outbox_events/email_deliveries` | PAY-007/SUB-006 | D-05 | PENDING |
| FR-10.02 | L223: Retry transient failures with deduplication; dead-letter queue and admin incident visibility for repeated failures. | `email worker retry planned` | `outbox_events/email_deliveries` | OPS-001 | D-05 | PENDING |
| FR-10.03 | L224: Audit log records actor, action, before/after (redacted), timestamp, source and business object ID for privileged changes. | `all privileged mutations` | `audit_logs` | ADM-006 | D-01 | PENDING |
| FR-10.04 | L225: Data retention and privacy processes distinguish financial proof retention from marketing consent. | `export/deletion planned` | `users/file_assets/audit_logs` | OPS-004 | D-01 | PENDING |
| FR-10.05 | L226: Backup, monitoring, incident response and restore drill must be completed before launch. | `operations endpoints planned` | `backup/monitoring external` | OPS-002/003 | D-05 | PENDING |

## Binding decisions

| ID | Requirement source | Contract/test linkage | Status |
|---|---|---|---|
| DEC-001 | PRD §2; per-plan device and session limits | `plan_policy_versions`, `licenses`; LIC-010, LIC-DEV-001; D-04 | Binding; values TBD |
| DEC-002 | PRD §2; max 336h offline | JWS deadline and `license_activations`; LIC-011–013, LIC-OFF-001–003; D-04 | Binding; unimplemented |
| DEC-003 | PRD §2; 72h grace | `subscription_periods.grace_end_at`; SUB-010/011; D-03 | Binding; unimplemented |
| DEC-004 | PRD §2; late renewal start | entitlement-ready event, period clock; SUB-012/013; D-03 | Binding; unimplemented |
| DEC-005 | PRD §2; international manual transfer | invoice currency/bank snapshots, credit review; PAY-010–013; D-02 | Binding; settlement values TBD |
| DEC-006 | PRD §2; Basic/Pro only | catalog server gate; MVP-001/002 | Binding; unimplemented |

## Non-functional requirements

| ID | Source | Planned verification | Status |
|---|---|---|---|
| NFR-001 | PRD §13 | WEB-003/004/005; UXT-12 | NOT TESTED |
| NFR-002 | PRD §13 | Public-page web vitals on target devices | NOT TESTED |
| NFR-003 | PRD §13 | API/checkout uptime SLO measurement | NOT TESTED |
| NFR-004 | PRD §13 | AUTH-004–008; PAY-009; LIC-006–008 | NOT TESTED |
| NFR-005 | PRD §13 | PAY-004/008/015; OPS-001 | NOT TESTED |
| NFR-006 | PRD §13 | OPS-002 restore drill | NOT TESTED |
| NFR-007 | PRD §13 | queue/issue metrics and alert rehearsal | NOT TESTED |
| NFR-008 | PRD §13 | WEB-002; UXT-01/02 | NOT TESTED |
| NFR-009 | PRD §13 | PAY-006/013; LIC-009 | NOT TESTED |
| NFR-010 | PRD §13 | cross-browser/mobile E2E | NOT TESTED |

## Coverage limit

This is a planned FR/DEC/NFR-to-contract-and-test map. It does not assert implementation, test execution, or acceptance. Code path, exact table/index and observed QA evidence must be added when later phases implement each requirement.
