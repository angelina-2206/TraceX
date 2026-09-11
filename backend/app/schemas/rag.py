from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any


class RAGSearchRequest(BaseModel):
    """Request body for standalone RAG search."""
    query: str = Field(..., description="Natural language query to search the cybersecurity knowledge base.")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of results to return.")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "query": "What does a suspicious login page with multiple redirects indicate?",
                "top_k": 5
            }
        }
    )


class RAGSearchResult(BaseModel):
    """A single retrieved knowledge chunk with full source attribution."""
    score: float = Field(..., description="Cosine similarity score (0-1). This is NOT a confidence score.")
    text: str
    title: str
    category: str
    source: str = "TRACE-X Knowledge Base"
    document_id: str
    chunk_id: str
    technique_id: Optional[str] = None


class RAGSearchResponse(BaseModel):
    """Response from the standalone RAG search endpoint."""
    query: str
    results: List[RAGSearchResult] = Field(default_factory=list)


class RAGHealthResponse(BaseModel):
    """Health check response for the RAG subsystem."""
    qdrant: str  # "connected" or "unavailable"
    collection: Optional[str] = None
    documents: int = 0
    embedding_model: str = ""


class InvestigationRAGContext(BaseModel):
    """
    RAG context attached to an investigation response.
    Separates observed evidence queries from retrieved knowledge.
    """
    queries: List[str] = Field(default_factory=list, description="Semantic queries derived from the observed evidence.")
    relevant_knowledge: List[RAGSearchResult] = Field(default_factory=list, description="Retrieved cybersecurity knowledge chunks.")
    ai_synthesis: Optional[Dict[str, Any]] = Field(default=None, description="Grounded Gemini analysis of threat evidence + RAG knowledge.")
