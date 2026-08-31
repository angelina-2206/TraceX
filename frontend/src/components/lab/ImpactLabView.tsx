import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { CaseDetail } from '../../types';

interface ImpactLabViewProps {
  caseDetail: CaseDetail;
}

export const ImpactLabView: React.FC<ImpactLabViewProps> = ({ caseDetail }) => {
  const [removeUrl, setRemoveUrl] = useState(false);
  const [assumeSpfPass, setAssumeSpfPass] = useState(false);
  const [disconnectCampaign, setDisconnectCampaign] = useState(false);
  const [removeReplyMismatch, setRemoveReplyMismatch] = useState(false);
  
  const [simulatedResult, setSimulatedResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/cases/${caseDetail.case_id}/impact-lab?remove_url=${removeUrl}&assume_spf_pass=${assumeSpfPass}&disconnect_campaign=${disconnectCampaign}&remove_reply_mismatch=${removeReplyMismatch}`, {
        method: 'POST'
      });
      const data = await res.json();
      setSimulatedResult(data);
    } catch (e) {
      console.error("Impact lab simulation error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [removeUrl, assumeSpfPass, disconnectCampaign, removeReplyMismatch, caseDetail.case_id]);

  const originalScore = caseDetail.threat_score.overall_score;

  return (
    <div className="space-y-6 p-6">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <span>TRACE-X IMPACT LAB — COUNTERFACTUAL RISK SENSITIVITY</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Simulate hypothetical counterfactual scenarios ("What if SPF passed?", "What if suspicious URL is removed?") to quantify exact threat score drivers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Counterfactual Switches (Left 2 columns) */}
        <div className="lg:col-span-2 forensic-card p-6 space-y-6 font-mono text-xs">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
            HYPOTHETICAL EVIDENCE MODIFIERS
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Remove Suspicious URL & Redirect Chain</div>
                <div className="text-[11px] text-slate-400">Hypothesize email contains no external redirect links.</div>
              </div>
              <input
                type="checkbox"
                checked={removeUrl}
                onChange={(e) => setRemoveUrl(e.target.checked)}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Assume SPF Authentication PASS</div>
                <div className="text-[11px] text-slate-400">Hypothesize sender infrastructure passed SPF domain verification.</div>
              </div>
              <input
                type="checkbox"
                checked={assumeSpfPass}
                onChange={(e) => setAssumeSpfPass(e.target.checked)}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Disconnect Historical Campaign Correlation</div>
                <div className="text-[11px] text-slate-400">Hypothesize case has no historical campaign memory overlap.</div>
              </div>
              <input
                type="checkbox"
                checked={disconnectCampaign}
                onChange={(e) => setDisconnectCampaign(e.target.checked)}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Align Reply-To Domain with Visible Sender</div>
                <div className="text-[11px] text-slate-400">Hypothesize Reply-To domain matches visible sender.</div>
              </div>
              <input
                type="checkbox"
                checked={removeReplyMismatch}
                onChange={(e) => setRemoveReplyMismatch(e.target.checked)}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Threat Score Delta Display (Right column) */}
        <div className="forensic-card p-6 flex flex-col justify-between font-mono text-xs">
          <div>
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              SIMULATED THREAT SCORE DELTA
            </h3>

            <div className="py-6 space-y-4 text-center">
              <div className="flex items-center justify-center space-x-4">
                <div>
                  <div className="text-[10px] text-slate-400">ACTUAL SCORE</div>
                  <div className="text-2xl font-bold text-red-400">{originalScore.toFixed(1)}</div>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-600" />

                <div>
                  <div className="text-[10px] text-slate-400">SIMULATED SCORE</div>
                  <div className="text-2xl font-bold text-cyan-300">
                    {simulatedResult ? simulatedResult.simulated_score.toFixed(1) : originalScore.toFixed(1)}
                  </div>
                </div>
              </div>

              {simulatedResult && (
                <div className="p-3 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">NET RISK IMPACT</div>
                  <div className={`text-base font-bold mt-1 ${
                    simulatedResult.score_delta < 0 ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {simulatedResult.score_delta < 0 ? '' : '+'}{simulatedResult.score_delta} POINTS ({simulatedResult.impact_direction})
                  </div>
                </div>
              )}
            </div>

            {simulatedResult && simulatedResult.simulated_changes.length > 0 && (
              <div className="space-y-2">
                <div className="text-slate-400 text-[11px]">APPLIED HYPOTHESES:</div>
                {simulatedResult.simulated_changes.map((change: string, idx: number) => (
                  <div key={idx} className="text-[11px] text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800">
                    • {change}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-400">
            <span>Counterfactual analysis demonstrates which specific evidence items exerted highest influence on the classification.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
