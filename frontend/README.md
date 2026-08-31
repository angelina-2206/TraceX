# TRACE-X Workstation Frontend

The user interface for **TRACE-X**, built using React, TypeScript, Vite, and Tailwind CSS. It acts as an interactive cybersecurity workstation, allowing analysts to submit indicators, analyze threat vectors, run sandbox detonations, and query the local RAG knowledge base.

---

## 📂 Directory Structure

```text
frontend/
├── src/
│   ├── components/            # Reusable UI component blocks (Charts, Cards, Maps)
│   ├── types/                 # TypeScript type definitions for API contracts
│   ├── App.tsx                # Main layout, state management, and orchestration
│   ├── index.css              # Global styles and Tailwind imports
│   ├── App.css                # Visual layout customizations
│   └── main.tsx               # Application entry point
├── public/                    # Static image/media assets
├── package.json               # Frontend dependencies and dev scripts
├── tailwind.config.js         # Styling tokens and color layouts
├── tsconfig.json              # TypeScript compilation rules
└── vite.config.ts             # Vite server configurations
```

---

## 🛠️ Getting Started

### 1. Install Node Dependencies
Run the installation command in the frontend root directory:
```bash
npm install
```

### 2. Start the Local Server
Run the local Vite development server:
```bash
npm run dev
```
*By default, the client launches on `http://localhost:5173`.*

---

## 🌐 API Interaction & Integration

The frontend communicates exclusively with the server running at `http://localhost:8000`. It performs actions like:
*   `POST /api/investigate`: Queries the unified threat reputation engine + local RAG knowledge base.
*   `POST /api/v1/cases/<id>/detonate`: Detonates case file attachments in a secure sandbox.
*   `POST /api/rag/search`: Standalone semantic matching query dashboard.
*   `GET /api/rag/health`: Displays Qdrant vector database statistics and statuses.
