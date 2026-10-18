# GALUNG.ID — PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Document ID:** GLG-PRD-001  
**Version:** 1.0  
**Status:** Baseline for development (commercial policy values marked TBD remain configurable)  
**Date:** 17 October 2026  
**Owner:** Product Management  
**Product:** Galung.id website, My Galung, Administration, and Windows desktop licensing integration  
**Audience:** Product, UI/UX, engineering, QA, security, finance, operations, marketing  

> This document establishes product requirements. Example prices, bank data, customers, feature matrices, and dates must not be treated as real approved commercial values. Final rollout requires operational, legal, security, and banking verification.

---

## 1. Executive summary

Galung is visual-first music software that enables collaborative music education and performance, with particular attention to Angklung and accessibility for Deaf and hard-of-hearing communities. Galung.id must communicate its value, demonstrate its features, exhibit validated customer work, sell monthly/annual licenses, host customer self-service, and equip authorized company staff to manage operations. Customer payments are **direct bank transfers only**, including international remittances in MVP. There is **no third-party payment gateway**, and evidence uploads never constitute payment confirmation. A finance administrator verifies funds actually received and approves the payment. An authorized administrator issues a license through the admin panel, which is delivered via My Galung and transactional email.

The commercial MVP sells **Galung Basic and Galung Pro only**. The site and database must be extensible for Galung Song Library Premium as a **separate subscription** and organizational seat management, but these purchases and permissions are **out of MVP**.

## 2. Product decisions (binding)

| ID | Decision | Rule | Verification |
|---|---|---|---|
| DEC-001 | Individual license device/seat limits | Configurable per plan and snapshotted on issuance; no hard-coded global cap | LIC-010 |
| DEC-002 | Temporary offline access | At most 14 days after latest successful online validation; never beyond authorized entitlement/grace window | LIC-011–013 |
| DEC-003 | Expiry grace | Exactly 72 elapsed hours after expiration, unless subscription is revoked for cause | SUB-010–011 |
| DEC-004 | Late renewal | After expiry, a new period begins only when payment is approved **and** entitlement/license activation completes; no retroactive reduction | SUB-012 |
| DEC-005 | International MVP customers | Bank-to-bank remittance manually verified after receipt; currency and fee handling explicit | PAY-010–012 |
| DEC-006 | Launch scope | Basic and Pro subscriptions only; Song Library Premium and institutional seat purchases deferred | MVP-001–002 |

**Interpretation:** Early renewal extends from the previous paid-period end. For late renewal, `service_start_at = max(payment_approved_at, entitlement_ready_at)` (if readiness is later); the customer must not lose paid days to internal processing failures. Grace access is not a paid renewal. For clarity, `subscription_expires_at` is the exclusive instant at which paid access ends; grace expires exactly 72 hours after that instant. Signed offline token expiration is `min(last_successful_online_validation_at + 14 days, authorized_access_end_at)`; revocation can only be enforced immediately on devices that reconnect. Device limit and concurrency are distinct policy fields. 

## 3. Vision and principles

**Vision:** Music Beyond Sound — accessible visual musical participation through collaborative guidance.  
**Principles:** visual-first not audio-dependent; accessible and comprehensible; transparent commerce; human-verified payments; secure and auditable entitlement; dependable offline performance; low operational complexity; bilingual by design.

### 3.1 Goals

1. Explain Galung's purpose and Basic/Pro value without requiring live demonstrations.
2. Convert domestic and international visitors into registered paid customers through direct bank transfer.
3. Ensure every paid activation has a verified underlying payment and authorized manual issuance.
4. Allow customers to see subscription, invoice, license, device count, and downloads without contacting support.
5. Allow authorized staff to manage pricing, promotions, content, bank instructions, payments, license issuance, and reports.
6. Provide a robust license contract with Windows desktop, including bounded offline verification.

### 3.2 Non-goals (commercial MVP)

- Third-party payment gateways, credit cards, auto-debit, or automated bank account integrations.
- Purchasing Song Library Premium, institutional subscription purchase or seat allocation, paid content distribution.
- A web version of Galung desktop software.
- Uncontrolled instant issuance on proof upload.
- Multi-currency pricing or bank accounts in every currency by default (international customers can transfer to the company-supported invoice currency).
- Full CRM, accounting general ledger, tax engine, or helpdesk suite.

### 3.3 Assumptions and open decisions

