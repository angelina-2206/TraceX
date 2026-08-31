import React, { useState, useEffect } from 'react';
import { Bot, Send, Mic, MicOff, Sparkles, ShieldCheck, AlertCircle, Database, Volume2 } from 'lucide-react';
import { CaseDetail } from '../../types';

interface ForensicRagCopilotViewProps {
  caseDetail: CaseDetail;
  voiceActive: boolean;
}

interface Message {
  sender: 'USER' | 'AI';
  text: string;
  evidence_references?: string[];
}

export const ForensicRagCopilotView: React.FC<ForensicRagCopilotViewProps> = ({
  caseDetail,
  voiceActive
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'AI',
      text: `### TRACE-X FORENSIC RAG COPILOT — READY FOR CASE ${caseDetail.case_id}\n\nAsk any question regarding observable headers, sender identity alignment, URL redirect chains, or geo-financial evidence. Answers cite verified evidence references strictly.`,
      evidence_references: []
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim()) return;

    const userMsg: Message = { sender: 'USER', text };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/cases/${caseDetail.case_id}/rag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
      });
      const data = await res.json();
      
      const aiMsg: Message = {
        sender: 'AI',
        text: data.answer,
        evidence_references: data.evidence_references
      };
      setMessages(prev => [...prev, aiMsg]);

      // Voice Text-To-Speech if Voice Active
      if (voiceActive && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const cleanSpeech = data.answer.replace(/\[.*?\]/g, ''); // strip markdown tags for speech
        const utterance = new SpeechSynthesisUtterance(cleanSpeech.substring(0, 200));
        synth.speak(utterance);
      }
    } catch (e) {
      console.error("RAG query error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Web Speech API Microphone Handler
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Browser speech recognition unavailable. Type question below.");
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
    <div className="space-y-6 p-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center space-x-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <span>FORENSIC RAG AI INVESTIGATOR & VOICE COPILOT</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Grounded evidence retriever enforcing strict separation between [FACT], [INFERENCE], and [UNCERTAINTY].
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Prompts Panel (Left column) */}
        <div className="forensic-card p-4 space-y-3 font-mono text-xs">
          <div className="text-slate-400 font-bold uppercase text-[11px]">INVESTIGATION QUICK PROMPTS</div>
          <button
            onClick={() => handleSend(`Why is ${caseDetail.case_id} considered business email compromise?`)}
            className="w-full text-left p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-300 transition-all"
          >
            "Why is this email suspicious?"
          </button>
          <button
            onClick={() => handleSend("Show me the reconstructed flight path and relay headers.")}
            className="w-full text-left p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-300 transition-all"
          >
            "Show me the infrastructure path."
          </button>
          <button
            onClick={() => handleSend("What are the extracted financial payout clues and bank details?")}
            className="w-full text-left p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-300 transition-all"
          >
            "Where are the financial destination clues?"
          </button>
        </div>

        {/* RAG Chat Box (Right 3 columns) */}
        <div className="lg:col-span-3 forensic-card h-[550px] flex flex-col justify-between p-6">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  m.sender === 'USER'
                    ? 'bg-slate-950 border-slate-800 ml-12 text-slate-200'
                    : 'bg-slate-900 border-cyan-500/30 text-slate-100 shadow-md shadow-cyan-500/5'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                  <span className="font-bold text-[11px] text-cyan-400 flex items-center space-x-1.5">
                    {m.sender === 'USER' ? 'ANALYST PROMPT' : 'TRACE-X FORENSIC RAG'}
                  </span>
                  {m.evidence_references && m.evidence_references.length > 0 && (
                    <div className="flex items-center space-x-1">
                      {m.evidence_references.map(ref => (
                        <span key={ref} className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                          [{ref}]
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
              </div>
            ))}

            {loading && (
              <div className="p-4 rounded-lg bg-slate-900 border border-cyan-500/30 font-mono text-xs text-cyan-400 animate-pulse">
                Retrieving grounded evidence from case vault...
              </div>
            )}
          </div>

          {/* Input Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center space-x-3 font-mono">
            <button
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded border transition-all ${
                listening
                  ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {listening ? <Mic className="w-4 h-4 text-red-400" /> : <MicOff className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask RAG investigator about case evidence..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || loading}
              className="px-4 py-2.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30 disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              <span>SEND</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
