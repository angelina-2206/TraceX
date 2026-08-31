import sys
import os
import asyncio

# Ensure backend root is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.utils.indicators import extract_and_normalize_target
from app.services.risk_engine import RiskEngine
from app.schemas.threat import RiskEngineFactor

def test_indicator_normalization():
    print("Running Test: Indicator Normalization...")
    
    # 1. URL
    res = extract_and_normalize_target("https://sub.lookalike-login.net/auth?x=1")
    assert res["indicator_type"] == "url"
    assert res["domain"] == "sub.lookalike-login.net"
    assert res["url"] == "https://sub.lookalike-login.net/auth?x=1"
    
    # 2. IPv4
    res = extract_and_normalize_target("185.220.101.45")
    assert res["indicator_type"] == "ip"
    assert res["ip"] == "185.220.101.45"
    assert res["domain"] is None
    
    # 3. IPv6
    res = extract_and_normalize_target("2001:db8::1")
    assert res["indicator_type"] == "ip"
    assert res["ip"] == "2001:db8::1"
    
    # 4. Domain
    res = extract_and_normalize_target("verify-login.microsoft-sso.xyz")
    assert res["indicator_type"] == "domain"
    assert res["domain"] == "verify-login.microsoft-sso.xyz"
    assert res["url"] is None
    
    # 5. File Hash (MD5)
    res = extract_and_normalize_target("42e0e764d7720a6028d1a0ff881ab9d0")
    assert res["indicator_type"] == "hash"
    assert res["normalized_target"] == "42e0e764d7720a6028d1a0ff881ab9d0"
    
    print("[OK] Indicator Normalization tests passed!")

def test_risk_engine():
    print("Running Test: Risk Engine...")
    
    # 1. Clean Indicator test
    clean_intel = {
        "virustotal": {"available": True, "malicious": 0, "rep": 0},
        "abuseipdb": {"available": True, "found": False, "abuse_confidence": 0},
        "urlscan": {"available": True, "redirects": []}
    }
    status = {"virustotal": "success", "abuseipdb": "success", "urlscan": "success"}
    rating = RiskEngine.calculate_risk(clean_intel, status)
    assert rating.score == 0
    assert rating.level == "CLEAN"
    
    # 2. High Risk/Critical Indicator test
    threat_intel = {
        "virustotal": {"available": True, "malicious": 8, "reputation": -10},
        "abuseipdb": {"available": True, "found": True, "abuse_confidence": 87, "total_reports": 42},
        "urlscan": {"available": True, "redirects": ["http://a.com", "http://b.com", "http://c.com"]}
    }
    rating2 = RiskEngine.calculate_risk(threat_intel, status)
    
    # Check that reasons and factors are explained
    assert rating2.score > 50
    assert len(rating2.factors) >= 3
    sources = [f.source for f in rating2.factors]
    assert "VirusTotal" in sources
    assert "AbuseIPDB" in sources
    assert "URLScan" in sources
    print(f"[OK] Risk Engine tests passed! Score evaluated: {rating2.score} (Level: {rating2.level})")

async def test_async_aggregator():
    print("Running Test: Asynchronous Aggregator Service...")
    from app.services.threat_aggregator import ThreatAggregatorService
    
    target_details = extract_and_normalize_target("185.220.101.45")
    report = await ThreatAggregatorService.aggregate_intelligence(target_details)
    
    # Verify aggregator output matches required UnifiedThreatReport properties
    assert report["investigation_id"] is not None
    assert report["indicator_type"] == "ip"
    assert report["intelligence"].abuseipdb is not None
    assert report["intelligence"].ipgeolocation is not None
    assert report["provider_status"]["abuseipdb"] == "success"
    assert report["provider_status"]["ipgeolocation"] == "success"
    
    print("[OK] Async Aggregator tests passed!")

async def run_all():
    test_indicator_normalization()
    test_risk_engine()
    await test_async_aggregator()
    print("\nALL BACKEND AGGREGATOR UNIT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_all())