**TBD-01:** final Basic/Pro feature entitlements. **TBD-02:** package-specific maximum devices and simultaneous sessions. **TBD-03:** official prices, annual discount and tax treatment. **TBD-04:** beneficiary accounts, eligible currencies and international transfer fees. **TBD-05:** operating hours and target review SLA. **TBD-06:** exact license experience during grace and any emergency suspension. **TBD-07:** installer signing and offline activation certificate lifecycle. **TBD-08:** company legal identity and governing terms. **TBD-09:** refund/chargeback-equivalent manual recovery and late incoming remittance policy. Do not fill these with invented production values.

---

## 4. Target users and jobs-to-be-done

| Persona | Need / job | Pain point | Priority |
|---|---|---|---|
| Indonesian individual teacher/operator | Understand, pay, install, activate, renew | Unclear pricing/technical setup | P0 |
| International individual | Find English instructions, remit internationally, track status | Currency/fee ambiguity, bank settlement delay | P0 |
| Deaf/hard-of-hearing prospective user | Understand product and demo without audio | Sound-dependent information | P0 |
| Finance administrator | Verify actual bank receipts and decide | Fake/duplicate evidence | P0 |
| License administrator | Issue, reissue, deactivate with audit trail | Manual email/key mistakes | P0 |
| Content manager | Update public copy, portfolio, FAQ | Developer dependencies | P0 |
| Super admin | Manage settings, roles, bank account changes | Sensitive privilege risk | P0 |
| School/organization administrator | Allocate institutional seats | Multiple users/devices | P1 |
| Song library subscriber | Browse premium song files | Rights/entitlement complexity | P1 |

## 5. Core journeys

**J-01 Discover:** landing → what Galung is → how it works (visual demo) → Basic/Pro comparison → pricing → registration.  
**J-02 New paid customer:** sign up → verify email → select plan & billing cycle → checkout → invoice → bank transfer → proof submission → admin funds check → approved → license issue → dashboard/email → installer → desktop activation.  
**J-03 International customer:** choose country/language → accepted currency and bank remittance details → invoice amount & fee obligations → transfer → supply remittance details → admin matches bank credit → approval / discrepancy review → license.  
**J-04 Renewal:** dashboard/email reminder → create renewal invoice → transfer → submit proof → admin approval → update period after successful entitlement readiness.  
**J-05 Administration:** finance reviews transaction with recorded bank evidence; license manager processes issuance queue; content manager publishes approved pages; all sensitive changes logged.  
**J-06 Expiration:** remind H-14/H-7/H-3 → expiry → grace 72h → restrict paid features when grace ends → late renewal restores access from valid new start.  
**J-07 Device:** see limit and activated devices → activate permitted device → deactivate device (with security rules) → retry on new device.  
**J-08 Incident:** email delivery fails / license issuance fails → status remains truthful, retry queue and human recovery are available.

---

## 6. Scope and prioritization

**P0 = release blocker**, **P1 = after MVP**, **P2 = optional expansion**.

| Domain | P0 MVP | P1/P2 |
|---|---|---|
| Public website | Home, About, Product, Basic/Pro, How It Works, Features, Pricing, Portfolio, FAQ, Contact, Download, Legal, bilingual core | Blog, rich testimonials, advanced demo |
| Accounts | Email verified auth, recovery, profile, secure sessions | Social auth, advanced self-service |
| Pricing and commerce | Configurable plans, monthly/yearly, price snapshots, basic promo, invoice, bank instructions | Sophisticated coupons, quotes |
| Payments | Upload, manual bank receipt verification, reject/revision, approve, audit, international bank wire | Semi-automated reconciliation |
| Subscription | Activation, expiry, 72h grace, manual renewal, reminder | Upgrade proration, negotiated contracts |
| License | Admin issuance, signed proof, online activation, device limits, bounded 14d offline, revoke/deactivate | Enhanced air-gapped activation |
| Customer dashboard | Order/payment states, subscription, license/device list, installer, receipts | Advanced support portal |
| Admin | Payment queue, order/customer, license queue, pricing, CMS, staff RBAC, settings, audit | Advanced analytics, bulk operations |
| Future products | Extensible product/entitlement model only | Song Library Premium, organization seats |

---

## 7. Information architecture and routes

### 7.1 Public routes

