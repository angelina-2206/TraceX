"""
RAG API endpoints for standalone knowledge search and health checks.
These are primarily for testing and debugging the retrieval layer.
"""
import logging
from fastapi import APIRouter
from app.schemas.rag import RAGSearchRequest, RAGSearchResponse, RAGHealthResponse, RAGSearchResult
from app.services import qdrant_service, rag_retriever
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

router = APIRouter()


@router.post("/rag/search", response_model=RAGSearchResponse, summary="Search cybersecurity knowledge base")
async def rag_search(payload: RAGSearchRequest):
    """
    Standalone RAG search endpoint.
    Embeds the query locally and retrieves the most relevant cybersecurity knowledge chunks from Qdrant.
    """
    results = rag_retriever.retrieve(payload.query, top_k=payload.top_k)

    return RAGSearchResponse(
        query=payload.query,
        results=results
    )


@router.get("/rag/health", response_model=RAGHealthResponse, summary="RAG subsystem health check")
async def rag_health():
    """
    Health check for the RAG subsystem.
    Reports Qdrant connectivity, collection stats, and embedding model info.
    Does not crash the API if Qdrant is unavailable.
    """
    connected = qdrant_service.is_connected()

    if not connected:
        return RAGHealthResponse(
            qdrant="unavailable",
            collection=None,
            documents=0,
            embedding_model=settings.EMBEDDING_MODEL
        )

    collection_name = settings.RAG_COLLECTION_NAME
    exists = qdrant_service.collection_exists(collection_name)

    if not exists:
        return RAGHealthResponse(
            qdrant="connected",
            collection=None,
            documents=0,
            embedding_model=settings.EMBEDDING_MODEL
        )

    info = qdrant_service.get_collection_info(collection_name)
    doc_count = info.get("points_count", 0) or 0

    return RAGHealthResponse(
        qdrant="connected",
        collection=collection_name,
        documents=doc_count,
        embedding_model=settings.EMBEDDING_MODEL
    )
