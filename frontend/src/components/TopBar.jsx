import React, { useState } from 'react';

export default function TopBar({
  day = 30,
  setDay,
  capacity = 20,
  setCapacity,
  searchQuery = '',
  setSearchQuery,
  isReachHidden = false,
  toggleHideReach,
  onResetDemo,
  onOpenWalkthrough,
}) {
  const [showCapacityTip, setShowCapacityTip] = useState(false);
  const [showSyntheticTip, setShowSyntheticTip] = useState(false);

  const handleCapacityChange = (newVal) => {
    const val = Math.max(5, Math.min(100, parseInt(newVal, 10) || 20));
    setCapacity(val);
  };

  return (
    <header className="sticky top-0 z-40 w-full min-h-[4rem] py-2 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 lg:px-6 flex flex-wrap items-center justify-between gap-2.5 select-none">
      {/* Brand & Synthetic Badge */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onResetDemo} title="TruthGuard Moderator Console">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800">
            <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-sky-400">shield</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base font-sans">TruthGuard</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 sm:py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                T&amp;S Console
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center gap-1 leading-none mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden xs:inline">Regional Misinformation Triage</span>
              <span className="xs:hidden">Triage</span>
            </div>
          </div>
        </div>

        {/* Visible Badge: Reach & timestamps are synthetic */}
        <div className="relative hidden md:block">
          <div
            onMouseEnter={() => setShowSyntheticTip(true)}
            onMouseLeave={() => setShowSyntheticTip(false)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] sm:text-[11px] font-medium cursor-help"
            role="note"
            aria-label="Synthetic data disclosure"
          >
            <span className="material-symbols-outlined text-[13px] text-amber-600">info</span>
            <span className="font-semibold">Reach &amp; timestamps are synthetic</span>
          </div>

          {showSyntheticTip && (
            <div className="absolute left-0 top-full mt-1.5 w-72 p-2.5 bg-slate-900 text-slate-200 text-xs rounded-xl shadow-xl border border-slate-800 z-50 animate-fadeIn pointer-events-none">
              <div className="font-semibold text-white mb-0.5 flex items-center gap-1">
                <span>🛡️ Evaluation Data Disclosure</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Linguistic text and source features are real world ground-truth signals. Audience reach distributions and temporal velocity are synthetically calibrated for multi-day triage capacity evaluation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Center Operational Controls: Day Selector, Daily Capacity & Demo Walkthrough */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-wrap">
        {/* Demo Walkthrough Action Button */}
        {onOpenWalkthrough && (
          <button
            type="button"
            onClick={onOpenWalkthrough}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-sky-300 hover:text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all border border-slate-700 ring-1 ring-sky-500/20"
            title="Open 30-Second Guided Tour for Judges"
            aria-label="Launch 30-Second Guided Tour for Judges"
          >
            <span className="material-symbols-outlined text-sky-400 text-[15px] sm:text-[16px] animate-pulse">
              play_circle
            </span>
            <span className="hidden sm:inline">Demo Walkthrough</span>
            <span className="sm:hidden">Tour</span>
            <span className="px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[9px] font-mono hidden md:inline">
              30s
            </span>
          </button>
        )}

        {/* Day Selector (1 - 30) */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs">
          <span className="material-symbols-outlined text-slate-500 text-[15px]">calendar_today</span>
          <span className="text-slate-500 font-medium hidden lg:inline">Day:</span>
          <select
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value, 10))}
            aria-label="Select simulation operational timeline day"
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1 text-xs"
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                Day {d} {d === 30 ? '(Latest)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Daily Capacity Control (K = 20 Default) */}
        <div className="relative">
          <div
            className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-1.5 sm:px-2 py-1 text-xs"
            onMouseEnter={() => setShowCapacityTip(true)}
            onMouseLeave={() => setShowCapacityTip(false)}
          >
            <span className="material-symbols-outlined text-sky-600 text-[15px]">tune</span>
            <span className="text-slate-500 font-medium hidden lg:inline">Capacity:</span>
            
            {/* Quick Stepper - */}
            <button
              type="button"
              onClick={() => handleCapacityChange(capacity - 5)}
              className="w-5 h-5 flex items-center justify-center rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold transition-colors cursor-pointer text-xs"
              title="Decrease capacity by 5"
              aria-label="Decrease daily capacity by 5"
            >
              -
            </button>

            {/* Numeric input */}
            <input
              type="number"
              min="5"
              max="100"
              step="5"
              value={capacity}
              onChange={(e) => handleCapacityChange(e.target.value)}
              className="w-8 sm:w-10 text-center font-bold text-slate-900 bg-white border border-slate-300 rounded py-0.5 text-xs focus:ring-1 focus:ring-slate-900"
              aria-label="Daily review capacity quota"
            />

            {/* Quick Stepper + */}
            <button
              type="button"
              onClick={() => handleCapacityChange(capacity + 5)}
              className="w-5 h-5 flex items-center justify-center rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold transition-colors cursor-pointer text-xs"
              title="Increase capacity by 5"
              aria-label="Increase daily capacity by 5"
            >
              +
            </button>
            <span className="text-slate-500 font-medium text-[10px] hidden sm:inline">items/d</span>
          </div>

          {showCapacityTip && (
            <div className="absolute right-0 top-full mt-1.5 w-64 p-2.5 bg-slate-900 text-slate-200 text-xs rounded-xl shadow-xl border border-slate-800 z-50 animate-fadeIn pointer-events-none">
              <div className="font-semibold text-white mb-0.5">Capacity Control (K items/day)</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Determines the daily human review boundary. Items ranked 1 to K receive immediate Review; items beyond K are deferred to the Waitlist backlog with age-boosting.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Reach Visibility Toggle & Moderator Session */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Toggle Reach live/hidden */}
        {toggleHideReach && (
          <button
            type="button"
            onClick={toggleHideReach}
            className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer shadow-xs ${
              isReachHidden
                ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            }`}
            title={
              isReachHidden
                ? 'Audience reach column is hidden. Click to reveal.'
                : 'Audience reach active. Click to hide.'
            }
            aria-label="Toggle reach column visibility"
          >
            <span className="material-symbols-outlined text-[14px]">
              {isReachHidden ? 'visibility_off' : 'visibility'}
            </span>
            <span className="hidden xl:inline">{isReachHidden ? 'Reach: Hidden' : 'Reach: Live URL'}</span>
          </button>
        )}

        {/* Region Badge */}
        <span className="hidden sm:inline-flex items-center gap-1 bg-red-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200 text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
          Tamil Nadu
        </span>
      </div>
    </header>
  );
}
