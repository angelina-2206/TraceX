import React, { useState } from 'react';
import { BarChart3, TrendingDown, ShieldCheck, DollarSign, Calculator, AlertCircle } from 'lucide-react';
import { CaseDetail } from '../../types';

interface ExecutiveRiskViewProps {
  caseDetail: CaseDetail;
}

export const ExecutiveRiskView: React.FC<ExecutiveRiskViewProps> = ({ caseDetail }) => {
  const [investmentLakhs, setInvestmentLakhs] = useState<number>(5);

  const threat = caseDetail.threat_score;
  const baseExposureINR = 485000 * 4; // ₹ 19.4 Lakhs modeled exposure

  // Risk Reduction Calculation Model
  const riskReductionPct = Math.min(85, investmentLakhs * 7.5);
  const projectedLossINR = Math.max(72000, baseExposureINR * (1 - riskReductionPct / 100));
  const netSavedINR = baseExposureINR - projectedLossINR;

  return (
    <div className="space-y-6 p-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span>EXECUTIVE RISK VIEW & FINANCIAL EXPOSURE SIMULATOR</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          High-level institutional campaign exposure metrics, decomposed risk vectors, and security investment ROI simulator.
        </p>
      </div>

      {/* High-Level Executive Risk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="forensic-card p-5">
          <div className="text-slate-400 text-[11px]">MODELED EXPOSURE</div>
          <div className="text-xl font-bold text-red-400 mt-1">
            ₹ {(baseExposureINR / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[10px] text-slate-400 mt-1">4 Potential Compromise Incidents</div>
        </div>

        <div className="forensic-card p-5">
          <div className="text-slate-400 text-[11px]">THREAT SEVERITY</div>
          <div className="text-xl font-bold text-amber-400 mt-1 uppercase">
            {threat.severity} ({threat.overall_score}/100)
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Requires SOC Escalation</div>
        </div>

        <div className="forensic-card p-5">
          <div className="text-slate-400 text-[11px]">PROJECTED LOSS (POST-INVESTMENT)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            ₹ {(projectedLossINR / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{riskReductionPct.toFixed(0)}% Risk Mitigated</div>
        </div>

        <div className="forensic-card p-5">
          <div className="text-slate-400 text-[11px]">ESTIMATED ROI</div>
          <div className="text-xl font-bold text-cyan-300 mt-1">
            {((netSavedINR / (investmentLakhs * 100000)) * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Net Savings: ₹ {(netSavedINR / 100000).toFixed(2)}L</div>
        </div>
      </div>

      {/* Security Investment Interactive Slider */}
      <div className="forensic-card p-6 space-y-6 font-mono text-xs">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>SECURITY CONTROL INVESTMENT SIMULATOR</span>
          </span>
          <span className="text-cyan-400 font-bold">CONFIGURE SECURITY BUDGET</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-slate-200">
            <span>ANNUAL SECURITY INVESTMENT:</span>
            <span className="text-cyan-400 font-bold text-base">₹ {investmentLakhs} LAKHS INR</span>
          </div>

          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={investmentLakhs}
            onChange={(e) => setInvestmentLakhs(Number(e.target.value))}
            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex justify-between text-[10px] text-slate-500">
            <span>₹ 1L (Basic Filter)</span>
            <span>₹ 10L (MDR + TRACE-X SOC)</span>
            <span>₹ 20L (Full Enterprise Zero-Trust)</span>
          </div>
        </div>

        {/* Executive Disclaimer */}
        <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Illustrative risk exposure model based on configured organization parameters. Not a guaranteed financial forecast.</span>
        </div>
      </div>
    </div>
  );
};
