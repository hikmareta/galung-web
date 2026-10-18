# GALUNG.ID — ACCEPTANCE CRITERIA & TEST MATRIX

**ID:** GLG-AC-001 | **Version:** 1.0 | **Status:** MVP verification baseline

## 1. Test conventions

- Every scenario must have automated unit/integration/E2E coverage where practical, with manual QA for accessibility, bank reconciliation and desktop performance.
- Test against isolated staging with synthetic users, fake keys, mock bank-credit records and bank statement fixtures; never fabricate production approvals.
- Use clock-controlled tests for UTC/calendar arithmetic, grace 72 hours and offline 14 days.
- Each test records build, environment, execution date, owner, evidence, pass/fail and linked requirement ID.
- `P0`: failing test blocks launch. `P1`: can be separately scheduled after documented acceptance.

## 2. Public site / CMS

| ID | Priority | Given / When | Expected result |
|---|---|---|---|
| WEB-001 | P0 | Fresh visitor opens home on mobile | Core value, product, CTA readable and responsive |
| WEB-002 | P0 | Visitor toggles ID/EN | Core public and transaction content translated; locale persists |
| WEB-003 | P0 | Keyboard-only visitor navigates checkout | All interactive elements reachable with visible focus |
| WEB-004 | P0 | Video has audio and critical explanation | Accurate captions/transcript available |
| WEB-005 | P0 | Visitor enables reduced motion | Non-essential animation suppressed |
| WEB-006 | P0 | Content manager edits hero as draft | Public site unchanged until approved publish |
| WEB-007 | P0 | Admin publishes and rolls back page | Correct version shown, audit recorded |
| WEB-008 | P0 | Portfolio lacks publication consent | Entry cannot be published without rights/consent record |
| WEB-009 | P0 | SEO crawler checks private paths | Auth required, noindex for account/admin/invoice pages |

## 3. Identity / security

| ID | Priority | Scenario | Expected result |
|---|---|---|---|
| AUTH-001 | P0 | Register valid account | Verification workflow and protected session work |
| AUTH-002 | P0 | Wrong password many times | Appropriate rate limit without account enumeration |
| AUTH-003 | P0 | Expired reset token used | Token rejected, safe recovery offered |
| AUTH-004 | P0 | Customer reads another customer order by ID | 403/404 without disclosure |
| AUTH-005 | P0 | Unprivileged account calls admin API | Denied server-side |
| AUTH-006 | P0 | Admin without MFA attempts sensitive approval | Denied |
| AUTH-007 | P0 | Admin edits own role to Super Admin | Denied unless separate authorized control |
| AUTH-008 | P0 | Sessions after password/security reset | Revoked according to policy |

## 4. Catalog / pricing / checkout

| ID | Priority | Scenario | Expected result |
|---|---|---|---|
| CHK-001 | P0 | Buy Basic Monthly | Matching published price and policy |
| CHK-002 | P0 | Buy Pro Annual | Correct annual amount and duration |
| CHK-003 | P0 | Apply eligible promotion | Server-calculated discount correct |
| CHK-004 | P0 | Use expired/ineligible promo | Reject without discount |
| CHK-005 | P0 | Tamper client-side total | Backend ignores forged amount |
| CHK-006 | P0 | Retry Create Order with same idempotency key | One canonical order/invoice |
| CHK-007 | P0 | Admin changes price after issued invoice | Invoice snapshot unchanged |
| CHK-008 | P0 | Unsupported currency requested | No invalid checkout generated |
| CHK-009 | P0 | Invoice generated | Correct company/account snapshot, total, currency, reference, timezone |
| MVP-001 | P0 | Open live pricing | Only Basic/Pro subscription purchases enabled |
| MVP-002 | P0 | Attempt Song Library Premium purchase endpoint | Route unavailable/denied on MVP |

## 5. Manual bank payment, including international

