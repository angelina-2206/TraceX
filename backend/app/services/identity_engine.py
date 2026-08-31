import re
from typing import Dict, Any, List
from app.schemas.forensics import IdentityAnalysis

class IdentityEngineService:
    # Target executive / brand names for impersonation detection
    TARGET_BRANDS = [
        "microsoft", "google", "paypal", "state bank of india", "sbi", "hdfc bank",
        "icici bank", "cfo", "chief executive officer", "finance team", "vendor portal",
        "accounts payable", "hr department"
    ]
    
    # Common homoglyph character substitutions (Cyrillic/Greek lookalikes for ASCII)
    HOMOGLYPH_MAP = {
        'о': 'o', 'а': 'a', 'е': 'e', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
        '0': 'o', '1': 'l', '3': 'e', '5': 's', '8': 'b'
    }

    @staticmethod
    def analyze_identity(
        from_str: str,
        reply_to: str = None,
        return_path: str = None,
        auth_aligned: bool = False
    ) -> IdentityAnalysis:
        """
        Analyzes sender display name, email address, reply-to, and return-path for identity deception.
        Calculates Deception Score (0-100) and extracts deception factors.
        """
        display_name = ""
        sender_email = from_str
        
        # Extract display name and email address from "Display Name <email@domain.com>"
        match = re.match(r'^(.*?)\s*<([^>]+)>$', from_str)
        if match:
            display_name = match.group(1).strip('"\' ')
            sender_email = match.group(2).strip()
        else:
            display_name = sender_email.split('@')[0] if '@' in sender_email else sender_email

        domain = sender_email.split('@')[1] if '@' in sender_email else ""
        
        deception_score = 0.0
        factors: List[str] = []
        lookalike_detected = False
        homoglyph_detected = False
        reply_to_mismatch = False
        return_path_mismatch = False
        typosquat_domain = None
        claimed_brand = None
        
        # 1. Display Name Spoofing / Impersonation Check
        disp_lower = display_name.lower()
        for brand in IdentityEngineService.TARGET_BRANDS:
            if brand in disp_lower and brand not in domain.lower():
                deception_score += 35.0
                claimed_brand = brand.title()
                factors.append(f"Display name claims identity as '{brand.title()}' but domain is '{domain}'")
                break
                
        # 2. Typosquatting / Homoglyph Detection in Domain
        for sub, orig in IdentityEngineService.HOMOGLYPH_MAP.items():
            if sub in domain:
                homoglyph_detected = True
                deception_score += 25.0
                factors.append(f"Homoglyph / character substitution detected in domain '{domain}' (contains '{sub}')")
                break
                
        # Check for lookalike domains (e.g. micr0soft, g00gle, sbi-update-login)
        if any(keyword in domain.lower() for keyword in ["login", "verify", "secure", "update", "check", "alert", "billing"]):
            if any(brand in domain.lower() for brand in ["micro", "soft", "sbi", "hdfc", "bank", "pay"]):
                lookalike_detected = True
                typosquat_domain = domain
                deception_score += 20.0
                factors.append(f"Domain '{domain}' uses a brand lookalike pattern combined with high-risk keywords")

        # 3. Reply-To Mismatch Analysis
        if reply_to:
            reply_domain = reply_to.split('@')[1] if '@' in reply_to else reply_to
            if reply_domain.lower() != domain.lower():
                reply_to_mismatch = True
                deception_score += 25.0
                factors.append(f"Reply-To domain '{reply_domain}' differs from visible sender domain '{domain}'")

        # 4. Return-Path Mismatch Analysis
        if return_path:
            return_domain = return_path.split('@')[1] if '@' in return_path else return_path
            if return_domain.lower() != domain.lower():
                return_path_mismatch = True
                deception_score += 15.0
                factors.append(f"Return-Path domain '{return_domain}' differs from sender domain '{domain}'")

        # 5. Authentication Misalignment Penalty
        if not auth_aligned:
            deception_score += 15.0
            factors.append("Sender infrastructure failed SPF/DKIM/DMARC domain alignment checks")

        deception_score = min(100.0, max(0.0, deception_score))
        
        return IdentityAnalysis(
            display_name=display_name or "Unknown Sender",
            sender_email=sender_email,
            reply_to=reply_to,
            return_path=return_path,
            claimed_brand=claimed_brand,
            lookalike_detected=lookalike_detected,
            homoglyph_detected=homoglyph_detected,
            typosquat_domain=typosquat_domain,
            reply_to_mismatch=reply_to_mismatch,
            return_path_mismatch=return_path_mismatch,
            deception_score=deception_score,
            deception_factors=factors
        )
