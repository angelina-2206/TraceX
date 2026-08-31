"""
Automated unit and integration test suite for the TRACE-X RAG knowledge layer.
Tests embeddings, chunking, Qdrant service integration, evidence-aware retrieval,
and investigate endpoint integration.
"""
import sys
import os
import asyncio

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services import embedding_service, qdrant_service, document_ingestion, rag_retriever
from app.services.evidence_query_builder import build_queries_from_evidence
from app.utils.indicators import extract_and_normalize_target
from app.services.threat_aggregator import ThreatAggregatorService


def test_embeddings():
    print("Running Test: Local Embeddings...")
    
    # Check dimension
    dim = embedding_service.get_dimension()
    assert dim == 384, f"Expected 384 dimensions for bge-small-en-v1.5, got {dim}"
    
    # Test single embedding
    vec = embedding_service.embed_text("Test query for credential phishing")
    assert len(vec) == 384
    assert isinstance(vec[0], float)
    
    # Test determinism
    vec2 = embedding_service.embed_text("Test query for credential phishing")
    assert vec == vec2, "Embeddings are not deterministic"
    
    # Test batch embedding
    vecs = embedding_service.embed_documents(["First document text", "Second document text"])
    assert len(vecs) == 2
    assert len(vecs[0]) == 384
    assert len(vecs[1]) == 384
    
    print("[OK] Local Embeddings tests passed!")


def test_chunking():
    print("Running Test: Document Chunking...")
    
    # Mock documents
    docs = [
        {
            "document_id": "test-doc-001",
            "title": "Short Doc",
            "category": "test",
            "source": "Test Source",
            "technique_id": "T1234",
            "text": "This is a very short document with just one paragraph."
        },
        {
            "document_id": "test-doc-002",
            "title": "Long Doc",
            "category": "test",
            "source": "Test Source",
            "technique_id": "T5678",
            "text": "\n\n".join([f"This is paragraph {i}. It contains some text that goes on for a bit to simulate a longer knowledge document." for i in range(10)])
        },
        {
            "document_id": "test-doc-003",
            "title": "Empty Doc",
            "category": "test",
            "source": "Test Source",
            "technique_id": None,
            "text": ""
        }
    ]
    
    chunks = document_ingestion.chunk_documents(docs)
    
    # Empty doc should be ignored
    doc_ids = [c["document_id"] for c in chunks]
    assert "test-doc-003" not in doc_ids
    
    # Short doc should have exactly 1 chunk
    short_chunks = [c for c in chunks if c["document_id"] == "test-doc-001"]
    assert len(short_chunks) == 1
    assert short_chunks[0]["title"] == "Short Doc"
    assert short_chunks[0]["technique_id"] == "T1234"
    assert "one paragraph" in short_chunks[0]["text"]
    
    # Long doc should chunk successfully and preserve metadata
    long_chunks = [c for c in chunks if c["document_id"] == "test-doc-002"]
    assert len(long_chunks) >= 1
    assert long_chunks[0]["title"] == "Long Doc"
    assert long_chunks[0]["technique_id"] == "T5678"
    assert long_chunks[0]["qdrant_id"] is not None
    
    print("[OK] Document Chunking tests passed!")


def test_evidence_query_builder():
    print("Running Test: Evidence Query Builder...")
    
    # 1. High risk IP evidence
    ip_intel = {
        "abuseipdb": {"available": True, "found": True, "abuse_confidence": 87, "usage_type": "Hosting Provider"},
        "ipgeolocation": {"available": True, "isp": "DigitalOcean VPS"},
        "virustotal": {"available": True, "malicious": 5, "categories": ["botnet", "c2"]}
    }
    status = {"abuseipdb": "success", "ipgeolocation": "success", "virustotal": "success"}
    queries = build_queries_from_evidence(ip_intel, status)
    
    # Should generate queries about IP abuse, hosting/vps, and C2/malicious indicators
    assert len(queries) >= 2
    query_str = " ".join(queries).lower()
    assert "ip address abuse" in query_str or "vps hosting" in query_str
    
    # 2. Phishing URL evidence
    url_intel = {
        "urlscan": {"available": True, "redirects": ["http://a.com", "http://b.com"], "page_title": "Microsoft Login"},
        "virustotal": {"available": True, "malicious": 8, "categories": ["phishing"]}
    }
    queries_url = build_queries_from_evidence(url_intel, status)
    assert len(queries_url) >= 2
    query_str_url = " ".join(queries_url).lower()
    assert "redirect" in query_str_url
    assert "phishing" in query_str_url
    
    print("[OK] Evidence Query Builder tests passed!")


def test_qdrant_and_semantic_search():
    print("Running Test: Qdrant Connectivity and Search...")
    
    # Check connection
    assert qdrant_service.is_connected(), "Qdrant is not running or unreachable"
    
    # Verify collection exists
    assert qdrant_service.collection_exists(), "Knowledge collection 'tracex_knowledge' does not exist. Run scripts/ingest_knowledge.py first."
    
    # Run test search
    vector = embedding_service.embed_text("credential phishing login page")
    results = qdrant_service.search(vector, top_k=3)
    
    assert len(results) > 0, "No results returned from Qdrant search"
    assert results[0]["score"] > 0.0
    assert "text" in results[0]
    assert "title" in results[0]
    
    # Semantic Quality Test: Querying credential phishing should return phishing-related documents
    res_titles = [r["title"].lower() for r in results]
    res_cats = [r["category"].lower() for r in results]
    assert any("phishing" in t or "phishing" in c for t, c in zip(res_titles, res_cats)), f"Semantic search failed to locate phishing documents. Titles: {res_titles}"
    
    print("[OK] Qdrant and Semantic Search tests passed!")


async def test_investigation_integration():
    print("Running Test: Investigation Pipeline Integration...")
    
    # Normalize IP indicator
    normalized = extract_and_normalize_target("185.220.101.45")
    
    # Run threat aggregator (which now includes RAG)
    report = await ThreatAggregatorService.aggregate_intelligence(normalized)
    
    # Verify investigation ID and aggregator values
    assert report["investigation_id"] is not None
    assert report["risk"] is not None
    
    # Verify RAG enrichment block exists in the response
    assert "rag" in report
    rag_context = report["rag"]
    assert rag_context is not None, "RAG enrichment was skipped or failed"
    
    # Verify generated queries and retrieved knowledge
    assert len(rag_context.queries) > 0, "No RAG queries generated"
    assert len(rag_context.relevant_knowledge) > 0, "No relevant knowledge retrieved"
    
    # Verify full source attribution on retrieved chunks
    chunk = rag_context.relevant_knowledge[0]
    assert chunk.score > 0.0
    assert chunk.title != ""
    assert chunk.category != ""
    assert chunk.source == "TRACE-X Knowledge Base"
    assert chunk.document_id != ""
    assert chunk.chunk_id != ""
    
    print("[OK] Investigation Pipeline Integration tests passed!")


async def run_all():
    test_embeddings()
    test_chunking()
    test_evidence_query_builder()
    test_qdrant_and_semantic_search()
    await test_investigation_integration()
    print("\nALL RAG SUBSYSTEM AND INTEGRATION TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(run_all())
