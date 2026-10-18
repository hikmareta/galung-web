# GALUNG.ID — UI/UX SCREEN SPECIFICATION (MVP)

**ID:** GLG-UX-001 | **Version:** 1.0 | **Date:** 2026-10-17 | **Status:** Implementation draft based on approved decisions

## 0. Governance and precedence

This document extends `PRODUCT_REQUIREMENTS.md`, `BUSINESS_RULES_AND_FLOWS.md`, and `ACCEPTANCE_CRITERIA.md` without overriding their binding rules. No invented prices, device limits, bank details, approved product features, or financial settlement times. A screen may be completed visually, but it must not suggest a financial transaction is paid before bank-credit verification. Product purchase MVP = **Galung Basic and Galung Pro only**. International customers can pay by **manual bank transfer**. License issue is **admin-initiated after finance approval**. Offline entitlement max **14 days** and never beyond authorized entitlement/grace. Grace **72 hours**. Post-expiry renewals start once approved and entitlement ready, not retroactively.

## 1. Global screen conventions

- **Responsive:** desktop ≥1200px; compact 768–1199px; mobile 320–767px. At 320px content is usable without horizontal scrolling except intentional tabular data with explicit scrolling.
- **Navigation:** public header and footer; customer dashboard sidebar collapses to mobile menu; admin sidebar collapses and task actions remain accessible. Persist user language where consent permits.
- **Accessibility:** semantic headings, navigation landmarks, explicit field labels, associated errors, keyboard-operated dialogs, focus return, WCAG 2.2 AA target; animations respect reduced-motion; video captions and transcript; no audio-only interactions.
- **State contract for every async component:** `initial`, `loading` (announce busy), `success`, `empty`, `validation_error`, `server_error` (retry), `unauthorized`, `forbidden`, and `stale/conflict` where relevant. Use non-destructive recovery flows.
- **Money:** always show currency code (e.g. `IDR 1,234,000`), never browser-inferred FX as payable total. The approved quote, invoice amount, payable currency and beneficiary snapshot must match server record.
- **Dates:** human-readable plus zone for transfer due, approval, subscription paid_end and grace_end. Back-end stores UTC and calculates fixed 30 × 24-hour or 365 × 24-hour terms; display localized absolute dates and timezone.
- **Feedback:** actionable text for errors; confirmation dialogs for irreversible actions; status badges must include words, not only colors. No optimistic display of finance approvals or license issuance.
- **Analytics/privacy:** collect event names and non-sensitive IDs, not proof images, bank account data, license secrets, or personal input values.

## 2. Route inventory and ownership

| Surface | Route(s) | Role | Screens |
|---|---|---|---|
| Public | `/`, `/about`, `/how-it-works`, `/features` | Visitor | UX-P01, UX-P02 |
| Public | `/products`, `/products/basic`, `/products/pro`, `/pricing` | Visitor | UX-P03, UX-P04 |
| Public | `/portfolio`, `/portfolio/[slug]`, `/faq`, `/contact`, `/download`, `/legal/*` | Visitor | UX-P05, UX-P06 |
| Auth | `/register`, `/login`, `/forgot-password`, email verification | Visitor/customer | UX-A01, UX-A02 |
| Checkout | `/checkout`, `/orders/[id]/transfer`, `/orders/[id]/payment-proof`, `/orders/[id]/status` | Customer | UX-C01–C04 |
| My Galung | `/dashboard`, `/dashboard/subscriptions`, `/dashboard/orders`, `/dashboard/orders/[id]` | Customer | UX-M01–M03 |
| My Galung | `/dashboard/licenses`, `/dashboard/licenses/[id]`, `/dashboard/devices`, `/dashboard/downloads`, `/dashboard/account` | Customer | UX-M04–M06 |
| Admin | `/overview`, `/orders`, `/payments`, `/payments/[id]` | Authorized staff | UX-D01–D03 |
| Admin | `/licenses/pending`, `/licenses/[id]`, `/subscriptions`, `/customers` | Authorized staff | UX-D04–D05 |
| Admin | `/plans`, `/pricing`, `/bank-accounts`, `/pages`, `/portfolio`, `/media`, `/releases`, `/staff`, `/audit` | Authorized staff | UX-D06–D10 |