`/`, `/about`, `/products`, `/products/basic`, `/products/pro`, `/features`, `/how-it-works`, `/pricing`, `/portfolio`, `/portfolio/[slug]`, `/faq`, `/download`, `/contact`, `/legal/terms`, `/legal/privacy`, `/legal/refunds`, `/login`, `/register`, `/forgot-password`. URLs may be localized under `/id/...` and `/en/...` with stable canonical/hreflang treatment. `Song Library` may have a labeled coming-soon marketing page but **no functioning purchase flow** at MVP.

### 7.2 Customer routes

`/dashboard`, `/dashboard/subscriptions`, `/dashboard/orders`, `/dashboard/orders/[id]`, `/dashboard/payments/[id]`, `/dashboard/licenses`, `/dashboard/licenses/[id]`, `/dashboard/devices`, `/dashboard/downloads`, `/dashboard/account`, `/dashboard/notifications`. All require authentication and object-level access checks.

### 7.3 Admin routes

`admin.galung.id/login`, `/overview`, `/customers`, `/orders`, `/payments`, `/payments/[id]`, `/subscriptions`, `/licenses`, `/licenses/pending`, `/products`, `/plans`, `/pricing`, `/promotions`, `/pages`, `/portfolio`, `/media`, `/releases`, `/bank-accounts`, `/staff`, `/audit`, `/reports`, `/settings`. Dedicated admin origin and short sessions preferred. Frontend route names do not imply authorization.

---

## 8. Functional requirements

### FR-01 Public marketing and accessibility (P0)

- FR-01.01 Explain what Galung does in a clear hero with a main CTA to compare plans and an optional captioned demo.
- FR-01.02 Explicitly identify the purpose of visual cue-based music participation without implying that all Deaf people have the same needs.
- FR-01.03 Show plan feature comparison using the server-published product catalog, not hard-coded prices.
- FR-01.04 Portfolio entries have consent/rights tracking, images, description, date, organization attribution rules, preview, publish and archive.
- FR-01.05 Support Bahasa Indonesia and English; preserve language selection on checkout and transactional notices where templates exist.
- FR-01.06 All meaningful videos include caption/subtitle and textual transcript; no audio-only navigation; motion-reduction supported.
- FR-01.07 Responsive mobile, tablet, desktop navigation, SEO metadata, canonical URLs, sitemap; dashboard/admin excluded from indexing.

### FR-02 Identity and account (P0)

- FR-02.01 Sign-up via email with verified ownership before ordering/licensing privileges.
- FR-02.02 Login, logout, password reset with expiring one-time token, and rate limiting.
- FR-02.03 Profile stores legal billing name, contact email, country and optional company details; do not require unnecessary identity documents for standard purchase.
- FR-02.04 Admin MFA is mandatory; admin users have separate roles and sessions.
- FR-02.05 Customer can see own records only; every API enforces object ownership/tenant boundary.
- FR-02.06 Account deletion/export requests follow approved data retention and obligations; financial records may have legally justified retention.

### FR-03 Product, plan and pricing (P0)

- FR-03.01 Basic and Pro are independently described catalog entries with eligible billing periods monthly and yearly.
- FR-03.02 Store effective-dated prices and immutable price snapshot on order; never retroactively change an issued invoice.
- FR-03.03 Device and concurrent-session policies configurable per plan; version applied when license is issued.
- FR-03.04 Feature entitlements are server-authoritative; UI-only feature hiding is not enforcement.
- FR-03.05 Promotions store eligibility, usage cap, effective dates, and stacking rule; price engine recalculates on server.
- FR-03.06 Tax, total, discount and currency display clearly. International checkout requires customer acknowledgment of transfer fees and invoice currency.

### FR-04 Checkout, orders and invoices (P0)

- FR-04.01 Authenticated customer selects exactly one subscription product/term per MVP checkout unless multi-line accounting is fully supported; model may support future multi-line.
- FR-04.02 Create globally unique order and invoice identifiers; use idempotency key for checkout mutation.
- FR-04.03 Payment instructions show official bank beneficiary/account, supported transfer currency, required reference, total due and due date; bank instructions snapshotted with invoice.
- FR-04.04 Pending/expired/cancelled orders do not activate rights. New order is required for expired quote unless finance explicitly revalidates a late transfer.
- FR-04.05 Generate downloadable invoice/receipt, with company identity, items, currency, amount, tax presentation and payment status; do not claim tax invoice status unless legally appropriate.
- FR-04.06 Store events in append-only history, prevent order/status reversal through simple deletion.

### FR-05 Direct-bank payment submission and review (P0)

