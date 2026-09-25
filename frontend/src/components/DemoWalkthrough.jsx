import React, { useEffect } from 'react';

export default function DemoWalkthrough({
  isOpen,
  onClose,
  currentStep,
  setCurrentStep,
  onSelectClaim,
  setCapacity,
  capacity,
  items = [],
}) {
  // Synchronize state when steps change
  useEffect(() => {
    if (!isOpen) return;

    if (currentStep === 1) {
      // Step 1: Pre-select outranking claim CLM-5017
      onSelectClaim('CLM-5017');
    } else if (currentStep === 2) {
      // Step 2: Ensure CLM-5017 is selected for evidence inspection
      onSelectClaim('CLM-5017');
    } else if (currentStep === 3) {
      // Step 3: Dynamically set capacity to 5 to demonstrate the boundary cutoff
      setCapacity(5);
    }
  }, [isOpen, currentStep, onSelectClaim, setCapacity]);

  if (!isOpen) return null;

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finish walkthrough
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResetCapacityAndClose = () => {
    setCapacity(20);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="walkthrough-title"
      >
        {/* Walkthrough Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-slate-950 font-black text-sm">
              {currentStep}/{totalSteps}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">
                  Judges 30-Second Guided Tour
                </span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                  Trust &amp; Safety
                </span>
              </div>
              <h2 id="walkthrough-title" className="text-sm sm:text-base font-bold text-white">
                {currentStep === 1 && '1. Prioritization Logic: The Outranking Case'}
                {currentStep === 2 && '2. Explanation Quality: SHAP & NLI Grounded Evidence'}
                {currentStep === 3 && '3. Capacity Handling: Dynamic K=5 Waterline Cutoff'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close guided walkthrough"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Step Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs font-sans text-slate-800">
          {/* STEP 1: OUTRANKING CASE STUDY */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-950">
                <div className="font-bold text-sm text-sky-900 flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-sky-600 text-[18px]">verified</span>
                  <span>Core Insight: Why High-Reach Moderate Risk Outranks Low-Reach Extreme Risk</span>
                </div>
                <p className="text-xs text-sky-900/90 leading-relaxed">
                  Notice in the queue table that <strong>CLM-5017</strong> (68.7% risk, 220,000 reach, Priority <strong>1.410</strong>) is ranked <strong>#3 (Review)</strong>, cleanly outranking <strong>CLM-10223</strong> (98.0% risk, 521 reach, Priority <strong>0.531</strong>) which sits at <strong>#6 (Waitlist)</strong>.
                </p>
              </div>

              {/* Side by Side Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Outranking Claim: CLM-5017 */}
                <div className="p-3.5 bg-white border-2 border-emerald-500 rounded-xl shadow-xs relative">
                  <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Rank #3 (Active Review)
                  </span>
                  <div className="font-mono text-[11px] font-bold text-slate-500">CLM-5017 (Selected)</div>
                  <p className="font-semibold text-slate-900 mt-1 line-clamp-2">
                    "Contaminated oral polio vaccine vials distributed across primary healthcare centers..."
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Calibrated Risk</span>
                      <strong className="text-amber-600 font-mono text-xs">68.7%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Audience Reach</span>
                      <strong className="text-emerald-700 font-mono text-xs">220,000 views</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Priority Score</span>
                      <strong className="text-slate-900 font-mono text-sm">1.410</strong>
                    </div>
                  </div>
                </div>

                {/* Lower-ranked Claim: CLM-10223 */}
                <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl">
                  <span className="text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-200">
                    Rank #6 (Deferred Backlog)
                  </span>
                  <div className="font-mono text-[11px] font-bold text-slate-500 mt-1">CLM-10223</div>
                  <p className="font-normal text-slate-700 mt-1 line-clamp-2">
                    "Ancient solar alignment cures cardiovascular arterial blockages in 24 hours..."
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Calibrated Risk</span>
                      <strong className="text-rose-600 font-mono text-xs">98.0% (High)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Audience Reach</span>
                      <strong className="text-slate-500 font-mono text-xs">521 views</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Priority Score</span>
                      <strong className="text-slate-700 font-mono text-sm">0.531</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mathematical Proof Callout */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                <strong>Why this saves lives:</strong> Societal harm exposure scales with audience reach: 
                <span className="font-mono bg-white px-1.5 py-0.5 mx-1 rounded border border-slate-200 text-slate-900">
                  Expected Harm = P(Misinfo) × log(1 + Reach)
                </span>
                Triaging a 521-view rumor while 220,000 citizens ingest an unverified polio vaccine panic creates <strong>2.6x higher societal harm</strong>.
              </div>
            </div>
          )}

          {/* STEP 2: EXPLANATION QUALITY */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                <div className="font-bold text-sm text-emerald-900 flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">psychology</span>
                  <span>Explainability: Grounded Evidence &amp; TreeSHAP Attributions</span>
                </div>
                <p className="text-xs text-emerald-900/90 leading-relaxed">
                  TruthGuard avoids "black-box" scores. The right-hand panel presents calibrated evidence, NLI semantic verification, and TreeSHAP group attributions in plain English for instant moderator auditing.
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. NLI Counter-Evidence */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <span>🏛️ Verified Authority Citation</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold text-[10px]">
                      NLI Contradiction: 89.4%
                    </span>
                  </div>
                  <blockquote className="p-2.5 bg-slate-50 rounded-lg text-slate-700 italic border-l-2 border-rose-500 text-[11px] leading-relaxed">
                    "PIB Fact Check &amp; Directorate of Public Health (Tamil Nadu): All state vaccine batches inspected, sealed, and verified compliant with WHO safety benchmarks. Zero contamination incidents detected."
                  </blockquote>
                </div>

                {/* 2. SHAP Attribution Group Breakdown */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <div className="font-bold text-slate-900 mb-2 flex items-center justify-between">
                    <span>TreeSHAP Feature Group Breakdown</span>
                    <span className="text-[10px] text-slate-400 font-mono">Calibrated LightGBM</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <span className="text-slate-500 block">🗣️ Language</span>
                      <strong className="text-rose-600 text-xs font-mono">+28%</strong>
                      <span className="text-[9px] text-slate-400 block">Sensational cues</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <span className="text-slate-500 block">📡 Source</span>
                      <strong className="text-rose-600 text-xs font-mono">+35%</strong>
                      <span className="text-[9px] text-slate-400 block">Falsehood prior</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <span className="text-slate-500 block">⚖️ Consistency</span>
                      <strong className="text-rose-600 text-xs font-mono">+31%</strong>
                      <span className="text-[9px] text-slate-400 block">NLI mismatch</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <span className="text-slate-500 block">📝 Text Signal</span>
                      <strong className="text-rose-600 text-xs font-mono">+12%</strong>
                      <span className="text-[9px] text-slate-400 block">Zero citations</span>
                    </div>
                  </div>
                </div>

                {/* 3. Actionable Verdict */}
                <div className="p-2.5 bg-slate-100 rounded-lg text-[11px] text-slate-700 flex items-center justify-between">
                  <span><strong>Recommended Action:</strong> Escalate to Medical Fact-Checking Board</span>
                  <span className="font-bold text-rose-700">Urgent</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CAPACITY CUTOFF */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950">
                <div className="font-bold text-sm text-amber-900 flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">tune</span>
                  <span>Capacity Handling: Hard Daily Waterline (K = 5 Items)</span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  We just dynamically dialed <strong>Capacity to 5 items/day</strong>. Look at the queue table on the left: a prominent boundary line now partitions the day's active reviews from the deferred backlog.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-emerald-200 rounded-xl shadow-xs">
                  <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                    <span>Top 5 Claims (Within Quota)</span>
                  </span>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Assigned immediate <strong>Escalate</strong> or <strong>Review</strong> action tiers. Moderators focus 100% of their daily cognitive capacity on these highest-harm incidents.
                  </p>
                </div>

                <div className="p-3 bg-white border border-sky-200 rounded-xl shadow-xs">
                  <span className="text-sky-800 font-bold text-xs flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-[15px]">hourglass_top</span>
                    <span>Claims #6 to #22 (Deferred)</span>
                  </span>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Automatically labeled <strong>Waitlist</strong>. They do not get lost: our multi-day queue logic applies automated age-boosting (+0.05/day) so high-priority backlogged items resurface next cycle.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">Zero Moderator Burnout Guarantee</span>
                  <span className="text-slate-400">Fixed capacity guarantees predictable workloads regardless of incoming traffic bursts.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCapacity(capacity === 5 ? 20 : 5)}
                  className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs shrink-0 cursor-pointer ml-2"
                >
                  Toggle K (Current: {capacity})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Walkthrough Footer Navigation */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {/* Step Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setCurrentStep(s)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentStep === s ? 'w-6 bg-slate-900' : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Jump to step ${s}`}
              ></button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
              >
                Previous
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Next Step</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetCapacityAndClose}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Restore K=20 &amp; Complete Tour</span>
                <span className="material-symbols-outlined text-[15px]">done_all</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
