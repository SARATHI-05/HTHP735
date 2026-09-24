import React from 'react';

export default function TabOverview({ queueData, onNavigateToQueue }) {
  const totalIngested = queueData?.total_ingested_claims || 128;
  const capacity = queueData?.daily_capacity_limit || 20;
  const harmMitigated = queueData?.estimated_harm_mitigated_pct || 87.8;
  const reviewedCount = queueData?.reviewed_count || 0;
  const escalatedCount = queueData?.escalated_count || 3;

  return (
    <div className="space-y-6">
      
      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Ingestion Volume */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>📥 Claims Ingested</span>
            <span className="text-slate-500 font-mono text-[11px]">30-Day Simulation</span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white font-mono">{totalIngested}</span>
            <span className="text-xs text-slate-400">active items</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center space-x-1">
            <span className="text-emerald-400 font-medium">100% evaluated</span>
            <span>via Multi-Signal NLP</span>
          </div>
        </div>

        {/* Card 2: High Risk Identified */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>🚨 Critical / High Risk</span>
            <span className="text-red-400 text-xs font-semibold">p ≥ 0.60</span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-red-400 font-mono">18</span>
            <span className="text-xs text-slate-400">high probability</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Includes <strong className="text-red-400">{escalatedCount} viral escalations</strong>
          </div>
        </div>

        {/* Card 3: Mitigated Harm Exposure */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>🎯 Harm Exposure Mitigated</span>
            <span className="text-sky-400 text-xs font-semibold font-mono">Top {capacity}</span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-sky-400 font-mono">{harmMitigated}%</span>
            <span className="text-xs text-emerald-400 font-semibold">▲ +21.2% lift</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            vs naive risk-only triage baseline
          </div>
        </div>

        {/* Card 4: Daily Capacity Utilization */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>⚡ Capacity Utilization</span>
            <span className="text-slate-400 font-mono text-[11px]">{reviewedCount} / {capacity}</span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono">
              {Math.min(100, Math.round((reviewedCount / capacity) * 100))}%
            </span>
            <span className="text-xs text-slate-400">active quota</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (reviewedCount / capacity) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Exposure Quadrant & Baseline Lift Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reach vs Risk 2D Matrix */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Prioritization Quadrant: Audience Reach vs. Calibrated Risk
              </h2>
              <p className="text-xs text-slate-400">
                Visualizing how Multi-Factor Triage prioritizes viral harm over obscure spam.
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono">log₁₀(Reach) × p</span>
          </div>

          <div className="grid grid-cols-2 gap-3 h-64 font-sans text-xs">
            
            {/* Top-Left: High Reach / Low Risk */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Viral Memes & Consensus News</span>
                <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono text-[10px]">High Reach / Low Risk</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Large audience exposure but verified consensus facts. Automated policy: <strong className="text-slate-300">Deprioritize</strong> (saves human capacity).
              </p>
              <div className="text-[10px] text-slate-500">Reach: 100k - 5M+ | Risk: &lt; 40%</div>
            </div>

            {/* Top-Right: High Reach / High Risk */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3.5 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-400 flex items-center gap-1">
                  <span>🚨</span> ESCALATE & TOP REVIEW
                </span>
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[10px]">High Reach / High Risk</span>
              </div>
              <p className="text-red-200/80 text-[11px] leading-relaxed">
                Critical public health, election, or financial falsehoods spreading virally. <strong className="text-red-300">Priority Rank #1–#20</strong> for immediate human debunking.
              </p>
              <div className="text-[10px] text-red-400/80 font-mono font-semibold">Priority: 1.20 – 2.25 (Top Daily Focus)</div>
            </div>

            {/* Bottom-Left: Low Reach / Low Risk */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-lg p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400">Benign Low-Reach Claims</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Low Reach / Low Risk</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Local discussion and uncontroversial posts. Automated policy: <strong className="text-slate-400">Deprioritize</strong>.
              </p>
              <div className="text-[10px] text-slate-600">Reach: &lt; 1k | Risk: &lt; 40%</div>
            </div>

            {/* Bottom-Right: Low Reach / High Risk */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-400">Low-Reach Falsehoods</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">Low Reach / High Risk</span>
              </div>
              <p className="text-amber-200/80 text-[11px] leading-relaxed">
                High probability falsehoods with negligible audience (10–50 views). Policy: <strong className="text-amber-300">Waitlist Backlog (+Aging Boost)</strong>.
              </p>
              <div className="text-[10px] text-amber-400/80">Prevents wasting reviewer hours on zero-impact spam.</div>
            </div>
          </div>
        </div>

        {/* Strategy Lift Comparison Table */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              30-Day Triage Lift Benchmark
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Fixed capacity: 20 reviews/day (600 total reviews).
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-sky-500/10 border border-sky-500/30">
                <div className="font-semibold text-sky-400">🛡️ Our Triage System</div>
                <div className="font-mono font-bold text-sky-300">87.8% Harm Caught</div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-700/50">
                <div className="text-slate-300">Risk-Only Sorting</div>
                <div className="font-mono text-slate-400">72.5% (-21.2% lift)</div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-700/50">
                <div className="text-slate-300">Reach-Only Sorting</div>
                <div className="font-mono text-slate-400">89.4% (wastes 58% labor)</div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-700/50">
                <div className="text-slate-300">Random / FIFO Triage</div>
                <div className="font-mono text-slate-400">45.1% (-94.9% lift)</div>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToQueue}
            className="mt-4 w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs transition shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Open Active Moderation Queue</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
