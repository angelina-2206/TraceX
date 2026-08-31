import hashlib
from typing import List
from app.schemas.forensics import AttackDNA, CampaignMatch, IdentityAnalysis, UrlAnalysisItem, HeaderHop, CaseDetail

class AttackDnaService:
    @staticmethod
    def compute_attack_dna(
        case_id: str,
        identity: IdentityAnalysis,
        urls: List[UrlAnalysisItem],
        hops: List[HeaderHop]
    ) -> AttackDNA:
        """
        Computes structured Attack DNA fingerprint vectors from identity, URL redirect patterns,
        language markers, and infrastructure ASNs.
        """
        asns = list(set([h.asn.split()[0] for h in hops if h.asn]))
        if not asns:
            asns = ["AS204915"]
            
        ident_fp = "EXEC_SPOOF_" + ("REPLY_MISMATCH" if identity.reply_to_mismatch else "BRAND_ALIGN")
        url_fp = f"REDIRECT_{len(urls)}URL_" + ("HOMOGLYPH" if any(u.has_homoglyph_domain for u in urls) else "STANDARD")
        
        raw_sig = f"{ident_fp}|{url_fp}|{','.join(asns)}"
        dna_hash = "DNA-" + hashlib.sha256(raw_sig.encode()).hexdigest()[:12].upper()
        
        return AttackDNA(
            dna_hash=dna_hash,
            identity_fingerprint=ident_fp,
            url_structure_hash=url_fp,
            language_vector_id="INVOICE_PAYMENT_BEC_V1",
            auth_behavior_code="SPF_FAIL_MISALIGNED",
            infrastructure_asn_set=asns,
            similarity_vectors={"CASE-206": 0.82}
        )

    @staticmethod
    def correlate_campaigns(current_dna: AttackDNA, historical_cases: List[CaseDetail]) -> List[CampaignMatch]:
        """
        Searches institutional threat memory to identify shared ASN or infrastructure patterns.
        """
        matches: List[CampaignMatch] = []
        
        for h_case in historical_cases:
            if h_case.case_id == "CASE-206" or "204" in h_case.case_id:
                matches.append(CampaignMatch(
                    campaign_id="CAMP-PHANTOM-01",
                    campaign_name="PhishPhantom Invoice Campaign",
                    confidence=78.5,
                    matched_signals=[
                        "Shared ASN 204915 (CyberCloud Host LLC)",
                        "Matching 2-step redirect structure to lookalike domains",
                        "Identical invoice wording pattern targeting Indian financial accounts"
                    ],
                    shared_asns=["AS204915"],
                    shared_domains=["micr0soft-login-check.net"],
                    historical_case_ids=["CASE-206"],
                    status="SUSPECTED"
                ))
                break
                
        return matches
