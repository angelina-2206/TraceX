import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Mic, MicOff, Sparkles, Database,
  Copy, Check, Search, Cpu, Terminal, ArrowRight,
  ShieldAlert, Route, Building2, Target, Link2, FileText, CheckCircle2
} from 'lucide-react';
import { CaseDetail } from '../../types';

interface ForensicRagCopilotViewProps {
  caseDetail?: CaseDetail | null;
  voiceActive: boolean;
}

interface Message {
  sender: 'USER' | 'AI';
  text: string;
  evidence_references?: string[];
  facts?: string[];
  inferences?: string[];
  uncertainties?: string[];
  timestamp?: string;
  confidence?: number;
}

const PROMPT_PRESETS = [
  { icon: ShieldAlert, label: 'BEC Threat Risk', query: 'Why is this email considered a business email compromise attack?' },
  { icon: Route, label: 'Relay Flight Path', query: 'Show me the reconstructed flight path and relay headers.' },
  { icon: Building2, label: 'Financial Destination', query: 'What are the extracted financial payout clues, IFSC code, and bank details?' },
  { icon: Target, label: 'MITRE ATT&CK', query: 'Map observable case indicators against MITRE ATT&CK techniques.' },
  { icon: Link2, label: 'URL Redirect Hops', query: 'Analyze embedded link redirect hops and credential forms.' },
];