- FR-05.01 Accept JPG/PNG/PDF proof under configured size limit; validate content and scan before any staff preview; store privately.
- FR-05.02 Collect bank sender name, sent date/time and timezone, amount, currency, transfer reference, and optional bank/remittance identifier.
- FR-05.03 Proof submission changes payment claim state only, never paid status, subscription, or license.
- FR-05.04 Finance queue provides filters by domestic/international, age, amount mismatch, status, customer, and order.
- FR-05.05 Finance admin explicitly verifies actual credited bank funds using bank-sanctioned records outside this system; log credit date, received amount/currency, reference and checker identity.
- FR-05.06 Match full due amount after currency conversion and fees according to documented policy. Partial/short payment routes to an exception review, not approval.
- FR-05.07 Permit revision request with reason, rejection with reason, or approval. Reviewer cannot silently overwrite submitted evidence; new submission version instead.
- FR-05.08 Approval transaction is atomic/idempotent and rejects double approval or use of same actual bank credit for multiple orders without authorized split allocation.
- FR-05.09 Approval publishes a durable provisioning event and creates a pending license issuance work item; does **not** itself assert license already issued.
- FR-05.10 High-risk payment or account change may require second checker according to configured threshold; mandatory dual authorization for bank beneficiary edits recommended.

### FR-06 Subscription lifecycle (P0)

- FR-06.01 Start paid service only after verified payment plus successful entitlement issuance/activation readiness.
- FR-06.02 Monthly/yearly periods are exactly 720/8,760 elapsed UTC hours and use UTC timestamps; store UTC and display localized dates/timezones.
- FR-06.03 For early renewal, preserve remaining paid term and extend from previous paid term's end.
- FR-06.04 For renewal after paid expiration, new service starts when payment is approved and entitlement is ready; never retroactively bill expired gap.
- FR-06.05 Allow grace for exactly 72 hours after paid expiry, maintaining policy-defined last entitlement; grace ends at exclusive timestamp.
- FR-06.06 Notifications H-14/H-7/H-3 and at expiry, with deduplication and delivery tracking; renewal never charges automatically.
- FR-06.07 Cancel auto-renew is not a meaningful action without auto-renew; label actions as renewal reminders, request cancellation, or no further renewal, with clear period effects.
- FR-06.08 Suspension or fraud revocation are explicit admin actions with reason, approval and audit.

### FR-07 License issuing and desktop API (P0)

- FR-07.01 License manager issues from payment-approved, provisioning-ready order; no issuance for unverified claims except specifically audited complimentary/manual exception flow (deferred by default).
- FR-07.02 Signed license payload includes ID, customer, plan and feature entitlement version, device limits, issued time, effective time, end time and status metadata.
- FR-07.03 Private signing key never leaves backend protected storage; desktop validates with public key, algorithm allowlist and signed token integrity.
- FR-07.04 Online activation enforces device cap and refreshes last-online-validation on successful genuine validation.
- FR-07.05 Offline authorization valid up to 14 days from last genuine online validation and **no later than authorized access end**, including applicable grace; if clock integrity cannot be trusted, fail safely with recoverable guidance.
- FR-07.06 Device revoke/deactivate and recovery are audited; cap cannot be bypassed by retry/concurrent calls.
- FR-07.07 Admin creates/publishes license, customer sees it in My Galung, email is queued; email failure cannot invalidate issued license.
- FR-07.08 License key must not be exposed in general logs, analytics, or email subject; masked by default in UI with explicit reveal.
- FR-07.09 Expired subscription does not destroy user projects; desktop applies feature restriction based on documented plan entitlement behavior.
- FR-07.10 Desktop releases use signed installer, SHA-256 integrity and authenticated download/metadata as appropriate.

### FR-08 Customer self-service (P0)

- FR-08.01 Dashboard shows product, status, paid expiry, grace expiry if relevant, payment order status and license issuance progress.
- FR-08.02 View invoices, bank instructions locked to respective order, payment submission history, and review reason.
- FR-08.03 View licenses and registered devices, permitted deactivation, current cap and last successful online validation time.
- FR-08.04 Download official Windows installer/release notes; preserve trusted distribution even when subscription expired where policy allows reinstall.
- FR-08.05 Create manual renewal checkout from existing subscription.
- FR-08.06 Notifications avoid false claims like “license sent” while issuance is pending.

### FR-09 Admin management and CMS (P0)

