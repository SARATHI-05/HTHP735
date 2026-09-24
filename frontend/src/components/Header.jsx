import React from 'react';

export default function Header({
  activeUser,
  setActiveUser,
  capacity,
  setCapacity,
  escalatedCount,
  onOpenEscalations,
}) {
  const users = [
    { id: 'elena.rostova', name: 'Elena Rostova (Senior Fact-Checker)' },
    { id: 'marcus.vance', name: 'Marcus Vance (T&S Operations Lead)' },
    { id: 'amina.almansoor', name: 'Amina Al-Mansoor (Compliance Auditor)' },
    { id: 'julian.chen', name: 'Dr. Julian Chen (T&S ML Engineer)' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center text-xl shadow-lg shadow-sky-500/20">
              🛡️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-tight">Evidence-Grounded Misinfo Triage</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">ML-09</span>
              </div>
              <p className="text-xs text-slate-400">Capacity-Constrained Queue Prioritization & XAI Grounding</p>
            </div>
          </div>

          {/* Controls: Persona & Capacity */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Persona Selector */}
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-slate-400">👤 User:</span>
              <select
                value={activeUser}
                onChange={(e) => setActiveUser(e.target.value)}
                aria-label="Active Reviewer Persona"
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Daily Capacity Slider */}
            <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3.5 py-1.5 text-xs">
              <span className="text-slate-400">⚡ Daily Quota (K):</span>
              <span className="font-bold text-sky-400 font-mono text-sm">{capacity}</span>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                aria-label="Daily review capacity limit slider"
                className="w-20 accent-sky-500 cursor-pointer"
              />
            </div>

            {/* System Status Pill */}
            <div className="flex items-center space-x-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online (FastAPI)</span>
            </div>
          </div>
        </div>

        {/* Emergency Escalation Banner */}
        {escalatedCount > 0 && (
          <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2.5 text-red-400 text-xs sm:text-sm font-semibold">
              <span className="text-base">🚨</span>
              <span>
                <strong>CRITICAL VIRAL ALERT:</strong> {escalatedCount} high-risk claims exceeding 80% risk & 100k reach require urgent editorial review!
              </span>
            </div>
            <button
              onClick={onOpenEscalations}
              className="text-xs bg-red-600 hover:bg-red-500 text-white font-medium px-3 py-1 rounded transition shadow-sm"
            >
              Filter Escalations ⚡
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
