"""
Unit test suite for TRACE-X Polygon Blockchain Evidence Anchoring Subsystem.
Tests:
- Deterministic canonical SHA-256 hashing
- Identical evidence yields identical hash
- Modified evidence yields different hash
- Real EVM EIP-155 transaction signing & Alchemy Polygon JSON-RPC broadcasting (eth_sendRawTransaction)
- On-chain RPC verification via eth_getTransactionByHash
- Blockchain credential missing / failure fallback to MOCK_ANCHORED
- Verification returning VALID for pristine evidence
- Verification returning TAMPERED for altered evidence
- Zero key exposure in outputs
"""
import sys
import os
import unittest
from unittest.mock import patch, MagicMock

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.blockchain_service import BlockchainService


class TestBlockchainAnchoring(unittest.TestCase):

    def setUp(self):
        self.evidence_a = {
            "case_id": "CASE-101",
            "title": "Phishing Incident Analysis",
            "threat_score": 88.0,
            "urls": ["http://phishing-site.org/login"],
            "sender_email": "attacker@fake-bank.com"
        }
        self.evidence_b = {
            "title": "Phishing Incident Analysis",
            "case_id": "CASE-101",
            "sender_email": "attacker@fake-bank.com",
            "urls": ["http://phishing-site.org/login"],
            "threat_score": 88.0
        }
        self.evidence_tampered = {
            "case_id": "CASE-101",
            "title": "Phishing Incident Analysis",
            "threat_score": 10.0,  # Altered evidence metric!
            "urls": ["http://phishing-site.org/login"],
            "sender_email": "attacker@fake-bank.com"
        }
        self.sample_key = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

    def test_deterministic_canonical_hashing(self):
        """Test 1 & 2 & 3: Canonical SHA-256 hashing determinism and tamper sensitivity."""
        hash_a = BlockchainService.compute_canonical_evidence_hash(self.evidence_a)
        hash_b = BlockchainService.compute_canonical_evidence_hash(self.evidence_b)
        hash_tampered = BlockchainService.compute_canonical_evidence_hash(self.evidence_tampered)

        # Hash format check
        self.assertTrue(hash_a.startswith("0x"))
        self.assertEqual(len(hash_a), 66)  # '0x' + 64 hex chars

        # Identical evidence (even with key ordering differences) -> identical hash
        self.assertEqual(hash_a, hash_b)

        # Modified evidence -> different hash
        self.assertNotEqual(hash_a, hash_tampered)

    @patch("requests.post")
    @patch("app.core.config.settings.ALCHEMY_RPC_URL", "https://polygon-mainnet.g.alchemy.com/v2/mock_key")
    def test_polygon_alchemy_raw_transaction_anchoring(self, mock_post):
        """Test 4: Real EIP-155 raw transaction signing and eth_sendRawTransaction broadcasting."""
        mock_evidence_hash = BlockchainService.compute_canonical_evidence_hash(self.evidence_a)
        real_tx_hash = "0x7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b"

        # Mock RPC calls for nonce, gasPrice, chainId, sendRawTransaction, blockNumber
        def side_effect(url, json, timeout):
            method = json.get("method")
            res = MagicMock()
            res.status_code = 200
            if method == "eth_getTransactionCount":
                res.json.return_value = {"jsonrpc": "2.0", "id": 1, "result": "0x5"}
            elif method == "eth_gasPrice":
                res.json.return_value = {"jsonrpc": "2.0", "id": 2, "result": "0x6fc23ac00"}  # 30 Gwei
            elif method == "eth_chainId":
                res.json.return_value = {"jsonrpc": "2.0", "id": 3, "result": "0x89"}  # Chain ID 137
            elif method == "eth_sendRawTransaction":
                # Verify raw transaction payload was sent
                raw_payload = json["params"][0]
                assert raw_payload.startswith("0x")
                res.json.return_value = {"jsonrpc": "2.0", "id": 4, "result": real_tx_hash}
            elif method == "eth_blockNumber":
                res.json.return_value = {"jsonrpc": "2.0", "id": 5, "result": "0x2e9f800"}
            return res

        mock_post.side_effect = side_effect

        with patch("app.core.config.settings.BLOCKCHAIN_PRIVATE_KEY", self.sample_key):
            record = BlockchainService.anchor_evidence("CASE-101", self.evidence_a)

        self.assertEqual(record["anchoring_status"], "POLYGON_ANCHORED")
        self.assertIn("Polygon POS", record["network"])
        self.assertEqual(record["tx_hash"], real_tx_hash)
        self.assertEqual(record["block_number"], 48887808)
        self.assertTrue(record["onchain_verified"])

        # Ensure private key is NOT exposed
        self.assertNotIn(self.sample_key, str(record))

    @patch("requests.post")
    @patch("app.core.config.settings.ALCHEMY_RPC_URL", "https://polygon-mainnet.g.alchemy.com/v2/mock_key")
    def test_onchain_rpc_verification(self, mock_post):
        """Test 5: Verification querying actual on-chain transaction data via eth_getTransactionByHash."""
        evidence_hash = BlockchainService.compute_canonical_evidence_hash(self.evidence_a)
        real_tx_hash = "0x7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b"

        # Mock eth_getTransactionByHash returning transaction input equal to evidence_hash
        mock_res = MagicMock()
        mock_res.status_code = 200
        mock_res.json.return_value = {
            "jsonrpc": "2.0",
            "id": 1,
            "result": {
                "hash": real_tx_hash,
                "input": evidence_hash,  # Raw hex input matches canonical evidence hash!
                "blockNumber": "0x2e9f800",
                "from": "0x1Be31A94361a391bBaFB2a4CCd704F57dc04d4bb"
            }
        }
        mock_post.return_value = mock_res

        # Pristine evidence verification -> VALID
        valid_res = BlockchainService.verify_evidence(self.evidence_a, "CASE-101", tx_hash=real_tx_hash)
        self.assertEqual(valid_res["status"], "VALID")
        self.assertTrue(valid_res["match"])
        self.assertTrue(valid_res["onchain_verified"])

        # Altered evidence verification against same on-chain tx -> TAMPERED
        tampered_res = BlockchainService.verify_evidence(self.evidence_tampered, "CASE-101", tx_hash=real_tx_hash)
        self.assertEqual(tampered_res["status"], "TAMPERED")
        self.assertFalse(tampered_res["match"])

    @patch("app.core.config.settings.ALCHEMY_RPC_URL", "")
    @patch("app.core.config.settings.BLOCKCHAIN_PRIVATE_KEY", "")
    def test_blockchain_missing_credentials_fallback(self):
        """Test 6: Missing credentials fallback to MOCK_ANCHORED."""
        record = BlockchainService.anchor_evidence("CASE-102", self.evidence_a)

        self.assertEqual(record["anchoring_status"], "MOCK_ANCHORED")
        self.assertIn("Simulated Mock", record["network"])
        self.assertFalse(record["onchain_verified"])


if __name__ == "__main__":
    unittest.main()
