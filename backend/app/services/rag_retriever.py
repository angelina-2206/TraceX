"""
RAG Retriever — Semantic search over the TRACE-X cybersecurity knowledge base.
Provides both standalone query search and evidence-aware retrieval
for integration with the threat investigation pipeline.
"""
import logging
from typing import Dict, Any, List, Optional

from app.services import embedding_service, qdrant_service
from app.services.evidence_query_builder import build_queries_from_evidence
from app.schemas.rag import RAGSearchResult, InvestigationRAGContext

logger = logging.getLogger("uvicorn.error")


def retrieve(query: str, top_k: int = 5) -> List[RAGSearchResult]:
    """
    Embed a query and retrieve the top-K most relevant knowledge chunks.
    Returns structured results with full source attribution.
    """
    try:
        vector = embedding_service.embed_text(query)
        raw_results = qdrant_service.search(vector, top_k=top_k)

        results = []
        for r in raw_results:
            results.append(RAGSearchResult(
                score=r.get("score", 0.0),
                text=r.get("text", ""),
                title=r.get("title", ""),
                category=r.get("category", ""),
                source=r.get("source", "TRACE-X Knowledge Base"),
                document_id=r.get("document_id", ""),
                chunk_id=r.get("chunk_id", ""),
                technique_id=r.get("technique_id"),
            ))
        return results
    except Exception as e:
        logger.error(f"[RAGRetriever] Retrieval failed: {e}")
        return []


def retrieve_for_evidence(
    intel_data: Dict[str, Any],
    provider_status: Dict[str, str],
    top_k: int = 5
) -> Optional[InvestigationRAGContext]:
    """
    Evidence-aware retrieval: transforms API intelligence into semantic queries,
    runs multiple searches, deduplicates, and returns the best results.

    Returns None if RAG is entirely unavailable.
    """
    try:
        # Check Qdrant connectivity first
        if not qdrant_service.is_connected():
            logger.warning("[RAGRetriever] Qdrant unavailable — skipping RAG enrichment.")
            return None

        if not qdrant_service.collection_exists():
            logger.warning("[RAGRetriever] Knowledge collection not found — skipping RAG enrichment.")
            return None

        # Build targeted queries from evidence
        queries = build_queries_from_evidence(intel_data, provider_status)
        logger.info(f"[RAGRetriever] Generated {len(queries)} evidence queries.")

        # Run each query and collect results
        all_results: Dict[str, RAGSearchResult] = {}  # keyed by chunk_id for dedup

        for query in queries:
            results = retrieve(query, top_k=top_k)
            for r in results:
                # Keep the highest-scoring version of each chunk
                if r.chunk_id not in all_results or r.score > all_results[r.chunk_id].score:
                    all_results[r.chunk_id] = r

        # Sort by score descending and take top_k
        sorted_results = sorted(all_results.values(), key=lambda x: x.score, reverse=True)[:top_k]

        return InvestigationRAGContext(
            queries=queries,
            relevant_knowledge=sorted_results
        )

    except Exception as e:
        logger.error(f"[RAGRetriever] Evidence retrieval failed: {e}")
        return None
