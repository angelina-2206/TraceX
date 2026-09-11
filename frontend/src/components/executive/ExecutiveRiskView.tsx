import React, { useState } from 'react';
import { BarChart3, TrendingDown, ShieldCheck, DollarSign, Calculator, AlertCircle } from 'lucide-react';
import { CaseDetail } from '../../types';
import { PageHeader } from '../common/PageHeader';

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
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ── Page Header ── */}
      <PageHeader
        breadcrumbs={['ANVESHAK', caseDetail.case_id, 'Governance', 'Executive Risk']}
        title="Executive Risk View & Financial Exposure Simulator"
        description="High-level institutional campaign exposure metrics, decomposed risk vectors, and security control investment ROI simulator."
        metadata={
          <>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              Modeled Exposure: ₹ {(baseExposureINR / 100000).toFixed(2)} Lakhs
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              Overall Severity: {threat.severity}
            </span>
          </>
        }
      />

      {/* High-Level Executive Risk Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="tracex-card p-5">
          <div className="text-[var(--text-muted)] text-[11px] font-semibold uppercase">Modeled Exposure</div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 code-mono">
            ₹ {(baseExposureINR / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1">4 Potential Compromise Incidents</div>
        </div>

        <div className="tracex-card p-5">
          <div className="text-[var(--text-muted)] text-[11px] font-semibold uppercase">Threat Severity</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 uppercase">
            {threat.severity} ({threat.overall_score}/100)
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1">Requires SOC Escalation</div>
        </div>

        <div className="tracex-card p-5">
          <div className="text-[var(--text-muted)] text-[11px] font-semibold uppercase">Projected Loss (Mitigated)</div>
          <div className="text-xl font-bold text-[var(--blue-primary)] mt-1 code-mono">
            ₹ {(projectedLossINR / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1">{riskReductionPct.toFixed(0)}% Risk Mitigated</div>
        </div>

        <div className="tracex-card p-5">
          <div className="text-[var(--text-muted)] text-[11px] font-semibold uppercase">Estimated ROI</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 code-mono">
            {((netSavedINR / (investmentLakhs * 100000)) * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1">Net Savings: ₹ {(netSavedINR / 100000).toFixed(2)}L</div>
        </div>
      </div>

      {/* Security Investment Interactive Slider */}
      <div className="tracex-card p-6 space-y-6 text-xs">
        <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-[var(--blue-primary)]" />
            <span>Security Control Investment Simulator</span>
          </span>
          <span className="text-[var(--blue-primary)] font-semibold">CONFIGURE SECURITY BUDGET</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-[var(--text-primary)]">
            <span className="font-medium text-sm">ANNUAL SECURITY INVESTMENT:</span>
            <span className="text-[var(--blue-primary)] font-bold text-base code-mono">₹ {investmentLakhs} LAKHS INR</span>
          </div>

          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={investmentLakhs}
            onChange={(e) => setInvestmentLakhs(Number(e.target.value))}
            className="w-full h-2 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--blue-primary)]"
          />

          <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>₹ 1L (Basic Filter)</span>
            <span>₹ 10L (MDR + ANVESHAK SOC)</span>
            <span>₹ 20L (Full Enterprise Zero-Trust)</span>
          </div>
        </div>

        {/* Executive Disclaimer */}
        <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[11px] text-[var(--text-muted)] flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Illustrative risk exposure model based on configured organizational parameters. Not a guaranteed financial forecast.</span>
        </div>
      </div>
    </div>
  );
};
