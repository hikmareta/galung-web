# ACCEPTANCE_CRITERIA_AND_RELEASE_GATES.md

## Global Definition of Done (required every phase)

- Traceability PRD/DEC/ADR -> code -> automated test with IDs.
- No introduced critical/high security exposures or unauthorized finance actions.
- Migrations reversible or forward-fix documented, with no silent historic data mutation.
- OpenAPI matches handler implementation; breaking changes explicitly versioned.
- `lint`, `typecheck`, `unit`, `integration`, and scoped E2E executed as applicable; evidence included.
- Sensitive data and credentials absent from logs, traces, screenshots and test fixtures.
- Ownership and RBAC tested at both controller/service query scopes.
- Bilingual/accessible required flows tested; visual screenshot review on phone/tablet/desktop.
- Operational runbook and rollback included for service changes.

## MVP must-pass scenarios

| AC ID | Condition | Expected verified outcome |
|---|---|---|
| GLG-PAY-001 | Proof uploaded without bank receipt | No payment approval, subscription, or license |
| GLG-PAY-002 | Two finance admins approve concurrently | Single recorded approval and financial allocation |
| GLG-PAY-003 | Same bank credit used for second order | Rejected/exception and audit logged |
| GLG-PAY-004 | International transfer sent but not settled | Awaiting funds; no access |
| GLG-PAY-005 | FX/fees reduce received amount | Explicit reconciliation exception, no implicit approval |
| GLG-LIC-001 | Finance approved, license not issued | Pending issuance; no claimed active desktop access |
| GLG-LIC-002 | Valid issued signed token on bound Windows device | Correct edition features within paid/offline deadline |
| GLG-LIC-003 | Token modified or wrong audience/device | Rejected |
| GLG-LIC-004 | Parallel activations exceed cap | At most approved device limit accepted |
| GLG-LIC-005 | Last validation >336h ago | Requires online refresh unless explicitly newly validated |
| GLG-LIC-006 | Subscription +72h grace reached before offline token deadline | Paid features do not extend beyond authorized end |
| GLG-LIC-007 | Offline desktop during revocation | Documented bounded revocation delay; reconnect denies access |
| GLG-SUB-001 | Renew before expiry | New period begins at old term end |
| GLG-SUB-002 | Renew after expiry | New term begins after verified approval AND usable entitlement ready |
| GLG-SUB-003 | Issuance retry/failure | No lost paid duration or duplicate entitlement |
| GLG-MVP-001 | Release 1 pages/checkout | Only Basic/Pro purchasable; no premium Song Library checkout |
| GLG-WEB-001 | Site without audio | Complete information/action without hearing |
| GLG-OPS-001 | Production restore drill | Restore achieves approved RTO/RPO test targets |

## Phase exit process

Developer submits evidence. QA verifies AC. Product approves user/business changes. Finance approves payment workflow and bank controls. Security reviews high-risk changes. Desktop Lead signs activation/offline behavior. Tech Lead marks next phase unblocked; unresolved P0 blocks release.
