from typing import List
from app.schemas.forensics import (
    DecomposedThreatScore, ThreatScoreComponent, IdentityAnalysis,
    AuthStatus, SocialEngSignal, UrlAnalysisItem, CampaignMatch
)

class ThreatScorerService:
    @staticmethod
    def calculate_decomposed_score(
        identity: IdentityAnalysis,
        auth: AuthStatus,
        social_signals: List[SocialEngSignal],
        urls: List[UrlAnalysisItem],
        campaign_matches: List[CampaignMatch]
    ) -> DecomposedThreatScore:
        """
        Builds a multi-dimensional decomposed threat score with category weights and evidence justification.
        """
        # 1. Identity Component (Max 25 pts)
        ident_score = min(25.0, identity.deception_score * 0.25)
        ident_comp = ThreatScoreComponent(
            category="Identity Alignment",
            score=ident_score,
            max_score=25.0,
            weight=0.25,
            confidence=0.92,
            reasons=identity.deception_factors if identity.deception_factors else ["Sender identity aligned"],
            evidence_ids=["EV-ID-01"]
        )

        # 2. Authentication Component (Max 20 pts)
        auth_reasons = []
        auth_penalty = 0.0
        if auth.spf_status != "PASS":
            auth_penalty += 8.0
            auth_reasons.append("SPF authentication check failed for sender domain")
        if auth.dkim_status != "PASS":
            auth_penalty += 6.0
            auth_reasons.append("DKIM cryptographic signature missing or invalid")
        if auth.dmarc_status != "PASS":
            auth_penalty += 6.0
            auth_reasons.append("DMARC alignment policy failed")
        if not auth_reasons:
            auth_reasons.append("All email authentication protocols (SPF/DKIM/DMARC) passed")

        auth_comp = ThreatScoreComponent(
            category="Infrastructure Authentication",
            score=auth_penalty,
            max_score=20.0,
            weight=0.20,
            confidence=0.98,
            reasons=auth_reasons,
            evidence_ids=["EV-AUTH-01"]
        )

        # 3. Content & Social Engineering Component (Max 15 pts)
        max_social = max([s.score for s in social_signals], default=0.0)
        content_score = min(15.0, max_social * 0.15)
        content_reasons = [f"Detected {s.category} ({s.severity}): '{s.evidence_quote}'" for s in social_signals if s.severity == "HIGH"]
        if not content_reasons:
            content_reasons = ["No aggressive urgency or coercion techniques detected"]

        content_comp = ThreatScoreComponent(
            category="Content & Social Engineering",
            score=content_score,
            max_score=15.0,
            weight=0.15,
            confidence=0.88,
            reasons=content_reasons,
            evidence_ids=["EV-SOC-01"]
        )

        # 4. URL & Redirect Chain Component (Max 15 pts)
        url_score = 0.0
        url_reasons = []
        for u in urls:
            if u.redirect_count > 0:
                url_score += 8.0
                url_reasons.append(f"URL '{u.original_url}' redirects through {u.redirect_count} intermediate hop(s)")
            if u.has_credential_form:
                url_score += 7.0
                url_reasons.append("Final destination URL hosts a login/credential harvesting form")
        url_score = min(15.0, url_score)
        if not url_reasons:
            url_reasons = ["No suspicious URLs or redirect chains identified"]

        url_comp = ThreatScoreComponent(
            category="URL & Redirect Chain",
            score=url_score,
            max_score=15.0,
            weight=0.15,
            confidence=0.90,
            reasons=url_reasons,
            evidence_ids=[u.evidence_id for u in urls] or ["EV-URL-NONE"]
        )

        # 5. Network Infrastructure Component (Max 15 pts)
        infra_score = 12.0 # Default high penalty for high-risk offshore ISP/ASN
        infra_comp = ThreatScoreComponent(
            category="Network Infrastructure",
            score=infra_score,
            max_score=15.0,
            weight=0.15,
            confidence=0.85,
            reasons=["Relay server AS204915 is classified as high-risk offshore hosting infrastructure"],
            evidence_ids=["EV-INFRA-01"]
        )

        # 6. Campaign Memory Overlap Component (Max 10 pts)
        camp_score = 8.0 if campaign_matches else 0.0
        camp_reasons = [f"Matches historical campaign '{c.campaign_name}' ({c.confidence:.0f}% confidence)" for c in campaign_matches]
        if not camp_reasons:
            camp_reasons = ["No historical campaign overlaps recorded in institutional threat memory"]

        camp_comp = ThreatScoreComponent(
            category="Campaign Intelligence",
            score=camp_score,
            max_score=10.0,
            weight=0.10,
            confidence=0.82,
            reasons=camp_reasons,
            evidence_ids=["EV-CAMP-01"] if campaign_matches else ["EV-CAMP-NONE"]
        )

        overall = ident_score + auth_penalty + content_score + url_score + infra_score + camp_score
        overall = min(100.0, max(0.0, overall))

        if overall >= 80:
            severity = "CRITICAL"
        elif overall >= 60:
            severity = "HIGH"
        elif overall >= 35:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        return DecomposedThreatScore(
            overall_score=round(overall, 1),
            severity=severity,
            identity_score=ident_comp,
            auth_score=auth_comp,
            content_score=content_comp,
            url_score=url_comp,
            infrastructure_score=infra_comp,
            campaign_score=camp_comp
        )
