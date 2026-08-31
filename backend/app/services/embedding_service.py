"""
Local embedding service using sentence-transformers.
Runs BAAI/bge-small-en-v1.5 on CPU — no external API key required.
"""
import logging
from typing import List

logger = logging.getLogger("uvicorn.error")

# Module-level singleton — lazy loaded on first use
_model = None
_dimension = None


def _get_model():
    """Lazy-load the sentence-transformer model on first call."""
    global _model, _dimension
    if _model is None:
        from sentence_transformers import SentenceTransformer
        from app.core.config import settings

        model_name = settings.EMBEDDING_MODEL
        logger.info(f"[EmbeddingService] Loading model '{model_name}' (CPU)...")
        _model = SentenceTransformer(model_name, device="cpu")

        # Programmatically determine embedding dimension
        if hasattr(_model, "get_embedding_dimension"):
            _dimension = _model.get_embedding_dimension()
        else:
            _dimension = _model.get_sentence_embedding_dimension()
        logger.info(f"[EmbeddingService] Model loaded. Dimension: {_dimension}")
    return _model


def get_dimension() -> int:
    """Return the vector dimension of the loaded model."""
    global _dimension
    if _dimension is None:
        _get_model()
    return _dimension


def embed_text(text: str) -> List[float]:
    """Embed a single text string into a vector."""
    model = _get_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


def embed_documents(documents: List[str], batch_size: int = 32) -> List[List[float]]:
    """Embed a list of text strings into vectors using batched processing."""
    model = _get_model()
    vectors = model.encode(documents, batch_size=batch_size, normalize_embeddings=True, show_progress_bar=True)
    return [v.tolist() for v in vectors]