## 3. Page specifications
### UX-P01 — Homepage

**Routes:** `/`  
**Users:** Visitor  
**Objective:** Educate; guide visitor to discover features, trust signals and pricing.

**Screen anatomy / content hierarchy:** Hero: headline, supporting copy, CTA Compare Plans; optional Watch Demo; how it works 3 stages; inclusion statement; real software screenshots; authentic case studies; Basic/Pro teaser; FAQ; footer.

**Primary interactions:** Compare Plans, Watch Demo (accessible captions/transcript), Learn More.

**Loading, empty, error, and exception handling:** No video → static image + transcript; no case studies → hide section, do not fabricate endorsements. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Desktop 2-column hero and feature cards; mobile stacked hero with CTA before heavy media.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/content/home, GET /api/v1/products`.

**Telemetry events (non-sensitive):** `home_view, home_cta_click`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-P02 — How It Works + Features

**Routes:** `/how-it-works`  
**Users:** Visitor  
**Objective:** Explain how visual cues and Angklung orchestration work without relying on sound.

**Screen anatomy / content hierarchy:** Step illustrations and captions; controlled motion demo; visual rhythm stepper; pause/replay; software compatibility.

**Primary interactions:** Play visual demo, Compare Plans.

**Loading, empty, error, and exception handling:** Media fails → textual sequence; reduced-motion → minimal static or step-by-step cues. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Mobile controls minimum easy touch targets; desktop side-by-side illustration/text.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/content/how-it-works`.

**Telemetry events (non-sensitive):** `demo_start, demo_finish`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-P03 — Product Details

**Routes:** `/products/basic and /products/pro`  
**Users:** Visitor  
**Objective:** Clearly distinguish plan-specific *approved* features, device policy and requirements.

**Screen anatomy / content hierarchy:** Product header, approved feature matrix, screen captures, Windows requirements, license duration, offline note, FAQ.

**Primary interactions:** Choose Plan.

**Loading, empty, error, and exception handling:** Unknown feature flags or device limit → no fictional claim; show Contact Sales or awaiting setup instead of invented count. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Mobile cards instead of wide table; desktop compare side-by-side.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/products, GET /api/v1/prices`.

**Telemetry events (non-sensitive):** `product_view, product_plan_click`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-P04 — Pricing & Billing Cycle

**Routes:** `/pricing`  
**Users:** Visitor  
**Objective:** Compare Basic vs Pro monthly/yearly; avoid misleading pricing.

**Screen anatomy / content hierarchy:** Cycle toggle, plan feature comparison, price IDR or configured currency, taxes and bank fees notice, configurable device count, billing semantics, manual transfer message.

**Primary interactions:** Subscribe Basic / Subscribe Pro.

**Loading, empty, error, and exception handling:** Missing active price → CTA disabled with contact notice; changed offer → refresh quote. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Sticky plan header on mobile; accessible toggle with verbal cycle label.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/prices?country=...`.

**Telemetry events (non-sensitive):** `pricing_view, cycle_changed, plan_selected`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-P05 — Portfolio & Case Study

**Routes:** `/portfolio, /portfolio/[slug]`  
**Users:** Visitor  
**Objective:** Build trust using consented and substantiated examples.

**Screen anatomy / content hierarchy:** Project list with facets, images alt text, project facts, challenge/solution/outcome, approved quotes, accessible videos.

**Primary interactions:** View Case Study, Contact.

