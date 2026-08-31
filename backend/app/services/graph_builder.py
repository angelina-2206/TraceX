from typing import List, Dict, Any
from app.schemas.forensics import (
    AttackGraphData, GraphNode, GraphEdge, IdentityAnalysis,
    UrlAnalysisItem, HeaderHop, GeoFinancialEntity, CampaignMatch
)

class GraphBuilderService:
    @staticmethod
    def build_attack_graph(
        case_id: str,
        sender_email: str,
        identity: IdentityAnalysis,
        hops: List[HeaderHop],
        urls: List[UrlAnalysisItem],
        geo_fin: GeoFinancialEntity,
        campaigns: List[CampaignMatch]
    ) -> AttackGraphData:
        """
        Constructs typed nodes and directional relationships for the interactive investigation canvas.
        Every relationship links back to a verifiable evidence ID.
        """
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []
        
        # 1. Primary Email Node
        email_node_id = f"node_email_{case_id}"
        nodes.append(GraphNode(
            id=email_node_id,
            label=f"Email: {case_id}",
            type="EMAIL",
            details={"case_id": case_id, "subject": "Urgent Invoice Payment"},
            severity="HIGH"
        ))

        # 2. Claimed Identity & Actual Sender Domain
        sender_domain = sender_email.split('@')[1] if '@' in sender_email else "unknown.com"
        ident_node_id = f"node_ident_{sender_domain}"
        nodes.append(GraphNode(
            id=ident_node_id,
            label=f"Sender: {sender_email}",
            type="IDENTITY",
            details={"display_name": identity.display_name, "email": sender_email},
            severity="HIGH" if identity.deception_score > 50 else "INFO"
        ))
        
        edges.append(GraphEdge(
            id="edge_email_sent_by",
            source=email_node_id,
            target=ident_node_id,
            relationship="SENT_BY",
            confidence=1.0,
            evidence_id="EV-HEADER-01"
        ))

        # 3. Claimed Brand (if impersonation)
        if identity.claimed_brand:
            brand_node_id = f"node_brand_{identity.claimed_brand.lower()}"
            nodes.append(GraphNode(
                id=brand_node_id,
                label=f"Claimed: {identity.claimed_brand}",
                type="IDENTITY",
                details={"brand": identity.claimed_brand, "spoofed": True},
                severity="WARNING"
            ))
            edges.append(GraphEdge(
                id="edge_claims_brand",
                source=ident_node_id,
                target=brand_node_id,
                relationship="CLAIMS_TO_BE",
                confidence=0.95,
                evidence_id="EV-ID-SPOOF"
            ))

        # 4. Reply-To Domain (if mismatch)
        if identity.reply_to:
            reply_domain = identity.reply_to.split('@')[1] if '@' in identity.reply_to else identity.reply_to
            reply_node_id = f"node_domain_{reply_domain}"
            nodes.append(GraphNode(
                id=reply_node_id,
                label=f"Reply-To: {reply_domain}",
                type="DOMAIN",
                details={"domain": reply_domain, "mismatch": identity.reply_to_mismatch},
                severity="HIGH" if identity.reply_to_mismatch else "INFO"
            ))
            edges.append(GraphEdge(
                id="edge_reply_to",
                source=email_node_id,
                target=reply_node_id,
                relationship="REPLY_TO",
                confidence=1.0,
                evidence_id="EV-REPLY-01"
            ))

        # 5. Header Hops & Relay IPs
        for hop in hops:
            ip_node_id = f"node_ip_{hop.ip}"
            nodes.append(GraphNode(
                id=ip_node_id,
                label=f"Relay IP: {hop.ip}",
                type="IP",
                details={"ip": hop.ip, "asn": hop.asn, "isp": hop.isp, "location": hop.geo_location},
                severity="HIGH" if hop.is_suspicious else "INFO"
            ))
            edges.append(GraphEdge(
                id=f"edge_hop_{hop.hop_index}",
                source=email_node_id,
                target=ip_node_id,
                relationship="ROUTED_THROUGH",
                confidence=1.0,
                evidence_id=f"EV-HOP-{hop.hop_index}"
            ))

        # 6. URLs & Redirect Chain Nodes
        for url_item in urls:
            url_node_id = f"node_url_{url_item.url_id}"
            nodes.append(GraphNode(
                id=url_node_id,
                label=f"URL: {url_item.domain}",
                type="URL",
                details={"url": url_item.original_url, "final_url": url_item.final_url},
                severity="HIGH" if url_item.reputation_score > 50 else "INFO"
            ))
            edges.append(GraphEdge(
                id=f"edge_contains_url_{url_item.url_id}",
                source=email_node_id,
                target=url_node_id,
                relationship="CONTAINS",
                confidence=1.0,
                evidence_id=url_item.evidence_id
            ))
            
            # Destination domain node
            final_domain = url_item.final_url.split('/')[2] if '/' in url_item.final_url else url_item.domain
            dest_domain_node_id = f"node_domain_{final_domain}"
            nodes.append(GraphNode(
                id=dest_domain_node_id,
                label=f"Domain: {final_domain}",
                type="DOMAIN",
                details={"domain": final_domain, "lookalike": url_item.has_homoglyph_domain},
                severity="CRITICAL"
            ))
            edges.append(GraphEdge(
                id=f"edge_redirect_{url_item.url_id}",
                source=url_node_id,
                target=dest_domain_node_id,
                relationship="REDIRECTS_TO",
                confidence=0.98,
                evidence_id=url_item.evidence_id
            ))

        # 7. Geo-Financial Entities
        if geo_fin:
            bank_node_id = f"node_bank_{geo_fin.ifsc_code}"
            nodes.append(GraphNode(
                id=bank_node_id,
                label=f"Bank: {geo_fin.bank_name} ({geo_fin.ifsc_code})",
                type="BANK_ENTITY",
                details={"beneficiary": geo_fin.beneficiary_name, "branch": geo_fin.branch_name, "ifsc": geo_fin.ifsc_code},
                severity="WARNING"
            ))
            edges.append(GraphEdge(
                id="edge_payment_request",
                source=email_node_id,
                target=bank_node_id,
                relationship="REQUESTS_PAYMENT_TO",
                confidence=1.0,
                evidence_id="EV-GEO-FIN-01"
            ))

        # 8. Historical Campaign Node
        for camp in campaigns:
            camp_node_id = f"node_camp_{camp.campaign_id}"
            nodes.append(GraphNode(
                id=camp_node_id,
                label=f"Campaign: {camp.campaign_name}",
                type="CAMPAIGN",
                details={"campaign_name": camp.campaign_name, "confidence": camp.confidence},
                severity="HIGH"
            ))
            edges.append(GraphEdge(
                id=f"edge_part_of_camp_{camp.campaign_id}",
                source=email_node_id,
                target=camp_node_id,
                relationship="PART_OF_CAMPAIGN",
                confidence=camp.confidence / 100.0,
                evidence_id="EV-CAMP-MATCH-01"
            ))

        return AttackGraphData(nodes=nodes, edges=edges)