- FR-09.01 Admin summary highlights payment review backlog, pending issuance, failed jobs, expiring subscriptions, and exceptions; never present made-up business data.
- FR-09.02 User, order, payment and license search/filter/detail; export restricted to authorized roles with audit.
- FR-09.03 Manage prices, promotions, plan policy versions, effective dates and publication approvals.
- FR-09.04 Manage pages, localized copy, sections, navigation, portfolio, FAQ, media, legal policies with draft/preview/publish/revert.
- FR-09.05 Bank account edits require elevated authority, MFA/re-auth and immutable audit; issued invoices retain original account snapshot unless formal replacement instruction issued.
- FR-09.06 License queue supports issue/retry/revoke with mandatory reason and clear original transaction linkage.
- FR-09.07 Releases dashboard supports channel, version, platform, file integrity hash, publishing state and rollback of availability.
- FR-09.08 RBAC checks occur in API, not only admin menu visibility.

### FR-10 Communication and operations (P0)

- FR-10.01 Event-driven transactional email templates for account verification, orders, proof receipt, review result, license issued, renewal reminders, grace and expiry.
- FR-10.02 Retry transient failures with deduplication; dead-letter queue and admin incident visibility for repeated failures.
- FR-10.03 Audit log records actor, action, before/after (redacted), timestamp, source and business object ID for privileged changes.
- FR-10.04 Data retention and privacy processes distinguish financial proof retention from marketing consent.
- FR-10.05 Backup, monitoring, incident response and restore drill must be completed before launch.

---

## 9. Detailed UI/UX specification

### 9.1 Design system

Proposed brand tokens (subject to actual logo/brand guide): Midnight `#111827`, Slate `#1C2738`, Bamboo Gold `#D7A34E`, Warm Ivory `#F4F0E8`, Teal `#3B8C83`; typography Plus Jakarta Sans or Manrope headings, Inter body, tabular financial digits. Distinct error/success colors must be accompanied by text and icon. Minimum WCAG 2.2 AA target. Keyboard focus visible; forms support accessible label/error associations; semantic navigation and landmarks; captions/transcripts; reduced-motion controls; minimum normal text contrast 4.5:1 and large-text ratio 3:1.

### 9.2 UX pages and acceptance

| Page | Main content | Primary CTA | Edge/empty/error state |
|---|---|---|---|
| Home | Hero, visual story, accessibility values, demo, pricing, portfolio | Compare plans | Fallback transcript if video unavailable |
| Pricing | Basic vs Pro, monthly/yearly toggle, policy and device cap | Subscribe | No active price -> contact support, no broken buy button |
| Checkout | Identity, selected plan, billing country, currency, summary | Create invoice | Price stale -> refresh quote and reconfirm |
| Transfer instructions | Official beneficiary/bank/SWIFT as applicable, invoice amount/ref/due | Submit payment | Expired invoice -> new/revalidation flow |
| Payment confirmation | Remittance data + secure proof upload | Submit proof | Invalid image, file scanner pending, upload retry |
| Payment status | Timeline, rejection reason and action | Resubmit when allowed | Bank pending -> clearly state not approved |
| My Galung | Active product, expiry, grace, issuance and download cards | Activate/download | No subscription -> pricing guidance |
| License detail | Masked key, seat/device count, dates, renewal CTA | View activation | Cap reached -> deactivate an allowed device |
| Admin review | Order/invoice, proof, bank credit verification, reviewer checklist | Approve/reject/revision | Duplicate approval conflict, insufficient funds |
| Admin license | Paid record, policy snapshot, issue action and result | Issue license | Signing failure -> retry without duplicate |
| Admin CMS | Draft/version, preview, publish scheduling | Publish | Conflicting revisions -> prevent silent overwrite |

### 9.3 Payment status copy

- Awaiting: “Menunggu transfer ke rekening resmi yang tercantum pada invoice.”
- Submitted: “Bukti diterima; pembayaran belum diverifikasi.”
- Under review: “Tim finance sedang mencocokkan dana yang masuk.”
- Awaiting funds (international): “Transfer dilaporkan, tetapi dana belum terlihat diterima.”
- Amount mismatch: “Jumlah yang diterima berbeda dari tagihan. Tim kami akan menghubungi Anda.”
- Approved, license pending: “Pembayaran berhasil diverifikasi. Lisensi sedang diproses.”
- Issued: “Lisensi tersedia di My Galung.”
- Grace: “Langganan berakhir. Akses sementara tersedia hingga [local datetime/timezone].”

