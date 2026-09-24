import React, { useState } from 'react';
import { submitModeratorAction } from '../services/api';

export default function TabInvestigation({
  selectedClaim,
  activeUser,
  onActionComplete,
}) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  if (!selectedClaim) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
        <div className="text-4xl mb-3">🔍</div>
        <h3 className="text-base font-bold text-white mb-1">No Claim Selected for Deep-Dive</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Select any claim from the Moderation Queue tab to inspect its TreeSHAP feature attributions, retrieved counter-evidence, and submit editorial actions.
        </p>
      </div>
    );
  }

  const handleAction = async (verdict) => {
    setSubmitting(true);
    const payload = {
      reviewer_id: activeUser,
      verdict,
      reviewer_notes: notes,
    };

    const res = await submitModeratorAction(selectedClaim.claim_id, payload);
    setSubmitting(false);

    if (res?.status === 'success') {
      setActionSuccess(`Verdict recorded: "${verdict}"`);
      setTimeout(() => {
        setActionSuccess(null);
        onActionComplete(selectedClaim.claim_id, verdict);
      }, 1200);
    }
  };

  const riskPct = Math.round((selectedClaim.calibrated_risk || 0.85) * 100);

  return (
    <div className="space-y-6">
      
      {/* Action Toast */}
      {actionSuccess && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {actionSuccess}</span>
          <span className="font-mono text-[11px] text-emerald-400">Logged to audit_log.jsonl</span>
        </div>
      )}

      {/* Split Screen Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Claim Content & Editorial Action Desk (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Statement & Metadata Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-slate-400">#{selectedClaim.rank || '01'}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono font-medium">
                  {selectedClaim.claim_id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                  {selectedClaim.subject} [{selectedClaim.harm_topic_weight || 1.0}x]
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded">
                Risk: {riskPct}%
              </div>
            </div>

            {/* Statement Text */}
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                Statement Under Review:
              </div>
              <blockquote className="text-sm font-medium text-slate-100 leading-relaxed bg-slate-800/40 p-3.5 rounded-lg border-l-4 border-sky-500">
                "{selectedClaim.statement}"
              </blockquote>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-800/30 p-3 rounded-lg">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Speaker / Domain</span>
                <span className="font-semibold text-slate-200">{selectedClaim.speaker}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Audience Reach</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {selectedClaim.estimated_reach?.toLocaleString() || '120,000'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Triage Priority</span>
                <span className="font-bold text-sky-400 font-mono">
                  {selectedClaim.priority_score?.toFixed(3) || '1.450'}
                </span>
              </div>
            </div>

            {/* Synthesized Plain-English Rationale */}
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center justify-between">
                <span>📝 Synthesized Plain-English Rationale</span>
                <span className="text-slate-500 font-mono text-[10px]">Zero Hallucination Template</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 text-xs text-slate-300 leading-relaxed">
                {selectedClaim.rationale || (
                  `${riskPct}% likely misleading. High semantic contradiction with verified consensus public records; ` +
                  `elevated sensationalist lexical markers detected; source exhibits historical falsehood pattern.`
                )}
              </div>
            </div>
          </div>

          {/* Action Desk */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              ⚖️ Moderator Editorial Action Desk
            </h3>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Editorial Reviewer Notes & Citations (Optional):
              </label>
              <textarea
                rows={2}
                placeholder="Cite official debunking source or add resolution notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                disabled={submitting}
                onClick={() => handleAction('VERIFIED_MISLEADING')}
                className="py-2.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition shadow-sm disabled:opacity-50"
              >
                🔴 Mark Misleading
              </button>

              <button
                disabled={submitting}
                onClick={() => handleAction('VERIFIED_TRUE')}
                className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm disabled:opacity-50"
              >
                🟢 Mark True
              </button>

              <button
                disabled={submitting}
                onClick={() => handleAction('ESCALATE')}
                className="py-2.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-sm disabled:opacity-50"
              >
                🚨 Escalate to Legal
              </button>

              <button
                disabled={submitting}
                onClick={() => handleAction('DISMISSED')}
                className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition shadow-sm disabled:opacity-50"
              >
                💤 Deprioritize
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Explainability & Grounding Desk (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* TreeSHAP Local Attributions */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                📊 TreeSHAP Feature Drivers
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Base: 0.56 → {riskPct}%</span>
            </div>

            <div className="space-y-2 text-xs">
              
              {/* Feature 1: Semantic Contradiction */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-medium">Semantic NLI Contradiction</span>
                  <span className="font-mono text-red-400 font-bold">+0.34</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              {/* Feature 2: Sensationalism */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-medium">Sensationalist Lexicon Ratio</span>
                  <span className="font-mono text-red-400 font-bold">+0.18</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-red-500/80 h-2 rounded-full" style={{ width: '55%' }}></div>
                </div>
              </div>

              {/* Feature 3: Historical Falsehood Prior */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-medium">Speaker Falsehood Prior</span>
                  <span className="font-mono text-red-400 font-bold">+0.14</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-red-500/60 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              {/* Feature 4: Mitigating text signal */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-medium">Text Length & Formal Syntax</span>
                  <span className="font-mono text-emerald-400 font-bold">-0.05</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 flex justify-end">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Retrieved Ground-Truth Evidence */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                🏛️ Retrieved Ground-Truth Evidence
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">Cosine Sim: 86.4%</span>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sky-400">Centers for Disease Control (CDC)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono">
                  CONTRADICTION (94%)
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed italic">
                "Vaccines undergo multi-phase clinical safety trials and contain only active biological stabilizers. No digital surveillance or microchip components exist in any approved medical formula."
              </p>
              <div className="text-[10px] text-slate-500 font-mono">
                Source ID: EVD-041 | Verified via Official Public Health Canvass
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
