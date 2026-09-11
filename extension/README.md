# ANVESHAK — Cyber-Forensic Webmail Sensor

> *"Your inbox's first line of investigation."*

Anveshak is the browser-level companion to the **ANVESHAK** cybersecurity forensic investigation platform. It runs natively inside webmail clients (**Gmail** and **Outlook Web**), extracts forensic observables in real time, generates sub-second threat verdicts backed by the Anveshak backend engine, and enables seamless one-click deep linking into full forensic case investigations.

---

## Core Architecture

```text
Gmail / Outlook Web (Inbox)
          │
          ▼ [Injected Anveshak Sensor Button & Sensor]
Anveshak Chrome Extension (Manifest V3)
          │
          ▼ HTTPS REST API (/api/v1/extension/analyze)
Anveshak Forensic Backend API
          │
          ├──► SPF / DKIM / DMARC Header Verification
          ├──► Sender Identity Deception Engine
          ├──► Multi-hop URL Redirect & Homoglyph Tracer
          ├──► Geo-Financial Mismatch (IFSC / Bank Payout)
          ├──► Attack DNA & Dynamic Campaign Memory
          ├──► 4-API Threat Aggregator (VT, URLScan, AbuseIPDB, IPGeo)
          └──► Chain of Custody & Polygon Blockchain Anchor
          │
          ▼
Quick Verdict Popup & Side Panel (Risk Score, Severity, Explainable "Why")
          │
          ▼ [ "INVESTIGATE IN ANVESHAK →" ]
Full Anveshak Cyber-Forensic Workstation Dashboard
```

---

## Key Features

1. **Native Webmail Integration**: Injects subtle, non-intrusive `[ 🛡 Anveshak ]` action buttons into Gmail and Outlook Web email headers.
2. **Sub-Second Quick Verdict**: Displays instant risk score (`0-100`), severity classification (`CRITICAL`, `HIGH`, `WARNING`, `SAFE`), and high-level verdict.
3. **Progressive Disclosure ("Why is this flagged?")**: Expandable technical evidence cards detailing Sender Impersonation, SPF/DMARC failures, URL Redirect anomalies, and Geo-Financial discrepancies.
4. **Link Hover Sensor**: Safe hover inspector previewing URL domain reputation and homoglyph sinkholes before clicking.
5. **Direct Deep Linking**: Clicking **"INVESTIGATE IN ANVESHAK →"** immediately opens the exact analyzed case in the main Anveshak workstation with reconstructed Attack Graphs, Header Flight Paths, and Forensic Copilot.
6. **Chain of Custody & Evidence Vault**: Every extension capture is cryptographically sealed with SHA-256 and anchored in the evidence ledger.

---

## Permissions & Security Architecture

| Permission | Purpose & Scope |
| :--- | :--- |
| `storage` | Local client caching of analyzed email fingerprints to prevent redundant backend calls. |
| `activeTab` | Read-only access to the currently active webmail DOM when the user interacts with the extension. |
| `sidePanel` | Chrome Side Panel support for persistent forensic viewing while triaging inboxes. |
| Host Permissions | Restrict network requests strictly to `https://mail.google.com/*`, `https://outlook.live.com/*`, `https://outlook.office.com/*`, and local Anveshak API (`http://127.0.0.1:8000/*`, `http://localhost:5173/*`). |

### Strict Privacy & Security Model
- **No Private Keys or Third-Party API Secrets**: The extension contains zero API keys or blockchain credentials. All intelligence lookups and on-chain anchoring are performed exclusively server-side.
- **User-Initiated Ingestion**: Emails are analyzed only when the user clicks the Anveshak button or opens the extension popup.
- **Sanitized Data Handling**: Untrusted HTML is sanitized and stripped of executable scripts. `dangerouslySetInnerHTML` is prohibited.
- **Prompt Injection Defense**: Ingested message text is treated strictly as untrusted data inputs and delimited before reaching AI synthesis layers.

---

## Installation & Developer Guide

### 1. Install Dependencies
```bash
cd extension
npm install
```

### 2. Run Tests
```bash
npm test
```

### 3. Build the Extension
```bash
npm run build
```
This compiles the extension into the standalone `extension/dist/` directory.

---

## How to Load the Extension into Google Chrome

1. Open **Google Chrome** and navigate to: `chrome://extensions/`
2. Toggle on **Developer mode** in the top right corner.
3. Click the **"Load unpacked"** button in the top left.
4. Select the directory: `e:\Hackathons\SIH\extension\dist`
5. Pin the **Anveshak** extension to your Chrome toolbar.
6. Open any email in **Gmail** (`https://mail.google.com`) or **Outlook Web** (`https://outlook.live.com`).
7. Click the **[ 🛡 Anveshak ]** button or extension popup to see instant forensic verdicts!

---

## Tech Stack
- **Extension Standard**: Chrome Extension Manifest V3
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (Clean Light Theme — `#F8FAFC` base, `#0D9488` teal accent, `#DC2626` critical, `#16A34A` success)
- **Icons**: Lucide React
- **Testing**: Vitest
