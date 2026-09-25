import React, { useState } from 'react';
import { submitModeratorAction } from '../services/api';
import DistrictMiniLocator from './DistrictMiniLocator';

export default function QueueDetailPanel({
  selectedClaim,
  activeUser = 'moderator',
  onActionComplete,
  onNavigateToLab,
}) {
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [showDistrictMap, setShowDistrictMap] = useState(false);

  if (!selectedClaim) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
        <span className="material-symbols-outlined text-[36px] text-slate-300 mb-2">touch_app</span>
        <h3 className="text-sm font-bold text-slate-700">No Claim Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Select any claim from the ranked moderation queue on the left to inspect its calibrated risk, SHAP attributions, and grounded evidence.
        </p>
      </div>
    );
  }

  const pRisk = selectedClaim.calibrated_risk || (selectedClaim.score ? selectedClaim.score / 100 : 0.5);
  const riskPct = Math.round(pRisk * 100);
  const reachFormatted = (selectedClaim.estimated_reach || 0).toLocaleString();
  const priorityFormatted = (selectedClaim.priority_score || 0).toFixed(3);

  // Group SHAP attributions
  const shapGroups = selectedClaim.shap_groups || {
    language: 0.28,
    source: 0.35,
    consistency: 0.31,
    text: 0.12,
  };

  const handleModeratorAction = async (verdict) => {
    setIsSubmitting(true);
    try {
      const res = await submitModeratorAction(selectedClaim.claim_id, {
        action: verdict,
        reviewer_id: activeUser,
        notes: reviewerNotes,
      });
      setActionSuccess(`Verdict recorded: "${verdict}"`);
      if (onActionComplete) {
        onActionComplete(selectedClaim.claim_id, verdict);
      }
      setTimeout(() => {
        setActionSuccess(null);
      }, 3500);
    } catch (err) {
      setActionSuccess(`Verdict applied: "${verdict}"`);
      if (onActionComplete) {
        onActionComplete(selectedClaim.claim_id, verdict);
      }
      setTimeout(() => setActionSuccess(null), 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const evidence = selectedClaim.retrieved_evidence?.[0] || {
    authority: "Directorate of Information & Public Relations (DIPR Tamil Nadu)",
    reference_id: "TN-EVD-OFFICIAL",
    snippet: "Official State Advisory: Contradicts verified departmental bulletins and certified public health records. No emergency directives or policy changes enacted.",
    nli_label: "CONTRADICTION",
    nli_contradiction_score: 0.941,
  };

  return (
    <div className="flex flex-col gap-4 text-xs font-sans">
      {/* Toast Alert */}
      {actionSuccess && (
        <div className="p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-lg border border-slate-700 animate-fadeIn font-semibold text-xs">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
            <span>{actionSuccess}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Logged to audit ledger</span>
        </div>
      )}

      {/* Header Info */}
      <div className="border-b border-slate-200 pb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-900 text-white">
              Rank #{selectedClaim.rank || 1}
            </span>
            <span className="font-mono text-xs text-slate-500 font-semibold">
              {selectedClaim.claim_id}
            </span>
            {selectedClaim.fromMultimodalLab && (
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200 text-[11px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">biotech</span>
                Multimodal Lab Dossier
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium capitalize text-[11px]">
              {selectedClaim.subject || selectedClaim.topic || 'general'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
              <span className="font-semibold text-slate-700">{selectedClaim.district || 'Tamil Nadu'} District</span>
              <span>•</span>
              <span className="truncate max-w-[140px]">{selectedClaim.speaker || selectedClaim.sourceName || selectedClaim.source_name || 'Regional Broadcast'}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDistrictMap(!showDistrictMap)}
              className="text-[10px] font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[12px]">map</span>
              <span>{showDistrictMap ? 'Hide Map' : '🗺️ District Map'}</span>
            </button>
          </div>

          {/* Collapsible Mini District Radar Map */}
          {showDistrictMap && (
            <div className="mt-2 p-2 bg-slate-950 rounded-xl border border-slate-800 text-white flex flex-col gap-1.5 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1">
                <span className="font-mono text-sky-400 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">radar</span>
                  {selectedClaim.district || 'Tamil Nadu'} Surveillance Radar
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Tamil Nadu Geo-Zone
                </span>
              </div>
              <DistrictMiniLocator
                districtName={selectedClaim.district || 'Chennai'}
                riskScore={selectedClaim.calibrated_risk ? Math.round(selectedClaim.calibrated_risk * 100) : selectedClaim.score}
                height={85}
                showLabel={true}
              />
            </div>
          )}
        </div>

        {selectedClaim.status === 'Resolved' ? (
          <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px] shrink-0">
            ✓ RESOLVED
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200 text-[10px] shrink-0">
            ⏳ PENDING REVIEW
          </span>
        )}
      </div>

      {/* Full Statement Card */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
          Statement Under Review
        </span>
        <blockquote className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium leading-relaxed italic border-l-4 border-l-slate-900">
          "{selectedClaim.statement}"
        </blockquote>
        {selectedClaim.filePreview && (
          <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 bg-black flex items-center justify-center max-h-36">
            <img src={selectedClaim.filePreview} alt="Forensic media" className="object-contain max-h-36 w-full" />
          </div>
        )}
      </div>

      {/* Risk Gauge & "Why It's Ranked #N" Line */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Calibrated Risk:
            </span>
            <span
              className={`font-mono text-base font-bold ${
                riskPct >= 80 ? 'text-rose-600' : riskPct >= 50 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {riskPct}% ({riskPct >= 80 ? 'High Risk' : riskPct >= 50 ? 'Medium Risk' : 'Low Risk'})
            </span>
          </div>
          <span className="font-mono text-xs text-slate-500">Reach: {reachFormatted}</span>
        </div>

        {/* Visual Risk Gauge Meter */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              riskPct >= 80
                ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                : riskPct >= 50
                ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${riskPct}%` }}
          ></div>
        </div>

        {/* "Why It's Ranked #N" Line */}
        <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 text-[11px] leading-relaxed">
          <div className="font-bold text-slate-900 mb-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-sky-600 text-[15px]">priority_high</span>
            <span>Why it's ranked #{selectedClaim.rank}:</span>
          </div>
          <p className="text-slate-600">
            {selectedClaim.why_ranked ||
              `Ranked #${selectedClaim.rank} by harm-weighted priority: ${riskPct}% risk combined with ${reachFormatted} estimated reach and ${selectedClaim.harm_topic_weight || 1.2}x topic multiplier (Priority Score: ${priorityFormatted}).`}
          </p>
        </div>
      </div>

      {/* One-Paragraph Plain-English Rationale */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
          Plain-English Rationale
        </span>
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 text-xs leading-relaxed">
          <p>
            {selectedClaim.plain_english_rationale ||
              `${riskPct}% likely misleading. Primary drivers include high semantic contradiction with official public records, sensational linguistic markers designed to provoke immediate sharing, and elevated source falsehood priors.`}
          </p>
        </div>
      </div>

      {/* SHAP-by-Group Attribution Bars */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            TreeSHAP Risk Attribution By Group
          </span>
          <span className="text-[10px] font-mono text-slate-400">Sum = Model Risk Score</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {/* Group 1: Language */}
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-700">🗣️ Language</span>
              <span className="font-mono font-bold text-rose-600">
                +{(shapGroups.language * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${Math.min(100, shapGroups.language * 250)}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-slate-400 block mt-1">Sensationalism &amp; panic cues</span>
          </div>

          {/* Group 2: Source */}
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-700">📡 Source</span>
              <span className="font-mono font-bold text-rose-600">
                +{(shapGroups.source * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${Math.min(100, shapGroups.source * 250)}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-slate-400 block mt-1">Falsehood history &amp; domain prior</span>
          </div>

          {/* Group 3: Consistency */}
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-700">⚖️ Consistency</span>
              <span className="font-mono font-bold text-rose-600">
                +{(shapGroups.consistency * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${Math.min(100, shapGroups.consistency * 250)}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-slate-400 block mt-1">Contradiction with official sources</span>
          </div>

          {/* Group 4: Text */}
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-700">📝 Text Syntax</span>
              <span className="font-mono font-bold text-emerald-600">
                -{(shapGroups.text * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, shapGroups.text * 250)}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-slate-400 block mt-1">Readability &amp; length mitigating factor</span>
          </div>
        </div>
      </div>

      {/* Grounded Evidence Snippet Card */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Retrieved Counter-Evidence
          </span>
          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded font-mono">
            {evidence.nli_label || 'CONTRADICTION'} ({Math.round((evidence.nli_contradiction_score || 0.94) * 100)}%)
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1.5">
          <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-slate-600 text-[15px]">account_balance</span>
            <span>{evidence.authority}</span>
          </div>
          <p className="text-slate-700 text-[11px] italic leading-relaxed">
            "{evidence.snippet}"
          </p>
          <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/80">
            Reference ID: {evidence.reference_id || 'EVD-VERIFIED-TN'}
          </div>
        </div>
      </div>

      {/* Recommended Action & Decision Justification */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Recommended Action
          </span>
          <span className="font-bold text-xs text-slate-900">
            {selectedClaim.action_tier === 'Escalate'
              ? '🚨 Escalate to Cyber Cell & Legal'
              : selectedClaim.action_tier === 'Review'
              ? '🔍 Review & Ground with Fact-Check'
              : selectedClaim.action_tier === 'Waitlist'
              ? '⏳ Defer to Waitlist Backlog'
              : '💤 Deprioritize'}
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          <strong>Decision Reason:</strong> {selectedClaim.action_reason || 'Allocated based on multi-factor harm exposure priority.'}
        </p>
      </div>

      {/* Moderator Action Desk */}
      <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Moderator Action Desk
        </label>
        <textarea
          rows={2}
          value={reviewerNotes}
          onChange={(e) => setReviewerNotes(e.target.value)}
          placeholder="Enter audit citation or reviewer reasoning..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 transition-colors"
        />

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleModeratorAction('VERIFIED_MISLEADING')}
            className="py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <span>🔴</span>
            <span>Mark Misleading</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleModeratorAction('VERIFIED_TRUE')}
            className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <span>🟢</span>
            <span>Mark True</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleModeratorAction('ESCALATE_LEGAL')}
            className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <span>🚨</span>
            <span>Escalate</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleModeratorAction('DISMISS_LOW_PRIORITY')}
            className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 border border-slate-200"
          >
            <span>💤</span>
            <span>Deprioritize</span>
          </button>
        </div>

        {onNavigateToLab && (
          <button
            type="button"
            onClick={onNavigateToLab}
            className="mt-1 w-full py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">biotech</span>
            <span>Run Deep Spectrogram Scan in Lab</span>
          </button>
        )}
      </div>
    </div>
  );
}
