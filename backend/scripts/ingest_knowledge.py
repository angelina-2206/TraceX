"""
Knowledge Base Ingestion Script for TRACE-X.
Loads cybersecurity knowledge documents, chunks them, generates local embeddings,
and upserts them into the Qdrant vector database.

Usage:
    python scripts/ingest_knowledge.py

Running this script multiple times is safe (idempotent) — deterministic IDs
prevent duplicate vectors.
"""
import sys
import os
import time

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.document_ingestion import load_all_documents, chunk_documents
from app.services import embedding_service, qdrant_service
from app.core.config import settings


def main():
    print("=" * 60)
    print("  TRACE-X Knowledge Base Ingestion Pipeline")
    print("=" * 60)
    start = time.time()

    # 1. Check Qdrant connectivity
    print("\n[1/5] Checking Qdrant connectivity...")
    if not qdrant_service.is_connected():
        print("ERROR: Cannot connect to Qdrant at", settings.QDRANT_URL)
        print("Make sure Qdrant is running: docker compose up -d qdrant")
        sys.exit(1)
    print(f"  Connected to Qdrant at {settings.QDRANT_URL}")

    # 2. Ensure collection exists
    print("\n[2/5] Ensuring collection exists...")
    created = qdrant_service.create_collection()
    if created:
        print(f"  Created collection '{settings.RAG_COLLECTION_NAME}'")
    else:
        print(f"  Collection '{settings.RAG_COLLECTION_NAME}' already exists")

    # 3. Load and chunk documents
    print("\n[3/5] Loading knowledge documents...")
    documents = load_all_documents()
    if not documents:
        print("  WARNING: No documents found in data/knowledge/")
        print("  Ensure the knowledge directory exists and contains .md/.txt/.json/.csv files.")
        sys.exit(1)
    print(f"  Loaded {len(documents)} documents")

    chunks = chunk_documents(documents)
    print(f"  Chunked into {len(chunks)} chunks (size={settings.RAG_CHUNK_SIZE}, overlap={settings.RAG_CHUNK_OVERLAP})")

    # 4. Generate embeddings
    print(f"\n[4/5] Generating embeddings with {settings.EMBEDDING_MODEL}...")
    texts = [c["text"] for c in chunks]
    vectors = embedding_service.embed_documents(texts)
    dimension = embedding_service.get_dimension()
    print(f"  Generated {len(vectors)} vectors (dimension={dimension})")

    # 5. Upsert into Qdrant
    print(f"\n[5/5] Upserting into Qdrant collection '{settings.RAG_COLLECTION_NAME}'...")
    points = []
    for chunk, vector in zip(chunks, vectors):
        points.append({
            "id": chunk["qdrant_id"],
            "vector": vector,
            "payload": {
                "document_id": chunk["document_id"],
                "chunk_id": chunk["chunk_id"],
                "title": chunk["title"],
                "category": chunk["category"],
                "source": chunk["source"],
                "technique_id": chunk["technique_id"],
                "text": chunk["text"],
            }
        })

    count = qdrant_service.upsert_documents(points)
    elapsed = round(time.time() - start, 1)

    # Summary
    info = qdrant_service.get_collection_info()
    print("\n" + "=" * 60)
    print("  INGESTION COMPLETE")
    print("=" * 60)
    print(f"  Documents loaded:    {len(documents)}")
    print(f"  Chunks created:      {len(chunks)}")
    print(f"  Vectors upserted:    {count}")
    print(f"  Collection total:    {info.get('points_count', 'N/A')} points")
    print(f"  Embedding model:     {settings.EMBEDDING_MODEL}")
    print(f"  Vector dimension:    {dimension}")
    print(f"  Time elapsed:        {elapsed}s")
    print("=" * 60)


if __name__ == "__main__":
    main()
