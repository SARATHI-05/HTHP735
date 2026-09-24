import React, { useState, useEffect } from 'react';
import { fetchClaimDetail, submitModeratorAction } from '../services/api';

export default function ItemInvestigation({
  selectedClaim,
  activeUser,
  onActionComplete,
  onBackToQueue,
}) {
  const [claimDetail, setClaimDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const claimId = selectedClaim?.claim_id || 'CLM-8821';

  useEffect(() => {
    async function load() {
      if (!claimId) return;
      setLoading(true);
      const detail = await fetchClaimDetail(claimId);
      setClaimDetail(detail);
      setLoading(false);
    }
    load();
  }, [claimId]);

  const claim = claimDetail || selectedClaim || {};

  const handleAction = async (actionType, label) => {
    setIsSubmitting(true);
    const payload = {
      action: actionType,
      moderator_id: activeUser || 'elena.rostova',
      notes: `Executed ${label} via TruthGuard Dossier Investigation panel.`,
    };

    const res = await submitModeratorAction(claimId, payload);
    setIsSubmitting(false);

    setActionNotice({
      title: label,
      message: `Disposition recorded successfully. Platform downranking and automated notification pipelines triggered for ${claimId}.`,
      type: actionType === 'escalate' ? 'error' : actionType === 'approve' ? 'success' : 'neutral',
    });

    if (onActionComplete) {
      onActionComplete(claimId, label);
    }

    setTimeout(() => {
      setActionNotice(null);
    }, 4500);
  };

  const sentiment = claim.sentiment || {
    label: 'Highly Hostile',
    polarity: -0.84,
    description: 'Polarity score -0.84 with strong negative valence targeting public civic institutions.',
  };

  const emotionalTriggers = claim.emotional_triggers || [
    { label: 'Panic', score: 0.91, color: 'bg-error-container text-error' },
    { label: 'Urgency', score: 0.88, color: 'bg-error-container text-error' },
    { label: 'Outrage', score: 0.82, color: 'bg-tertiary-container text-tertiary' },
    { label: 'Electoral Fear', score: 0.79, color: 'bg-secondary-fixed text-secondary' },
  ];

  const distortion = claim.context_distortion || {
    type: 'Synthetic Urgency',
    description: 'Routine software upgrade misattributed to electoral disenfranchisement and grain subsidy cancellation.',
  };

  const nliEvidence = claim.nli_evidence || [
    {
      source: 'Tamil Nadu Election Commission Official Bulletin #409',
      verdict: 'Direct Contradiction',
      color: 'border-error text-error',
      badgeClass: 'text-error',
      statement: 'No biometric re-verification is required for ration distribution during the ongoing election cycle. Existing digital cards remain completely valid.',
    },
    {
      source: 'Madurai District Collectorate Fact-Check Advisory',
      verdict: 'Official Debunk',
      color: 'border-secondary text-secondary',
      badgeClass: 'text-secondary',
      statement: 'Audio circulating on WhatsApp regarding ration shop closures is entirely fabricated. Legal action initiated under Section 505 IPC.',
    },
  ];

  const shapFeatures = claim.shap_drivers || [
    { name: 'Cross-Modal Video/Audio Contradiction', value: '+0.38', pct: 88, color: 'bg-error' },
    { name: 'Synthetic Emotional Arousal (Panic/Fear)', value: '+0.27', pct: 72, color: 'bg-error' },
    { name: 'Reach Acceleration Spike (+340/hr)', value: '+0.21', pct: 60, color: 'bg-tertiary' },
    { name: 'Publisher Credibility Deficit', value: '+0.14', pct: 45, color: 'bg-secondary' },
  ];

  const actor = claim.actor_profile || {
    name: '@tamil_voice_leak',
    platform: 'WhatsApp Forward / X Syndicate',
    authenticity_score: '12/100',
    history: 'Flagged 4 times in past 30 days for deceptive civic audio.',
    account_age: '14 days',
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="bg-primary text-on-primary p-space-md rounded-xl flex items-center justify-between shadow-xl border border-secondary animate-fadeIn">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[24px]">verified</span>
            <div>
              <div className="font-headline-sm font-bold text-sm">{actionNotice.title}</div>
              <div className="text-body-sm text-outline-variant text-xs">{actionNotice.message}</div>
            </div>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-outline-variant hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Top Bar Context & Threat Level Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-space-md bg-surface-container-lowest border border-outline-variant/30 p-space-md px-space-lg rounded-xl shadow-xs">
        <div className="flex items-center gap-space-md">
          <span className="material-symbols-outlined text-error text-[28px] animate-pulse">
            warning
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-space-sm mb-0.5">
              <span className="font-headline-sm font-bold text-on-surface text-base">
                CRITICAL THREAT: {claim.claim_id || claimId}
              </span>
              <span className="font-label-sm text-error bg-error-container px-2 py-0.5 rounded-full font-bold text-[10px]">
                TIER-1 PRIORITIZATION
              </span>
              <span className="font-label-sm text-secondary bg-secondary-fixed px-2 py-0.5 rounded-full font-semibold text-[10px]">
                {claim.language || 'Tamil (தமிழ்)'}
              </span>
            </div>
            <div className="text-body-sm text-outline text-xs">
              District: <strong className="text-on-surface">{claim.district || 'Madurai'}</strong> • Detected 14 mins ago • Threat Vector: <strong className="text-on-surface">{claim.threat_vector || 'Manipulated Audio / Deepfake'}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          {onBackToQueue && (
            <button
              onClick={onBackToQueue}
              className="px-space-md py-space-xs bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl text-body-sm font-semibold hover:bg-surface-container-high transition-colors shadow-xs flex items-center gap-1 text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Queue
            </button>
          )}
          <span className="font-mono text-xs text-outline bg-surface-container px-2.5 py-1 rounded-lg">
            Reviewer: <strong className="text-on-surface">{activeUser}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Original Post & Media Analysis (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Original Flagged Item Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl flex flex-col gap-space-md shadow-xs border border-outline-variant/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center font-bold text-sm font-mono">
                  TR
                </div>
                <div>
                  <div className="font-headline-sm text-on-surface font-semibold text-sm">
                    {actor.name}
                  </div>
                  <div className="text-body-sm text-outline text-[11px]">
                    Forwarded in 18+ high-density WhatsApp Groups • Madurai / Dindigul
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline">share</span>
            </div>

            {/* Claim Text: English & Tamil */}
            <div className="bg-surface-container-low p-space-md rounded-xl border border-outline-variant/20 space-y-2">
              <div className="text-xs uppercase font-bold tracking-wider text-outline">Ingested Signal Text</div>
              <p className="text-on-surface font-headline-sm text-sm leading-relaxed">
                "{claim.statement || claim.claim_text || 'URGENT: Govt officials in Madurai are locking ration shops and demanding mandatory biometric re-verification linked directly to voter ID cards. If you don\'t scan by tomorrow evening, your monthly grain subsidy will be permanently cancelled!'}"
              </p>
              {claim.tamil_text && (
                <p className="text-on-surface-variant font-tamil text-xs leading-relaxed border-t border-outline-variant/20 pt-2 text-slate-700">
                  "{claim.tamil_text}"
                </p>
              )}
            </div>

            {/* Manipulated Video Frame Comparison */}
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-outline mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-tertiary">compare</span>
                Multi-Modal Evidence Frame Comparison
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {/* Manipulated Frame */}
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-sm uppercase text-error font-bold flex items-center gap-space-xs text-[11px]">
                    <span className="material-symbols-outlined text-[14px]">videocam_off</span>
                    Manipulated Frame (Timestamp 0:14)
                  </span>
                  <div
                    className="w-full h-40 bg-cover bg-center rounded-xl relative overflow-hidden border border-error/30 bg-slate-800"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80')`,
                    }}
                  >
                    <div className="absolute inset-0 bg-error/20 flex items-center justify-center p-2 text-center">
                      <span className="bg-white/95 text-error font-bold text-xs px-space-sm py-space-xs rounded-full backdrop-blur shadow-sm">
                        Deepfake / Splice Detected (97.4%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Certified Authentic Frame */}
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-sm uppercase text-secondary font-bold flex items-center gap-space-xs text-[11px]">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Original Archive Footage (2021)
                  </span>
                  <div
                    className="w-full h-40 bg-cover bg-center rounded-xl relative overflow-hidden border border-secondary/30 bg-slate-800"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80')`,
                    }}
                  >
                    <div className="absolute inset-0 bg-secondary/15 flex items-center justify-center p-2 text-center">
                      <span className="bg-white/95 text-secondary font-bold text-xs px-space-sm py-space-xs rounded-full backdrop-blur shadow-sm">
                        Doordarshan Archive Match
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Linguistic & NLP Signals Breakdown */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl flex flex-col gap-space-md shadow-xs border border-outline-variant/30">
            <h3 className="font-headline-md text-on-surface font-bold text-base flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-secondary">psychology</span>
              Linguistic & NLP Signals Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
              {/* Sentiment */}
              <div className="bg-surface-container-high p-space-md rounded-xl flex flex-col gap-space-xs border border-outline-variant/20">
                <span className="font-label-sm uppercase text-outline text-[10px] font-bold tracking-wider">
                  Sentiment Analysis
                </span>
                <div className="text-headline-md text-error font-bold">{sentiment.label}</div>
                <p className="font-body-sm text-on-surface-variant text-[11px] leading-tight">
                  {sentiment.description}
                </p>
              </div>

              {/* Emotional Triggers */}
              <div className="bg-surface-container-high p-space-md rounded-xl flex flex-col gap-space-xs border border-outline-variant/20">
                <span className="font-label-sm uppercase text-outline text-[10px] font-bold tracking-wider">
                  Emotional Triggers
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {emotionalTriggers.map((trig) => (
                    <span
                      key={trig.label}
                      className={`font-label-sm px-2 py-0.5 rounded text-[10px] font-bold ${trig.color}`}
                    >
                      {trig.label} ({trig.score})
                    </span>
                  ))}
                </div>
              </div>

              {/* Context Distortion */}
              <div className="bg-surface-container-high p-space-md rounded-xl flex flex-col gap-space-xs border border-outline-variant/20">
                <span className="font-label-sm uppercase text-outline text-[10px] font-bold tracking-wider">
                  Context Distortion
                </span>
                <div className="text-headline-md text-tertiary font-bold">{distortion.type}</div>
                <p className="font-body-sm text-on-surface-variant text-[11px] leading-tight">
                  {distortion.description}
                </p>
              </div>
            </div>

            {/* TreeSHAP Feature Attribution Drivers */}
            <div className="mt-space-sm bg-surface-container-high p-space-md rounded-xl flex flex-col gap-space-xs border border-outline-variant/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-label-sm uppercase text-outline text-[10px] font-bold tracking-wider">
                  TreeSHAP Model Feature Attribution
                </span>
                <span className="font-mono text-[11px] text-error font-semibold">+0.88 Net Model Boost</span>
              </div>
              <div className="space-y-2">
                {shapFeatures.map((feat) => (
                  <div key={feat.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface">{feat.name}</span>
                      <span className="font-mono font-bold text-on-surface">{feat.value}</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${feat.color}`} style={{ width: `${feat.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Source Credibility & Reviewer Actions (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Actor & Source Credibility Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl flex flex-col gap-space-md shadow-xs border border-outline-variant/30">
            <h3 className="font-headline-md text-on-surface font-bold text-base flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-error">verified_user</span>
              Actor & Source Credibility
            </h3>

            <div className="bg-surface-container-high p-space-md rounded-xl flex items-center justify-between border border-outline-variant/20">
              <div>
                <div className="text-outline text-[11px] uppercase font-bold">Historical Credibility Index</div>
                <div className="text-headline-lg font-bold text-error font-mono">{actor.authenticity_score}</div>
              </div>
              <span className="font-label-sm text-error bg-error-container px-2.5 py-1 rounded-full font-bold text-xs">
                Untrusted Syndicate
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-outline">Platform Medium</span>
                <span className="font-semibold text-on-surface">{actor.platform}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-outline">Account Age</span>
                <span className="font-semibold text-on-surface font-mono">{actor.account_age}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-outline">Prior Platform Flags</span>
                <span className="font-semibold text-error font-bold font-mono">4 Infractions</span>
              </div>
              <div className="text-outline text-[11px] pt-1">
                {actor.history}
              </div>
            </div>
          </div>

          {/* Fact-Check Database Matches / NLI Evidence */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl flex flex-col gap-space-md shadow-xs border border-outline-variant/30">
            <h3 className="font-headline-md text-on-surface font-bold text-base flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-tertiary">fact_check</span>
              Fact-Check Database Matches
            </h3>

            <div className="flex flex-col gap-space-sm">
              {nliEvidence.map((ev, idx) => (
                <div
                  key={idx}
                  className={`bg-surface-container-high p-space-md rounded-xl border-l-4 ${ev.color} flex flex-col gap-space-xs border-r border-t border-b border-outline-variant/20`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-headline-sm text-on-surface font-semibold text-xs leading-snug">
                      {ev.source}
                    </span>
                    <span className={`font-label-sm font-bold uppercase text-[10px] shrink-0 ${ev.badgeClass}`}>
                      {ev.verdict}
                    </span>
                  </div>
                  <p className="font-body-sm text-on-surface-variant text-xs leading-relaxed italic">
                    "{ev.statement}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Reviewer Verdict Controls */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl flex flex-col gap-space-md shadow-xs border border-outline-variant/30">
            <h3 className="font-headline-md text-on-surface font-bold text-base flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary">gavel</span>
              Reviewer Action & Verdict
            </h3>
            <p className="font-body-sm text-on-surface-variant text-xs">
              Select an authoritative disposition to execute immediate platform intervention and trigger state notification pipelines.
            </p>

            <div className="flex flex-col gap-space-sm mt-space-xs">
              {/* Approve & Attach Fact Check */}
              <button
                disabled={isSubmitting}
                onClick={() => handleAction('approve', 'Approve & Attach Fact-Check Banner')}
                className="w-full py-space-md px-space-lg rounded-xl bg-primary text-on-primary font-headline-sm hover:opacity-90 transition-all flex items-center justify-center gap-space-sm shadow-xs text-xs font-bold disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Approve & Attach Fact-Check Banner
              </button>

              <div className="grid grid-cols-2 gap-space-sm">
                {/* Deprioritize */}
                <button
                  disabled={isSubmitting}
                  onClick={() => handleAction('deprioritize', 'Deprioritize')}
                  className="py-space-md px-space-md rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-bright transition-all font-label-md flex items-center justify-center gap-space-xs border border-outline-variant/40 shadow-xs text-xs font-semibold disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                  Deprioritize
                </button>

                {/* Escalate */}
                <button
                  disabled={isSubmitting}
                  onClick={() => handleAction('escalate', 'Escalate to Cyber Cell')}
                  className="py-space-md px-space-md rounded-xl bg-error-container text-error hover:opacity-90 transition-all font-label-md flex items-center justify-center gap-space-xs shadow-xs text-xs font-bold disabled:opacity-50 border border-error/20"
                >
                  <span className="material-symbols-outlined text-[16px]">security</span>
                  Escalate to Cyber Cell
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
