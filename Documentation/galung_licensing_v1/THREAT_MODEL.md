# Galung Licensing Threat Model v1.0 (STRIDE-lite)

| Threat | Attacker / entry point | Impact | Primary mitigation | Residual risk |
|---|---|---|---|---|
| Forged offline entitlement | Client edits JWS | Pro bypass | EdDSA strict signature and claims | Patched client binary |
| Copied license to second PC | User shares token | Seat bypass | Bind to device private key, server seat checks | Private key extraction on compromised host |
| Token replay | Intercepted refresh | Unauthorized renewal | Device PoP, nonce/challenge, rotated credentials | Local malware with privileged access |
| Clock rollback | Offline user alters Windows clock | Extend 14-day window | Local anti-rollback anchors, signed server time, online recovery | Fully compromised host cannot be trusted |
| Concurrency race | Parallel activations | Oversubscription | Serializable/row locks, constraints | Misconfigured counter code |
| Forged proof of payment | Customer uploads edited image | Free access | Finance reconciles actual bank deposit | Human operational error |
| Insider issues licenses | Compromised License Manager | Fraud | role separation, MFA, issuance only from approved transaction, audit, alerts | Privileged insider collusion |
| Signing-key compromise | Server breach | Universal forged licenses | KMS/HSM, least privilege, audit, staged rotation | Offline clients cannot immediately revoke |
| Lost device | Customer cannot release seat | Support friction | Authenticated device deactivation/replacement path | Stolen device offline token until expiration |
| Malware rewrites app | End-user endpoint | Bypass restrictions | Code signing, integrity tests, offline bounded grants | DRM is not unbreakable |
| Denial-of-service | External attacker | Prevent online refresh | rate limits, queues, offline window, monitoring | New activations delayed |
| Token/key leak via logs | Debug/admin tools | Credential theft | Redaction, deny logging secrets, access controls | Debug misconfiguration |

## Abuse tests

Use test environment and synthetic users only. Simulate expired claims, guessed claims, nonce replay, token copy, repeated device registration, payment forged image, clock rollback, signer rotation, partial failure after credential rotation, and temporary internet outage during a continuous performance.

## Review gates

P0 security review of cryptographic choices and supported Windows APIs; approved threat model; automated signature and replay tests; chaos test signer API; manual business-process dry run with Finance/License Manager; no outstanding critical/high vulnerabilities at launch.
