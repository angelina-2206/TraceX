import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.schemas.forensics import (
    IdentityAnalysis, AuthStatus, UrlAnalysisItem, AttachmentItem,
    GeoFinancialEntity, HeaderHop, AttackDNA
)
from app.services.email_classifier import EmailClassifierService
from app.services.attack_dna import AttackDnaService

def test_financial_fraud_classification():
    identity = IdentityAnalysis(
        display_name="CEO Robert",
        sender_email="ceo@executive-portal.com",
        reply_to="wire-support@micr0soft-login-check.net",
        reply_to_mismatch=True,
        deception_score=88.0,
        deception_factors=["Display name claims executive identity with mismatching reply-to"]
    )
    auth = AuthStatus(
        spf_status="FAIL",
        spf_domain="executive-portal.com",
        dkim_status="FAIL",
        dmarc_status="FAIL",
        dmarc_policy="none",
        alignment="MISALIGNED"
    )
    geo_fin = GeoFinancialEntity(
        entity_id="GEO-1",
        bank_name="State Bank of India",
        ifsc_code="SBIN0000847",
        amount_requested="₹ 4,85,000 INR",
        lat=17.3850,
        lng=78.4867,
        ip_geolocation="Sofia, Bulgaria",
        ip_lat=42.6977,
        ip_lng=23.3219,
        location_mismatch=True,
        uncertainty_disclaimer="Test disclaimer"
    )
    urls = [
        UrlAnalysisItem(
            url_id="U1",
            original_url="http://micr0soft-login-check.net/pay",
            final_url="http://micr0soft-login-check.net/pay",
            domain="micr0soft-login-check.net",
            redirect_count=1,
            redirect_chain=[],
            has_homoglyph_domain=True,
            has_credential_form=True,
            reputation_score=90.0,
            evidence_id="EV-1"
        )
    ]
    hops = [
        HeaderHop(
            hop_index=1,
            from_host="relay.bg",
            by_host="mx.corp.com",
            ip="185.220.101.45",
            asn="AS204915",
            isp="Offshore",
            geo_location="Sofia, Bulgaria",
            timestamp="Sun, 30 Aug 2026",
            delay_seconds=0,
            raw_header="Received: ...",
            is_suspicious=True
        )
    ]

    res = EmailClassifierService.classify(
        subject="URGENT: Outstanding Vendor Invoice Payment",
        body_text="Please wire ₹ 4,85,000 to our updated State Bank of India account IFSC SBIN0000847 immediately.",
        identity=identity,
        auth_status=auth,
        urls=urls,
        attachments=[],
        hops=hops,
        geo_financial=geo_fin
    )

    assert res.category == "Financial Fraud"
    assert res.confidence >= 90.0
    assert "Financial Fraud" in res.summary_label
    assert len(res.explainable_reasons) >= 3

def test_campaign_correlation_engine():
    dna = AttackDNA(
        dna_hash="DNA-TEST-001",
        identity_fingerprint="EXEC_SPOOF_REPLY_MISMATCH",
        url_structure_hash="REDIRECT_2HOP_HOMOGLYPH",
        language_vector_id="INVOICE_PAYMENT_BEC_V1",
        auth_behavior_code="SPF_FAIL_MISALIGNED",
        infrastructure_asn_set=["AS204915"],
        similarity_vectors={"CASE-204": 0.85}
    )
    urls = [
        UrlAnalysisItem(
            url_id="U1",
            original_url="http://micr0soft-login-check.net/pay",
            final_url="http://micr0soft-login-check.net/pay",
            domain="micr0soft-login-check.net",
            redirect_count=1,
            redirect_chain=[],
            reputation_score=90.0,
            evidence_id="EV-1"
        )
    ]
    hops = [
        HeaderHop(
            hop_index=1,
            from_host="relay.bg",
            by_host="mx.corp.com",
            ip="185.220.101.45",
            asn="AS204915",
            isp="Offshore",
            geo_location="Sofia, Bulgaria",
            timestamp="Sun, 30 Aug 2026",
            delay_seconds=0,
            raw_header="Received: ...",
            is_suspicious=True
        )
    ]

    matches = AttackDnaService.correlate_campaigns(
        current_dna=dna,
        historical_cases=[],
        subject="URGENT: Outstanding Vendor Invoice Payment",
        sender_email="executive-office@vendor-example.com",
        urls=urls,
        hops=hops,
        reply_to="wire-transfer@micr0soft-login-check.net"
    )

    assert len(matches) > 0
    top = matches[0]
    assert top.campaign_id == "CAMP-PHANTOM-001"
    assert top.related_emails_count == 27
    assert top.related_domains_count == 8
    assert top.related_ips_count == 4
    assert top.related_urls_count == 13
    assert "Campaign #001 — 27 related emails, 8 domains, 4 IPs, 13 URLs" in top.campaign_summary
