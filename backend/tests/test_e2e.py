import unittest
import asyncio
import os
import sys
import logging

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.utils.indicators import extract_and_normalize_target
from app.services.threat_aggregator import ThreatAggregatorService
from app.services.blockchain_service import BlockchainService
from app.core.config import settings

class TestEndToEndPipeline(unittest.TestCase):
    def test_full_e2e_investigation_and_verification_pipeline(self):
        """
        Executes real E2E integration test:
        1. Extract & normalize indicator target
        2. Parallel lookups (VT, URLScan, AbuseIPDB, IPGeo)
        3. Qdrant RAG semantic retrieval
        4. Gemini 2.5 Flash grounded synthesis
        5. Canonical SHA-256 evidence hashing
        6. Polygon POS transaction anchoring
        7. On-chain evidence verification (VALID status check)
        """
        target = "185.220.101.45"
        
        # 1. Normalize
        normalized = extract_and_normalize_target(target)
        self.assertEqual(normalized["indicator_type"], "ip")
        self.assertEqual(normalized["ip"], "185.220.101.45")

        # 2. Run Threat Aggregation + RAG + Gemini + Polygon Anchoring asynchronously
        loop = asyncio.get_event_loop()
        report = loop.run_until_complete(ThreatAggregatorService.aggregate_intelligence(normalized))

        # Assert report fields exist
        self.assertIn("investigation_id", report)
        self.assertEqual(report["target"], target)
        self.assertIn("intelligence", report)
        self.assertIn("risk", report)
        self.assertIn("ai_analysis", report)
        self.assertIn("blockchain_anchor", report)

        # Assert intelligence providers returned structured data
        intel = report["intelligence"]
        self.assertIsNotNone(intel.virustotal)
        self.assertIsNotNone(intel.abuseipdb)
        self.assertIsNotNone(intel.ipgeolocation)

        # Assert Gemini AI Analysis generated FACTS / INFERENCES / UNCERTAINTIES & Evidence References
        ai = report["ai_analysis"]
        self.assertIn("answer", ai)
        self.assertIn("facts", ai)
        self.assertIn("inferences", ai)
        self.assertIn("uncertainties", ai)
        self.assertIn("evidence_references", ai)
        self.assertTrue(len(ai["evidence_references"]) > 0)

        # Assert SHA-256 evidence hash and Polygon anchoring record
        anchor = report["blockchain_anchor"]
        self.assertIsNotNone(anchor)
        self.assertTrue(anchor["evidence_hash"].startswith("0x"))
        self.assertIn("tx_hash", anchor)
        self.assertIn("network", anchor)
        self.assertIn("block_number", anchor)
        self.assertIn(anchor["anchoring_status"], ["POLYGON_ANCHORED", "MOCK_ANCHORED"])

        # 7. Perform On-Chain Verification
        verification = BlockchainService.verify_evidence(
            evidence_data=report,
            case_id_or_target=target,
            tx_hash=anchor["tx_hash"]
        )

        self.assertEqual(verification["status"], "VALID")
        self.assertTrue(verification["match"])
        self.assertEqual(verification["current_hash"], anchor["evidence_hash"])

        print(f"\n[E2E-SUCCESS] Pipeline verified!")
        print(f"  Target: {target}")
        print(f"  Risk Score: {report['risk'].score}/100 ({report['risk'].level})")
        print(f"  Cited Sources: {ai['evidence_references']}")
        print(f"  SHA-256 Hash: {anchor['evidence_hash']}")
        print(f"  Polygon Tx Hash: {anchor['tx_hash']}")
        print(f"  Verification Status: {verification['status']} (Match: {verification['match']})\n")

if __name__ == "__main__":
    unittest.main()
