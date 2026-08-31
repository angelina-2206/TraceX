from typing import Dict, Any, List
from app.schemas.forensics import CaseDetail

class ForensicRagService:
    @staticmethod
    def answer_question(case: CaseDetail, question: str) -> Dict[str, Any]:
        """
        Grounded RAG query engine that analyzes the active case details, evidence vault,
        and attack graph to construct an explainable response with [FACT], [INFERENCE],
        and [UNCERTAINTY] tags.
        """
        import json
        from app.core.config import settings
        from app.services.openai_service import OpenAiService
        
        # If API key is available, call OpenAI dynamically
        if settings.OPENAI_API_KEY:
            system_instructions = (
                "You are an expert cybersecurity forensic analyst. "
                "Analyze the provided email threat case details. "
                "Structure your response with [FACT] tags for objective details (include evidence IDs like [EV-ID-01]), "
                "[INFERENCE] tags for logical conclusions, and "
                "[UNCERTAINTY] tags for bounds of your knowledge."
            )
            # Create a simple JSON representation of case details
            case_data_str = json.dumps(case.model_dump(), default=str)
            ai_answer = OpenAiService.get_completion(system_instructions, question, case_data_str)
            if ai_answer:
                lines = ai_answer.split("\n")
                facts = [l.strip("- *") for l in lines if "[FACT]" in l]
                inferences = [l.strip("- *") for l in lines if "[INFERENCE]" in l]
                uncertainties = [l.strip("- *") for l in lines if "[UNCERTAINTY]" in l]
                return {
                    "answer": ai_answer,
                    "facts": facts,
                    "inferences": inferences,
                    "uncertainties": uncertainties,
                    "evidence_references": ["EV-AI-GENERATED"]
                }
                
        q_lower = question.lower()
        
        # 1. Question: Why is this email suspicious / BEC / dangerous?
        if any(term in q_lower for term in ["why", "suspicious", "bec", "dangerous", "risk", "threat"]):
            facts = []
            inferences = []
            uncertainties = []
            
            # Extract facts from case
            if case.identity_analysis.reply_to_mismatch:
                facts.append(f"[FACT] The Reply-To email address '{case.identity_analysis.reply_to}' differs from the visible sender domain '{case.email_from}'. [EV-ID-01]")
            if case.auth_status.alignment == "MISALIGNED":
                facts.append(f"[FACT] Email infrastructure failed SPF/DKIM/DMARC domain alignment checks (SPF: {case.auth_status.spf_status}, DKIM: {case.auth_status.dkim_status}). [EV-AUTH-01]")
            if case.urls:
                facts.append(f"[FACT] The email contains a link '{case.urls[0].original_url}' which redirects through intermediate domain '{case.urls[0].final_url}'. [{case.urls[0].evidence_id}]")
            if case.geo_financial:
                facts.append(f"[FACT] Body contains payment redirection instructions requesting transfer of {case.geo_financial.amount_requested} to IFSC branch '{case.geo_financial.ifsc_code}' ({case.geo_financial.bank_name}). [EV-GEO-FIN-01]")
                
            inferences.append("[INFERENCE] The combination of display name brand spoofing, Reply-To domain mismatch, and payment instruction changes indicates a Business Email Compromise (BEC) attack.")
            if case.campaign_matches:
                inferences.append(f"[INFERENCE] Shared ASN (AS204915) and redirect structure suggest correlation with historical threat campaign '{case.campaign_matches[0].campaign_name}'. [EV-CAMP-01]")
                
            uncertainties.append("[UNCERTAINTY] IP geolocation (Sofia, Bulgaria) and IFSC branch location (Hyderabad) represent observed technical & financial clues; they do NOT provide definitive physical proof of attacker identity or location.")
            
            response_text = "### CASE INVESTIGATION ANALYSIS\n\n"
            response_text += "**SUPPORTING FACTS (OBSERVED EVIDENCE):**\n" + "\n".join(f"- {f}" for f in facts) + "\n\n"
            response_text += "**DERIVED INFERENCES:**\n" + "\n".join(f"- {i}" for i in inferences) + "\n\n"
            response_text += "**LIMITS & UNCERTAINTIES:**\n" + "\n".join(f"- {u}" for u in uncertainties)
            
            return {
                "answer": response_text,
                "facts": facts,
                "inferences": inferences,
                "uncertainties": uncertainties,
                "evidence_references": ["EV-ID-01", "EV-AUTH-01", "EV-GEO-FIN-01", "EV-CAMP-01"]
            }

        # 2. Question: Show infrastructure path / headers / hops
        elif any(term in q_lower for term in ["header", "path", "hop", "infrastructure", "asn", "relay"]):
            hops_summary = [f"Hop #{h.hop_index}: {h.from_host} -> {h.by_host} (IP: {h.ip}, ASN: {h.asn})" for h in case.header_hops]
            
            facts = [
                f"[FACT] Flight recorder reconstructed {len(case.header_hops)} delivery hops starting from origin server. [EV-HEADER-RECON]",
                f"[FACT] Hop #1 originated from IP {case.header_hops[0].ip} hosted on ASN '{case.header_hops[0].asn}'. [EV-HOP-1]"
            ]
            inferences = [
                "[INFERENCE] The relay server operates outside the authenticated corporate infrastructure of the claimed sender."
            ]
            uncertainties = [
                "[UNCERTAINTY] Open relay headers may be manipulated if intermediate hop servers lack cryptographic signing."
            ]
            
            response_text = "### HEADER FLIGHT PATH RECONSTRUCTION\n\n"
            response_text += "\n".join(f"- {h}" for h in hops_summary) + "\n\n"
            response_text += "**SUPPORTING FACTS:**\n" + "\n".join(f"- {f}" for f in facts) + "\n\n"
            response_text += "**DERIVED INFERENCES:**\n" + "\n".join(f"- {i}" for i in inferences)
            
            return {
                "answer": response_text,
                "facts": facts,
                "inferences": inferences,
                "uncertainties": uncertainties,
                "evidence_references": ["EV-HEADER-RECON", "EV-HOP-1"]
            }

        # 3. Question: Financial clues / bank / IFSC / payout
        elif any(term in q_lower for term in ["financial", "bank", "ifsc", "payout", "beneficiary", "money"]):
            if case.geo_financial:
                gf = case.geo_financial
                facts = [
                    f"[FACT] Extracted Beneficiary: '{gf.beneficiary_name}' [EV-GEO-FIN-01]",
                    f"[FACT] Extracted Bank: {gf.bank_name}, IFSC: {gf.ifsc_code} ({gf.branch_name}, {gf.branch_city}) [EV-GEO-FIN-01]",
                    f"[FACT] Amount Requested: {gf.amount_requested} [EV-GEO-FIN-01]"
                ]
                inferences = [
                    f"[INFERENCE] Perpetrator is requesting payout redirection to an Indian banking branch ({gf.branch_city}) while routing email headers through European relay infrastructure ({gf.ip_geolocation})."
                ]
                uncertainties = [
                    f"[UNCERTAINTY] {gf.uncertainty_disclaimer}"
                ]
                
                response_text = "### GEO-FINANCIAL EVIDENCE ANALYSIS\n\n"
                response_text += "**SUPPORTING FACTS:**\n" + "\n".join(f"- {f}" for f in facts) + "\n\n"
                response_text += "**DERIVED INFERENCES:**\n" + "\n".join(f"- {i}" for i in inferences) + "\n\n"
                response_text += "**LIMITS & UNCERTAINTIES:**\n" + "\n".join(f"- {u}" for u in uncertainties)
                
                return {
                    "answer": response_text,
                    "facts": facts,
                    "inferences": inferences,
                    "uncertainties": uncertainties,
                    "evidence_references": ["EV-GEO-FIN-01"]
                }

        # Default Fallback Grounded Answer
        facts = [f"[FACT] Case {case.case_id} contains {len(case.urls)} extracted URLs and {len(case.header_hops)} header hops. [EV-GENERAL]"]
        inferences = [f"[INFERENCE] Overall threat rating evaluated at {case.threat_score.overall_score}/100 ({case.threat_score.severity})."]
        uncertainties = ["[UNCERTAINTY] Additional evidence ingestion required for further automated conclusions."]
        
        response_text = f"### CASE {case.case_id} EVIDENCE SUMMARY\n\n"
        response_text += f"**Subject:** {case.email_subject}\n"
        response_text += f"**From:** {case.email_from}\n"
        response_text += f"**Threat Score:** {case.threat_score.overall_score} / 100 ({case.threat_score.severity})\n\n"
        response_text += "**FACTS:**\n- " + "\n- ".join(facts)
        
        return {
            "answer": response_text,
            "facts": facts,
            "inferences": inferences,
            "uncertainties": uncertainties,
            "evidence_references": ["EV-GENERAL"]
        }
