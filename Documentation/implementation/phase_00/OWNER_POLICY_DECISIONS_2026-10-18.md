# Owner policy decisions — 2026-10-18

**Status:** Owner answers recorded; contract changes and Gate A pending reconciliation. Source is the Product Owner's numbered reply in this chat. This file does not turn missing values into defaults.

| # | Owner answer | Contract interpretation / outstanding point |
|---|---|---|
| 1 | Basic/Pro feature list configurable in admin | Versioned per-plan feature policy; no feature list supplied. No plan may be sold or licensed before its approved policy is published. |
| 2 | Basic 1 device; Pro more than 1, maximum 5 | Clarified by owner: Basic 1 device/1 concurrent session; Pro 5 devices/1 concurrent session. Plan policy remains versioned. |
| 3 | Monthly/yearly price configurable in admin; display Rp 0 before set | Price editing approved. Owner clarified that checkout is disabled until approved price, bank and legal profile exist; display “Harga belum tersedia”, not an orderable Rp 0 offer. |
| 4 | Do not include tax for now | No tax calculation feature in MVP checkout candidate. Legal/Finance must establish whether tax is legally applicable and invoice disclosure; cannot waive statutory tax through a product setting. |
| 5 | Company identity configurable later in admin | Versioned company profile and immutable invoice snapshots. Commercial invoicing blocked until verified legal identity exists. |
| 6 | Beneficiary configurable later in admin | Existing two-person MFA maker/checker still mandatory before publication. Orders blocked without an approved live beneficiary supporting IDR and international wires. |
| 7 | IDR; website imposes no transfer fee; bank decides its own fees | Invoice currency IDR. Customer-sent/received amounts and bank fees recorded separately; no automatic FX conversion or implicit shortfall writeoff. International customers remain supported where bank accepts remittance. |
| 8 | Shortfall/mismatch policy configurable later in admin | Configurable, versioned, approval-controlled finance policy proposed. Until published, mismatch remains exception and cannot approve automatically. |
| 9 | Late-arriving funds after invoice expiry: contact help center | Keep payment under manual exception; support contact does not automatically renew/reprice/refund or activate access. |
| 10 | Refund/reversal needs terms | Policy substance remains TBD. See `DRAFT_TERMS_AND_COMMUNICATION.md`; no blanket no-refund clause or automatic license revoke. |
| 11 | Finance review on working days 09:00–17:00 WIB | Service hours approved; public promise of completion deadline/SLA remains TBD. Holiday calendar and bank settlement caveat required. |
| 12 | Full purchased-plan features during 72-hour grace | Subject to signed entitlement bound and valid non-revoked state. Emergency suspension triggers remain TBD. |
| 13 | License duration counted from license issuance, not payment | Aligns for initial/late terms if `license issuance` is defined as durable signed entitlement ready and claimable; early renewals must still extend from previous paid end under DEC-004. |
| 14 | Subscription starts at issuance; 30 calendar days | Owner clarified fixed durations: monthly 30 × 24 hours and annual 365 × 24 hours from entitlement readiness for initial/late terms. Early renewal still extends from the existing paid end under DEC-004. The Product Owner chose option A on 2026-10-18: fixed elapsed UTC duration, not calendar-month arithmetic. Draft SQL/API/test reconciliation is recorded separately and remains subject to contract review. |
| 15 | Proof size limit 10 MB | Change proposed from existing 5 MB UI/DB note; server, object storage, malware scanning and UI must use same limit. |
| 16 | Proof, finance, audit and device data retained 12 months | Product preference recorded. Legal must validate category-specific statutory preservation, security logs, deletion requests and archive holds before a blanket deletion schedule is applied. |
| 17 | Request draft terms and communication | Draft created, not legal-approved or publishable. |

## Decisions needed before contract freeze

1. Review the amended narrative, additive SQL migration 004, API `termDays` semantics and boundary test matrix for fixed 30/365-day terms while preserving early-renewal and late-renewal rules.
2. Refund eligibility, approval, partial-period calculation, payment reversal and entitlement effects.
3. Legal review of IDR international transfers, tax/invoice obligations, company identity, terms and 12-month retention.
4. Security/Desktop review of device proof, Windows support, offline revocation and key management; QA evidence of SQL/contract checks.

**Gate:** Phase 01 foundation remains subject to Phase 00 Gate A. The Product Owner's expectation to proceed is recorded, but this file does not mark the gate passed.
