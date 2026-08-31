# TRACE-X Backend API Engine

The core forensic intelligence engine for **TRACE-X**, built using FastAPI. It orchestrates parallel threat-intelligence lookups, runs a rule-based explainable risk scorer, and feeds collected evidence into a local, CPU-bound Qdrant RAG (Retrieval-Augmented Generation) knowledge engine to surface relevant cybersecurity tactics, techniques, and procedures (TTPs).

---

## System Architecture & Flow

```text
                     [Indicator Submission]
                               │
                               ▼
                    [API Gateway: POST /api/investigate]
                               │ (Rate Limiter: 20 req/min)
                               ▼
                    [Indicator Classifier]
                               │ (RegEx url/domain/ip/hash validation)
                               ├──► [DNS Resolver] (Resolves IP for Abuse/GeoIP)
                               ▼
                    [Threat Aggregator Service]
                               │
           ┌───────────────────┼───────────────────┬───────────────────┐
           ▼ (asyncio)         ▼ (asyncio)         ▼ (asyncio)         ▼ (asyncio)
      [VirusTotal]        [AbuseIPDB]         [URLScan.io]       [IPGeolocation]
           │                   │                   │                   │
           └───────────────────┼───────────────────┴───────────────────┘
                               ▼
                    [Evidence Normalizer]
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
       [Rule Risk Engine]            [Evidence Query Builder]
        (Score: 0-100)                        │ (Generates semantic queries)
                                              ▼
                                     [Local Embeddings]
                                      (bge-small-en-v1.5)
                                              │
                                              ▼
                                     [Local Qdrant DB]
                                      (tracex_knowledge)
                                              │
                                              ▼
                                     [Retrieved Knowledge]
                                              │
                ┌─────────────────────────────┘
                ▼
      [Unified Forensic Report]
```

---

## Core Capabilities

### 1. Multi-Provider Intel Orchestration
*   **Parallel Queries**: Runs all service queries concurrently using `asyncio.gather` with `return_exceptions=True`. A single provider timing out or failing does not disrupt others.
*   **Intelligent Routing**: Skips providers that do not support the indicator type (e.g., skips URLScan for file hashes).
*   **SSRF Protection**: Gateway checks prevent resolving loopbacks (`127.0.0.1`, `::1`) or private ranges (`10.0.0.0/8`, `192.168.0.0/16`).

### 2. Explainable Rule-Based Risk Engine
Computes a unified score of `0-100` mapped to risk levels:
*   **0-19**: `CLEAN`
*   **20-49**: `SUSPICIOUS`
*   **50-79**: `HIGH`
*   **80-100**: `CRITICAL`
*   **Fallback**: `UNKNOWN` (if all queries fail or return no data).

#### Scoring Logic:
| Rule Source | Condition | Weight (Points) | Max Cap |
| :--- | :--- | :--- | :--- |
| **VirusTotal** | Malicious vendor reports | `vendors * 5` | 40 pts |
| **VirusTotal** | Negative community reputation | `abs(reputation) * 2` | 15 pts |
| **AbuseIPDB** | Abuse confidence rating | `confidence * 0.35` | 30 pts |
| **AbuseIPDB** | Volume of abuse reports | `reports * 0.1` | 10 pts |
| **URLScan** | Redirect hops in chain | `hops * 5` | 15 pts |

### 3. Subsecond Local RAG Knowledge Engine
*   **CPU Embeddings**: Runs `BAAI/bge-small-en-v1.5` on CPU, producing 384-dimensional vector embeddings.
*   **Qdrant Index**: Manages cosine-similarity searches on the `tracex_knowledge` collection.
*   **Evidence-to-Query Transformation**: The query builder translates raw findings (e.g. *8 VT detections, 3 URLScan redirects*) into optimized queries (e.g., `"credential phishing redirect chains"`).
*   **Attribution Traceability**: Every retrieved text chunk preserves `source`, `title`, `category`, `document_id`, `chunk_id`, and `technique_id` (e.g., `T1566.002`).

---

## Configuration (.env)

The environment parameters are set inside [`backend/.env`](file:///e:/Hackathons/SIH/backend/.env):
```ini
# Security
SECRET_KEY=tracex-super-secret-forensic-key-2026-sih
ALLOWED_ORIGINS=["http://localhost:5173", "http://localhost:3000"]

# Threat Intel API Keys (exclusively server-side)
VIRUSTOTAL_API_KEY=42e0e764d7720a6028...
ABUSEIPDB_API_KEY=4f3dbbd72c0dbad523...
URLSCAN_API_KEY=01a056c1-c09f-702a...
IPGEOLOCATION_API_KEY=15c225065c9145...

# Qdrant Local Configuration (no credentials required)
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=

# Local Embedding Settings
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
RAG_COLLECTION_NAME=tracex_knowledge
RAG_CHUNK_SIZE=600
RAG_CHUNK_OVERLAP=80
```

---

## API Endpoints Reference

### 1. Investigation Gateway
*   **Route**: `POST /api/investigate` (Alias: `POST /api/v1/investigate`)
*   **Rate Limit**: 20 requests per minute.
*   **Payload Schema**:
    ```json
    {
      "target": "185.220.101.45"
    }
    ```
*   **Response**: Returns the complete aggregated threat intelligence, risk levels, and RAG knowledge.

### 2. Standalone RAG Query
*   **Route**: `POST /api/rag/search`
*   **Payload Schema**:
    ```json
    {
      "query": "credential phishing login page redirects",
      "top_k": 3
    }
    ```

### 3. RAG Health Status
*   **Route**: `GET /api/rag/health`
*   **Response**:
    ```json
    {
      "qdrant": "connected",
      "collection": "tracex_knowledge",
      "documents": 19,
      "embedding_model": "BAAI/bge-small-en-v1.5"
    }
    ```

---

## Quick Start & Verification

### 1. Boot Vector DB
```bash
docker compose up -d qdrant
```

### 2. Load Documents
```bash
python scripts/ingest_knowledge.py
```

### 3. Start Backend
```bash
python -m uvicorn app.main:app --reload
```

### 4. Run Test Suite
```bash
python tests/test_rag.py
```