| ID | Priority | Scenario | Expected result |
|---|---|---|---|
| PAY-001 | P0 | Upload valid proof | Only proof-submitted state changes |
| PAY-002 | P0 | Upload forged-looking evidence without bank credit | No approval or entitlement |
| PAY-003 | P0 | Finance verifies full credit and approves | One approved review, audited, issuance pending |
| PAY-004 | P0 | Double approval same payment | No duplicate credit use or issuance |
| PAY-005 | P0 | Non-finance account approves | Forbidden |
| PAY-006 | P0 | Finance rejects and records reason | User sees safe reason and next steps |
| PAY-007 | P0 | Notification service down after approval | Approval persists, email retries |
| PAY-008 | P0 | Same bank credit used on another order | Block or explicit allocation workflow |
| PAY-009 | P0 | Malware or disguised executable uploaded | Denied/quarantined; no staff preview |
| PAY-010 | P0 | International customer fills remittance checkout | Currency, country, recipient instructions persisted |
| PAY-011 | P0 | Bank receives less than invoiced | Amount mismatch, not auto approved |
| PAY-012 | P0 | SWIFT proof uploaded but bank not credited | Awaiting funds, no activation |
| PAY-013 | P0 | Bank fee/currency conversion mismatch | Human exception with explicit recorded resolution |
| PAY-014 | P0 | Change beneficiary account post invoice | Existing invoice snapshot cannot silently change |
| PAY-015 | P0 | Two staff review same payment concurrently | Concurrency guard allows single decision |

## 6. Subscription lifecycle

| ID | Priority | Scenario | Expected result |
|---|---|---|---|
| SUB-001 | P0 | Proof submitted with no approved payment | Subscription inactive |
| SUB-002 | P0 | Payment approved, license pending | Subscription not falsely shown fully ready |
| SUB-003 | P0 | License issued after approval | Correct activation timestamp and period |
| SUB-004 | P0 | Early renewal | Period extends from existing paid_end |
| SUB-005 | P0 | Calendar month renewal around Jan 31/leap year | Documented calendar math, no 30-day shortcut |
| SUB-006 | P0 | H-14/H-7/H-3 reminders | Deduplicated expected messages |
| SUB-007 | P0 | Renewal invoice created | No auto-debit or automatic extension |
| SUB-010 | P0 | Paid end reached | Exactly 72-hour grace window opened |
| SUB-011 | P0 | Grace window ends | Paid entitlement is limited at exclusive end |
| SUB-012 | P0 | Payment + issue after prior paid end | New period starts at max(approval, entitlement ready), not backdated |
| SUB-013 | P0 | Approval delayed and issuance queued | Customer isn't silently charged for activation delay |
| SUB-014 | P0 | Revoked subscription reaches grace | Admin revoke policy prevails, audited |

## 7. License / desktop

| ID | Priority | Scenario | Expected result |
|---|---|---|---|
| LIC-001 | P0 | Issue license for unpaid order | Blocked |
| LIC-002 | P0 | Issue Basic | Only approved Basic feature set |
| LIC-003 | P0 | Issue Pro | Approved Pro feature set |
| LIC-004 | P0 | Reach cap then activate extra device | Rejected with clear recovery path |
| LIC-005 | P0 | Subscription/grace expires | Entitlement restriction observed in desktop |
| LIC-006 | P0 | Forged key | Rejected |
| LIC-007 | P0 | Alter token payload/signature | Signature validation fails |
| LIC-008 | P0 | Valid signed token while offline | Authorized use until bounded expiry |
| LIC-009 | P0 | Signing fails after approved bank receipt | Issuance pending/retry, payment remains approved |
| LIC-010 | P0 | Plan policies differ for device cap | Each license uses its versioned plan limit |
| LIC-011 | P0 | Last online validation at T; offline at T+13d23h | Valid only if entitlement still permits |
| LIC-012 | P0 | Offline at T+14d+1s | Offline token expired; revalidation required |
| LIC-013 | P0 | Subscription/grace ends before T+14d | Offline token cannot exceed authorized end |
| LIC-014 | P0 | Issue called twice by manager/worker | One canonical license returned |
| LIC-015 | P0 | User modifies local clock backward | Cannot gain unbounded continued use |
| LIC-016 | P0 | User deactivates device then reassigns | Cap and audit respected |
| LIC-017 | P0 | Email not delivered after issue | License still retrievable in dashboard |
| LIC-018 | P0 | App offline during a live performance | Already-valid offline token remains usable |
| LIC-019 | P0 | Revoked while device offline | New online refresh denies; offline residual risk documented |
| LIC-020 | P0 | Installer downloaded | Signed binary and published SHA-256 match |

