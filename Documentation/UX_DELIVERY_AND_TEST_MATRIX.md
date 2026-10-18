# GALUNG.ID — UX DELIVERY & TEST MATRIX

**Version 1.0 — 2026-10-17**

## A. Deliverable checklist per screen

- Desktop 1440px high fidelity; tablet 1024px responsive; mobile 390px and narrow 320px checks.
- Design states: loading, populated, empty, validation failure, 401, 403, 404, 409 conflict, 5xx, retry and success.
- Clickable prototype showing keyboard focus, form validation, confirmations, alerts, and menu behavior.
- ID/EN complete translations and timezone/currency treatment.
- Document component names, API bindings, role checks, sensitive data handling, analytics and exact acceptance trace.

## B. High-priority end-to-end test journeys

| Journey | Screens | Pass conditions |
|---|---|---|
| UXT-01 Indonesian Basic monthly | P04→A01→C01→C02→C03→C04→D03→D04→M04 | No access until finance verifies funds and license manager issues license |
| UXT-02 International Pro annual | P04→C01→C02→C03→D03→D04→M04 | SWIFT/remittance instructions, fees/currency reconciliation, no auto approval |
| UXT-03 Wrong paid amount | C03→C04→D03 | Explicit mismatch state, no activation, documented exception |
| UXT-04 Double admin approval | D03 | Concurrent second approval rejected/no double entry |
| UXT-05 Late renewal | M02→C01→C02→C03→D03→D04 | No backdated period; new clock starts when ready |
| UXT-06 Expiry & grace | M02→M04 | 72h grace clearly shown, then correct entitlement behavior |
| UXT-07 Offline limit | M04 + Windows client | 14-day max and never past authorized expiry/grace |
| UXT-08 Plan limits | P03→M04 + desktop | Device limit per versioned plan policy |
| UXT-09 CMS content change | D08→P01 | Draft/preview/publish/rollback, accessible ALT, safe versioning |
| UXT-10 Bank account change | D07→C02 | Unapproved bank details never shown; old invoices immutable |
| UXT-11 Sign-in/session expiry | A02→M01 or D03 | Safe retry, no action executed without authentication |
| UXT-12 Screen reader / keyboard | all forms and key workflows | Operable, logical reading/focus order; text status labels |

## C. Severity / release gates

- P0 (block launch): payment approval without actual credited funds, improper license issue, admin access bypass, data exposure, incorrect plan entitlements, expired token bypass, invalid invoice account, or missing required international payment instruction.
- P1 (block pilot/decision required): unclear status copy causing mistaken payment assumption, missing keyboard operation for core journeys, incorrect local timezone/grace display, nonfunctional invoice recovery.
- P2: polish and cosmetic imperfections with no conversion/accessibility impact.

## D. Evidence expected in QA

For every scenario record test ID, environment/version, test data (synthetic), screenshots/video where permitted, API logs with secrets redacted, expected vs actual behavior, defect ID, owner, severity, retest outcome. Never capture real customer bank documents in test artifacts.
