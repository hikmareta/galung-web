"""Phase 00 draft contract checks; no production application is exercised."""

from __future__ import annotations

import json
import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[2]
API = json.loads((ROOT / "galung_api_v1/openapi.json").read_text())
SQL = (ROOT / "database/003_phase00_contract_delta.sql").read_text()


class ContractDraftTests(unittest.TestCase):
    def test_openapi_refs_and_operation_ids(self) -> None:
        ids: list[str] = []

        def walk(value: object) -> None:
            if isinstance(value, dict):
                ref = value.get("$ref")
                if isinstance(ref, str):
                    self.assertTrue(ref.startswith("#/"), ref)
                    target: object = API
                    for part in ref[2:].split("/"):
                        self.assertIsInstance(target, dict)
                        target = target[part.replace("~1", "/").replace("~0", "~")]
                for nested in value.values():
                    walk(nested)
            elif isinstance(value, list):
                for nested in value:
                    walk(nested)

        walk(API)
        for path in API["paths"].values():
            for method, operation in path.items():
                if method in {"get", "post", "put", "patch", "delete"}:
                    ids.append(operation["operationId"])
        self.assertEqual(len(ids), len(set(ids)))

    def test_critical_payment_gates(self) -> None:
        approve = API["paths"]["/admin/payment-submissions/{id}/approve"]["post"]
        body = approve["requestBody"]["content"]["application/json"]["schema"]
        self.assertEqual(body["$ref"], "#/components/schemas/PaymentApprovalInput")
        self.assertIn("bankCreditId", API["components"]["schemas"]["PaymentApprovalInput"]["required"])
        self.assertIn("finance.approve", approve["x-required-permission"])
        self.assertIn("Idempotency", str(approve["parameters"]))
        self.assertIn("CSRF", str(approve["parameters"]))
        bank = API["paths"]["/admin/bank-account-change-requests/{id}/approve-and-publish"]["post"]
        self.assertEqual(bank["x-required-permission"], "bank.change.approve")
        self.assertIn("bank_change_mfa_pair", SQL)
        self.assertIn("reviewed_by <> requested_by", SQL)
        self.assertNotIn("payment-gateway", " ".join(API["paths"]))

    def test_desktop_contract(self) -> None:
        for path in [
            "/me/licenses/{id}/activation-claims",
            "/desktop/challenges",
            "/desktop/activations",
            "/desktop/validations",
        ]:
            self.assertIn(path, API["paths"])
        schemas = API["components"]["schemas"]
        self.assertTrue({"challengeId", "devicePublicKeyJwk", "deviceProof"}.issubset(schemas["ActivationRequest"]["required"]))
        self.assertTrue({"refreshCredential", "licenseRevision", "signedToken"}.issubset(schemas["SignedEntitlement"]["required"]))
        self.assertTrue({"jti", "activation_id", "device_key_thumbprint", "offline_deadline_at"}.issubset(schemas["OfflineEntitlementClaims"]["required"]))
        for table in ["activation_claims", "license_challenges", "license_device_keys", "license_refresh_credentials", "license_signing_keys", "license_token_issuances", "license_revisions"]:
            self.assertIn(f"CREATE TABLE {table}", SQL)


if __name__ == "__main__":
    unittest.main()
