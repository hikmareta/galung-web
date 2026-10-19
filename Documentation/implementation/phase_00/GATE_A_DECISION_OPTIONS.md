# Gate A decision options for the Product Owner

**Prepared:** 2026-10-18 (Asia/Jakarta). **Status:** Product Owner selected Option B in this chat on 2026-10-18; scoped identity contract review and the Phase 01 exit decision remain pending. This document does not declare Gate A frozen or Phase 02 started.

The original roadmap requires a frozen Phase 00 contract before Phase 02. The [candidate manifest](CONTRACT_VERSION_MANIFEST.md) remains `CANDIDATE / NOT FROZEN`, and [reconciliation backlog](RECONCILIATION_BACKLOG.md) has open P0 items. PR #1 merged the Phase 01 foundation at reviewed head `fd7a62c`; [PR #2](https://github.com/hikmareta/galung-web/pull/2) now proposes the duration reconciliation and evidence updates with fresh checks and review pending. The Product Owner's Option B selection changes the planned path, subject to the scoped prerequisites below; it does not approve unresolved commercial terms.

## Option A — Full Gate A freeze before Phase 02

Keep the roadmap gate unchanged. Supply and approve the Basic/Pro entitlement and feature matrix; real prices, beneficiary and supported remittance capabilities; currency/FX/fee/underpayment/refund and tax/invoice/legal-identity policies; retention and terms; identity/MFA/CSRF and desktop licensing/security policies. Close each P0 in `RECONCILIATION_BACKLOG.md` with exact SQL/OpenAPI/licensing revisions, target PostgreSQL 16+ and Windows compatibility evidence, and Product, Finance, Legal, Security, Desktop, QA and Tech Lead signoffs as applicable. Publish a canonical version manifest with hashes and effective date, then record a Phase 01 Product Owner gate decision.

**Effect:** Phase 02 can start under the existing roadmap. Commercial and production work still needs its own phase acceptance. **Cost:** Phase 02 waits for finance/legal/desktop decisions that its identity work does not directly implement.

## Option B — Limited identity-only gate amendment (recommended for progress)

The Product Owner selects an amendment of the Phase 02 prerequisite for a narrow identity and account-security scope. Freeze only the identity contract needed by Phase 02: user/session model, role and ownership semantics, secure cookie/CSRF policy, recovery and email verification, admin MFA, audit events, consent-version behavior, and the corresponding SQL/OpenAPI contract. Security and Tech Lead review ADR-01/D-01/CR-01/CR-13 and the scoped SQL/OpenAPI diff; QA records identity acceptance and negative-test coverage. The Product Owner then approves the Phase 01 handoff for this limited scope. Record the scoped contract version, reviews and final gate verdict in the roadmap, Phase 02 prompt, version manifest and acceptance report before starting Phase 02.

**Hard boundary:** No price, bank, checkout, payment, subscription, entitlement, license or desktop activation feature is implemented, enabled or migrated to production under this amendment. All other open Gate A P0 items remain blockers for the phases that use them, and the full commercial contract remains `CANDIDATE / NOT FROZEN`. Draft migrations retain the production guard. A later full Gate A decision is still required.

**Effect:** Phase 02 can start after the scoped identity contract and amended gate are approved. **Cost:** The project carries an explicit split contract baseline and must prevent identity work from silently implementing commercial assumptions.

## Option C — Hold Phase 02

Keep the current gate and leave the phase blocked while collecting values, role reviews and target-environment evidence. No Phase 02 implementation begins. Read-only planning and safe Phase 00 contract reconciliation may continue when separately authorized.

## Decision record to return

Record one selected option, date, Product Owner identity and exact authorized scope. For Option B, explicitly name the identity contract version/commit, the Security/Tech Lead/QA review links, the deferred Gate A items, prohibited features and the milestone for full freeze. State whether the Phase 01 gate is approved for that limited handoff. Merge of a PR is not itself a phase-gate approval.

Suggested Option B wording, to be issued only if the Product Owner chooses it:

> I approve a limited Gate A amendment for Phase 02 identity and account security only, after the identity SQL/OpenAPI/ADR package receives Security, Tech Lead and QA review. All commercial, payment, subscription, licensing and desktop activation work remains blocked until its full Gate A contract is frozen. I approve the Phase 01 foundation handoff only for this limited Phase 02 scope, subject to a reviewed PR containing the remaining local Phase 00/01 changes and green required checks.
