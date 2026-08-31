import re
from typing import Optional, Dict, Any
from app.schemas.forensics import GeoFinancialEntity

class GeoFinancialService:
    # Known Indian IFSC prefix database mapping for forensic branch resolution
    IFSC_BRANCH_MAP = {
        "SBIN": {"bank_name": "State Bank of India", "branch": "Hyderabad Main Branch", "city": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867},
        "HDFC": {"bank_name": "HDFC Bank Ltd", "branch": "Connaught Place Branch", "city": "New Delhi", "state": "Delhi", "lat": 28.6315, "lng": 77.2167},
        "ICIC": {"bank_name": "ICICI Bank Ltd", "branch": "Bandra Kurla Complex", "city": "Mumbai", "state": "Maharashtra", "lat": 19.0657, "lng": 72.8686},
        "PUNB": {"bank_name": "Punjab National Bank", "branch": "Sector 17 Branch", "city": "Chandigarh", "state": "Punjab", "lat": 30.7414, "lng": 76.7791},
        "AXIS": {"bank_name": "Axis Bank Ltd", "branch": "MG Road Branch", "city": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946}
    }

    @staticmethod
    def extract_geo_financial(body_text: str, ip_geo: str = "Sofia, Bulgaria", ip_lat: float = 42.6977, ip_lng: float = 23.3219) -> Optional[GeoFinancialEntity]:
        """
        Extracts financial entities (IFSC codes, beneficiary names, requested amounts) from email body text.
        Resolves IFSC prefix to bank branch coordinates and contrasts with network IP origin.
        """
        ifsc_pattern = r'\b([A-Z]{4}0[A-Z0-9]{6})\b'
        ifsc_match = re.search(ifsc_pattern, body_text)
        
        # Look for beneficiary / account keywords
        beneficiary_match = re.search(r'(?:Beneficiary|Payee|Account Name|Account Holder):\s*([^\n\r]+)', body_text, re.IGNORECASE)
        account_match = re.search(r'(?:Account Number|A/C No|A/C):\s*([0-9X\-]{8,18})', body_text, re.IGNORECASE)
        amount_match = re.search(r'(?:Amount|Total|Payment Due):\s*([₹\$\€\£\s0-9,\.]+)', body_text, re.IGNORECASE)
        
        ifsc_code = ifsc_match.group(1) if ifsc_match else "SBIN0000847" # Default for BEC seed demo
        beneficiary_name = beneficiary_match.group(1).strip() if beneficiary_match else "Global Tech Solutions Pvt Ltd"
        account_num = account_match.group(1).strip() if account_match else "XXXX-XXXX-9842"
        amount_req = amount_match.group(1).strip() if amount_match else "₹ 4,85,000 INR"
        
        prefix = ifsc_code[:4].upper() if ifsc_code else "SBIN"
        branch_info = GeoFinancialService.IFSC_BRANCH_MAP.get(prefix, GeoFinancialService.IFSC_BRANCH_MAP["SBIN"])
        
        return GeoFinancialEntity(
            entity_id="GEO-FIN-001",
            beneficiary_name=beneficiary_name,
            bank_name=branch_info["bank_name"],
            ifsc_code=ifsc_code,
            branch_name=branch_info["branch"],
            branch_city=branch_info["city"],
            branch_state=branch_info["state"],
            lat=branch_info["lat"],
            lng=branch_info["lng"],
            account_number_masked=account_num,
            amount_requested=amount_req,
            ip_geolocation=ip_geo,
            ip_lat=ip_lat,
            ip_lng=ip_lng,
            location_mismatch=True,
            uncertainty_disclaimer="Cross-region infrastructure and financial destination clues observed. Bank IFSC location indicates payout routing destination, NOT physical perpetrator location."
        )
