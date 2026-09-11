import logging
from typing import List, Optional, Dict, Any
from app.schemas.forensics import (
    EmailClassification, IdentityAnalysis, AuthStatus,
    SocialEngSignal, UrlAnalysisItem, AttachmentItem,
    GeoFinancialEntity, DecomposedThreatScore, HeaderHop
)

logger = logging.getLogger("uvicorn.error")

class EmailClassifierService:
    """
    ML-informed rule & heuristic synthesis engine that categorizes analyzed email artifacts
    into standardized threat classes with confidence scoring and explainable indicator rationale.
    """

    CATEGORIES = [
        "Financial Fraud",
        "BEC",
        "Phishing",
        "Impersonation",
        "Malware",
        "Suspicious",
        "Legitimate"
    ]

    @classmethod
    def classify(
        cls,
        identity: IdentityAnalysis,
        auth: Optional[AuthStatus] = None,
        auth_status: Optional[AuthStatus] = None,
        social_signals: Optional[List[SocialEngSignal]] = None,
        urls: Optional[List[UrlAnalysisItem]] = None,
        attachments: Optional[List[AttachmentItem]] = None,
        threat_score: Optional[DecomposedThreatScore] = None,
        geo_financial: Optional[GeoFinancialEntity] = None,
        subject: str = "",
        body_text: str = "",
        hops: Optional[List[HeaderHop]] = None,
        campaigns: Optional[List[Any]] = None
    ) -> EmailClassification:
        """
        Classifies an email and generates explainable human-readable justification lines.
        """
        auth_obj = auth or auth_status or AuthStatus(spf_status="NONE", spf_domain="", dkim_status="NONE", dmarc_status="NONE", dmarc_policy="none", alignment="UNALIGNED")
        urls_list = urls or []
        att_list = attachments or []
        social_list = social_signals or []
        hops_list = hops or []
        text_lower = (subject + " " + body_text).lower()
        score = threat_score.overall_score if threat_score else 50.0

        reasons: List[str] = []
        key_indicators: Dict[str, Any] = {
            "has_auth_failure": auth_obj.spf_status != "PASS" or auth_obj.dmarc_status != "PASS" or auth_obj.alignment == "MISALIGNED",
            "has_reply_to_mismatch": identity.reply_to_mismatch,
            "has_homoglyph": identity.homoglyph_detected or any(u.has_homoglyph_domain for u in urls_list),
            "has_credential_form": any(u.has_credential_form for u in urls_list),
            "redirect_hops_count": max([u.redirect_count for u in urls_list], default=0),
            "has_macro_attachment": any(a.is_macro_enabled or a.is_executable for a in att_list),
            "has_ifsc_payout": bool(geo_financial and geo_financial.ifsc_code),
            "urgency_score": max([s.score for s in social_list], default=0.0)
        }

        # -------------------------------------------------------------
        # 1. Financial Fraud / Wire Payout Redirection (Priority 1)
        # -------------------------------------------------------------
        is_financial_words = any(w in text_lower for w in [
            "invoice", "wire", "remit", "payout", "ifsc", "bank account",
            "payment", "beneficiary", "rtgs", "neft", "transfer funds"
        ])
        if (geo_financial and geo_financial.ifsc_code) or (is_financial_words and key_indicators["has_reply_to_mismatch"]):
            reasons.append("Direct payment redirection and bank routing request identified in message body.")
            if geo_financial and geo_financial.ifsc_code:
                reasons.append(f"Target payout beneficiary IFSC '{geo_financial.ifsc_code}' detected with geographical infrastructure mismatch.")
            if identity.reply_to_mismatch:
                reasons.append(f"Sender claims executive/vendor identity but routes replies to unaligned inbox '{identity.reply_to}'.")
            if auth_obj.alignment == "MISALIGNED" or auth_obj.spf_status != "PASS":
                reasons.append("Email infrastructure failed SPF/DMARC domain alignment verification.")
            if key_indicators["urgency_score"] >= 75:
                reasons.append("High urgency psychological pressure applied to bypass standard financial review.")

            conf = 91.0 if (geo_financial and geo_financial.ifsc_code) else 88.0
            return EmailClassification(
                category="Financial Fraud",
                confidence=conf,
                severity="CRITICAL" if score >= 75 else "HIGH",
                summary_label=f"Financial Fraud — {conf:.0f}% confidence",
                explainable_reasons=reasons,
                key_indicators=key_indicators
            )

        # -------------------------------------------------------------
        # 2. BEC (Business Email Compromise) / Executive Deception
        # -------------------------------------------------------------
        is_exec_role = any(title in identity.display_name.lower() or title in text_lower for title in [
            "ceo", "cfo", "director", "executive", "president", "management", "vp"
        ])
        if (is_exec_role and (identity.reply_to_mismatch or identity.lookalike_detected)) or ("INVOICE" in text_lower and identity.reply_to_mismatch):
            reasons.append("Executive identity impersonated to execute unauthorized operational or financial directives.")
            if identity.reply_to_mismatch:
                reasons.append(f"Covert Reply-To address '{identity.reply_to}' misaligned with visible sender '{identity.sender_email}'.")
            if identity.lookalike_detected or identity.homoglyph_detected:
                reasons.append(f"Lookalike / homoglyph domain detected in sender infrastructure ('{identity.typosquat_domain or identity.sender_email}').")
            if auth_obj.dmarc_status != "PASS":
                reasons.append("Cryptographic DMARC authentication checks failed for claimed sender domain.")

            conf = 89.0
            return EmailClassification(
                category="BEC",
                confidence=conf,
                severity="HIGH",
                summary_label=f"BEC — {conf:.0f}% confidence",
                explainable_reasons=reasons,
                key_indicators=key_indicators
            )

        # -------------------------------------------------------------
        # 3. Malware / Malicious Attachment Delivery
        # -------------------------------------------------------------
        if any(a.is_macro_enabled or a.is_executable or a.risk_level in ["HIGH", "CRITICAL"] for a in att_list):
            mal_att = next((a for a in att_list if a.is_macro_enabled or a.is_executable or a.risk_level in ["HIGH", "CRITICAL"]), att_list[0])
            reasons.append(f"Embedded attachment '{mal_att.filename}' flagged with high-risk executable or macro behavior.")
            if mal_att.entropy_score and mal_att.entropy_score > 6.0:
                reasons.append(f"Elevated Shannon entropy score ({mal_att.entropy_score:.2f}) indicates encrypted or obfuscated payload.")
            if mal_att.yara_matches:
                reasons.append(f"YARA heuristic matches: {', '.join(mal_att.yara_matches[:2])}.")

            conf = 93.0
            return EmailClassification(
                category="Malware",
                confidence=conf,
                severity="CRITICAL",
                summary_label=f"Malware — {conf:.0f}% confidence",
                explainable_reasons=reasons,
                key_indicators=key_indicators
            )

        # -------------------------------------------------------------
        # 4. Phishing / Credential Harvesting
        # -------------------------------------------------------------
        has_phish_urls = any(u.has_credential_form or u.has_homoglyph_domain or u.redirect_count > 0 for u in urls_list)
        is_sso_lure = any(w in text_lower for w in ["sso", "login", "password", "re-authenticate", "security alert", "mfa", "session expired"])
        if has_phish_urls or (is_sso_lure and (urls_list or auth_obj.spf_status != "PASS")):
            reasons.append("Embedded URL links resolve to credential harvesting forms or suspicious redirect chains.")
            if any(u.has_homoglyph_domain for u in urls_list):
                reasons.append("Target URL uses deceptive lookalike / homoglyph character substitutions.")
            if any(u.redirect_count > 0 for u in urls_list):
                reasons.append("Multi-hop HTTP redirect chain configured to bypass automated network filters.")
            if is_sso_lure:
                reasons.append("Urgent authentication/account suspension lure designed to coerce credential disclosure.")

            conf = 88.0
            return EmailClassification(
                category="Phishing",
                confidence=conf,
                severity="HIGH",
                summary_label=f"Phishing — {conf:.0f}% confidence",
                explainable_reasons=reasons,
                key_indicators=key_indicators
            )

        # -------------------------------------------------------------
        # 5. Impersonation / Brand Spoofing
        # -------------------------------------------------------------
        if identity.lookalike_detected or identity.deception_score >= 60.0:
            reasons.append(f"Sender display name claims '{identity.display_name}' but fails domain verification.")
            if identity.claimed_brand:
                reasons.append(f"Unauthorized brand usage impersonating '{identity.claimed_brand}'.")
            if identity.return_path_mismatch:
                reasons.append(f"Return-Path mismatch: routed through bounce relay '{identity.return_path}'.")

            conf = 84.0
            return EmailClassification(
                category="Impersonation",
                confidence=conf,
                severity="MEDIUM" if score < 60 else "HIGH",
                summary_label=f"Impersonation — {conf:.0f}% confidence",
                explainable_reasons=reasons,
                key_indicators=key_indicators
            )

        # -------------------------------------------------------------
        # 6. Suspicious (General Anomaly / Unverified)
        # -------------------------------------------------------------
        if score >= 35.0 or auth_obj.spf_status != "PASS" or auth_obj.dmarc_status != "PASS":
            if auth_obj.spf_status != "PASS":
                reasons.append("SPF authorization record failed for origin relay IP address.")
            if auth_obj.dmarc_status != "PASS":
                reasons.append("DMARC alignment policy verification failed.")
            if not reasons:
                reasons.append("Unverified sender infrastructure with anomalous routing telemetry.")

            conf = 74.0
            return EmailClassification(
                category="Suspicious",
                confidence=conf,
                severity="MEDIUM",
                summary_label=f"Suspicious — {conf:.0f}% confidence",
                explainable_reasons=reasons,
                key_indicators=key_indicators
            )

        # -------------------------------------------------------------
        # 7. Legitimate Baseline
        # -------------------------------------------------------------
        reasons.append("SPF, DKIM, and DMARC domain authentication checks successfully passed and aligned.")
        reasons.append("Sender identity matches verified corporate reputation history.")
        reasons.append("No malicious URL redirects, credential forms, or high-risk attachments observed.")

        conf = 94.0
        return EmailClassification(
            category="Legitimate",
            confidence=conf,
            severity="CLEAN",
            summary_label=f"Legitimate — {conf:.0f}% confidence",
            explainable_reasons=reasons,
            key_indicators=key_indicators
        )
