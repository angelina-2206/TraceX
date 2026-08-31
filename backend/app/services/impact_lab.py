from typing import Dict, Any
from app.schemas.forensics import CaseDetail, DecomposedThreatScore
from app.services.threat_scorer import ThreatScorerService

class ImpactLabService:
    @staticmethod
    def simulate_counterfactual(
        case: CaseDetail,
        remove_url: bool = False,
        assume_spf_pass: bool = False,
        disconnect_campaign: bool = False,
        remove_reply_mismatch: bool = False
    ) -> Dict[str, Any]:
        """
        Simulates counterfactual changes to case evidence and evaluates threat score delta.
        Answers: 'What made this email dangerous?'
        """
        original_score = case.threat_score.overall_score
        
        # Clone components for scenario simulation
        modified_ident = case.identity_analysis.model_copy(deep=True)
        modified_auth = case.auth_status.model_copy(deep=True)
        modified_urls = [u.model_copy(deep=True) for u in case.urls]
        modified_campaigns = [c.model_copy(deep=True) for c in case.campaign_matches]
        
        simulated_changes = []
        
        if remove_url:
            modified_urls = []
            simulated_changes.append("Removed suspicious URL & redirect chain")
            
        if assume_spf_pass:
            modified_auth.spf_status = "PASS"
            modified_auth.alignment = "ALIGNED" if modified_auth.dkim_status == "PASS" else "MISALIGNED"
            simulated_changes.append("Assumed SPF authentication PASS")
            
        if disconnect_campaign:
            modified_campaigns = []
            simulated_changes.append("Disconnected historical campaign correlation")
            
        if remove_reply_mismatch:
            modified_ident.reply_to_mismatch = False
            modified_ident.deception_score = max(0.0, modified_ident.deception_score - 25.0)
            simulated_changes.append("Aligned Reply-To domain with visible sender")

        # Recalculate decomposed score
        new_threat_score: DecomposedThreatScore = ThreatScorerService.calculate_decomposed_score(
            identity=modified_ident,
            auth=modified_auth,
            social_signals=case.social_eng_signals,
            urls=modified_urls,
            campaign_matches=modified_campaigns
        )

        score_delta = round(new_threat_score.overall_score - original_score, 1)

        return {
            "original_score": original_score,
            "simulated_score": new_threat_score.overall_score,
            "score_delta": score_delta,
            "impact_direction": "REDUCED_RISK" if score_delta < 0 else ("INCREASED_RISK" if score_delta > 0 else "NO_CHANGE"),
            "simulated_changes": simulated_changes,
            "new_severity": new_threat_score.severity,
            "simulated_breakdown": new_threat_score
        }
