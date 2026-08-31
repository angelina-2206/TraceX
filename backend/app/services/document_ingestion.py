"""
Document ingestion pipeline.
Loads cybersecurity knowledge files, chunks them, and prepares them for embedding + Qdrant upsert.
Supports: .md, .txt, .json, .csv
"""
import os
import re
import json
import csv
import uuid
import hashlib
import logging
from typing import List, Dict, Any, Optional

import yaml

from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

# Default knowledge directory
KNOWLEDGE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data", "knowledge"
)


def _deterministic_uuid(text: str) -> str:
    """Generate a deterministic UUID from a string for idempotent ingestion."""
    return str(uuid.uuid5(uuid.NAMESPACE_URL, text))


def _parse_frontmatter(content: str) -> tuple:
    """
    Extract YAML frontmatter from markdown content.
    Returns (metadata_dict, body_text).
    """
    frontmatter_pattern = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)
    match = frontmatter_pattern.match(content)
    if match:
        try:
            metadata = yaml.safe_load(match.group(1))
            body = content[match.end():]
            return metadata or {}, body
        except yaml.YAMLError:
            return {}, content
    return {}, content


def _chunk_text(text: str, chunk_size: int = None, chunk_overlap: int = None) -> List[str]:
    """
    Split text into chunks by token-approximate boundaries.
    Uses whitespace-split word counting as a proxy for tokens.
    Respects paragraph boundaries where possible.
    """
    chunk_size = chunk_size or settings.RAG_CHUNK_SIZE
    chunk_overlap = chunk_overlap or settings.RAG_CHUNK_OVERLAP

    # Split into paragraphs first to avoid breaking mid-thought
    paragraphs = re.split(r"\n\s*\n", text.strip())
    
    chunks = []
    current_chunk_words = []
    current_word_count = 0

    for para in paragraphs:
        para_words = para.split()
        para_word_count = len(para_words)

        # If adding this paragraph would exceed chunk_size, finalize current chunk
        if current_word_count + para_word_count > chunk_size and current_word_count > 0:
            chunks.append(" ".join(current_chunk_words))
            # Keep overlap from the end of the current chunk
            overlap_words = current_chunk_words[-chunk_overlap:] if chunk_overlap > 0 else []
            current_chunk_words = overlap_words + para_words
            current_word_count = len(current_chunk_words)
        else:
            current_chunk_words.extend(para_words)
            current_word_count += para_word_count

    # Don't forget the last chunk
    if current_chunk_words:
        chunks.append(" ".join(current_chunk_words))

    return chunks


def _load_markdown(filepath: str) -> Dict[str, Any]:
    """Load a markdown file with frontmatter metadata."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    metadata, body = _parse_frontmatter(content)
    filename = os.path.splitext(os.path.basename(filepath))[0]
    
    # Derive category from parent directory name
    parent_dir = os.path.basename(os.path.dirname(filepath))
    
    return {
        "document_id": metadata.get("document_id", f"{parent_dir}-{filename}"),
        "title": metadata.get("title", filename.replace("_", " ").title()),
        "category": metadata.get("category", parent_dir),
        "source": metadata.get("source", "TRACE-X Knowledge Base"),
        "technique_id": metadata.get("technique_id", None),
        "text": body.strip(),
    }


def _load_txt(filepath: str) -> Dict[str, Any]:
    """Load a plain text file."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    filename = os.path.splitext(os.path.basename(filepath))[0]
    parent_dir = os.path.basename(os.path.dirname(filepath))
    
    return {
        "document_id": f"{parent_dir}-{filename}",
        "title": filename.replace("_", " ").title(),
        "category": parent_dir,
        "source": "TRACE-X Knowledge Base",
        "technique_id": None,
        "text": content.strip(),
    }


def _load_json(filepath: str) -> List[Dict[str, Any]]:
    """Load a JSON file — expects a list of objects or a single object with a 'text' field."""
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    if isinstance(data, list):
        return data
    elif isinstance(data, dict) and "text" in data:
        return [data]
    return []


def _load_csv(filepath: str) -> List[Dict[str, Any]]:
    """Load a CSV file — expects columns: title, text, category, technique_id (optional)."""
    documents = []
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            documents.append({
                "document_id": row.get("document_id", f"csv-{i}"),
                "title": row.get("title", f"Entry {i}"),
                "category": row.get("category", "general"),
                "source": row.get("source", "TRACE-X Knowledge Base"),
                "technique_id": row.get("technique_id", None),
                "text": row.get("text", ""),
            })
    return documents


def load_all_documents(knowledge_dir: str = None) -> List[Dict[str, Any]]:
    """
    Walk the knowledge directory and load all supported files.
    Returns a flat list of document dicts.
    """
    knowledge_dir = knowledge_dir or KNOWLEDGE_DIR
    documents = []

    if not os.path.isdir(knowledge_dir):
        logger.warning(f"[Ingestion] Knowledge directory not found: {knowledge_dir}")
        return documents

    for root, dirs, files in os.walk(knowledge_dir):
        for filename in sorted(files):
            filepath = os.path.join(root, filename)
            ext = os.path.splitext(filename)[1].lower()

            try:
                if ext == ".md":
                    documents.append(_load_markdown(filepath))
                elif ext == ".txt":
                    documents.append(_load_txt(filepath))
                elif ext == ".json":
                    docs = _load_json(filepath)
                    documents.extend(docs)
                elif ext == ".csv":
                    docs = _load_csv(filepath)
                    documents.extend(docs)
            except Exception as e:
                logger.error(f"[Ingestion] Failed to load {filepath}: {e}")

    logger.info(f"[Ingestion] Loaded {len(documents)} documents from {knowledge_dir}")
    return documents


def chunk_documents(documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Chunk all documents and attach metadata to each chunk.
    Returns a list of chunk dicts ready for embedding.
    """
    all_chunks = []

    for doc in documents:
        text = doc.get("text", "")
        if not text.strip():
            continue

        chunks = _chunk_text(text)

        for idx, chunk_text in enumerate(chunks):
            chunk_id = f"{doc['document_id']}-{idx:03d}"
            all_chunks.append({
                "document_id": doc["document_id"],
                "chunk_id": chunk_id,
                "title": doc.get("title", ""),
                "category": doc.get("category", ""),
                "source": doc.get("source", "TRACE-X Knowledge Base"),
                "technique_id": doc.get("technique_id"),
                "text": chunk_text,
                # Deterministic ID for Qdrant (idempotent upsert)
                "qdrant_id": _deterministic_uuid(chunk_id),
            })

    logger.info(f"[Ingestion] Chunked {len(documents)} documents into {len(all_chunks)} chunks.")
    return all_chunks
