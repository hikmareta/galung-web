# Licensing Acceptance & Test Matrix v1.0

| ID | Scenario | Expected outcome | Priority |
|---|---|---|---|
| LIC-PAY-001 | Proof uploaded, funds unverified | No issuance request, no entitlement | P0 |
| LIC-PAY-002 | Finance approves, issuance service fails | Payment stays approved, issuance pending, retry safe | P0 |
| LIC-ISS-001 | Non-license admin attempts issue | 403 + audit | P0 |
| LIC-ISS-002 | Two license managers issue same request | One effective license; no duplicates | P0 |
| LIC-DEV-001 | 1 seat plan, 2 simultaneous activation requests | At most 1 successful active activation | P0 |
| LIC-DEV-002 | Valid client claims seat across device reboot | Correct activation recognized | P0 |
| LIC-DEV-003 | Copied signed token on other device | Rejected by PoP/device binding | P0 |
| LIC-DEV-004 | Deactivate device from My Galung | No further online refresh; seat released by policy | P0 |
| LIC-DEV-005 | Revoked device offline | Old token may survive only to signed deadline; documented | P0 |
| LIC-SEC-001 | JWS `alg=none`, wrong kid, malformed JWT | Reject | P0 |
| LIC-SEC-002 | Wrong audience, product, issuer, typ | Reject | P0 |
| LIC-SEC-003 | Token changed without resigning | Reject | P0 |
| LIC-SEC-004 | Refresh replay or reused credential | Reject, audit, block family per policy | P0 |
| LIC-SEC-005 | Brute-force claim attempts | Rate limited and alerted | P0 |
| LIC-OFF-001 | Offline for 335h with valid paid term | Permitted by valid JWS | P0 |
| LIC-OFF-002 | Offline for more than 336h | Paid-only features denied until online refresh | P0 |
| LIC-OFF-003 | Paid term ends before offline token 14-day target | Effective entitlement end takes precedence | P0 |
| LIC-OFF-004 | Clock rolled back | Flag and require safe recovery; no indefinite access | P0 |
| LIC-OFF-005 | Internet outage mid-performance, JWS valid | No network-dependent interruption | P0 |
| LIC-GRC-001 | Paid end and eligible grace starts | Grace access for 72h maximum | P0 |
| LIC-GRC-002 | Grace ends | Paid entitlement stops | P0 |
| LIC-REN-001 | Renew before paid end | Extend from old paid end | P0 |
| LIC-REN-002 | Renew after paid end, including grace | Start on approved entitlement-ready activation | P0 |
| LIC-REN-003 | Approval completed but entitlement delayed | Time not consumed while pending | P0 |
| LIC-KEY-001 | Key rotation with overlap | Old valid signatures remain verifiable till expiry | P0 |
| LIC-KEY-002 | Unknown or retired key token | Reject according to trusted-key policy | P0 |
| LIC-OPS-001 | PII/secret redaction in logs | No raw secrets or fingerprints exposed | P0 |
| LIC-OPS-002 | API failure after rotating credential before reply | Retry path recovers without double-issue | P0 |
| LIC-UX-001 | Activation error and offline expiration | Clear message & recovery CTA | P1 |

Test execution needs real Windows hardware/VM matrix, isolated KMS test signer, PostgreSQL transaction contention tests, and automated API contract tests; this document does not claim those tests ran.
