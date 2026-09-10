import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Mic, MicOff, Sparkles, ShieldCheck, AlertCircle, Database,
  Copy, Check, Volume2, Search, Cpu, Terminal, ArrowRight, Zap, Info,
  ShieldAlert, Route, Building2, Target, Link2
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
      text: `### TRACE-X FORENSIC RAG COPILOT — GROUNDED INVESTIGATOR ACTIVE FOR ${caseId}\n\nAsk any technical question regarding observable MIME headers, sender identity alignment, URL redirect chains, or financial payout targets. Answers cite verified case vault evidence and Qdrant vector knowledge strictly.`,
      evidence_references: ['EV-VAULT', 'QDRANT-KB'],
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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);

      // Voice Speech Synthesis
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
      alert("Browser speech recognition unavailable in this browser. Type question below.");
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
    <div className="p-6 space-y-5 max-w-7xl mx-auto font-sans">
      {/* ── Top Header Banner ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2E33] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#181C20] border border-[#2A2E33] text-cyan-400 uppercase">
              RAG AI ENGINE v2.5
            </span>
            <span className="text-[10px] font-mono text-gray-500">GROUNDED MODEL INTERFACE</span>
          </div>
          <h1 className="text-xl font-bold font-mono text-white mt-1 flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            FORENSIC RAG COPILOT & VOICE INVESTIGATOR
          </h1>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#121518] border border-[#2A2E33]">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-400 text-[11px]">QDRANT VECTOR:</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#121518] border border-[#2A2E33]">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-gray-400 text-[11px]">MODEL:</span>
            <span className="text-purple-300 font-bold">GEMINI 2.5</span>
          </div>
        </div>
      </div>

      {/* ── Interactive Preset Quick Prompts ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-mono text-gray-500 font-bold uppercase shrink-0">QUICK PROMPTS:</span>
        {PROMPT_PRESETS.map((p, idx) => {
          const IconComp = p.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(p.query)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121518] border border-[#2A2E33] hover:border-cyan-500/50 hover:bg-[#181C20] text-xs font-mono text-gray-300 hover:text-white transition-all shrink-0 disabled:opacity-50"
            >
              <IconComp className="w-3.5 h-3.5 text-cyan-400" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Chat Area & Evidence Inspector Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Chat Box (Left 3 cols) */}
        <div className="lg:col-span-3 rounded-xl bg-[#121518] border border-[#2A2E33] h-[580px] flex flex-col justify-between p-5 relative overflow-hidden backdrop-blur-md">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  m.sender === 'USER'
                    ? 'bg-[#181C20] border-[#2A2E33] ml-12 text-gray-200'
                    : 'bg-[#0B0D0F] border-cyan-500/30 text-gray-100 shadow-lg shadow-cyan-500/5'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#2A2E33] pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    {m.sender === 'USER' ? (
                      <span className="font-bold text-[11px] text-gray-300 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-gray-400" />
                        ANALYST PROMPT
                      </span>
                    ) : (
                      <span className="font-bold text-[11px] text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        TRACE-X FORENSIC RAG
                      </span>
                    )}
                    {m.timestamp && (
                      <span className="text-[10px] text-gray-600 font-mono">[{m.timestamp}]</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Action buttons */}
                    <button
                      onClick={() => copyMessage(m.text, idx)}
                      className="p-1 rounded hover:bg-[#181C20] text-gray-500 hover:text-gray-300 transition-colors"
                      title="Copy response"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Evidence References Badges */}
                {m.evidence_references && m.evidence_references.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <span className="text-[9px] text-gray-500 font-bold uppercase">CITATIONS:</span>
                    {m.evidence_references.map(ref => (
                      <button
                        key={ref}
                        onClick={() => setSelectedRef(ref)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${
                          selectedRef === ref
                            ? 'bg-cyan-500 text-black border-cyan-400'
                            : 'bg-[#181C20] text-cyan-300 border-cyan-800 hover:border-cyan-500'
                        }`}
                      >
                        [{ref}]
                      </button>
                    ))}
                  </div>
                )}

                {/* Structured Answer Content */}
                <div className="whitespace-pre-wrap leading-relaxed space-y-2 text-gray-200">
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="p-4 rounded-xl bg-[#0B0D0F] border border-cyan-500/40 font-mono text-xs text-cyan-400 animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                  <span>Retrieving grounded evidence from case vault & Qdrant knowledge base...</span>
                </div>
                <span className="text-[10px] text-gray-500">EXPLAINABLE RAG</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Controls */}
          <div className="pt-4 border-t border-[#2A2E33] flex items-center gap-3 font-mono">
            <button
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-lg border transition-all ${
                listening
                  ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                  : 'bg-[#0B0D0F] text-gray-400 border-[#2A2E33] hover:text-white hover:border-[#40464E]'
              }`}
              title={listening ? "Listening..." : "Click to speak prompt"}
            >
              {listening ? <Mic className="w-4 h-4 text-red-400" /> : <MicOff className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask RAG investigator about case evidence..."
              className="flex-1 bg-[#0B0D0F] border border-[#2A2E33] rounded-lg px-4 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || loading}
              className="px-5 py-2.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center gap-2 shrink-0"
            >
              <span>SEND</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Evidence Inspector Drawer (Right 1 col) */}
        <div className="space-y-4 font-mono text-xs">
          {/* Active Case Context Card */}
          <div className="p-4 rounded-xl bg-[#121518] border border-[#2A2E33] space-y-3">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>CASE VAULT TARGET</span>
              <span className="text-emerald-400 font-bold">{caseId}</span>
            </div>

            {caseDetail ? (
              <div className="space-y-2 text-[11px]">
                <div className="text-white font-bold truncate" title={caseDetail.title}>{caseDetail.title}</div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>SENDER:</span>
                  <span className="text-gray-200 truncate max-w-[120px]">{caseDetail.email_from}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>THREAT SCORE:</span>
                  <span className="text-amber-400 font-bold">{caseDetail.threat_score.overall_score}/100</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>AUTHENTICATION:</span>
                  <span className={`font-bold ${caseDetail.auth_status.alignment === 'MISALIGNED' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {caseDetail.auth_status.alignment}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-[11px]">No active case loaded. RAG querying Qdrant knowledge base.</div>
            )}
          </div>

          {/* Citation / Evidence Inspector */}
          <div className="p-4 rounded-xl bg-[#121518] border border-[#2A2E33] space-y-3 h-[380px] flex flex-col">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-[#2A2E33] pb-2">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>EVIDENCE CITATION INSPECTOR</span>
            </div>

            {selectedRef ? (
              <div className="flex-1 overflow-y-auto space-y-2 animate-fade-in text-[11px]">
                <div className="p-2.5 rounded bg-[#0B0D0F] border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-between">
                  <span>[{selectedRef}]</span>
                  <span className="text-[9px] text-gray-500 font-normal">VERIFIED CITATION</span>
                </div>
                <div className="text-gray-300 leading-relaxed p-2 rounded bg-[#0B0D0F] border border-[#2A2E33]">
                  {selectedRef.startsWith('EV-') ? (
                    <span>Ground evidence extracted from ingested email MIME payload, headers, or 4-API threat reputation aggregators for case <strong>{caseId}</strong>.</span>
                  ) : (
                    <span>Retrieved document chunk from Qdrant vector collection (384-d BAAI embeddings). Grounded in MITRE ATT&CK & incident response procedures.</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-gray-500">
                <Search className="w-6 h-6 mb-2 opacity-30 text-cyan-400" />
                <p className="text-[11px]">Click any citation tag like <span className="text-cyan-400 font-bold">[EV-ID-01]</span> or <span className="text-purple-400 font-bold">[KB-01]</span> in chat responses to inspect proof details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