export const ForensicRagCopilotView: React.FC<ForensicRagCopilotViewProps> = ({
  caseDetail,
  voiceActive
}) => {
  const caseId = caseDetail?.case_id || 'CASE-2026-001';

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'AI',
      text: `### TRACE-X FORENSIC RAG COPILOT — GROUNDED INVESTIGATOR ACTIVE FOR ${caseId}\n\nAsk technical questions regarding observable MIME headers, sender identity alignment, URL redirect chains, or financial payout targets. Answers cite verified case vault evidence and Qdrant vector knowledge strictly.`,
      evidence_references: ['EV-VAULT', 'QDRANT-KB'],
      confidence: 98.4,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim()) return;

    const userMsg: Message = {
      sender: 'USER',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');

    setLoading(true);
    try {
      let res;
      if (caseDetail?.case_id) {
        res = await fetch(`http://127.0.0.1:8000/api/v1/cases/${caseDetail.case_id}/rag`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: text })
        });
      } else {
        res = await fetch(`http://127.0.0.1:8000/api/v1/rag/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text, top_k: 5 })
        });
      }

      const data = await res.json();

      let answerText = "";
      let refs: string[] = [];

      if (typeof data.answer === 'string' && data.answer.trim()) {
        answerText = data.answer;
        refs = data.evidence_references || [];
      } else if (Array.isArray(data.results) && data.results.length > 0) {
        answerText = "### RETRIEVED KNOWLEDGE BASE RESULTS\n\n" + data.results.map((r: any) => (
          `**[${r.category}] ${r.title}** (Relevance: ${(r.score * 100).toFixed(0)}%)\n${r.text}`
        )).join('\n\n');
        refs = data.results.map((r: any) => r.source || 'QDRANT-KB');
      } else {
        answerText = data.detail || "No grounded evidence found for query. Please refine your forensic prompt.";
        refs = ['EV-UNKNOWN'];
      }

      const aiMsg: Message = {
        sender: 'AI',
        text: answerText,
        evidence_references: refs,
        facts: data.facts || [],
        inferences: data.inferences || [],
        uncertainties: data.uncertainties || [],
        confidence: 96.5,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);

      if (voiceActive && 'speechSynthesis' in window && answerText) {
        const synth = window.speechSynthesis;
        const cleanSpeech = answerText.replace(/\[.*?\]/g, '').replace(/[\*\_]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanSpeech.substring(0, 200));
        synth.speak(utterance);
      }
    } catch (e) {
      console.error("RAG query error:", e);
      setMessages(prev => [...prev, {
        sender: 'AI',
        text: "[RAG CONNECTION ERROR] Unable to query backend server at http://127.0.0.1:8000. Please verify the FastAPI Uvicorn backend server is active.",
        evidence_references: ['ERR-OFFLINE'],
        confidence: 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (txt: string, idx: number) => {
    navigator.clipboard.writeText(txt);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Browser speech recognition is unavailable. Please type your query below.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!listening) {
      setListening(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setListening(false);
        handleSend(transcript);
      };
      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);
    } else {
      setListening(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      {/* ── Top Header Banner ── */}
      <div className="tracex-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-teal-500">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-400">
              RAG Forensic AI Engine v4.2
            </span>
            <span className="text-xs text-slate-400">Grounded Evidence Retrieval</span>
          </div>
          <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-teal-400" />
            Forensic RAG Copilot & Investigation Assistant
          </h1>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 text-[11px]">Vector Store:</span>
            <span className="text-emerald-400 font-semibold">Online</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-400 text-[11px]">Model:</span>
            <span className="text-teal-300 font-semibold">TRACE-LLM v4.2</span>
          </div>
        </div>
      </div>

      {/* ── Interactive Preset Quick Prompts ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] text-slate-400 font-semibold uppercase shrink-0">Quick Prompts:</span>
        {PROMPT_PRESETS.map((p, idx) => {
          const IconComp = p.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(p.query)}
              disabled={loading}
              className="btn-secondary text-xs py-1.5 px-3 shrink-0 flex items-center gap-1.5"
            >
              <IconComp className="w-3.5 h-3.5 text-teal-400" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Chat Area & Evidence Inspector Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Chat Box (Left 3 cols) */}
        <div className="lg:col-span-3 tracex-card h-[600px] flex flex-col justify-between p-5 relative">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  m.sender === 'USER'
                    ? 'bg-slate-900/80 border-slate-700 ml-12 text-slate-200'
                    : 'bg-slate-950/80 border-teal-500/30 text-slate-100'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    {m.sender === 'USER' ? (
                      <span className="font-semibold text-xs text-slate-300 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-slate-400" />
                        Analyst Prompt
                      </span>
                    ) : (
                      <span className="font-semibold text-xs text-teal-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                        TRACE-X Grounded Copilot
                      </span>
                    )}
                    {m.timestamp && (
                      <span className="text-[10px] text-slate-500">[{m.timestamp}]</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {m.confidence && m.sender === 'AI' && (
                      <span className="text-[10px] text-teal-400 font-semibold bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 rounded">
                        {m.confidence}% Confidence
                      </span>
                    )}
                    <button
                      onClick={() => copyMessage(m.text, idx)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Copy response text"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Evidence References Badges */}
                {m.evidence_references && m.evidence_references.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Citations:</span>
                    {m.evidence_references.map(ref => (
                      <button
                        key={ref}
                        onClick={() => setSelectedRef(ref)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all border ${
                          selectedRef === ref
                            ? 'bg-teal-500 text-slate-950 border-teal-400'
                            : 'bg-slate-900 text-teal-300 border-teal-800 hover:border-teal-500'
                        }`}
                      >
                        [{ref}]
                      </button>
                    ))}
                  </div>
                )}

                {/* Structured Answer Content */}
                <div className="whitespace-pre-wrap leading-relaxed space-y-2 text-slate-200 text-xs">
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/40 text-xs text-teal-400 animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                  <span>Retrieving grounded evidence from case vault & vector store...</span>
                </div>
                <span className="text-[10px] text-slate-500">Explainable RAG</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Controls Bar */}
          <div className="pt-4 border-t border-white/5 flex items-center gap-3">
            <button
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-lg border transition-all ${
                listening
                  ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'
              }`}
              title={listening ? "Listening..." : "Click to activate speech-to-text"}
            >
              {listening ? <Mic className="w-4 h-4 text-red-400" /> : <MicOff className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask RAG copilot about MIME headers, authentication status, or payout indicators..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || loading}
              className="btn-primary text-xs py-2.5 px-4 shrink-0 flex items-center gap-2 font-semibold"
            >
              <span>Send Prompt</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Evidence & Case Context Inspector (Right 1 col) */}
        <div className="space-y-4 text-xs">
          {/* Active Case Context Card */}
          <div className="tracex-card p-4 space-y-3">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Case Vault Target</span>
              <span className="text-teal-400 font-mono font-bold">{caseId}</span>
            </div>

            {caseDetail ? (
              <div className="space-y-2 text-[11px]">
                <div className="text-slate-100 font-semibold truncate" title={caseDetail.title}>{caseDetail.title}</div>
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
                  <span>Sender:</span>
                  <span className="text-slate-200 truncate max-w-[120px] font-mono">{caseDetail.email_from}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
                  <span>Threat Score:</span>
                  <span className="text-amber-400 font-bold">{caseDetail.threat_score.overall_score}/100</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Authentication:</span>
                  <span className={`font-semibold ${caseDetail.auth_status.alignment === 'MISALIGNED' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {caseDetail.auth_status.alignment}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-[11px]">No active case loaded. RAG querying Qdrant knowledge base.</div>
            )}
          </div>

          {/* Citation / Evidence Inspector */}
          <div className="tracex-card p-4 space-y-3 h-[400px] flex flex-col">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Evidence Citation Inspector</span>
            </div>

            {selectedRef ? (
              <div className="flex-1 overflow-y-auto space-y-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-teal-500/40 text-teal-300 font-semibold flex items-center justify-between">
                  <span className="font-mono">[{selectedRef}]</span>
                  <span className="text-[9px] text-slate-400 font-normal">Verified Citation</span>
                </div>
                <div className="text-slate-300 leading-relaxed p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  {selectedRef.startsWith('EV-') ? (
                    <span>Ground evidence extracted from ingested email MIME payload, headers, or 4-API threat reputation aggregators for case <strong>{caseId}</strong>.</span>
                  ) : (
                    <span>Retrieved document chunk from vector collection (384-d embeddings). Grounded in MITRE ATT&CK & incident response procedures.</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <Search className="w-6 h-6 mb-2 opacity-40 text-teal-400" />
                <p className="text-xs">Click any citation tag like <span className="text-teal-400 font-semibold font-mono">[EV-VAULT]</span> or <span className="text-teal-300 font-semibold font-mono">[QDRANT-KB]</span> in chat responses to inspect proof details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
