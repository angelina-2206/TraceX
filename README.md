# TRACE-X: Advanced Cyber-Forensic Workstation & Threat Intelligence Aggregator

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.5-8E75B5?style=for-the-badge&logo=googlegemini&logoColor=white)
![Polygon](https://img.shields.io/badge/Polygon_PoS-8247E5?style=for-the-badge&logo=polygon&logoColor=white)
![Qdrant](https://img.shields.io/badge/Qdrant-e52230?style=for-the-badge&logo=qdrant&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

TRACE-X is a specialized cyber-forensic investigation workstation designed for SOC analysts and incident response teams. The system automates email artifact ingestion, parses metadata and header routing paths, queries external reputation intelligence providers, correlates indicators with dynamic threat campaigns, anchors evidence to the Polygon PoS blockchain, and synthesizes findings using Google Gemini and a local security knowledge base.

---

## Technical Architecture Overview

TRACE-X divides its core operations into five decoupled layers to ensure isolation, sub-second latency, and fault tolerance:

```text
  [ Ingested Email Artifact (.eml) ]
                  │
                  ▼
   1. EVIDENCE & MIME PARSING LAYER  ◄── [ SPF/DKIM/DMARC Alignment Checks ]
                  │
                  ├──► [ Header Flight Path & Dynamic Attack DNA ]
                  ▼
   2. 4-API REPUTATION AGGREGATOR   ◄── [ Parallel API Lookups & Fail-safes ]
                  │
                  ├──► [ Geo-Financial Mismatch & Dynamic Campaign Correlation ]
                  ▼
   3. EXPLAINABLE RISK ENGINE       ◄── [ Decomposed Metric Scoring & Impact Lab ]
                  │
                  ├──► [ Polygon PoS Cryptographic Evidence Sealing ]
                  ▼
   4. LOCAL KNOWLEDGE RAG & GEMINI  ◄── [ BAAI Embeddings, Qdrant & Gemini 2.5 ]
                  │
                  ▼
   5. FORENSIC WORKSTATION DESK     ◄── [ Attack Graph, Copilot & Ledger Views ]
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

### 3. Geo-Financial Forensic Mapping & Dynamic Campaign Engine
*   **Financial Metadata Extraction**: Searches email body text for financial parameters, including Bank Beneficiary Names, Bank Names, Masked Accounts, and Indian Financial System Codes (IFSC).
*   **Cross-Region Mismatch Engine**: Geolocates physical bank branch coordinates via IFSC and compares them with the geolocated IP address of the email sender hop.
*   **Dynamic Campaign Correlation Engine**: Computes structured Attack DNA fingerprint vectors (language markers, identity deception, URL redirect structure, and infrastructure ASNs). Correlates newly ingested `.eml` files dynamically against institutional threat memory clusters (e.g. *PhishPhantom Invoice BEC*, *DarkSSO Credential Harvest*, *ApexImpersonate Ring*).

### 4. Polygon PoS Blockchain Evidence Ledger & Verification
To guarantee legal admissibility and tamper-proof chain of custody:
*   **Immutable Append-Only Log**: Every investigator action, ingestion event, and sandbox detonation is recorded with cryptographic timestamps.
*   **Polygon PoS Anchoring**: Hashes evidence payloads (`SHA-256`) and anchors verification proofs directly to the Polygon PoS blockchain.
*   **On-Chain Status Verification**: Computes real-time canonical hashes and verifies evidence integrity against on-chain transaction records to confirm evidence has never been modified or forged.

### 5. Local RAG Engine & Google Gemini Synthesis
*   **Local Embeddings**: Converts queries using `BAAI/bge-small-en-v1.5` transformer models running locally on CPU (384-dimensional vector space).
*   **Qdrant Vector Storage**: Performs sub-second cosine-similarity searches on indexed MITRE ATT&CK knowledge documents.
*   **Grounded Gemini 2.5 Flash Synthesis**: Feeds retrieved MITRE knowledge context and case evidence into Google Gemini 2.5 Flash to synthesize structured facts, inferences, uncertainties, and evidence citations (`[EV-ID-XX]`, `[KB-XX]`).

---

## User Role Personas

TRACE-X implements three distinct workspaces tailored to the operational requirements of different cybersecurity stakeholders:

1.  **SOC Analyst (`SOC_ANALYST`)**:
    *   **Focus**: Rapid intake triage, initial evidence parsing, and threat assessment.
    *   **Capabilities**: Performs EML uploads and raw text ingestion, reviews resolved SMTP relay flight records, checks DKIM/SPF alignment states, and analyzes key indicator reputation lists.
2.  **Forensic Investigator (`INVESTIGATOR`)**:
    *   **Focus**: In-depth incident correlation, trace analysis, and threat containment.
    *   **Capabilities**: Interacts with the complete visual Attack Graph, runs secure sandbox detonations on attachments, correlates indicators against threat campaigns, and queries the local Forensic RAG Copilot for MITRE ATT&CK techniques mapping.
3.  **CISO / Executive (`EXECUTIVE`)**:
    *   **Focus**: Strategic risk evaluation, financial impact containment, and remediation governance.
    *   **Capabilities**: Accesses the CISO dashboard outlining potential financial exposure, reviews and updates containment/mitigation checklists, and exports standardized STIX 2.1 IOC threat bundle reports.

---

## Project Structure

```text
SIH/
├── backend/
│   ├── app/
│   │   ├── main.py                    # Application startup and global middlewares
│   │   ├── api/
│   │   │   ├── cases.py               # Case uploads, EML ingestion, impact lab & STIX
│   │   │   ├── investigate.py         # 4-API aggregator endpoints
│   │   │   └── rag.py                 # RAG search and health check endpoints
│   │   ├── core/
│   │   │   ├── config.py              # Configuration manager (Gemini & threat API keys)
│   │   │   └── security.py            # Token-bucket rate limiter implementation
│   │   ├── schemas/
│   │   │   ├── forensics.py           # Attack DNA, Campaign, & Evidence schemas
│   │   │   ├── threat.py              # Pydantic aggregator schemas
│   │   │   └── rag.py                 # Pydantic vector matching schemas
│   │   └── services/
│   │       ├── gemini_service.py      # Google Gemini 2.5 Flash integration
│   │       ├── attack_dna.py          # Dynamic Attack DNA & Campaign correlation engine
│   │       ├── blockchain_service.py  # Polygon PoS transaction anchoring & verification
│   │       ├── forensic_rag.py        # Grounded RAG copilot reasoning engine
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
│   │   ├── test_blockchain.py         # Polygon anchoring & hash verification tests
│   │   ├── test_gemini_rag.py         # Gemini RAG & dynamic campaign tests
│   │   ├── test_security.py           # Rate limiting & authorization tests
│   │   ├── test_e2e.py                # Full pipeline E2E integration test
│   │   └── test_rag.py                # RAG subsystem unit tests
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
Create a `.env` file in the `backend/` directory based on `.env.example`. Add your API keys:
```ini
GEMINI_API_KEY=your_gemini_api_key
VIRUSTOTAL_API_KEY=your_key_here
ABUSEIPDB_API_KEY=your_key_here
URLSCAN_API_KEY=your_key_here
IPGEOLOCATION_API_KEY=your_key_here
```

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

### 7. Run TRACE-X Sentinel Chrome Extension
Build the extension bundle and load it into Google Chrome:
```bash
cd ../extension
npm install
npm run build
```
1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the `extension/` directory (or `extension/dist/`).
4. Pin **TRACE-X Sentinel** to your Chrome toolbar.
5. Open any email in **Gmail** or **Outlook Web** to evaluate instant forensic verdicts or inspect destination link safety.

---

## Verification & Testing

Verify that all backend modules, extension APIs, AI layers, database connectors, and blockchain services function correctly:

*   **Backend Pytest Suite**:
    ```bash
    cd backend
    python -m pytest tests/test_extension_api.py tests/test_blockchain.py tests/test_security.py
    ```
*   **Extension Vitest Suite**:
    ```bash
    cd extension
    npm test
    ```


