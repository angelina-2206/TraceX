import unittest
import os
import sys
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

class TestExtensionApiEndpoints(unittest.TestCase):

    def test_extension_analyze_phishing_email(self):
        """Test analyzing a suspicious payment/BEC email via extension endpoint."""
        payload = {
            "source": "gmail",
            "sender": "Robert Vance CEO <executive@vendor-example.com>",
            "recipients": ["finance@enterprise.com"],
            "subject": "URGENT: Outstanding Vendor Invoice Payment #9842",
            "timestamp": "Sun, 30 Aug 2026 14:10:00 +0000",
            "body_text": "Please execute an urgent wire transfer to the updated bank account immediately. IFSC: HDFC0001234. Beneficiary: Cyber Phantom LLC.",
            "urls": ["https://micr0soft-login-check.net/verify.php"]
        }

        response = client.post("/api/v1/extension/analyze", json=payload)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("case_id", data)
        self.assertGreaterEqual(data["risk_score"], 60.0)
        self.assertIn(data["severity"], ["HIGH", "CRITICAL"])
        self.assertGreater(len(data["findings"]), 0)
        self.assertGreater(len(data["reasons"]), 0)
        self.assertIn("deep_link_url", data)
        self.assertIn(data["case_id"], data["deep_link_url"])

        # Test caching on identical second submission
        cached_res = client.post("/api/v1/extension/analyze", json=payload)
        self.assertEqual(cached_res.status_code, 200)
        cached_data = cached_res.json()
        self.assertTrue(cached_data.get("cached", False))

    def test_extension_analyze_sso_lure_email(self):
        """Test analyzing an SSO credential harvesting email via extension endpoint."""
        payload = {
            "source": "outlook",
            "sender": "IT Security Helpdesk <security@sso-verify-portal.net>",
            "recipients": ["employee@enterprise.com"],
            "subject": "ACTION REQUIRED: Re-authenticate Microsoft 365 Password",
            "timestamp": "Sun, 30 Aug 2026 15:00:00 +0000",
            "body_text": "Your account session will expire in 2 hours. Click below to verify your login credentials immediately.",
            "urls": ["https://auth-verify-session.xyz/login"]
        }

        response = client.post("/api/v1/extension/analyze", json=payload)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("case_id", data)
        self.assertGreaterEqual(data["risk_score"], 50.0)
        self.assertTrue(any("auth" in f["type"] or "url" in f["type"] or "identity" in f["type"] for f in data["findings"]))

    def test_extension_trace_link_endpoint(self):
        """Test single link inspection endpoint."""
        payload = {
            "url": "https://micr0soft-login-check.net/secure"
        }

        response = client.post("/api/v1/extension/trace-link", json=payload)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["domain"], "micr0soft-login-check.net")
        self.assertTrue(data["has_homoglyph"] or data["is_suspicious"])
        self.assertIn(data["risk_level"], ["HIGH", "CRITICAL", "SAFE"])


if __name__ == "__main__":
    unittest.main()
