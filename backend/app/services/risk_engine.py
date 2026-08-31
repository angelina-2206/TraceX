import logging
from typing import Dict, Any, List
from app.schemas.threat import RiskEngineRating, RiskEngineFactor

logger = logging.getLogger("uvicorn.error")

class RiskEngine:
    @staticmethod
    def calculate_risk(intel: Dict[str, Any], provider_status: Dict[str, str]) -> RiskEngineRating:
        """
        Calculates a transparent, rule-based risk score (0-100) based on gathered evidence.
        Provides a detailed breakdown of factors and their associated weights.
        """
        factors: List[RiskEngineFactor] = []
        
        vt = intel.get("virustotal", {})
        abuse = intel.get("abuseipdb", {})
        urlscan = intel.get("urlscan", {})
        
        # 1. Rule: VirusTotal malicious vendor detections
        if vt and vt.get("available") and vt.get("malicious", 0) > 0:
            malicious = vt["malicious"]
            weight = min(40, malicious * 5)
            factors.append(RiskEngineFactor(
                source="VirusTotal",
                reason=f"{malicious} security vendors classified the indicator as malicious.",
                weight=weight
            ))
            
        # 2. Rule: VirusTotal negative reputation score
        if vt and vt.get("available") and vt.get("reputation", 0) < 0:
            rep = vt["reputation"]
            weight = min(15, abs(rep) * 2)
            factors.append(RiskEngineFactor(
                source="VirusTotal",
                reason=f"Community reputation score is negative ({rep}).",
                weight=weight
            ))

        # 3. Rule: AbuseIPDB abuse confidence score
        if abuse and abuse.get("available") and abuse.get("found") and abuse.get("abuse_confidence", 0) > 0:
            confidence = abuse["abuse_confidence"]
            weight = min(30, int(confidence * 0.35))
            factors.append(RiskEngineFactor(
                source="AbuseIPDB",
                reason=f"IP has an abuse confidence score of {confidence}%.",
                weight=weight
            ))

        # 4. Rule: AbuseIPDB volume of abuse reports
        if abuse and abuse.get("available") and abuse.get("found") and abuse.get("total_reports", 0) > 5:
            reports = abuse["total_reports"]
            weight = min(10, int(reports * 0.1))
            factors.append(RiskEngineFactor(
                source="AbuseIPDB",
                reason=f"IP has been reported {reports} times for active spam or attacks.",
                weight=weight
            ))

        # 5. Rule: URLScan Redirect hops
        if urlscan and urlscan.get("available") and urlscan.get("redirects") and len(urlscan["redirects"]) > 1:
            redirects_count = len(urlscan["redirects"])
            weight = min(15, redirects_count * 5)
            factors.append(RiskEngineFactor(
                source="URLScan",
                reason=f"URL exhibited multiple redirect hops ({redirects_count}).",
                weight=weight
            ))

        # Calculate final aggregated score
        total_score = sum(f.weight for f in factors)
        total_score = min(100, max(0, total_score))

        # Determine Risk Level classification
        level = "CLEAN"
        if total_score >= 80:
            level = "CRITICAL"
        elif total_score >= 50:
            level = "HIGH"
        elif total_score >= 20:
            level = "SUSPICIOUS"

        # Check if we have any data at all to make a decision
        active_providers = [p for p, status in provider_status.items() if status == "success"]
        
        # If all API queries failed or returned unavailable, mark UNKNOWN
        has_any_data = any(
            intel.get(prov, {}).get("available")
            for prov in ("virustotal", "abuseipdb", "urlscan", "ipgeolocation")
        )
        
        if not has_any_data or not active_providers:
            level = "UNKNOWN"
            total_score = 0
            confidence = 0
        else:
            # Confidence based on quantity of active data sources
            provider_count = len(active_providers)
            if provider_count == 4:
                confidence = 95
            elif provider_count == 3:
                confidence = 75
            elif provider_count == 2:
                confidence = 50
            else:
                confidence = 25

        return RiskEngineRating(
            score=total_score,
            level=level,
            confidence=confidence,
            factors=factors
        )
