import re
from typing import List
from app.schemas.forensics import SocialEngSignal

class SocialEngEngineService:
    # Pattern dictionaries for social engineering categories
    CATEGORIES = {
        "Urgent Payment Request": {
            "patterns": [r"urgent", r"immediately", r"within 24 hours", r"before end of day", r"wire transfer", r"immediate payment", r"overdue invoice"],
            "severity": "HIGH",
            "base_score": 85.0
        },
        "Executive Authority Pressure": {
            "patterns": [r"ceo", r"cfo", r"director", r"confidential request", r"do not discuss", r"per my conversation", r"exec approval"],
            "severity": "HIGH",
            "base_score": 80.0
        },
        "Account Suspension Threat": {
            "patterns": [r"account suspended", r"termination", r"legal action", r"access revoked", r"security compromise", r"unauthorized login"],
            "severity": "HIGH",
            "base_score": 90.0
        },
        "Payment Redirection / IFSC Change": {
            "patterns": [r"new bank account", r"updated account details", r"ifsc", r"beneficiary", r"wire to new account", r"routing number"],
            "severity": "HIGH",
            "base_score": 95.0
        },
        "Credential Harvesting": {
            "patterns": [r"verify your password", r"login to continue", r"click here to confirm", r"update credentials", r"sso authentication"],
            "severity": "HIGH",
            "base_score": 88.0
        }
    }

    @staticmethod
    def analyze_social_engineering(body_text: str) -> List[SocialEngSignal]:
        """
        Analyzes email body text line by line, detecting social engineering attack techniques
        and mapping them directly to the line snippet evidence.
        """
        signals: List[SocialEngSignal] = []
        lines = body_text.splitlines()
        
        detected_categories = set()
        
        for category, info in SocialEngEngineService.CATEGORIES.items():
            for line_idx, line in enumerate(lines, start=1):
                clean_line = line.strip()
                if not clean_line or category in detected_categories:
                    continue
                    
                for pattern in info["patterns"]:
                    if re.search(pattern, clean_line, re.IGNORECASE):
                        signals.append(SocialEngSignal(
                            category=category,
                            severity=info["severity"],
                            score=info["base_score"],
                            evidence_quote=clean_line[:120],
                            line_number=line_idx
                        ))
                        detected_categories.add(category)
                        break
                        
        if not signals:
            # Add low baseline if clean
            signals.append(SocialEngSignal(
                category="Standard Business Communication",
                severity="LOW",
                score=10.0,
                evidence_quote="No aggressive social engineering indicators detected in email body text.",
                line_number=1
            ))
            
        return signals
