# Product Owner Decision Log — Phase 00

Recorded from the Product Owner's direct reply in this chat on 2026-10-18 (Asia/Jakarta). This is a record of the answer, not a signature on every technical ADR or a waiver of Gate A.

| ID | Question / decision | Owner answer | Effect | Remaining approval |
|---|---|---|---|---|
| ODL-001 | Are official Basic/Pro features, prices, device/session caps, bank/currency/fee rules, tax, refund and legal identity available? | **All remain TBD.** | No production values may be invented or seeded. Checkout, policy publication, international settlement and related release gates remain blocked until each applicable value/policy is approved. | Product, Finance and Legal decision records with actual values and version/effective date. |
| ODL-002 | Is two-person MFA control mandatory for beneficiary account changes? | **Yes; two different people are required.** | Binding product-control principle for bank beneficiary publication. It supersedes draft wording that merely recommends dual control. | Finance/Security must approve actor roles, step-up evidence, emergency recovery, exact API/schema and test acceptance; ADR-03 remains technically proposed. |

| ODL-003 | Approve ADR-01–08 architecture and control direction; authorize alignment of canonical SQL, OpenAPI and licensing documents? | **Yes.** | Draft alignment is authorized within Phase 00. This is not approval of TBD values, production deployment or Phase 01. | Detailed cross-functional contract review, target-environment tests and Gate A signoff remain open. |
| ODL-004 | Product Owner states “Saya ingin menyetujui semuanya” after receiving Gate A prerequisites. | **Broad approval intent recorded.** | Product Owner approval of the review package and stated architectural direction. No exact TBD value or missing test result can be inferred from this statement. | Exact commercial/finance/legal values, independent domain review, target checks and contract freeze are still required for Gate A. |

| ODL-005 | Product Owner answered 17 commercial/operational questions and three follow-up clarifications. | **Recorded in `OWNER_POLICY_DECISIONS_2026-10-18.md`.** | Basic 1 device/1 session; Pro 5 devices/1 session; monthly 30 days; annual 365 days; checkout disabled until real approved price, bank and legal profile exist. Other answers are recorded with their limits. | Refund substance, tax/legal/retention review, contract clock changes and domain test/signoff remain open. |

| ODL-006 | Product Owner selected option A for the Phase 00 duration conflict. | **30 × 24 elapsed UTC hours monthly; 365 × 24 elapsed UTC hours annual.** | ADR-10, candidate migration 004, OpenAPI `termDays` and boundary checks implement the draft reconciliation. Early/late start rules remain as DEC-004. | Technical/domain review, production migration and Gate A freeze still pending. |

No Product/Finance/Security/Desktop departmental signoffs were supplied. The approved DEC-001–006 remain unchanged.
