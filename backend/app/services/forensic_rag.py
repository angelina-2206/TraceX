import json
import re
import logging
from typing import Dict, Any, List
from app.schemas.forensics import CaseDetail
from app.core.config import settings
from app.services.gemini_service import GeminiService
from app.services import rag_retriever

logger = logging.getLogger("uvicorn.error")

class ForensicRagService:
    @staticmethod
    def answer_question(case: CaseDetail, question: str) -> Dict[str, Any]:
        """
        Grounded RAG query engine that analyzes the active case details, evidence vault,
        and Qdrant knowledge base to construct a realistic, explainable response with [FACT],
        [INFERENCE], and [UNCERTAINTY] tags without markdown hashes.
        """
        # 1. Execute Qdrant Vector Retrieval using rag_retriever
        search_query = f"{question} {case.email_subject} {case.identity_analysis.sender_email}"
        retrieved_chunks = []
        try:
            retrieved_chunks = rag_retriever.retrieve(search_query, top_k=5)
        except Exception as e:
            logger.warning(f"[ForensicRAG] Qdrant retrieval fallback: {e}")

        # 2. Format Retrieved RAG Knowledge Chunks into Structured Context
        if retrieved_chunks:
            formatted_kb_blocks = []
            for idx, chunk in enumerate(retrieved_chunks, 1):
                kb_tag = f"[KB-{idx:02d}]"
                block = (
                    f"{kb_tag}\n"
                    f"Title: {chunk.title}\n"
                    f"Category/Source: {chunk.category} ({chunk.source})\n"
                    f"Relevance Score: {chunk.score:.2f}\n"
                )
                if chunk.technique_id:
                    block += f"MITRE Technique: {chunk.technique_id}\n"
                block += f"Content:\n{chunk.text.strip()}\n"
                formatted_kb_blocks.append(block)
            rag_context_str = "\n".join(formatted_kb_blocks)
        else:
            rag_context_str = "[NOTICE] No relevant cybersecurity knowledge-base documents were retrieved from Qdrant."

        # 3. If API key is available, call Gemini dynamically
        if settings.GEMINI_API_KEY:
            system_instructions = (
                "You are TRACE-X, an executive cyber-forensic investigator assistant. "
                "Provide a realistic, professional, and explainable incident analysis based strictly on observable evidence and retrieved knowledge base context. "
                "CRITICAL: Do NOT use markdown headers with hash symbols (do NOT use #, ##, or ###). Format section titles as bold uppercase lines (e.g. OBSERVED EVIDENCE, FORENSIC ANALYSIS, UNCERTAINTIES).\n"
                "Structure your response with:\n"
                "- [FACT] tags for objective, observed evidence details (always cite evidence IDs like [EV-ID-01] or [KB-01]).\n"
                "- [INFERENCE] tags for logical forensic conclusions.\n"
                "- [UNCERTAINTY] tags for bounds of knowledge or missing information.\n"
                "Speak clearly, realistically, and authoritatively as an expert security researcher."
            )
            # Create a JSON representation of case details
            case_data_str = json.dumps(case.model_dump(), default=str)
            ai_answer = GeminiService.get_completion(
                system_instructions=system_instructions,
                user_question=question,
                case_data_str=case_data_str,
                rag_context_str=rag_context_str
            )
            if ai_answer:
                # Robust output parser removing any stray hashes
                clean_answer = re.sub(r"^#+\s*", "", ai_answer.replace("```markdown", "").replace("```", "").strip(), flags=re.MULTILINE)
                lines = clean_answer.split("\n")
                
                facts = []
                inferences = []
                uncertainties = []
                evidence_refs = set()

                for line in lines:
                    stripped = line.strip()
                    cleaned_line = re.sub(r"^[\s\-\*\•\d\.\>]+", "", stripped).strip()
                    
                    if "[FACT]" in cleaned_line:
                        facts.append(cleaned_line)
                    elif "[INFERENCE]" in cleaned_line:
                        inferences.append(cleaned_line)
                    elif "[UNCERTAINTY]" in cleaned_line:
                        uncertainties.append(cleaned_line)
                        
                    # Extract evidence / KB tags
                    refs = re.findall(r"\[(EV-[\w\-]+|KB-\d+)\]", cleaned_line)
                    for r in refs:
                        evidence_refs.add(r)

                if not evidence_refs:
                    evidence_refs.add("EV-AI-GENERATED")

                return {
                    "answer": clean_answer,
                    "facts": facts,
                    "inferences": inferences,
                    "uncertainties": uncertainties,
                    "evidence_references": sorted(list(evidence_refs))
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
                
            uncertainties.append(f"[UNCERTAINTY] Technical origin geolocation ({case.geo_financial.ip_geolocation if case.geo_financial else 'Bulgaria'}) and IFSC branch location represent observed clues; they do NOT provide definitive physical proof of physical perpetrator identity.")
            
            response_text = "FORENSIC CASE INVESTIGATION BRIEFING\n\n"
            response_text += "**OBSERVED EVIDENCE (FACTS):**\n" + "\n".join(f"- {f}" for f in facts) + "\n\n"
            response_text += "**TECHNICAL ANALYSIS (INFERENCES):**\n" + "\n".join(f"- {i}" for i in inferences) + "\n\n"
            response_text += "**INVESTIGATIVE LIMITS (UNCERTAINTIES):**\n" + "\n".join(f"- {u}" for u in uncertainties)
            
            return {
                "answer": response_text,
                "facts": facts,
                "inferences": inferences,
                "uncertainties": uncertainties,
                "evidence_references": ["EV-ID-01", "EV-AUTH-01", "EV-GEO-FIN-01", "EV-CAMP-01"]
            }

        # 2. Question: Show infrastructure path / headers / hops
        elif any(term in q_lower for term in ["header", "path", "hop", "infrastructure", "asn", "relay"]):
            hops_summary = [f"Hop {h.hop_index}: {h.from_host} ➔ {h.by_host} (IP: {h.ip}, ASN: {h.asn})" for h in case.header_hops]
            
            facts = [
                f"[FACT] Flight recorder reconstructed {len(case.header_hops)} delivery hops starting from origin server. [EV-HEADER-RECON]",
                f"[FACT] Hop 1 originated from IP {case.header_hops[0].ip if case.header_hops else 'Unknown'} hosted on ASN '{case.header_hops[0].asn if case.header_hops else 'Unknown'}'. [EV-HOP-1]"
            ]
            inferences = [
                "[INFERENCE] The relay server operates outside the authenticated corporate infrastructure of the claimed sender."
            ]
            uncertainties = [
                "[UNCERTAINTY] Open relay headers may be manipulated if intermediate hop servers lack cryptographic signing."
            ]
            
            response_text = "HEADER FLIGHT PATH RECONSTRUCTION\n\n"
            response_text += "**DELIVERY ROUTE HOPS:**\n" + "\n".join(f"- {h}" for h in hops_summary) + "\n\n"
            response_text += "**OBSERVED EVIDENCE:**\n" + "\n".join(f"- {f}" for f in facts) + "\n\n"
            response_text += "**TECHNICAL ANALYSIS:**\n" + "\n".join(f"- {i}" for i in inferences)
            
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
                    f"[INFERENCE] Perpetrator is requesting payout redirection to an Indian banking branch ({gf.branch_city}) while routing email headers through offshore server infrastructure ({gf.ip_geolocation})."
                ]
                uncertainties = [
                    f"[UNCERTAINTY] {gf.uncertainty_disclaimer}"
                ]
                
                response_text = "GEO-FINANCIAL EVIDENCE ANALYSIS\n\n"
                response_text += "**OBSERVED EVIDENCE:**\n" + "\n".join(f"- {f}" for f in facts) + "\n\n"
                response_text += "**TECHNICAL ANALYSIS:**\n" + "\n".join(f"- {i}" for i in inferences) + "\n\n"
                response_text += "**INVESTIGATIVE LIMITS:**\n" + "\n".join(f"- {u}" for u in uncertainties)
                
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
        
        response_text = f"CASE {case.case_id} EVIDENCE SUMMARY\n\n"
        response_text += f"**Subject:** {case.email_subject}\n"
        response_text += f"**From:** {case.email_from}\n"
        response_text += f"**Threat Score:** {case.threat_score.overall_score} / 100 ({case.threat_score.severity})\n\n"
        response_text += "**OBSERVED EVIDENCE:**\n- " + "\n- ".join(facts)
        
        return {
            "answer": response_text,
            "facts": facts,
            "inferences": inferences,
            "uncertainties": uncertainties,
            "evidence_references": ["EV-GENERAL"]
        }