## 8. My Galung, admin and operations

| ID | Priority | Scenario | Expected result |
|---|---|---|---|
| DASH-001 | P0 | User has pending order | Honest payment status and next action |
| DASH-002 | P0 | Payment approved, license not issued | Pending issuance visible |
| DASH-003 | P0 | License issued | Key protected, device and date details visible |
| DASH-004 | P0 | Grace period active | Exact expiry timestamp and renewal CTA |
| DASH-005 | P0 | User has no active plan | Simple discover/subscribe state |
| ADM-001 | P0 | Finance views pending domestic/international | Filter and escalation effective |
| ADM-002 | P0 | License manager issues after approval | Signed license + customer access + audit |
| ADM-003 | P0 | Unauthorized staff modifies bank details | Denied |
| ADM-004 | P0 | Authorized bank edit | Re-auth, approval, audit, notification |
| ADM-005 | P0 | Price published for new date | Only eligible future orders use it |
| ADM-006 | P0 | Sensitive activity occurs | Append-only audit with actor/time/object |
| OPS-001 | P0 | Worker crashes after approval | Outbox recovery issues correct pending work |
| OPS-002 | P0 | Database restored in rehearsal | Agreed restoration objectives evidenced |
| OPS-003 | P0 | Bank reconciliation daily | Approved payments map to verified credits |
| OPS-004 | P0 | Customer requests data export/deletion | Safe identity check and compliant handling |

## 9. User acceptance test scripts

### UAT-A — Indonesian Basic purchase
1. Visit pricing → choose Basic/monthly.
2. Create verified account, place order.
3. Inspect invoice and official transfer instructions.
4. Submit synthetic proof; verify subscription inactive.
5. Finance approves simulated verified credit.
6. Check `Payment approved; license pending` UI.
7. License admin issues license; desktop activates; check Basic feature set and device cap.

### UAT-B — International Pro annual purchase
1. Select English, international billing country and Pro/year.
2. Observe exact supported invoice currency and company banking details.
3. Submit international remittance claim; before simulated credit, verify `Awaiting funds` and no license.
4. Match official simulated credit, fees and FX; approve full amount.
5. Issue Pro license, receive email and activate Windows client.

### UAT-C — Expiry / grace / late renewal
1. Activate with clock-controlled service start.
2. Reach `paid_end_at`, enter grace for exactly 72h.
3. Check feature availability at grace_end minus 1s and restriction at grace_end.
4. Approve renewal after prior paid expiry; delay issuance.
5. When issuance completes, start new term at valid readiness timestamp without backdating.

### UAT-D — Offline verification
1. Activate online at T, disconnect device.
2. Validate permitted functionality until T+14d (exclusive) unless authorization ends sooner.
3. Set paid_end before offline TTL and verify grace bound.
4. Attempt clock rollback and token modification; no indefinite access.

### UAT-E — Fraud and operations
1. Upload fake proof with no bank credit.
2. Verify no admin approval and no license.
3. Attempt duplicate review, concurrent approval and duplicate license issuing.
4. Confirm one canonical payment/issuance, audited incident, safe error display.

## 10. Release criteria

No release with failed P0 cases, critical/high unresolved findings, wrong bank beneficiary, untested code signing, missing admin MFA, inaccessible core checkout, failed restore drill, lost approval-to-issuance event, or unapproved commercial policy variables. Attach all test evidence and sign-off to release record.
