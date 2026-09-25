import React, { useState } from 'react';

export default function KpiStrip({
  queueData,
  capacity = 20,
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const totalToday = queueData?.total_ingested_claims || 128;
  const reviewed = queueData?.reviewed_count ?? 14;
  const escalations = queueData?.escalated_count ?? 4;
  const backlog = Math.max(0, totalToday - reviewed);
  const capacityPct = Math.min(100, Math.round((reviewed / Math.max(1, capacity)) * 100));

  const tooltips = {
    items: "Items Today: The total volume of regional media signals ingested, processed, and scored by the multi-signal model for this operational timeline.",
    capacity: "Daily Capacity: Daily human review quota allocated for high-harm mitigation before lower-exposure claims are deferred to the waitlist backlog.",
    escalations: "Escalations: High-probability misleading claims (Risk ≥ 80%) with viral reach that trigger mandatory legal or emergency advisories.",
    backlog: "Backlog Carried Over: Claims ranked beyond the daily capacity boundary deferred to the waitlist queue with priority aging multipliers.",
    risk: "Calibrated Risk: The mathematically calibrated probability (0-100%) that a statement is misleading based on linguistic, source, and consistency signals.",
    reach: "Audience Reach: The estimated or observed number of individuals exposed to the post across regional broadcast networks.",
    priority: "Priority Score: Harm-weighted triage ranking calculated as Calibrated Risk × log10(Reach) × Topic Severity × Age Multiplier.",
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Card 1: Items today */}
        <div
          className="relative bg-white border border-slate-200/80 rounded-xl p-3.5 lg:p-4 shadow-xs hover:border-slate-300 transition-all"
          onMouseEnter={() => setActiveTooltip('items')}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Items Today
            </span>
            <span className="material-symbols-outlined text-[18px] text-slate-400">inbox</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {totalToday}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              100% Scored
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Multi-signal NLP pipeline</span>
            <span className="text-slate-400 cursor-help" title="Click or hover for definition">ⓘ</span>
          </div>

          {activeTooltip === 'items' && (
            <div className="absolute left-0 bottom-full mb-2 w-64 p-2.5 bg-slate-900 text-slate-200 text-xs rounded-xl shadow-xl border border-slate-800 z-50 animate-fadeIn pointer-events-none">
              <p className="text-[11px] leading-relaxed">{tooltips.items}</p>
            </div>
          )}
        </div>

        {/* Card 2: Capacity used */}
        <div
          className="relative bg-white border border-slate-200/80 rounded-xl p-3.5 lg:p-4 shadow-xs hover:border-slate-300 transition-all"
          onMouseEnter={() => setActiveTooltip('capacity')}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Capacity Used
            </span>
            <span className="font-mono font-bold text-xs text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
              {reviewed}/{capacity} items
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {capacityPct}%
            </span>
            <span className="text-[11px] text-slate-500">
              ({Math.max(0, capacity - reviewed)} slots left)
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacityPct >= 100 ? 'bg-amber-500' : 'bg-sky-600'
              }`}
              style={{ width: `${Math.min(100, capacityPct)}%` }}
            ></div>
          </div>

          {activeTooltip === 'capacity' && (
            <div className="absolute left-0 bottom-full mb-2 w-64 p-2.5 bg-slate-900 text-slate-200 text-xs rounded-xl shadow-xl border border-slate-800 z-50 animate-fadeIn pointer-events-none">
              <p className="text-[11px] leading-relaxed">{tooltips.capacity}</p>
            </div>
          )}
        </div>

        {/* Card 3: Escalations */}
        <div
          className="relative bg-white border border-slate-200/80 rounded-xl p-3.5 lg:p-4 shadow-xs hover:border-slate-300 transition-all"
          onMouseEnter={() => setActiveTooltip('escalations')}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Escalations
            </span>
            <span className="material-symbols-outlined text-[18px] text-rose-500">emergency</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-rose-600 tracking-tight">
              {escalations}
            </span>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              Viral Threat
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>High Risk (≥80%) + High Reach</span>
            <span className="text-slate-400 cursor-help">ⓘ</span>
          </div>

          {activeTooltip === 'escalations' && (
            <div className="absolute left-0 bottom-full mb-2 w-64 p-2.5 bg-slate-900 text-slate-200 text-xs rounded-xl shadow-xl border border-slate-800 z-50 animate-fadeIn pointer-events-none">
              <p className="text-[11px] leading-relaxed">{tooltips.escalations}</p>
            </div>
          )}
        </div>

        {/* Card 4: Backlog carried over */}
        <div
          className="relative bg-white border border-slate-200/80 rounded-xl p-3.5 lg:p-4 shadow-xs hover:border-slate-300 transition-all"
          onMouseEnter={() => setActiveTooltip('backlog')}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Backlog Carried Over
            </span>
            <span className="material-symbols-outlined text-[18px] text-slate-400">hourglass_top</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-slate-800 tracking-tight">
              {backlog}
            </span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Waitlist
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Priority aging boost active</span>
            <span className="text-slate-400 cursor-help">ⓘ</span>
          </div>

          {activeTooltip === 'backlog' && (
            <div className="absolute right-0 bottom-full mb-2 w-64 p-2.5 bg-slate-900 text-slate-200 text-xs rounded-xl shadow-xl border border-slate-800 z-50 animate-fadeIn pointer-events-none">
              <p className="text-[11px] leading-relaxed">{tooltips.backlog}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
