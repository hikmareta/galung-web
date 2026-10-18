# GALUNG.ID — DATABASE VALIDATION & QA CHECKLIST

**GLG-DBQ-001 · Version 1.0**

## Pre-migration
- [ ] Target PostgreSQL version and enabled extensions approved.
- [ ] Migration SQL executed successfully from empty DB and tested against retained staging data.
- [ ] Application runtime DB role cannot alter schema or read decrypted secrets beyond permissions.
- [ ] Role/permission seeds are approved; admin MFA implementation selected.
- [ ] Basic/Pro only are purchasable; Song Library/institutions not exposed in MVP.
- [ ] Real price, policy, bank data approved separately and **not included** in repository.

## Financial invariants
- [ ] Order subtotal – discount + tax = total in smallest supported currency unit.
- [ ] Cannot have overlapping published effective prices for same plan/currency/term.
- [ ] Invoice bank and price snapshots stay unchanged after publishing.
- [ ] Submitted proof does not approve payment or create entitlement.
- [ ] Malicious/unscanned proof cannot be previewed/downloaded by staff.
- [ ] Only verified funds credit can be approved.
- [ ] Bank credit reference cannot satisfy two independent approved payments.
- [ ] International amount/currency discrepancy enters manual review.
- [ ] Approval race between two admins gives exactly one effective event.
- [ ] Historic finance records protected against ordinary UPDATE/DELETE.

## Subscription & entitlement
- [ ] Early renewal starts from current paid end when ready before expiry.
- [ ] Late renewal starts at max(payment approval, entitlement ready).
- [ ] End of paid period calculated as exactly 720 or 8,760 elapsed UTC hours, including Jan 31, Feb 28/29, leap years and DST changes.
- [ ] Grace end equals paid end + exactly 72h.
- [ ] Cancel renewal does not terminate current paid subscription early.
- [ ] Duplicate license issuance and duplicate renewal service-period creation are impossible.
- [ ] License manager needs proper permission and finance approval must preexist.
- [ ] Snapshot device limit differs between Basic and Pro when configured.
- [ ] Concurrent activation cannot exceed device limit, including parallel requests.
- [ ] Token offline max = min(last validation+336h, authorized access end).
- [ ] Offline revoked token limitation is documented and maximum life enforced.

## Security, privacy and operations
- [ ] Bank details encrypted and output redacted.
- [ ] PII queries authorized and customer-scoped.
- [ ] Audit captures actor, action, entity, reason, time; no raw secrets.
- [ ] Signing private key absent from web/desktop/database rows.
- [ ] Queue retries and lost email never issue duplicate license.
- [ ] Idempotency keys scoped by actor/endpoint/action and validated against body hash.
- [ ] Backup restoration verified and checked for referential integrity.
- [ ] Data retention schedule approved by legal/finance.

## Suggested E2E fixture matrix

| ID | Fixture | Expected outcome |
|---|---|---|
| DB-001 | Indonesian Basic monthly checkout | Matching invoice/price/policy snapshots |
| DB-002 | International Pro yearly invoice in company-supported currency | Country, currency, beneficiary snapshot correct |
| DB-003 | Proof submitted; no credited bank transaction | No payment approval or license |
| DB-004 | Two reviewers approve one credited bank reference simultaneously | One effective approval, other safe conflict |
| DB-005 | Remittance sent 500, received 480 due bank fees | Mismatch workflow, no silent approval |
| DB-006 | License admin click issued twice | One issued license and service period |
| DB-007 | Early renewal within paid term | Preserves remaining paid time |
| DB-008 | Late renewal after paid expiry | Start at valid readiness timestamp |
| DB-009 | 72h grace edge exactly | Exclusive end enforced |
| DB-010 | 14-day offline limit with earlier paid+grace end | Token expires at earlier instant |
| DB-011 | Two parallel device activations at capacity | No limit overflow |
| DB-012 | Wrong-user attempts to access another customer's invoice | Forbidden |
| DB-013 | Email worker retries after partial failure | No duplicate license/period |
| DB-014 | New bank beneficiary pending reviewer approval | Not available at checkout |