**Loading, empty, error, and exception handling:** No published items → helpful empty content; removed case study → 404 or archived redirect. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Responsive masonry/cards without causing cumulative layout shift.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/content/portfolio`.

**Telemetry events (non-sensitive):** `portfolio_view, case_open`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-P06 — FAQ, Download & Contact

**Routes:** `/faq, /download, /contact, /legal/*`  
**Users:** Visitor  
**Objective:** Provide answers, safe distribution and a route to help.

**Screen anatomy / content hierarchy:** Searchable FAQ, installer compatibility, signed file/hash info, contact form, current policies with revision date.

**Primary interactions:** Download (when permitted), Submit Inquiry.

**Loading, empty, error, and exception handling:** Installer unavailable → release notice, no broken downloads; form failure → retain input. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Single column reading mode on mobile.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/releases, GET /api/v1/content/faq, POST /api/v1/contact`.

**Telemetry events (non-sensitive):** `faq_search, contact_submit`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-A01 — Register / Verify Email

**Routes:** `/register`  
**Users:** Visitor  
**Objective:** Create account before checkout; establish identity securely.

**Screen anatomy / content hierarchy:** Email, password, password confirmation as appropriate, country selector, terms acknowledgement, verification feedback, language choice.

**Primary interactions:** Create Account, Resend Verification.

**Loading, empty, error, and exception handling:** Email in use → safe guidance; expired verification → resend throttled; do not enumerate hidden accounts. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Mobile single-column inputs, correct autocomplete and input modes.

**API/data dependencies (planned; confirm in OpenAPI):** `POST /api/v1/auth/register, POST /api/v1/auth/resend-verification`.

**Telemetry events (non-sensitive):** `registration_started, registration_succeeded`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-A02 — Login / Recovery

**Routes:** `/login, /forgot-password`  
**Users:** Customer / Staff on respective origin  
**Objective:** Offer safe authentication and recovery while preserving non-sensitive purchase intent.

**Screen anatomy / content hierarchy:** Email, password, show/hide password, forgot password link, trusted devices/session messaging; admin MFA challenge.

**Primary interactions:** Sign In, Reset Password.

**Loading, empty, error, and exception handling:** Invalid credentials → generic message; expired session → continue safely after re-authentication. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Keyboard-supported form and MFA field.

**API/data dependencies (planned; confirm in OpenAPI):** `POST /api/v1/auth/login, POST /api/v1/auth/reset-request`.

**Telemetry events (non-sensitive):** `login_success, reset_requested`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-C01 — Checkout Review

**Routes:** `/checkout`  
**Users:** Authenticated customer  
**Objective:** Confirm one configured Basic/Pro plan, duration and billing information before invoice.

**Screen anatomy / content hierarchy:** Plan, cycle, country, billing name/email/address, invoice currency, server quote, promo if active, legal checkboxes and transfer explanation.

**Primary interactions:** Create Invoice.

**Loading, empty, error, and exception handling:** Price stale → display new price and require explicit reconfirmation; plan inactive → return to pricing. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Desktop two-column form/order summary, mobile summary before confirm.

**API/data dependencies (planned; confirm in OpenAPI):** `POST /api/v1/orders/quote, POST /api/v1/orders`.

**Telemetry events (non-sensitive):** `checkout_started, invoice_created`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-C02 — Bank Transfer Instructions

**Routes:** `/orders/[id]/transfer`  
**Users:** Order owner  
**Objective:** Show immutable issued invoice and verified beneficiary details.

**Screen anatomy / content hierarchy:** Invoice ID, payable total/currency, beneficiary name/account, SWIFT/BIC when required, bank address, remittance reference, expiry with zone, fee instructions, copy controls.

**Primary interactions:** I Have Transferred / Upload Proof.

**Loading, empty, error, and exception handling:** Expired invoice → show reissue/revalidation path; changed bank config must not mutate existing issued instruction without a formal replacement. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Mobile vertical bank detail cards and tap-to-copy; desktop printable layout.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/orders/:id, GET /api/v1/orders/:id/invoice`.

**Telemetry events (non-sensitive):** `transfer_instructions_viewed, copy_reference`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-C03 — Payment Proof Submission

**Routes:** `/orders/[id]/payment-proof`  
**Users:** Order owner  
**Objective:** Capture transfer claim—never activate subscription.

**Screen anatomy / content hierarchy:** Sender legal name, origin bank (optional by route), transfer time/date, sent amount and currency, international remittance ref, file chooser JPG/PNG/PDF (≤5MB), declaration and preview.

**Primary interactions:** Submit for Verification.

**Loading, empty, error, and exception handling:** Unsupported/oversize/infected file → blocked with specifics; network failure → safe retry; duplicate submission → show history. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Mobile camera/gallery accessible alternatives; desktop drag/drop + browse.

**API/data dependencies (planned; confirm in OpenAPI):** `POST /api/v1/orders/:id/payment-proofs`.

**Telemetry events (non-sensitive):** `payment_claim_submitted, proof_upload_failed`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-C04 — Order & Payment Status

**Routes:** `/orders/[id]/status`  
**Users:** Order owner  
**Objective:** Make distinction between proof received, credited payment, and issued license unmistakable.

**Screen anatomy / content hierarchy:** Timeline Created → Proof Submitted → Review → Approved → License Issued; international Awaiting Funds/Amount Mismatch; rejection reasons/redaction; support link.

**Primary interactions:** Resubmit when permitted, View License when issued.

**Loading, empty, error, and exception handling:** Pending > expected → no fabricated SLA; show contact and last updated; unauthorized → 404-safe ownership response. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Mobile vertical timeline, desktop event rail with detail pane.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/orders/:id, GET /api/v1/orders/:id/payments`.

**Telemetry events (non-sensitive):** `order_status_view`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-M01 — Customer Overview

**Routes:** `/dashboard`  
**Users:** Customer  
**Objective:** Surface entitlement, upcoming actions and downloads.

**Screen anatomy / content hierarchy:** Active plan cards, paid end & grace end, latest orders, license pending/issued, downloads, alerts.

**Primary interactions:** View Licenses, Renew, Upload Proof.

**Loading, empty, error, and exception handling:** No purchases → browse plans; license pending → do not show a usable key. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Desktop card grid with left rail; mobile priority cards stack.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/me/dashboard`.

**Telemetry events (non-sensitive):** `dashboard_view`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-M02 — Subscriptions & Renewal

**Routes:** `/dashboard/subscriptions`  
**Users:** Customer  
**Objective:** Explain paid period, remaining time, 72h grace and renewal starting rule.

**Screen anatomy / content hierarchy:** Plan, cycle, paid_end, grace_end local time, policy note, renewal invoice CTA, cancellation terms.

**Primary interactions:** Renew Subscription.

**Loading, empty, error, and exception handling:** Expired: clear locked status; late renewal: new service start after approval/issuance; avoid retroactive calendar math. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Mobile stacked subscription cards and accessible status text.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/me/subscriptions, POST /api/v1/subscriptions/:id/renewal-order`.

**Telemetry events (non-sensitive):** `renewal_started`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-M03 — Orders & Invoices

**Routes:** `/dashboard/orders, /dashboard/orders/[id]`  
**Users:** Customer  
**Objective:** Give complete traceability and document downloads.

**Screen anatomy / content hierarchy:** Filterable orders, invoice amount, bank instruction snapshot, payment status and receipt references, PDF download.

**Primary interactions:** View Order, View Invoice.

**Loading, empty, error, and exception handling:** No orders → pricing CTA; cancelled or expired invoice → show immutable history and next step. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Tables horizontally scroll with labels; mobile card rows.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/me/orders, GET /api/v1/orders/:id`.

**Telemetry events (non-sensitive):** `order_history_view`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-M04 — Licenses & Devices

**Routes:** `/dashboard/licenses, /dashboard/licenses/[id], /dashboard/devices`  
**Users:** Customer  
**Objective:** Expose issued keys safely and count against per-plan policy.

**Screen anatomy / content hierarchy:** Masked key / deliberate reveal, product edition, last validation, device slots, issue/expiry/grace dates, deactivate process with warning.

**Primary interactions:** Copy Key, Deactivate Device when permitted.

**Loading, empty, error, and exception handling:** No license yet → pending/none distinction; device limit reached → actionable release-device guidance. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Mobile compact device list; desktop card/table views.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/me/licenses, GET /api/v1/me/devices, POST /api/v1/licenses/:id/devices/:deviceId/deactivate`.

**Telemetry events (non-sensitive):** `license_viewed, device_deactivated`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-M05 — Downloads & Release Notes

**Routes:** `/dashboard/downloads`  
**Users:** Customer  
**Objective:** Provide authentic official Windows installer and update notes.

**Screen anatomy / content hierarchy:** Current stable version, x64 requirements, checksum, signed publisher, build date, version history.

**Primary interactions:** Download Windows Installer.

**Loading, empty, error, and exception handling:** File unavailable/revoked → disable link and show support path; malicious download prevention. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Mobile download card with legible technical details.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/releases, GET /api/v1/releases/:id/download-url`.

**Telemetry events (non-sensitive):** `installer_download_started`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-M06 — Account / Preferences

**Routes:** `/dashboard/account`  
**Users:** Customer  
**Objective:** Maintain own profile and security.

**Screen anatomy / content hierarchy:** Profile, locale, billing identity, password/session security, email settings, delete request process.

**Primary interactions:** Save Changes, Log Out Other Sessions.

**Loading, empty, error, and exception handling:** Invalid email change → require verification; slow save → retain form, show retry. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Responsive form sections and clear save confirmation.

**API/data dependencies (planned; confirm in OpenAPI):** `GET/PATCH /api/v1/me, POST /api/v1/auth/change-password`.

**Telemetry events (non-sensitive):** `account_updated`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-D01 — Admin Overview

**Routes:** `/overview`  
**Users:** Staff with dashboard permission  
**Objective:** Prioritize pending finance and licensing work without confusing claimed vs collected funds.

**Screen anatomy / content hierarchy:** Task cards: unreviewed claims, awaiting bank funds, license issuance queue, approvals today; charts for collected vs invoiced.

**Primary interactions:** Review Payments, Issue Licenses.

**Loading, empty, error, and exception handling:** No tasks → positive empty state; permission restricted → hide metrics and enforce server authorization. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Desktop dashboard grid; mobile critical tasks first.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/admin/overview`.

**Telemetry events (non-sensitive):** `admin_overview_view`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-D02 — Orders & Payments Queue

**Routes:** `/orders, /payments`  
**Users:** Finance staff  
**Objective:** Review work by urgency, country and exception.

**Screen anatomy / content hierarchy:** Search, status/country/date filters, amount currency, claim created, bank credited status, assigned reviewer; paginated list.

**Primary interactions:** Open Review.

**Loading, empty, error, and exception handling:** Concurrent updates → refresh conflict indicator; zero matching results → clear filters. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Admin desktop table; mobile read-only/high-priority cards with secure action screen.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/admin/orders, GET /api/v1/admin/payments`.

**Telemetry events (non-sensitive):** `payment_queue_view`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-D03 — Payment Verification Workspace

**Routes:** `/payments/[id]`  
**Users:** Finance admin  
**Objective:** Ensure independent bank-credit verification before approval.

**Screen anatomy / content hierarchy:** Split layout: invoice and proof left; bank credit evidence/right; receipt amount/currency, fees/ref, reviewer notes, audit and confidence checklist.

**Primary interactions:** Approve, Request Revision, Reject.

**Loading, empty, error, and exception handling:** Uncredited funds → approval blocked; amount mismatch → explicit exception handling; concurrent approval → 409 with latest state. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Desktop split pane, mobile stacked review with sticky summary, confirmation dialog.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/admin/payments/:id, POST /api/v1/admin/payments/:id/approve|reject|revision`.

**Telemetry events (non-sensitive):** `payment_review_open, payment_approved`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-D04 — License Issuance Queue

**Routes:** `/licenses/pending, /licenses/[id]`  
**Users:** License manager  
**Objective:** Issue signed license after settled payment, with exact plan-policy snapshot.

**Screen anatomy / content hierarchy:** Verified payment, order, product, approved device slots/features, prospective dates, issuance history and signing state.

**Primary interactions:** Issue License, Retry Failed Issue.

**Loading, empty, error, and exception handling:** Not approved → action prohibited; issuer crash → idempotent recovery; issue twice → prevent duplicate. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Review pane + confirmation with customer and plan.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/admin/licenses/pending, POST /api/v1/admin/licenses`.

**Telemetry events (non-sensitive):** `license_issue_started, license_issued`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-D05 — Customer & Subscription Operations

**Routes:** `/customers, /subscriptions`  
**Users:** Customer support/authorized staff  
**Objective:** View account timeline and resolve incidents without overexposing data.

**Screen anatomy / content hierarchy:** Search by masked email, subscriptions, payment/license timeline, role-bound actions, support notes.

**Primary interactions:** Open Customer, Review Subscription.

**Loading, empty, error, and exception handling:** Sensitive records masked; no permission → forbidden; expired grace shown accurately. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Desktop split view; mobile searchable cards.

**API/data dependencies (planned; confirm in OpenAPI):** `GET /api/v1/admin/customers, GET /api/v1/admin/subscriptions`.

**Telemetry events (non-sensitive):** `customer_record_open`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-D06 — Products, Pricing & Promotions

**Routes:** `/plans, /pricing, /promotions`  
**Users:** Pricing administrator  
**Objective:** Publish future-effective plan and price revisions safely.

**Screen anatomy / content hierarchy:** Edition, monthly/annual, price currency, device/concurrent limits, feature flag references, version, effective dates, promo eligibility.

**Primary interactions:** Save Draft, Publish Revision.

**Loading, empty, error, and exception handling:** Invalid overlapping price windows blocked; historical invoices unchanged; no approved limits → cannot publish. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Desktop editable grid; mobile single-record form; high-risk confirm.

**API/data dependencies (planned; confirm in OpenAPI):** `GET/POST/PATCH /api/v1/admin/plans and /prices`.

**Telemetry events (non-sensitive):** `pricing_revision_published`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-D07 — Bank Account Settings

**Routes:** `/bank-accounts`  
**Users:** Super Admin with dual-control where possible  
**Objective:** Prevent bank-account substitution fraud.

**Screen anatomy / content hierarchy:** Account holder exact legal name, bank, account/IBAN as appropriate, SWIFT, currency support, effective dates, approval history.

**Primary interactions:** Propose Change, Approve Change.

**Loading, empty, error, and exception handling:** Unapproved edit never changes customer instructions; existing invoices retain beneficiary snapshot or formal reissue. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Sensitive fields masked by default; require MFA re-authentication.

**API/data dependencies (planned; confirm in OpenAPI):** `GET/POST /api/v1/admin/bank-accounts, POST /api/v1/admin/bank-accounts/:id/approve`.

**Telemetry events (non-sensitive):** `bank_change_proposed, bank_change_approved`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-D08 — CMS, Portfolio & Media

**Routes:** `/pages, /portfolio, /media`  
**Users:** Content manager  
**Objective:** Edit and publish accessible bilingual content with history.

**Screen anatomy / content hierarchy:** Draft, preview, localized fields, alt text, image rights and consent, published version, rollback.

**Primary interactions:** Preview, Publish.

**Loading, empty, error, and exception handling:** Revision conflicts -> explicit reconciliation; missing image rights → publication blocked for restricted content. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Desktop preview side-by-side; mobile limited editing preview.

**API/data dependencies (planned; confirm in OpenAPI):** `GET/POST/PATCH /api/v1/admin/content/*`.

**Telemetry events (non-sensitive):** `content_published`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-D09 — Releases / Downloads

**Routes:** `/releases`  
**Users:** Release manager  
**Objective:** Publish verified Windows installers and documentation.

**Screen anatomy / content hierarchy:** Version, channel, OS/architecture, checksum, signature verification, release notes, rollout and status.

**Primary interactions:** Publish Release.

**Loading, empty, error, and exception handling:** Hash mismatch or unverified signature → cannot publish; unpublished URLs never public. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Desktop artifact table; mobile cards.

**API/data dependencies (planned; confirm in OpenAPI):** `GET/POST /api/v1/admin/releases`.

**Telemetry events (non-sensitive):** `release_published`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

### UX-D10 — Staff, Audit & Reports

**Routes:** `/staff, /audit, /reports`  
**Users:** Super Admin / Analyst limited  
**Objective:** Manage access, review critical events and export reporting.

**Screen anatomy / content hierarchy:** Roles, invites, MFA enforcement, immutable audit entries, filters/export and revenue collected vs billed.

**Primary interactions:** Assign Role, Export Report.

**Loading, empty, error, and exception handling:** Privilege escalation blocked; audit entry immutable; export permission checked and sanitized. All async requests announce progress, give retry on recoverable failure, and show safe session-expired recovery; no sensitive data in toast messages.

**Responsive/adaptive rules:** Desktop dense tables; accessible mobile drill-in.

**API/data dependencies (planned; confirm in OpenAPI):** `GET/POST /api/v1/admin/staff, GET /api/v1/admin/audit`.

**Telemetry events (non-sensitive):** `audit_reviewed`.

**Acceptance checklist:** [ ] reachable only by appropriate audience; [ ] meaningful heading and accessible focus flow; [ ] user input and server response reconciled; [ ] loading/error/empty tested; [ ] keyboard and 320px layout tested; [ ] Indonesian and English copy tested; [ ] no price, bank data, license or customer details invented; [ ] no role bypass.

## 4. Core form and validation contracts

| Screen | Field | Required / Validation | Important copy / behavior |
|---|---|---|---|
| Register | email | required; normalized; server validates | Verification required; avoid account enumeration |
| Register | password | required; approved security policy; show requirements | Never log or prefill into query string |
| Checkout | country | required; ISO country code | Indicates billing context, not inferred citizenship |
| Checkout | billing name and address | required based on approved invoice policy | Store immutable billing snapshot on order |
| Checkout | plan + duration | required; exact versioned product/price ID | One of Basic/Pro; monthly/yearly |
| Checkout | promo code | optional; server validates eligibility, expiry and limits | Display removed discount if invalid |
| Payment proof | sender name | required for manual review | Claim is not verification |
| Payment proof | date/time sent | required; time zone or explicit localized conversion | Distinguish transfer initiation from arrival |
| Payment proof | sent amount/currency | required; positive numeric and ISO 4217 currency | Never assume received amount equals sent amount |
| Payment proof | remittance reference | required if transfer type provides it | May differ from company-bank credit reference |
| Payment proof | attachment | required; JPG/PNG/PDF, max 5MB; scan before access | Do not publicly expose URL |
| Finance review | received amount + currency | required for approval; must match actual bank credit | Verify independently with bank record |
| Finance review | bank credit reference/time | required for approval | Unique/idempotent bank reference check |
| Finance review | reason on rejection/revision | required | Visible sanitized reason to customer |
| License issue | approved plan policy version | required, immutable snapshot | Manual issue after payment approval |
| License issue | device and concurrency limits | required configured values | No unapproved default limits |
| Plan publish | effective from, price, currency, feature policy | required with validation | No backdating historical invoices |
| Bank change | proposed account details, reason, MFA | required | Dual control recommended; pending until approved |

## 5. Interaction sequences

### 5.1 Checkout to license delivery
`Pricing → Authenticate → Checkout Review → Server Quote → Create Invoice → Bank Instructions → Submit Transfer Claim → Under Review/Awaiting Funds → Independent Bank Credit Confirmation → Payment Approved → Pending License → Admin Issue → Customer License Available → Windows Activation`.

### 5.2 Payment exception
`Claim Submitted → Awaiting Funds OR Amount Mismatch OR Needs Revision → Reviewer Note → Customer Action (where appropriate) → Independent Recheck → Approved/Rejected`. Status cannot silently jump from claim to paid.

### 5.3 Post-expiry renewal
`Paid period ends → 72h grace → Expired → New renewal order → Manual transfer → Finance approves → License renewed/entitlement ready → New period starts at ready/approval-complete time`.

## 6. Essential frontend component catalog

`AppHeader`, `LanguageSwitcher`, `Footer`, `PlanCard`, `BillingCycleToggle`, `FeatureComparison`, `BankTransferInstruction`, `CopyField`, `OrderSummary`, `PaymentProofUploader`, `PaymentStatusTimeline`, `SubscriptionStatusBanner`, `LicenseKeyReveal`, `DeviceSlotList`, `ReleaseDownloadCard`, `AdminDataTable`, `AdminReviewChecklist`, `SensitiveActionConfirm`, `ContentRevisionPreview`, `ErrorSummary`, `EmptyState`, `InlineAlert`, `FormField`, `AccessibleDialog`, `Toast` (non-sensitive). Each must specify loading, keyboard, screen reader, RTL-ready spacing where possible and responsive behavior.

## 7. UX writing vocabulary (ID/EN)

| System status | Bahasa Indonesia | English |
|---|---|---|
| AWAITING_PAYMENT | Menunggu transfer | Awaiting bank transfer |
| PROOF_SUBMITTED | Bukti transfer terkirim—belum terverifikasi | Proof submitted—not yet verified |
| AWAITING_FUNDS | Dana belum terlihat diterima | Awaiting receipt of funds |
| UNDER_REVIEW | Pembayaran sedang diperiksa | Payment under review |
| AMOUNT_MISMATCH | Terdapat selisih jumlah transfer | Received amount differs |
| NEEDS_REVISION | Konfirmasi pembayaran perlu diperbaiki | Payment confirmation needs an update |
| APPROVED | Dana telah diverifikasi | Funds verified |
| LICENSE_PENDING | Lisensi sedang diproses oleh admin | License issuance pending |
| ISSUED | Lisensi tersedia | License available |
| GRACE_PERIOD | Akses sementara sampai [date/time/zone] | Temporary access until [date/time/zone] |
| EXPIRED | Langganan berakhir | Subscription expired |

## 8. UI signoff gates

1. **PM:** page objective, CTA, role and MVP scope confirmed.
2. **Design:** low-fidelity, high-fidelity desktop/mobile, tokens, variants and interaction prototype signed off.
3. **Engineering:** API/data/status contract reviewed; server security on every privileged mutation.
4. **Accessibility:** keyboard, screen reader, text alternatives, touch targets, visual cues, language and color-contrast review.
5. **QA:** full state matrix including payment exceptions and offline/grace boundaries.
6. **Operations:** finance and license manager rehearse cases before production deployment.

## 9. Not in MVP

Premium Song Library checkout/access, institution seat management, song subscription pricing, automatic collection/debit/payment gateway, automatically trusting customer payment evidence, mandatory online checks during a valid offline window, and undefined desktop features. Teaser content may exist without active sales.

## 10. Open owner approvals

- Basic and Pro price per period; device and concurrent-use limits; approved feature matrix.
- Company banking/remittance capabilities, payable currencies, fee bearer, short/over payment policy.
- Invoice validity, refund policy, support hours, tax rules; company legal identity.
- Design assets: official logo, original desktop screenshots, product videos, approved testimonials and consent.
- License handling when revoked during offline window; anti-clock-tampering policy, secure activation API details.

**Next handoff:** prepare Figma-equivalent clickable prototypes/wireframes and an OpenAPI + database schema that implement these contracts.
