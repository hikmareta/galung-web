# API Verification & Acceptance Test Matrix

| ID | Operation / scenario | Expected outcome |
|---|---|---|
| AUTH-01 | Customer logs in with correct credentials | Secure session cookie, CSRF established, no token in JS-readable storage |
| AUTH-02 | Staff MFA challenge incomplete | No privileged authenticated session |
| AUTH-03 | Browser mutation without valid CSRF | 403, no data changed |
| ACL-01 | Customer accesses another customer's order or license | 404/403 without detail leak |
| ACL-02 | Support agent attempts finance approval | 403 and audit event |
| ORD-01 | POST order valid Basic 1-month | Exact published server price snapshot, invoice linked |
| ORD-02 | Tamper price in browser request | Recomputed server price; client total ignored |
| ORD-03 | Reuse idempotency key with identical request | Exact prior outcome, no duplicate order |
| ORD-04 | Same idempotency key with different request | 409 IDEMPOTENCY_CONFLICT |
| ORD-05 | International customer from Bosnia chooses IDR checkout | Country retained, correct verified eligible bank instructions |
| UP-01 | Upload PDF > 5 MiB | 422 / rejected before accepted proof |
| UP-02 | Uploaded file scanned malicious/pending | Cannot submit or finance preview as clean proof |
| PAY-01 | Customer submits proof | Proof status submitted; no payment approval or license |
| PAY-02 | Finance attempts approve without verified bank credit | 422, no changes |
| PAY-03 | Verified bank credit mismatches invoice received currency/amount | 422 or explicit exception review, no silent FX |
| PAY-04 | Two staff approve same bank credit simultaneously | Exactly one effective approval |
| PAY-05 | Proof rejected and resubmitted | Prior revision remains in history; new revision distinct |
| LIC-01 | Finance approval only | Issuance request pending; license not yet issued |
| LIC-02 | License manager issues approved order | Exactly one issuance event, customer can view valid license |
| LIC-03 | Signing service unavailable | Recoverable pending/failed state; no false fulfilled state |
| LIC-04 | Retry issuance with same idempotency key | No duplicate license |
| LIC-05 | Device limit reached under concurrent activations | At most configured active devices accepted |
| LIC-06 | Token offline elapsed 14 days | Offline validation denied after deadline |
| LIC-07 | Subscription paid term + 72h grace precedes offline 14d | Signed deadline clamped to grace end |
| LIC-08 | Forged offline entitlement signature | Desktop refuses access |
| SUB-01 | Renewal before expiry | Next period from old paid end |
| SUB-02 | Renewal after expiry | Starts upon approved/ready issuance; no retroactive charge of unused days |
| SUB-03 | During 72h grace | Authorized features available according to policy |
| SUB-04 | After grace without renewal | No paid feature access |
| CMS-01 | Content manager edits a page | New revision, page not necessarily published |
| CMS-02 | Concurrent stale edit | 409 REVISION_CONFLICT |
| CMS-03 | Unauthorized CMS publish | 403, no publication |
| AUD-01 | High-risk admin action | Actor, action, reason, request ID in redacted append-only audit |
| REL-01 | Installer download | Secure ticket, correct SHA-256 and signed binary |

## Testing layers

- **Contract:** parse and lint OpenAPI; validate each example and request body; use contract tests against staging.
- **Unit:** money/currency arithmetic, fixed 720/8,760-hour renewals across month-end, leap dates and DST, grace/offline boundary calculations, roles, input validation.
- **Integration:** actual PostgreSQL transactions, row locks, constraints, idempotency and outbox persistence.
- **End-to-end:** real browser checkout, manual finance approval with **test bank credits** in isolated staging, staff license issuance, Windows desktop activation, offline boundary simulation.
- **Security:** session/CSRF, privilege escalation, IDOR, secret leakage, upload malware, concurrency, replay, forged signed token, expired/revoked credentials.
- **Accessibility:** user-facing loading/errors usable by keyboard and screen readers, clear manual verification progress.

## Release gate

No unresolved P0 gap in `SCHEMA_ALIGNMENT_NOTES.md`, no failing P0 tests, successful restore drill and observed full checkout → verified funds → admin issuance → desktop activation. QA must not use live bank accounts or real money for automated tests.