### 9.4 Internationalization

Country selector does not infer citizenship. Show ISO currency code, locale-formatted currency and exact invoice currency; show recipient account instructions in one clear copyable block. Display timezone for payment deadlines, grace end and review events. Use clear English translations for all payment/legal/status content. Do not automatically convert prices at a browser-estimated FX rate; display any conversion only as clearly labeled, non-binding estimate (or omit entirely for MVP).

---

## 10. Status models and transition contracts

### 10.1 Order

`DRAFT` → `AWAITING_PAYMENT` → `PAYMENT_REVIEW` → `PAID` → `FULFILLED`. Alternative terminal paths: `CANCELLED`, `EXPIRED` with controlled reopen/late-remittance manual exception. `PAID` means verified receipt; `FULFILLED` means entitlement/license ready.

### 10.2 Payment claim/review

`AWAITING_PAYMENT` → `PROOF_SUBMITTED` → `UNDER_REVIEW` → `APPROVED` / `NEEDS_REVISION` / `REJECTED`; specialized review flags `AWAITING_FUNDS`, `AMOUNT_MISMATCH` (review substatus, not equivalent to paid). Actual bank credit ledger entry is distinct from proof claim. `APPROVED` is a terminal outcome for that specific review; reversals generate compensating events.

### 10.3 Subscription

`PENDING_ACTIVATION` → `ACTIVE` → (`GRACE_PERIOD` → `EXPIRED`) or `RENEWED` (new period record, active). `SUSPENDED`, `REVOKED`, `CANCELLED` are separately authorized pathways and must be clarified by finance/support policy. Store a complete immutable sequence of paid service periods, not only current dates.

### 10.4 License

`PENDING_ISSUANCE` → `ISSUED` → `ACTIVE`; later `EXPIRED` / `REVOKED` / `DEACTIVATED`. A duplicate retry for the same approved order returns the same issued license or the canonical issuance record, not a second license.

---

## 11. Data model contracts

Main tables and selected fields (exact SQL types, indexes and migrations belong to `DATABASE_SCHEMA.md`):

| Table | Critical fields / constraints |
|---|---|
| users | id, email unique case-folded, verified_at, country, locale, status |
| roles, user_roles, permissions | scoped admin authorization and change audit |
| products, plans | product code BASIC/PRO, billing support, state |
| plan_policy_versions | plan_id, device_limit, concurrent_limit, entitlements_json, effective_at, version |
| prices | price ID, plan, billing cycle, invoice currency, amount integer minor units, effective interval |
| promotions | code, type, value, eligibility, usage cap, start/end, status |
| orders, order_items | immutable order number, currency, total, price/offer/policy snapshot, due timestamp |
| invoices | invoice no., company identity snapshot, beneficiary instructions snapshot, line items |
| payment_submissions | order, uploader, bank sender, sent date, sent amount/currency, transfer ref, proof_file_id |
| payment_reviews | reviewer, decision, timestamp, notes, confirmed credited amount/currency/reference |
| bank_credit_records | verified credit unique fingerprint, bank account, amount/currency, received_at, supporting evidence |
| subscriptions, subscription_periods | subscriber, plan, status, paid period start/end, grace_end, approved order link |
| licenses | subscription, policy version, license id, key hash, issued_by, signed metadata, state |
| device_activations | license, device pseudonymous ID, activation status, last_verified_at, revoke history |
| software_releases | version/channel, installer file id, sha256, signature, published status |
| pages, page_revisions, portfolio_entries | locale, draft/publish state, consent/rights flag, version |
| audit_logs, outbox_events | actor, object, event, timestamp, immutable change details / durable jobs |

**Security:** store raw bank files privately; never log full activation secrets; passwords only securely hashed; prefer protected key management for signing. `received_amount` and `sent_amount` are separate. Use ISO currency codes and integer minor units with currency-specific precision.

### 11.1 Invariants

- One verified bank credit cannot fulfill unrelated orders twice without authorized allocation record.
- Subscription activation requires payment approval and entitlement readiness.
- An inactive or revoked license cannot be “made active” through UI manipulation.
- Token offline expiry is never beyond signed entitlement end (paid or authorized grace).
- Device cap is enforced transactionally for concurrent activation attempts.
- Price changes never mutate existing invoice snapshots.
- Role permission changes and bank instructions changes are audited.
- Future Song Library entitlement is a separate product/access domain, not automatically granted by Pro.

