from typing import Dict, List
from app.schemas.forensics import (
    CaseDetail, HeaderHop, AuthStatus, IdentityAnalysis, SocialEngSignal,
    UrlAnalysisItem, UrlRedirectHop, AttachmentItem, GeoFinancialEntity,
    DecomposedThreatScore, ThreatScoreComponent, AttackDNA, CampaignMatch,
    AttackGraphData, GraphNode, GraphEdge, ChainOfCustodyEvent
)
from app.services.chain_of_custody import ChainOfCustodyService

def get_seed_cases() -> Dict[str, CaseDetail]:
    # -------------------------------------------------------------
    # CASE-204: Executive Impersonation & Invoice Payment BEC
    # -------------------------------------------------------------
    coc_204_1 = ChainOfCustodyService.create_event(
        actor="System Ingestion Engine",
        role="SYSTEM",
        action="EVIDENCE_UPLOAD",
        artifact_id="EV-EML-204",
        details="Ingested raw .eml file invoice_payment_urgent.eml (SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855)",
        prev_events=[]
    )
    coc_204_2 = ChainOfCustodyService.create_event(
        actor="Forensic Parser",
        role="PARSER",
        action="HEADER_RECONSTRUCTION",
        artifact_id="EV-HEADER-204",
        details="Reconstructed 2 flight recorder hops. Origin relay IP 185.220.101.45 flagged as offshore AS204915.",
        prev_events=[coc_204_1]
    )
    coc_204_3 = ChainOfCustodyService.create_event(
        actor="SOC Analyst (Alex Rivera)",
        role="SOC_ANALYST",
        action="CASE_MARK_SUSPICIOUS",
        artifact_id="EV-DECISION-204",
        details="Verified Reply-To mismatch (vendor-billing.net != vendor-example.com) and confirmed BEC risk.",
        prev_events=[coc_204_1, coc_204_2]
    )

    case_204 = CaseDetail(
        case_id="CASE-204",
        title="Executive Impersonation & Invoice Payment Fraud",
        status="INVESTIGATING",
        severity="HIGH",
        created_at="2026-08-30T14:10:00Z",
        updated_at="2026-08-30T14:45:00Z",
        assignee="Alex Rivera (SOC Lead)",
        summary="Suspicious payment request email claiming to originate from Executive Management requesting urgent wire transfer to an updated bank account in India.",
        raw_email_id="EV-EML-204",
        email_subject="URGENT: Outstanding Vendor Invoice Payment #INV-84920",
        email_from="\"Robert Vance - CEO\" <executive-office@vendor-example.com>",
        email_to="finance-payable@corporate-enterprise.com",
        email_date="Sun, 30 Aug 2026 14:10:00 +0000",
        header_hops=[
            HeaderHop(
                hop_index=1,
                from_host="mail.vendor-finance-portal.net",
                by_host="relay-01.suspicious-hosting-infra.org",
                ip="185.220.101.45",
                asn="AS204915 (CyberCloud Host LLC)",
                isp="Offshore High-Risk Hosting",
                geo_location="Sofia, Bulgaria",
                timestamp="Sun, 30 Aug 2026 14:10:12 +0000",
                delay_seconds=0,
                raw_header="Received: from mail.vendor-finance-portal.net (185.220.101.45) by relay-01.suspicious-hosting-infra.org",
                is_suspicious=True,
                flag_reason="Origin relay server operates outside claimed brand infrastructure"
            ),
            HeaderHop(
                hop_index=2,
                from_host="relay-01.suspicious-hosting-infra.org",
                by_host="mx.company-security-gateway.com",
                ip="198.51.100.22",
                asn="AS15169 (Google LLC Security Gateway)",
                isp="Corporate Ingress Gateway",
                geo_location="Frankfurt, Germany",
                timestamp="Sun, 30 Aug 2026 14:10:15 +0000",
                delay_seconds=3,
                raw_header="Received: from relay-01.suspicious-hosting-infra.org by mx.company-security-gateway.com with ESMTP id 84931a",
                is_suspicious=False,
                flag_reason=None
            )
        ],
        auth_status=AuthStatus(
            spf_status="FAIL",
            spf_domain="vendor-finance-portal.net",
            dkim_status="FAIL",
            dkim_selector="s1024",
            dmarc_status="FAIL",
            dmarc_policy="quarantine",
            alignment="MISALIGNED"
        ),
        identity_analysis=IdentityAnalysis(
            display_name="Robert Vance - CEO",
            sender_email="executive-office@vendor-example.com",
            reply_to="wire-transfer@micr0soft-login-check.net",
            return_path="bounces@suspicious-hosting-infra.org",
            claimed_brand="Chief Executive Officer",
            lookalike_detected=True,
            homoglyph_detected=True,
            typosquat_domain="micr0soft-login-check.net",
            reply_to_mismatch=True,
            return_path_mismatch=True,
            deception_score=87.5,
            deception_factors=[
                "Display name claims identity as CEO but Reply-To is 'micr0soft-login-check.net'",
                "Homoglyph / character substitution detected in Reply-To domain ('0' for 'o')",
                "Reply-To domain differs from visible sender domain ('vendor-example.com')",
                "Sender infrastructure failed SPF/DKIM/DMARC domain alignment checks"
            ]
        ),
        social_eng_signals=[
            SocialEngSignal(
                category="Payment Redirection / IFSC Change",
                severity="HIGH",
                score=95.0,
                evidence_quote="Please remit the outstanding invoice balance of ₹ 4,85,000 INR to our updated beneficiary bank account details provided below.",
                line_number=4
            ),
            SocialEngSignal(
                category="Urgent Payment Request",
                severity="HIGH",
                score=88.0,
                evidence_quote="This payment is past due. Kindly process before end of day to avoid service interruption.",
                line_number=2
            ),
            SocialEngSignal(
                category="Executive Authority Pressure",
                severity="HIGH",
                score=82.0,
                evidence_quote="As discussed privately, do not delay this transaction for standard quarterly audit review.",
                line_number=7
            )
        ],
        urls=[
            UrlAnalysisItem(
                url_id="URL-001",
                original_url="https://secure-payment.vendor-example.com/invoice-auth",
                final_url="https://micr0soft-login-check.net/login/verify.php",
                domain="secure-payment.vendor-example.com",
                redirect_count=2,
                redirect_chain=[
                    UrlRedirectHop(
                        step=1,
                        url="https://secure-payment.vendor-example.com/invoice-auth",
                        domain="secure-payment.vendor-example.com",
                        ip="104.21.45.12",
                        asn="AS13335 (Cloudflare CDN)",
                        status_code=302,
                        is_shortener=False,
                        is_suspicious=False,
                        risk_factors=[]
                    ),
                    UrlRedirectHop(
                        step=2,
                        url="https://micr0soft-login-check.net/login/verify.php",
                        domain="micr0soft-login-check.net",
                        ip="185.220.101.45",
                        asn="AS204915 (CyberCloud Host LLC)",
                        status_code=200,
                        is_shortener=False,
                        is_suspicious=True,
                        risk_factors=["Final destination domain is unverified lookalike domain", "Hosted on bulletproof offshore infrastructure"]
                    )
                ],
                has_credential_form=True,
                has_homoglyph_domain=True,
                reputation_score=92.0,
                evidence_id="EV-URL-204-1"
            )
        ],
        attachments=[
            AttachmentItem(
                attachment_id="ATT-001",
                filename="Invoice_INV-84920_Details.pdf",
                mime_type="application/pdf",
                size_bytes=142850,
                sha256="7a89b01c34ef9281a1048b6c0192e1047812bc8917823461048bc91238491024",
                is_executable=False,
                is_macro_enabled=False,
                risk_level="MEDIUM"
            )
        ],
        geo_financial=GeoFinancialEntity(
            entity_id="GEO-FIN-204",
            beneficiary_name="Global Tech Solutions Pvt Ltd",
            bank_name="State Bank of India",
            ifsc_code="SBIN0000847",
            branch_name="Hyderabad Main Branch",
            branch_city="Hyderabad",
            branch_state="Telangana",
            lat=17.3850,
            lng=78.4867,
            account_number_masked="XXXX-XXXX-9842",
            amount_requested="₹ 4,85,000 INR",
            ip_geolocation="Sofia, Bulgaria",
            ip_lat=42.6977,
            ip_lng=23.3219,
            location_mismatch=True,
            uncertainty_disclaimer="Cross-region infrastructure and financial destination clues observed. Bank IFSC location indicates payout routing destination, NOT physical perpetrator location."
        ),
        threat_score=DecomposedThreatScore(
            overall_score=84.5,
            severity="HIGH",
            identity_score=ThreatScoreComponent(
                category="Identity Alignment",
                score=21.8,
                max_score=25.0,
                weight=0.25,
                confidence=0.95,
                reasons=[
                    "Display name claims CEO identity but Reply-To domain is 'micr0soft-login-check.net'",
                    "Reply-To domain differs from visible sender domain ('vendor-example.com')"
                ],
                evidence_ids=["EV-ID-204"]
            ),
            auth_score=ThreatScoreComponent(
                category="Infrastructure Authentication",
                score=18.0,
                max_score=20.0,
                weight=0.20,
                confidence=0.98,
                reasons=["SPF failed", "DKIM signature invalid", "DMARC policy failed"],
                evidence_ids=["EV-AUTH-204"]
            ),
            content_score=ThreatScoreComponent(
                category="Content & Social Engineering",
                score=14.2,
                max_score=15.0,
                weight=0.15,
                confidence=0.90,
                reasons=["Urgent payment demand combined with updated bank account details"],
                evidence_ids=["EV-SOC-204"]
            ),
            url_score=ThreatScoreComponent(
                category="URL & Redirect Chain",
                score=13.8,
                max_score=15.0,
                weight=0.15,
                confidence=0.92,
                reasons=["Multi-hop redirect to lookalike domain hosting credential form"],
                evidence_ids=["EV-URL-204-1"]
            ),
            infrastructure_score=ThreatScoreComponent(
                category="Network Infrastructure",
                score=12.0,
                max_score=15.0,
                weight=0.15,
                confidence=0.88,
                reasons=["Relay server AS204915 operates on high-risk offshore hosting infrastructure"],
                evidence_ids=["EV-HOP-1"]
            ),
            campaign_score=ThreatScoreComponent(
                category="Campaign Intelligence",
                score=4.7,
                max_score=10.0,
                weight=0.10,
                confidence=0.80,
                reasons=["Matches historical campaign 'PhishPhantom' (78% confidence) via shared ASN 204915"],
                evidence_ids=["EV-CAMP-204"]
            )
        ),
        attack_dna=AttackDNA(
            dna_hash="DNA-204-9842A109B4",
            identity_fingerprint="EXEC_SPOOF_REPLY_MISMATCH",
            url_structure_hash="REDIRECT_2HOP_HOMOGLYPH",
            language_vector_id="URGENT_INVOICE_PAYMENT_V3",
            auth_behavior_code="SPF_FAIL_DKIM_FAIL",
            infrastructure_asn_set=["AS204915", "AS13335"],
            similarity_vectors={"CASE-206": 0.82, "CASE-177": 0.65}
        ),
        campaign_matches=[
            CampaignMatch(
                campaign_id="CAMP-PHANTOM-01",
                campaign_name="PhishPhantom Invoice Campaign",
                confidence=78.5,
                matched_signals=[
                    "Shared ASN 204915 (CyberCloud Host LLC)",
                    "Matching 2-step redirect structure to lookalike domains",
                    "Identical invoice wording pattern targeting Indian financial accounts"
                ],
                shared_asns=["AS204915"],
                shared_domains=["micr0soft-login-check.net", "auth-verify-session.xyz"],
                historical_case_ids=["CASE-206"],
                status="SUSPECTED"
            )
        ],
        attack_graph=AttackGraphData(
            nodes=[
                GraphNode(id="n_email", label="Email: CASE-204", type="EMAIL", details={"case_id": "CASE-204"}, severity="HIGH"),
                GraphNode(id="n_sender", label="Sender: executive-office@vendor-example.com", type="IDENTITY", details={"display_name": "Robert Vance - CEO"}, severity="HIGH"),
                GraphNode(id="n_reply", label="Reply-To: micr0soft-login-check.net", type="DOMAIN", details={"mismatch": True}, severity="CRITICAL"),
                GraphNode(id="n_ip1", label="Relay IP: 185.220.101.45", type="IP", details={"asn": "AS204915"}, severity="HIGH"),
                GraphNode(id="n_url", label="URL: secure-payment.vendor-example.com", type="URL", details={}, severity="WARNING"),
                GraphNode(id="n_dest", label="Domain: micr0soft-login-check.net", type="DOMAIN", details={"homoglyph": True}, severity="CRITICAL"),
                GraphNode(id="n_bank", label="Bank: State Bank of India (SBIN0000847)", type="BANK_ENTITY", details={"city": "Hyderabad"}, severity="WARNING"),
                GraphNode(id="n_camp", label="Campaign: PhishPhantom Invoice", type="CAMPAIGN", details={"confidence": 78.5}, severity="HIGH")
            ],
            edges=[
                GraphEdge(id="e1", source="n_email", target="n_sender", relationship="SENT_BY", confidence=1.0, evidence_id="EV-HEADER-204"),
                GraphEdge(id="e2", source="n_email", target="n_reply", relationship="REPLY_TO", confidence=1.0, evidence_id="EV-ID-204"),
                GraphEdge(id="e3", source="n_email", target="n_ip1", relationship="ROUTED_THROUGH", confidence=1.0, evidence_id="EV-HOP-1"),
                GraphEdge(id="e4", source="n_email", target="n_url", relationship="CONTAINS", confidence=1.0, evidence_id="EV-URL-204-1"),
                GraphEdge(id="e5", source="n_url", target="n_dest", relationship="REDIRECTS_TO", confidence=0.98, evidence_id="EV-URL-204-1"),
                GraphEdge(id="e6", source="n_email", target="n_bank", relationship="REQUESTS_PAYMENT_TO", confidence=1.0, evidence_id="EV-GEO-FIN-204"),
                GraphEdge(id="e7", source="n_email", target="n_camp", relationship="PART_OF_CAMPAIGN", confidence=0.78, evidence_id="EV-CAMP-204")
            ]
        ),
        chain_of_custody=[coc_204_1, coc_204_2, coc_204_3],
        mitre_techniques=[
            {
                "technique_id": "T1566.002",
                "name": "Spearphishing Attachment / Link",
                "tactic": "Initial Access",
                "confidence": 0.95,
                "evidence_quote": "Redirects to micr0soft-login-check.net lookalike portal"
            },
            {
                "technique_id": "T1534",
                "name": "Internal Spearphishing / Impersonation",
                "tactic": "Lateral Movement",
                "confidence": 0.92,
                "evidence_quote": "Display name claims identity as CEO Robert Vance"
            },
            {
                "technique_id": "T1586.002",
                "name": "Compromised Infrastructure / Relay",
                "tactic": "Resource Development",
                "confidence": 0.88,
                "evidence_quote": "Relayed through offshore AS204915"
            }
        ]
    )

    # -------------------------------------------------------------
    # CASE-205: Credential Harvesting Phishing (Critical Risk)
    # -------------------------------------------------------------
    coc_205_1 = ChainOfCustodyService.create_event(
        actor="Automated Scanner",
        role="SYSTEM",
        action="EVIDENCE_UPLOAD",
        artifact_id="EV-EML-205",
        details="Ingested raw .eml file sso_security_alert.eml",
        prev_events=[]
    )

    case_205 = CaseDetail(
        case_id="CASE-205",
        title="Microsoft 365 SSO Credential Harvesting Campaign",
        status="INVESTIGATING",
        severity="CRITICAL",
        created_at="2026-08-30T15:20:00Z",
        updated_at="2026-08-30T15:35:00Z",
        assignee="Sarah Jenkins (Incident Response)",
        summary="High-volume credential phishing campaign targeting corporate SSO credentials using spoofed Microsoft security notifications and dark web redirect chain.",
        raw_email_id="EV-EML-205",
        email_subject="CRITICAL ALERT: Your SSO Account Will Be Suspended in 2 Hours",
        email_from="\"Microsoft Security Team\" <no-reply@security-alert-center-update.com>",
        email_to="all-employees@corporate-enterprise.com",
        email_date="Sun, 30 Aug 2026 15:20:00 +0000",
        header_hops=[
            HeaderHop(
                hop_index=1,
                from_host="m365-alert-relay.xyz",
                by_host="mail.security-alert-center-update.com",
                ip="194.26.29.112",
                asn="AS44477 (Stark Industries Hosting)",
                isp="High Risk Bulletproof Hosting",
                geo_location="Amsterdam, Netherlands",
                timestamp="Sun, 30 Aug 2026 15:20:02 +0000",
                delay_seconds=0,
                raw_header="Received: from m365-alert-relay.xyz (194.26.29.112) by mail.security-alert-center-update.com",
                is_suspicious=True,
                flag_reason="Known bulletproof host AS44477"
            )
        ],
        auth_status=AuthStatus(
            spf_status="FAIL",
            spf_domain="security-alert-center-update.com",
            dkim_status="NONE",
            dkim_selector=None,
            dmarc_status="FAIL",
            dmarc_policy="none",
            alignment="MISALIGNED"
        ),
        identity_analysis=IdentityAnalysis(
            display_name="Microsoft Security Team",
            sender_email="no-reply@security-alert-center-update.com",
            reply_to=None,
            return_path=None,
            claimed_brand="Microsoft",
            lookalike_detected=True,
            homoglyph_detected=False,
            typosquat_domain="security-alert-center-update.com",
            reply_to_mismatch=False,
            return_path_mismatch=False,
            deception_score=94.0,
            deception_factors=[
                "Display name claims identity as 'Microsoft' but domain is 'security-alert-center-update.com'",
                "Domain uses high-risk credential harvesting lookalike pattern",
                "SPF and DMARC authentication failed"
            ]
        ),
        social_eng_signals=[
            SocialEngSignal(
                category="Account Suspension Threat",
                severity="HIGH",
                score=98.0,
                evidence_quote="Your Microsoft 365 Single Sign-On access will be permanently suspended within 2 hours if you fail to re-verify your password.",
                line_number=1
            )
        ],
        urls=[
            UrlAnalysisItem(
                url_id="URL-002",
                original_url="https://bit.ly/m365-sso-verify-portal",
                final_url="https://login-microsoft-auth-session.xyz/sso/login.php",
                domain="bit.ly",
                redirect_count=3,
                redirect_chain=[
                    UrlRedirectHop(step=1, url="https://bit.ly/m365-sso-verify-portal", domain="bit.ly", ip="67.199.248.10", status_code=301, is_shortener=True, is_suspicious=True, risk_factors=["URL obfuscated via shortener"]),
                    UrlRedirectHop(step=2, url="https://login-microsoft-auth-session.xyz/sso/login.php", domain="login-microsoft-auth-session.xyz", ip="194.26.29.112", status_code=200, is_shortener=False, is_suspicious=True, risk_factors=["Hosts fake Microsoft login page"])
                ],
                has_credential_form=True,
                has_homoglyph_domain=False,
                reputation_score=98.0,
                evidence_id="EV-URL-205-1"
            )
        ],
        attachments=[],
        geo_financial=GeoFinancialEntity(
            entity_id="GEO-FIN-205",
            beneficiary_name="Apex Cloud Infrastructure Services",
            bank_name="ICICI Bank Ltd",
            ifsc_code="ICIC0000102",
            branch_name="Bengaluru Main Branch",
            branch_city="Bengaluru",
            branch_state="Karnataka",
            lat=12.9716,
            lng=77.5946,
            account_number_masked="XXXX-XXXX-3109",
            amount_requested="₹ 12,50,000 INR",
            ip_geolocation="Amsterdam, Netherlands",
            ip_lat=52.3676,
            ip_lng=4.9041,
            location_mismatch=True,
            uncertainty_disclaimer="Cross-region infrastructure and financial destination clues observed. Bank IFSC location indicates payout routing destination, NOT physical perpetrator location."
        ),
        threat_score=DecomposedThreatScore(
            overall_score=94.2,
            severity="CRITICAL",
            identity_score=ThreatScoreComponent(category="Identity Alignment", score=24.0, max_score=25.0, weight=0.25, confidence=0.98, reasons=["Brand impersonation of Microsoft"], evidence_ids=["EV-ID-205"]),
            auth_score=ThreatScoreComponent(category="Infrastructure Authentication", score=19.5, max_score=20.0, weight=0.20, confidence=0.99, reasons=["SPF & DMARC failed"], evidence_ids=["EV-AUTH-205"]),
            content_score=ThreatScoreComponent(category="Content & Social Engineering", score=14.8, max_score=15.0, weight=0.15, confidence=0.95, reasons=["Immediate 2-hour account suspension coercion"], evidence_ids=["EV-SOC-205"]),
            url_score=ThreatScoreComponent(category="URL & Redirect Chain", score=15.0, max_score=15.0, weight=0.15, confidence=0.98, reasons=["Obfuscated Bitly shortener leading to credential harvester"], evidence_ids=["EV-URL-205-1"]),
            infrastructure_score=ThreatScoreComponent(category="Network Infrastructure", score=13.9, max_score=15.0, weight=0.15, confidence=0.92, reasons=["AS44477 bulletproof host"], evidence_ids=["EV-HOP-205"]),
            campaign_score=ThreatScoreComponent(category="Campaign Intelligence", score=7.0, max_score=10.0, weight=0.10, confidence=0.85, reasons=["Correlates with M365 Phish Harvest Campaign"], evidence_ids=["EV-CAMP-205"])
        ),
        attack_dna=AttackDNA(
            dna_hash="DNA-205-CRED-HARVEST-X",
            identity_fingerprint="MSFT_BRAND_SPOOF_SUSPEND",
            url_structure_hash="BITLY_SHORTENER_REDIRECT_XYZ",
            language_vector_id="SSO_SUSPENSION_URGENCY",
            auth_behavior_code="SPF_FAIL_NO_DKIM",
            infrastructure_asn_set=["AS44477"],
            similarity_vectors={"CASE-204": 0.45}
        ),
        campaign_matches=[],
        attack_graph=AttackGraphData(
            nodes=[
                GraphNode(id="n_email205", label="Email: CASE-205", type="EMAIL", details={"case_id": "CASE-205"}, severity="CRITICAL"),
                GraphNode(id="n_msft", label="Claimed: Microsoft Security", type="IDENTITY", details={}, severity="CRITICAL"),
                GraphNode(id="n_bitly", label="URL: bit.ly/m365-sso", type="URL", details={}, severity="HIGH"),
                GraphNode(id="n_phish_dest", label="Domain: login-microsoft-auth-session.xyz", type="DOMAIN", details={}, severity="CRITICAL")
            ],
            edges=[
                GraphEdge(id="e205_1", source="n_email205", target="n_msft", relationship="CLAIMS_TO_BE", confidence=1.0, evidence_id="EV-ID-205"),
                GraphEdge(id="e205_2", source="n_email205", target="n_bitly", relationship="CONTAINS", confidence=1.0, evidence_id="EV-URL-205-1"),
                GraphEdge(id="e205_3", source="n_bitly", target="n_phish_dest", relationship="REDIRECTS_TO", confidence=1.0, evidence_id="EV-URL-205-1")
            ]
        ),
        chain_of_custody=[coc_205_1]
    )

    # -------------------------------------------------------------
    # CASE-206: Historical Campaign Baseline ("PhishPhantom")
    # -------------------------------------------------------------
    case_206 = CaseDetail(
        case_id="CASE-206",
        title="Historical Campaign - PhishPhantom Infrastructure Overlap",
        status="UNDER_REVIEW",
        severity="HIGH",
        created_at="2026-08-15T09:00:00Z",
        updated_at="2026-08-15T11:00:00Z",
        assignee="Intelligence Research Desk",
        summary="Historical baseline case recorded 2 weeks ago sharing AS204915 and identical invoice redirection pattern.",
        raw_email_id="EV-EML-206",
        email_subject="Payment Confirmation Needed - Invoice #INV-7731",
        email_from="accounts@vendor-billing-group.com",
        email_to="ap@corporate-enterprise.com",
        email_date="Fri, 15 Aug 2026 09:00:00 +0000",
        header_hops=[],
        auth_status=AuthStatus(spf_status="FAIL", spf_domain="vendor-billing-group.com", dkim_status="FAIL", dmarc_status="FAIL", dmarc_policy="none", alignment="MISALIGNED"),
        identity_analysis=IdentityAnalysis(display_name="Vendor Billing Group", sender_email="accounts@vendor-billing-group.com", deception_score=75.0, deception_factors=["Unverified domain"]),
        social_eng_signals=[],
        urls=[],
        attachments=[],
        geo_financial=GeoFinancialEntity(
            entity_id="GEO-FIN-206",
            beneficiary_name="Cyphersoft Global Payments Ltd",
            bank_name="HDFC Bank Ltd",
            ifsc_code="HDFC0000060",
            branch_name="Mumbai Fort Branch",
            branch_city="Mumbai",
            branch_state="Maharashtra",
            lat=18.9322,
            lng=72.8336,
            account_number_masked="XXXX-XXXX-7721",
            amount_requested="₹ 8,20,000 INR",
            ip_geolocation="Bucharest, Romania",
            ip_lat=44.4323,
            ip_lng=26.1063,
            location_mismatch=True,
            uncertainty_disclaimer="Cross-region infrastructure and financial destination clues observed. Bank IFSC location indicates payout routing destination, NOT physical perpetrator location."
        ),
        threat_score=DecomposedThreatScore(
            overall_score=78.0,
            severity="HIGH",
            identity_score=ThreatScoreComponent(category="Identity", score=18.0, max_score=25.0, weight=0.25, confidence=0.8, reasons=[], evidence_ids=[]),
            auth_score=ThreatScoreComponent(category="Auth", score=15.0, max_score=20.0, weight=0.20, confidence=0.8, reasons=[], evidence_ids=[]),
            content_score=ThreatScoreComponent(category="Content", score=12.0, max_score=15.0, weight=0.15, confidence=0.8, reasons=[], evidence_ids=[]),
            url_score=ThreatScoreComponent(category="URL", score=13.0, max_score=15.0, weight=0.15, confidence=0.8, reasons=[], evidence_ids=[]),
            infrastructure_score=ThreatScoreComponent(category="Infra", score=12.0, max_score=15.0, weight=0.15, confidence=0.8, reasons=[], evidence_ids=[]),
            campaign_score=ThreatScoreComponent(category="Campaign", score=8.0, max_score=10.0, weight=0.10, confidence=0.8, reasons=[], evidence_ids=[])
        ),
        attack_dna=AttackDNA(dna_hash="DNA-206-HIST", identity_fingerprint="VENDOR_BILLING", url_structure_hash="REDIRECT_XYZ", language_vector_id="INVOICE_BEC", auth_behavior_code="SPF_FAIL", infrastructure_asn_set=["AS204915"], similarity_vectors={"CASE-204": 0.82}),
        campaign_matches=[],
        attack_graph=AttackGraphData(nodes=[], edges=[]),
        chain_of_custody=[]
    )

    return {
        "CASE-204": case_204,
        "CASE-205": case_205,
        "CASE-206": case_206
    }
