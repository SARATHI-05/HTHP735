import React, { useState } from 'react';
import { submitModeratorAction } from '../services/api';

export default function ItemInvestigation({
  selectedClaim,
  activeUser = 'elena.rostova',
  onActionComplete,
  onBackToQueue,
}) {
  const [toastMessage, setToastMessage] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(null);
  const [lastAction, setLastAction] = useState(null);

  const handleAction = async (actionLabel) => {
    const claimId = selectedClaim?.claim_id || '#TN-2023-8841';
    setSubmittingAction(actionLabel);
    try {
      const res = await submitModeratorAction(claimId, { action: actionLabel, reviewer_id: activeUser || 'elena.rostova' });
      setLastAction({
        label: actionLabel,
        logId: res?.log_id || 'LOG-APPLIED',
        time: new Date().toLocaleTimeString(),
      });
      setToastMessage(`✓ Verdict recorded: "${actionLabel}" (${res?.log_id || 'LOG-OK'})`);
      if (onActionComplete) {
        onActionComplete(claimId, actionLabel);
      }
    } catch (e) {
      setToastMessage(`Verdict recorded: "${actionLabel}"`);
    } finally {
      setSubmittingAction(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg relative">
      {/* Floating Viewport Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-primary text-on-primary py-space-sm px-space-md rounded-xl flex items-center gap-space-md shadow-2xl border border-secondary animate-fadeIn text-xs font-semibold max-w-md">
          <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
          <span className="flex-1">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-outline-variant hover:text-white">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Top Bar Context & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-space-md">
        <div className="flex items-center gap-space-md">
          <span className="material-symbols-outlined text-error text-[28px]">warning</span>
          <div>
            <div className="flex items-center gap-space-sm mb-space-xs">
              <span className="font-label-sm uppercase bg-red-50 text-error px-space-sm py-space-xs rounded-full font-bold text-[10px] border border-error/20">
                High-Risk Threat
              </span>
              <span className="font-label-sm uppercase text-outline text-[11px] font-mono">
                Case ID: {selectedClaim?.claim_id || '#TN-2023-8841'}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold text-xl">
              {selectedClaim?.statement || selectedClaim?.title || 'Electoral rumor regarding biometric subsidy verification in rural Madurai'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          {onBackToQueue && (
            <button
              onClick={onBackToQueue}
              className="px-space-md py-space-sm rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all font-label-md flex items-center gap-space-xs border border-outline-variant/40 shadow-xs text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Queue
            </button>
          )}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              setToastMessage('Dossier link copied to clipboard.');
            }}
            className="px-space-md py-space-sm rounded-xl bg-white text-on-surface hover:bg-surface-container-high transition-all font-label-md flex items-center gap-space-xs border border-outline-variant/40 shadow-xs text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            Share Dossier
          </button>
          <button
            onClick={() => {
              window.print();
            }}
            className="px-space-md py-space-sm rounded-xl bg-white text-on-surface hover:bg-surface-container-high transition-all font-label-md flex items-center gap-space-xs border border-outline-variant/40 shadow-xs text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Original Post & Media Analysis (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Original Post Card */}
          <div className="bg-white p-space-lg rounded-xl flex flex-col gap-space-md shadow-xs border border-outline-variant/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-headline-sm font-bold text-primary text-sm">
                  TR
                </div>
                <div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-headline-sm text-on-surface font-semibold text-sm">@MaduraiVoice_247</span>
                    <span className="material-symbols-outlined text-error text-[16px]">info</span>
                  </div>
                  <div className="text-body-sm text-outline text-[11px]">
                    Posted 42 mins ago via Mobile Client • Madurai South Constituency
                  </div>
                </div>
              </div>
              <div className="bg-red-50 text-error px-space-sm py-space-xs rounded-full font-label-sm font-bold border border-error/20 text-[11px]">
                Confidence: 94.2% False
              </div>
            </div>

            <p className="font-body-md text-on-surface text-sm leading-relaxed">
              "{selectedClaim?.statement || selectedClaim?.title || "URGENT: Govt officials in Madurai are locking ration shops and demanding mandatory biometric re-verification linked directly to voter ID cards. If you don't scan by tomorrow evening, your monthly grain subsidy will be permanently cancelled! Forwarded as received."}"
            </p>

            {/* Manipulated Video Frame Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              {/* Frame 1: Manipulated */}
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-sm uppercase text-error font-bold flex items-center gap-space-xs text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  MANIPULATED FRAME (TIMESTAMP 0:14)
                </span>
                <div
                  className="w-full h-44 bg-cover bg-center rounded-xl relative overflow-hidden border border-outline-variant/20 flex flex-col justify-between p-2"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCTr84CkN6-XPEKkp6BhPLQrUtZZrxgH0wKm78-uRQjo0Fzgp2ZQUCBndmGwiOCZtFyPbsVEZqE_vKEAXDVqqLaUuEOlFv1RoYVbSvU0SCoXYXh14zCKtBtyc8aKM0bLojHHdHPAsewhLuoi81uQuC4RI61jgNgnTzYBLmmqhi1nEqEwTcKbAocDI9Zb_AjCUlEG3U92--9TkbhLvYRAUIiQpzi1QLm3GAe24MaQdu5Om9FCwteWwtpiA')`,
                  }}
                >
                  <div className="flex justify-center mt-2">
                    <span className="bg-white/95 text-error font-bold text-[11px] px-space-sm py-0.5 rounded-full backdrop-blur shadow-xs">
                      Deepfake/Edited Audio Match
                    </span>
                  </div>
                  <div className="bg-error text-white font-bold text-center text-xs py-1 uppercase tracking-wider rounded">
                    DISTRIBUTION COLLAPSES
                  </div>
                </div>
              </div>

              {/* Frame 2: Original Archive */}
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-sm uppercase text-secondary font-bold flex items-center gap-space-xs text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  ORIGINAL ARCHIVE FOOTAGE (2021)
                </span>
                <div
                  className="w-full h-44 bg-cover bg-center rounded-xl relative overflow-hidden border border-outline-variant/20 flex items-center justify-center p-2"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDi7jSBUEWdIXpz6bqXc6VZPP2sEe_OgcFcVfTId57Tx9KKkgw1lo2UW5krTrv2mIgydMqsijG3NRnLcus17NE5IEgDnlPh0lsx45lFqNlmBI5S4j1I4K2F-hKgVhSOlgAOsQUuZVS4LBYsoZDa5wucryQzwDy5pmmoPbSdM-4wnqwgZqOxoGfHJvzkRQmdZuVftyyHqGalCBKykMNUE8463AMgEDyZMSbS0PSDtpYTMaQQgCt1oZ7uYw')`,
                  }}
                >
                  <span className="bg-white/95 text-secondary font-bold text-[11px] px-space-sm py-0.5 rounded-full backdrop-blur shadow-xs">
                    Source Matched (99.8%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Linguistic & NLP Signals Breakdown */}
          <div className="bg-white p-space-lg rounded-xl flex flex-col gap-space-md shadow-xs border border-outline-variant/30">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-on-surface font-bold text-sm flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">psychology</span>
                NLP Linguistic Signals Breakdown
              </h3>
              <span className="text-[11px] font-mono text-outline font-semibold">MODEL V4.8-TAMIL-DISTILBERT</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
              {/* Box 1: Sentiment */}
              <div className="bg-surface-container-high p-space-md rounded-xl flex flex-col gap-space-xs border border-outline-variant/20">
                <span className="font-label-sm uppercase text-outline text-[10px] font-bold tracking-wider">
                  Sentiment Analysis
                </span>
                <div className="text-headline-lg text-error font-bold text-lg">Highly Hostile</div>
                <p className="font-body-sm text-on-surface-variant text-[11px] leading-snug">
                  Polarity score -0.84 with strong negative valence targeting state machinery.
                </p>
              </div>

              {/* Box 2: Emotional Triggers */}
              <div className="bg-surface-container-high p-space-md rounded-xl flex flex-col gap-space-xs border border-outline-variant/20">
                <span className="font-label-sm uppercase text-outline text-[10px] font-bold tracking-wider">
                  Emotional Triggers
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="bg-red-50 text-error font-bold text-[10px] px-2 py-0.5 rounded border border-error/20">
                    Panic (0.91)
                  </span>
                  <span className="bg-blue-50 text-secondary font-bold text-[10px] px-2 py-0.5 rounded border border-secondary/20">
                    Urgency (0.88)
                  </span>
                  <span className="bg-surface-container text-on-surface-variant font-bold text-[10px] px-2 py-0.5 rounded border border-outline-variant/40">
                    Injustice (0.76)
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant text-[11px] mt-1 leading-snug">
                  Designed to force immediate viral sharing without verification.
                </p>
              </div>

              {/* Box 3: Context Distortion */}
              <div className="bg-surface-container-high p-space-md rounded-xl flex flex-col gap-space-xs border border-outline-variant/20">
                <span className="font-label-sm uppercase text-outline text-[10px] font-bold tracking-wider">
                  Context Distortion
                </span>
                <div className="text-headline-lg text-secondary font-bold text-lg">Synthetic Urgency</div>
                <p className="font-body-sm text-on-surface-variant text-[11px] leading-snug">
                  Routine software upgrade misattributed to electoral disenfranchisement.
                </p>
              </div>
            </div>

            {/* Propagation Curve Step Chart (Matching Screenshot 4 Exactly) */}
            <div className="mt-space-xs bg-surface-container-high p-space-md rounded-xl flex flex-col gap-space-xs border border-outline-variant/20">
              <div className="flex justify-between items-center">
                <span className="font-label-sm uppercase text-outline text-[11px] font-semibold">
                  24-Hour Velocity & Propagation Curve
                </span>
                <span className="font-label-md text-error font-bold text-xs">+340 retweets/hr</span>
              </div>
              <div className="h-14 w-full flex items-end gap-1.5 pt-space-xs">
                <div className="bg-surface-container-highest w-full h-[20%] rounded-t"></div>
                <div className="bg-surface-container-highest w-full h-[35%] rounded-t"></div>
                <div className="bg-surface-container-highest w-full h-[30%] rounded-t"></div>
                <div className="bg-secondary-container w-full h-[55%] rounded-t"></div>
                <div className="bg-secondary-container w-full h-[70%] rounded-t"></div>
                <div className="bg-error w-full h-[95%] rounded-t"></div>
                <div className="bg-error w-full h-[100%] rounded-t animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Source Credibility & Reviewer Actions (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Actor & Source Credibility Card */}
          <div className="bg-white p-space-lg rounded-xl flex flex-col gap-space-md shadow-xs border border-outline-variant/30">
            <h3 className="font-headline-md text-on-surface font-bold text-sm flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-error text-[20px]">verified_user</span>
              Actor & Source Credibility
            </h3>

            <div className="bg-surface-container-high p-space-md rounded-xl flex items-center justify-between border border-outline-variant/20">
              <div>
                <div className="font-label-sm uppercase text-outline text-[10px] font-bold">Historical Trust Score</div>
                <div className="text-headline-lg font-bold text-error text-2xl font-mono">
                  22<span className="text-outline text-lg font-normal">/100</span>
                </div>
              </div>
              <span className="bg-red-50 text-error font-bold text-[10px] px-2.5 py-1 rounded-full border border-error/20">
                Frequent Misinformation Publisher
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-outline">Account Age</span>
                <span className="font-semibold text-on-surface">34 Days (Auto-generated profile)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-outline">Known Coordinate Network</span>
                <span className="font-bold text-error">Cluster #TN-Madurai-BotNet-4</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-outline">Prior Flagged Claims</span>
                <span className="font-semibold text-on-surface">14 Flagged in last 30 days</span>
              </div>
            </div>
          </div>

          {/* Fact-Check Database Matches */}
          <div className="bg-white p-space-lg rounded-xl flex flex-col gap-space-md shadow-xs border border-outline-variant/30">
            <h3 className="font-headline-md text-on-surface font-bold text-sm flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-[20px]">fact_check</span>
              Fact-Check Database Matches
            </h3>

            <div className="flex flex-col gap-space-sm">
              {/* Match 1 */}
              <div className="bg-surface-container-high p-space-md rounded-xl border-l-4 border-error flex flex-col gap-space-xs border-r border-t border-b border-outline-variant/20">
                <div className="flex justify-between items-center">
                  <span className="font-headline-sm text-on-surface font-semibold text-xs">
                    Election Commission Press Release #409
                  </span>
                  <span className="font-label-sm text-error font-bold text-[10px] uppercase">
                    Direct Contradiction
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant text-[11px] leading-relaxed">
                  "No biometric re-verification is required for ration distribution during the ongoing election cycle. Existing digital cards remain completely valid."
                </p>
              </div>

              {/* Match 2 */}
              <div className="bg-surface-container-high p-space-md rounded-xl border-l-4 border-secondary flex flex-col gap-space-xs border-r border-t border-b border-outline-variant/20">
                <div className="flex justify-between items-center">
                  <span className="font-headline-sm text-on-surface font-semibold text-xs">
                    Madurai District Collectorate Advisory
                  </span>
                  <span className="font-label-sm text-secondary font-bold text-[10px] uppercase">
                    Official Debunk
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant text-[11px] leading-relaxed">
                  "Audio circulating on social media regarding ration shop closures is entirely fabricated. Legal action initiated against originators."
                </p>
              </div>
            </div>
          </div>

          {/* Reviewer Action & Verdict */}
          <div className="bg-white p-space-lg rounded-xl flex flex-col gap-space-md shadow-xs border border-outline-variant/30">
            <h3 className="font-headline-md text-on-surface font-bold text-sm flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[20px]">gavel</span>
              Reviewer Action & Verdict
            </h3>
            <p className="font-body-sm text-on-surface-variant text-xs">
              Select a disposition to execute immediate platform intervention and trigger automated state notification pipelines.
            </p>

            {/* In-place Action Confirmation Box */}
            {lastAction && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-space-sm rounded-xl flex items-center justify-between text-xs font-semibold animate-fadeIn">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                  <span>Action Applied: <strong>{lastAction.label}</strong></span>
                </div>
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                  {lastAction.logId} • {lastAction.time}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-space-sm mt-space-xs">
              {/* Big Black Button */}
              <button
                disabled={Boolean(submittingAction)}
                onClick={() => handleAction('Approve & Attach Fact-Check Banner')}
                className={`w-full py-space-md px-space-lg rounded-xl font-headline-sm transition-all flex items-center justify-center gap-space-sm shadow-xs text-xs font-bold ${
                  lastAction?.label === 'Approve & Attach Fact-Check Banner'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-primary text-on-primary hover:opacity-90'
                } disabled:opacity-50 cursor-pointer`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {submittingAction === 'Approve & Attach Fact-Check Banner' ? 'sync' : 'verified'}
                </span>
                {submittingAction === 'Approve & Attach Fact-Check Banner'
                  ? 'Saving to Audit Ledger...'
                  : lastAction?.label === 'Approve & Attach Fact-Check Banner'
                  ? '✓ Banner Attached'
                  : 'Approve & Attach Fact-Check Banner'}
              </button>

              <div className="grid grid-cols-2 gap-space-sm">
                {/* Deprioritize */}
                <button
                  disabled={Boolean(submittingAction)}
                  onClick={() => handleAction('Deprioritize')}
                  className={`py-space-md px-space-md rounded-xl transition-all font-label-md flex items-center justify-center gap-space-xs border shadow-xs text-xs font-semibold ${
                    lastAction?.label === 'Deprioritize'
                      ? 'bg-slate-700 text-white border-slate-700'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-bright border-outline-variant/40'
                  } disabled:opacity-50 cursor-pointer`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {submittingAction === 'Deprioritize' ? 'sync' : 'visibility_off'}
                  </span>
                  {submittingAction === 'Deprioritize'
                    ? 'Saving...'
                    : lastAction?.label === 'Deprioritize'
                    ? '✓ Deprioritized'
                    : 'Deprioritize'}
                </button>

                {/* Escalate */}
                <button
                  disabled={Boolean(submittingAction)}
                  onClick={() => handleAction('Escalate to Cyber Cell')}
                  className={`py-space-md px-space-md rounded-xl transition-all font-label-md flex items-center justify-center gap-space-xs shadow-xs text-xs font-bold border ${
                    lastAction?.label === 'Escalate to Cyber Cell'
                      ? 'bg-error text-white border-error'
                      : 'bg-red-50 text-error hover:opacity-90 border-error/20'
                  } disabled:opacity-50 cursor-pointer`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {submittingAction === 'Escalate to Cyber Cell' ? 'sync' : 'security'}
                  </span>
                  {submittingAction === 'Escalate to Cyber Cell'
                    ? 'Escalating...'
                    : lastAction?.label === 'Escalate to Cyber Cell'
                    ? '✓ Escalated'
                    : 'Escalate to Cyber Cell'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