---

## 12. API contract outline

Prefix `/api/v1`; OpenAPI is source-of-truth, with JSON schema validation, structured error response and request-id.

| Method/path | Auth | Operation | Critical condition |
|---|---|---|---|
| GET `/products`, GET `/prices` | Public | Show active catalog | Published prices only |
| POST `/orders` | Customer | Create quote/order | Recalculate price, idempotency |
| GET `/orders/:id` | Owner/admin | Status/detail | Object-level ownership |
| POST `/orders/:id/payment-proofs` | Owner | New payment evidence version | Scan, content validation |
| GET `/me/subscriptions` | Customer | Own subscriptions | Owner scope |
| POST `/subscriptions/:id/renewal-orders` | Owner | Start manual renewal | Calendar-aware rules |
| GET `/me/licenses` | Customer | Own licenses | Mask key in list |
| POST `/licenses/activate` | Authenticated desktop/client | Bind device | Rate limit, cap, signed response |
| POST `/licenses/refresh` | Licensed desktop | Refresh | Genuine online validation |
| POST `/licenses/deactivate` | Authorized owner | Release device | Audit + cooldown if policy |
| GET `/releases/stable` | Public/owner as policy | Installer metadata | Hash + signing metadata |
| GET `/admin/payments` | Finance | Review queue | RBAC |
| POST `/admin/payments/:id/approve` | Finance | Approve bank verified claim | Credited funds, atomic, audit |
| POST `/admin/payments/:id/revision` | Finance | Request correction | Reason required |
| POST `/admin/licenses/:id/issue` | License manager | Sign/publish license | Approved order + idempotency |
| PUT `/admin/plans/:id/policies` | Authorized admin | New policy version | Effective-dated, audit |
| POST `/admin/pages/:id/publish` | Content role | Publish revision | Approval/preview conditions |
| PUT `/admin/bank-accounts/:id` | Privileged admin | Modify beneficiary data | MFA + second approval process |

Error example: `{ "error": { "code": "PAYMENT_FUNDS_NOT_CONFIRMED", "message": "Transfer belum terverifikasi.", "request_id": "..." } }`. Rate limits and repeated submission cooldown must not block legitimate support resolution. API key/token samples in documentation must never be real.

---

## 13. Non-functional requirements (NFR)

| ID | Requirement | Initial acceptance target |
|---|---|---|
| NFR-001 Accessibility | WCAG 2.2 AA for public and core purchase/customer workflows | Automated + manual keyboard/screen-reader and Deaf/HoH usability assessment |
| NFR-002 Performance | Fast usable website on mid-tier mobile connection | Target LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at 75th percentile for main public pages |
| NFR-003 Availability | Reliable checkout and license APIs | Initial operational objective >= 99.5% monthly, subject to infrastructure validation |
| NFR-004 Security | RBAC, MFA admin, TLS, private uploads, signing key protection, audit | Security review and critical/high findings resolved pre-launch |
| NFR-005 Data integrity | Approved payment/issuance never silently lost/duplicated | Transaction + outbox + idempotency integration tests |
| NFR-006 Backup | Encrypted scheduled backups + restore drills | Restore evidenced before launch; RPO <=1h and RTO <=4h are aspirational until proven |
| NFR-007 Observability | Payment/license job latency, errors, review backlog, audit | Alerts, operational dashboards and incident runbooks |
| NFR-008 Localization | ID and EN for entire checkout/legal/transaction paths | No untranslated blocking copy during user testing |
| NFR-009 Supportability | Human recovery for stuck payments or issuance | Admin exception queue and operator SOP |
| NFR-010 Browser/mobile | Current supported evergreen browsers; responsive | Cross-browser E2E and mobile tests |

Do not promise payment approval speed without bank settlement realities or staffing SLAs.

---

## 14. Roles and authorization matrix

Legend: R read, W create/update, A final approval, I issue/revoke, — no access; real permissions defined per action, not page.

| Area | Super Admin | Finance | License Manager | Content | Support | Customer |
|---|---|---|---|---|---|---|
| Public CMS | R/W/A | — | — | R/W/(A by scope) | R | R published |
| Product prices | R/W/A | R | R | R | R | R published |
| Orders | R/W | R/W | R linked | — | R restricted | R own |
| Bank proof/credit | R/A | R/W/A | R limited status | — | R status only | R own submission |
| License | R/I | R payment status | R/I | — | R status only | R own |
| Bank beneficiary edit | Elevated A, dual-control | Request/limited | — | — | — | — |
| Staff roles | R/W/A | — | — | — | — | — |
| Audit logs | R | R scoped | R scoped | — | — | — |

