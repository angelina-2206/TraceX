# TRACE-X: Advanced Cyber-Forensic Workstation & Threat Intelligence Aggregator

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Qdrant](https://img.shields.io/badge/Qdrant-e52230?style=for-the-badge&logo=qdrant&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

TRACE-X is a specialized cyber-forensic investigation workstation designed for SOC analysts and incident response teams. The system automates email artifact ingestion, parses metadata and header routing paths, queries external reputation intelligence providers, and maps findings to an immutable chain of custody and a local security knowledge base.

---

## Technical Architecture Overview

TRACE-X divides its core operations into five decoupled layers to ensure isolation, sub-second latency, and fault tolerance:

```text
  [ Ingested Email Artifact (.eml) ]
                  │
                  ▼
   1. EVIDENCE & MIME PARSING LAYER  ◄── [ SPF/DKIM/DMARC Alignment Checks ]
                  │
                  ├──► [ Header Flight Path Reconstruction ]
                  ▼
   2. 4-API REPUTATION AGGREGATOR   ◄── [ Parallel API Lookups & Fail-safes ]
                  │
                  ├──► [ Geo-Financial Mismatch Engine ]
                  ▼
   3. EXPLAINABLE RISK ENGINE       ◄── [ Deterministic Metric Weighting ]
                  │
                  ├──► [ Binary Merkle Tree Cryptographic Sealing ]
                  ▼
   4. LOCAL KNOWLEDGE RAG ENGINE    ◄── [ BAAI Embeddings & Qdrant Search ]
                  │
                  ▼
   5. FORENSIC WORKSTATION DESK     ◄── [ Threat Vectors & Graph Rendering ]
```

---

## Core Forensic Subsystems

### 1. Evidence Ingestion & MIME Parsing Layer
The ingestion layer accepts raw `.eml` uploads or raw MIME header streams and decomposes them into structural indicators without executing malicious elements:
*   **MIME Structure Decomposition**: Separates plaintext, HTML, metadata, and attachment buffers.
*   **Header Flight Path Reconstruction**: Parses consecutive `Received:` headers from bottom (origin) to top (destination). It extracts intermediate SMTP relay hops, resolves their associated IPs, and calculates transit delays.
*   **Authentication Alignment Checks**: Inspects `Authentication-Results` and `Received-SPF` headers to verify DKIM, SPF, and DMARC passes. It identifies sender domain spoofing and display name mismatches.

### 2. Parallel 4-API Threat Intelligence Aggregator
The aggregator queries four external APIs concurrently via asynchronous HTTP clients:
*   **AbuseIPDB**: Retrieves abuse confidence scores, report frequencies, and activity categorizations.
*   **IPGeolocation.io**: Collects coordinates, Autonomous System Numbers (ASN), ISP names, and timezone offsets.
*   **URLScan.io**: Submits suspicious URLs to determine redirect hops, screenshot assets, and loaded technologies.
*   **VirusTotal**: Checks hashes, domains, and IPs against multi-vendor scanner directories.
*   **Fault Containment**: All lookups run in parallel via `asyncio.gather` with isolated timeout controls (5-8 seconds). If an individual API goes offline or encounters rate limits, the aggregator flags the failure and returns the remaining intelligence uninterrupted.

### 3. Geo-Financial Forensic Mapping
A unique detection system for financial redirection attacks:
*   **Metadata Extraction**: Searches the email body for financial coordinates, including Bank Beneficiary Names, Bank Names, Masked Accounts, and Indian Financial System Codes (IFSC).
*   **Cross-Region Mismatch Engine**: Geolocates the physical branch coordinates of the target bank via its IFSC and compares them with the geolocated IP address of the initial email sender hop. If a significant cross-border anomaly is detected (e.g., mail originating from a server in Bulgaria requesting an urgent payout to a bank branch in Bangalore), it flags a high-priority billing threat.

### 4. Tamper-Evident Forensic Ledger
To guarantee the legal integrity of digital evidence, the chain of custody is secured cryptographically:
*   **Immutable Append-Only Log**: Every investigator action, sandbox detonation, and query is saved as an sequential ledger event.
*   **Binary Merkle Tree Root**: The hash of each event is paired and hashed (`SHA-256`) to construct a binary Merkle Tree. Odd nodes are replicated to maintain tree balance.
*   **Verification Path Proofs**: The system generates a list of proof siblings (Merkle path proofs) for every single event. This allows independent auditors to mathematically verify that no historical log entry has been altered, deleted, or inserted.

### 5. Local Knowledge RAG Engine
A completely private, offline retrieval-augmented generation layer:
*   **Local Embeddings**: Converts queries using the `BAAI/bge-small-en-v1.5` transformer model running locally on the CPU (384-dimensional vector space).
*   **Qdrant Vector Storage**: Performs sub-second cosine-similarity searches on the `tracex_knowledge` collection.
*   **Evidence-to-Query Transformation**: The query builder translates raw aggregator findings into targeted semantic search parameters (e.g., translating a domain with negative VT reputation and multiple redirects into the query `"malicious redirect chains credential harvesting"`). This limits retrieval scope to factual, highly relevant MITRE ATT&CK techniques.

---

## Project Structure

```text
SIH/
├── backend/
│   ├── app/
│   │   ├── main.py                    # Application startup and global middlewares
│   │   ├── api/
│   │   │   ├── cases.py               # Case uploads, timeline, and STIX generators
│   │   │   ├── investigate.py         # 4-API aggregator endpoints
│   │   │   └── rag.py                 # RAG search and health check endpoints
│   │   ├── core/
│   │   │   ├── config.py              # Configuration manager and startup diagnostics
│   │   │   └── security.py            # Token-bucket rate limiter implementation
│   │   ├── schemas/
│   │   │   ├── threat.py              # Pydantic aggregator schemas
│   │   │   └── rag.py                 # Pydantic vector matching schemas
│   │   └── services/
│   │       ├── risk_engine.py         # Weight-based threat classification
│   │       ├── threat_aggregator.py   # Concurrency lookup runner
│   │       ├── embedding_service.py   # Local CPU vector generation
│   │       ├── qdrant_service.py      # Qdrant client collection operations
│   │       ├── document_ingestion.py  # Markdown metadata loader & chunker
│   │       ├── evidence_query_builder.py # Evidence translator rules
│   │       └── rag_retriever.py       # Standalone and evidence search coordinator
│   ├── data/
│   │   └── knowledge/                 # 19 MITRE and IR Markdown documents
│   ├── scripts/
│   │   └── ingest_knowledge.py        # Database indexing pipeline
│   ├── tests/
│   │   ├── run_tests.py               # Aggregator unit tests
│   │   └── test_rag.py                # RAG system integration tests
│   └── docker-compose.yml             # Local Qdrant container definition
└── frontend/                          # React TypeScript Vite workspace
```

---

## Installation & Deployment

### 1. Vector Database Setup
Start the local Qdrant container using Docker:
```bash
cd backend
docker compose up -d qdrant
```

### 2. Configure Environment Parameters
Create a `.env` file in the `backend/` directory based on `.env.example`. Add your external threat API keys:
```ini
VIRUSTOTAL_API_KEY=your_key_here
ABUSEIPDB_API_KEY=your_key_here
URLSCAN_API_KEY=your_key_here
IPGEOLOCATION_API_KEY=your_key_here
```
*(No API keys or cloud credentials are required for local embeddings or Qdrant).*

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 4. Index Knowledge Base
Run the ingestion pipeline to chunk, embed, and store the markdown knowledge documents into Qdrant:
```bash
python scripts/ingest_knowledge.py
```

### 5. Run Backend Server
Start the Uvicorn ASGI server:
```bash
python -m uvicorn app.main:app --reload
```
The interactive documentation is exposed at: `http://localhost:8000/docs`

### 6. Run Client Interface
Navigate to the frontend folder, install packages, and launch the Vite development server:
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## Verification & Testing

Verify that all backend modules, embedding layers, and database connectors function correctly:

*   **Run Core Aggregator Tests**:
    ```bash
    python tests/run_tests.py
    ```
*   **Run RAG Subsystem Tests**:
    ```bash
    python tests/test_rag.py
    ```
