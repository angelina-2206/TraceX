import logging
import asyncio
import uuid
import time
import json
import re
from typing import Dict, Any
from app.services.abuseipdb import AbuseIPDBClient
from app.services.ipgeolocation import IPGeolocationClient
from app.services.urlscan import URLScanClient
from app.services.virustotal import VirusTotalClient
from app.services.risk_engine import RiskEngine
from app.services import rag_retriever
from app.services.gemini_service import GeminiService
from app.services.blockchain_service import BlockchainService
from app.core.config import settings
from app.schemas.threat import UnifiedThreatReport, AggregatedIntelligence, IndicatorDetails

logger = logging.getLogger("uvicorn.error")

class ThreatAggregatorService:
    @staticmethod
    async def aggregate_intelligence(normalized: Dict[str, Any]) -> Dict[str, Any]:
        """
        Coordinates parallel lookups across the four external threat APIs,
        runs Qdrant semantic RAG retrieval, and generates a grounded Gemini
        threat intelligence analysis.
        Fails safely if individual providers or AI services crash.
        """
        investigation_id = str(uuid.uuid4())
        target_value = normalized["normalized_target"]
        indicator_type = normalized["indicator_type"]
        domain = normalized["domain"]
        ip = normalized["ip"]
        url = normalized["url"]

        logger.info(f"[ThreatAggregator] Initiating parallel lookups. investigation_id={investigation_id} target={target_value[:40]}")

        # Setup parallel tasks
        abuseipdb_task = AbuseIPDBClient.check_ip(ip) if ip else ThreatAggregatorService._empty_fallback()
        ipgeo_task = IPGeolocationClient.geolocate_ip(ip) if ip else ThreatAggregatorService._empty_fallback()
        
        urlscan_task = (
            URLScanClient.scan_url(url or target_value, domain) 
            if indicator_type in ("url", "domain") 
            else ThreatAggregatorService._empty_fallback()
        )
        
        virustotal_task = VirusTotalClient.query_indicator(target_value, indicator_type)

        start_time = time.time()

        # Run all tasks concurrently
        results = await asyncio.gather(
            abuseipdb_task,
            ipgeo_task,
            urlscan_task,
            virustotal_task,
            return_exceptions=True
        )

        duration_ms = int((time.time() - start_time) * 1000)
        logger.info(f"[ThreatAggregator] Concurrency gather complete in {duration_ms}ms")

        # Map results and catch individual errors/exceptions
        provider_names = ["abuseipdb", "ipgeolocation", "urlscan", "virustotal"]
        intel_data = {}
        provider_status = {}

        for idx, name in enumerate(provider_names):
            res = results[idx]
            
            if isinstance(res, Exception):
                logger.error(f"[ThreatAggregator] Provider '{name}' raised an unhandled exception: {str(res)}")
                intel_data[name] = {"available": False}
                provider_status[name] = "error"
            elif isinstance(res, dict) and "error" in res:
                logger.warning(f"[ThreatAggregator] Provider '{name}' returned error: {res['error']}")
                intel_data[name] = {"available": False}
                provider_status[name] = res["error"]
            else:
                intel_data[name] = res
                provider_status[name] = "success"

        # Calculate final unified risk scoring
        risk_rating = RiskEngine.calculate_risk(intel_data, provider_status)

        # RAG enrichment — gracefully skip if Qdrant is unavailable
        rag_context = None
        try:
            rag_context = rag_retriever.retrieve_for_evidence(intel_data, provider_status)
        except Exception as e:
            logger.warning(f"[ThreatAggregator] RAG enrichment failed (non-fatal): {e}")

        # Gemini AI Analysis — Grounded evidence + Qdrant RAG synthesis
        ai_analysis = ThreatAggregatorService._generate_ai_analysis(
            target=normalized["original_target"],
            indicator_type=indicator_type,
            intel_data=intel_data,
            risk_rating=risk_rating,
            rag_context=rag_context
        )

        if rag_context and ai_analysis:
            rag_context.ai_synthesis = ai_analysis

        report_dict = {
            "investigation_id": investigation_id,
            "target": normalized["original_target"],
            "indicator_type": indicator_type,
            "normalized": IndicatorDetails(**normalized),
            "intelligence": AggregatedIntelligence(**intel_data),
            "risk": risk_rating,
            "provider_status": provider_status,
            "rag": rag_context,
            "ai_analysis": ai_analysis
        }

        # Anchor final evidence payload to Polygon POS blockchain
        try:
            anchor_record = BlockchainService.anchor_evidence(normalized["original_target"], report_dict)
            report_dict["blockchain_anchor"] = anchor_record
        except Exception as e:
            logger.warning(f"[ThreatAggregator] Blockchain anchoring error (fallback mock): {e}")

        return report_dict

    @staticmethod
    def _generate_ai_analysis(
        target: str,
        indicator_type: str,
        intel_data: Dict[str, Any],
        risk_rating: Any,
        rag_context: Any
    ) -> Dict[str, Any]:
        """
        Generates a grounded forensic AI report using Gemini.
        Combines API threat intelligence, Qdrant RAG knowledge, and risk metrics.
        Fails safely to deterministic fallback if Gemini or settings.GEMINI_API_KEY is unavailable.
        """
        # Format RAG knowledge context
        rag_context_str = ""
        if rag_context and rag_context.relevant_knowledge:
            kb_blocks = []
            for idx, chunk in enumerate(rag_context.relevant_knowledge, 1):
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
                kb_blocks.append(block)
            rag_context_str = "\n".join(kb_blocks)
        else:
            rag_context_str = "[NOTICE] No relevant cybersecurity knowledge-base documents were retrieved from Qdrant."

        if settings.GEMINI_API_KEY:
            try:
                system_instructions = (
                    "You are TRACE-X, an expert cybersecurity threat intelligence analyst. "
                    "Analyze the provided threat indicator evidence (from VirusTotal, AbuseIPDB, URLScan, IPGeolocation) and retrieved knowledge base context. "
                    "Structure your analysis with:\n"
                    "- [FACT] tags for objective, observed evidence details (include source tags like [VT], [ABUSEIPDB], [URLSCAN], [IPGEO], or [KB-01]).\n"
                    "- [INFERENCE] tags for threat classifications, campaign likelihood, and risk reasoning.\n"
                    "- [UNCERTAINTY] tags for intelligence gaps or unverified claims.\n"
                    "Do not invent evidence. If evidence is insufficient, explicitly state the uncertainty."
                )

                # Format evidence summary for Gemini
                evidence_summary = {
                    "target": target,
                    "indicator_type": indicator_type,
                    "risk_score": getattr(risk_rating, "score", 0),
                    "risk_level": getattr(risk_rating, "level", "UNKNOWN"),
                    "intelligence": intel_data
                }
                case_data_str = json.dumps(evidence_summary, default=str)

                user_question = f"Provide a grounded threat investigation report for indicator target: {target} (type: {indicator_type})."

                ai_answer = GeminiService.get_completion(
                    system_instructions=system_instructions,
                    user_question=user_question,
                    case_data_str=case_data_str,
                    rag_context_str=rag_context_str
                )

                if ai_answer:
                    clean_answer = ai_answer.replace("```markdown", "").replace("```", "").strip()
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
                            
                        refs = re.findall(r"\[(VT|ABUSEIPDB|URLSCAN|IPGEO|EV-[\w\-]+|KB-\d+)\]", cleaned_line)
                        for r in refs:
                            evidence_refs.add(r)

                    if not evidence_refs:
                        evidence_refs.add("EV-INTEL-GENERATED")

                    return {
                        "answer": clean_answer,
                        "facts": facts,
                        "inferences": inferences,
                        "uncertainties": uncertainties,
                        "evidence_references": sorted(list(evidence_refs))
                    }
            except Exception as e:
                logger.warning(f"[ThreatAggregator] Gemini AI analysis fallback: {e}")

        # Deterministic Rule-Based Fallback Analysis
        risk_level = getattr(risk_rating, "level", "UNKNOWN")
        risk_score = getattr(risk_rating, "score", 0)
        facts = [f"[FACT] Indicator '{target}' evaluated with risk level {risk_level} (Score: {risk_score}/100). [EV-INTEL]"]
        
        vt = intel_data.get("virustotal", {})
        if vt.get("available") and vt.get("malicious", 0) > 0:
            facts.append(f"[FACT] VirusTotal flagged indicator with {vt['malicious']} malicious detections. [VT]")
            
        abuse = intel_data.get("abuseipdb", {})
        if abuse.get("available") and abuse.get("abuse_confidence", 0) > 0:
            facts.append(f"[FACT] AbuseIPDB reported IP abuse confidence score of {abuse['abuse_confidence']}%. [ABUSEIPDB]")

        inferences = [f"[INFERENCE] Aggregated risk score {risk_score}/100 indicates {risk_level} threat level."]
        uncertainties = ["[UNCERTAINTY] Additional sandbox detonation or live traffic monitoring required for full confirmation."]

        fallback_text = f"### THREAT INVESTIGATION ANALYSIS FOR {target}\n\n"
        fallback_text += "**OBSERVED EVIDENCE FACTS:**\n" + "\n".join(f"- {f}" for f in facts) + "\n\n"
        fallback_text += "**DERIVED INFERENCES:**\n" + "\n".join(f"- {i}" for i in inferences) + "\n\n"
        fallback_text += "**LIMITS & UNCERTAINTIES:**\n" + "\n".join(f"- {u}" for u in uncertainties)

        return {
            "answer": fallback_text,
            "facts": facts,
            "inferences": inferences,
            "uncertainties": uncertainties,
            "evidence_references": ["EV-INTEL"]
        }

    @staticmethod
    async def _empty_fallback() -> Dict[str, Any]:
        """Helper to return an immediate empty fallback for skipped providers."""
        return {"available": False}