Default deny; least privilege; no staff role may edit its own audit trail.

---

## 15. Events, jobs and failure recovery

Domain events: `OrderCreated`, `PaymentProofSubmitted`, `PaymentMarkedUnderReview`, `FundsVerified`, `PaymentApproved`, `PaymentRevisionRequested`, `EntitlementProvisionRequested`, `LicenseIssued`, `LicenseIssueFailed`, `SubscriptionActivated`, `GraceEntered`, `SubscriptionExpired`, `RenewalInvoiceCreated`, `RenewalApproved`, `EmailDeliveryFailed`.

Payment approval commits verified bank-credit linkage, review outcome and transactional outbox event together. Worker handles entitlement and creates issuance queue. Admin issues license. Another event transitions order fulfillment and subscription to active when service is ready. Email uses retry and DLQ; it cannot roll back validated payment or license. All tasks must be idempotent and traceable through stable IDs.

**Important ambiguity resolved:** human approval for **payment** and human **license issuance** are distinct gates. The system may prepare a license record in pending issuance automatically, but only authorized staff action publishes/signs the license under MVP policy.

---

## 16. Analytics and privacy

Track `page_view`, `pricing_view`, `plan_selected`, `checkout_started`, `order_created`, `payment_proof_submitted`, `payment_review_completed`, `license_issued`, `desktop_activation_success/failure`, `subscription_renewed`. Do **not** put license secrets, bank account numbers, full proof content, or personal email in analytics. Separate operational metrics from marketing consent.

KPIs: visitor-to-pricing, checkout-to-order, claim-to-approved, median funds-review time, approval-to-issuance time, issuance success, desktop activation success, renewal rate, invoice vs received cash, exceptions by domestic/international.

---

## 17. Delivery plan and dependencies

| Stage | Deliverable | Prerequisites | Gate |
|---|---|---|---|
| 0 | Finalize open financial/licensing policy | Company stakeholders | Decision sign-off |
| 1 | PRD, flows, design system, prototype | This PRD | UX and finance review |
| 2 | Monorepo, identity, DB, API, RBAC | Security design | CI test suite |
| 3 | Marketing/CMS/catalog | Approved copy/feature matrix | Content acceptance |
| 4 | Checkout, invoice, international wire | Verified bank details, policy | E2E order creation |
| 5 | Proof review and manual reconciliation | Finance SOP | No self-approval path |
| 6 | Subscription + admin licensing + desktop client | API + Windows build team | E2E real device activation |
| 7 | Dashboard/downloads/notifications | Stable business events | End-to-end customer UAT |
| 8 | Security, accessibility, DR, launch | Prior phases | Go/no-go review |

**After MVP:** Song Library Premium separate subscription, organization and premium song seats, rich catalogue and institutional entitlement.

---

## 18. Release acceptance and launch checklist

Must demonstrate 5 test traces in staging/prod-like environment: (1) Indonesian Basic purchase/activation; (2) international Pro remittance with waiting-funds stage; (3) suspicious/fake proof rejection; (4) Basic → expiry → 72h grace → late renewal starting at new approval/ready timestamp; (5) offline activation valid <=14d while bounded by grace/access expiry. Additionally: permissions, admin MFA, duplicate approval protection, resilience against mail failures, backup restore, installer signature verification, legal pages and bank account verification.

Go/no-go signed by Product, Engineering, QA, Finance, Security/Operations and company owner. No go if any unresolved P0 failure, critical security finding, inaccurate beneficiary instructions, or untested recovery for payment/license issuance.

---

## 19. Change control and traceability

All requirements have stable IDs (`FR`, `NFR`, `DEC`, `AC`). Any scope modification requires impact review across product rules, UI copy, API, schema, security, analytics, test cases, release gates. New prices and device limits are configuration/version decisions; changing DEC-002 offline 14 days, DEC-003 grace 72h, DEC-004 late renewal start, DEC-005 international support, or DEC-006 MVP scope is a formal product decision change.

Related documents: `BUSINESS_RULES_AND_FLOWS.md`, `ACCEPTANCE_CRITERIA.md`, `IMPLEMENTATION_HANDOFF.md`.
