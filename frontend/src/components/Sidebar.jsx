import React from 'react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  capacity,
  setCapacity,
  queueCount = 14,
  reviewedCount = 14,
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'queue', label: 'Moderation Queue', icon: 'queue', badge: queueCount },
    { id: 'investigation', label: 'Investigation', icon: 'manage_search' },
    { id: 'sources', label: 'Source Credibility', icon: 'verified' },
    { id: 'audit', label: 'Quantitative Audit', icon: 'gavel' },
  ];

  const capacityPct = Math.min(100, Math.round((reviewedCount / capacity) * 100));

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col pt-space-lg pb-space-lg select-none">
      {/* Brand Header */}
      <div className="px-space-lg mb-space-xl flex items-center gap-space-sm cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
          <span className="material-symbols-outlined text-[20px]">shield</span>
        </div>
        <div>
          <span className="text-headline-sm font-headline-sm tracking-tight uppercase text-primary block leading-none">
            TruthGuard
          </span>
          <span className="text-[10px] font-mono text-outline uppercase tracking-wider block mt-0.5">
            Trust & Safety TN
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-space-md flex flex-col gap-space-xs">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-space-md py-space-sm rounded-xl transition-all text-left text-body-md ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-headline-sm shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center">
                <span className={`material-symbols-outlined mr-space-sm text-[20px] ${isActive ? 'text-on-primary-container' : 'text-outline'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-secondary text-white' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Daily Capacity Widget */}
      <div className="px-space-lg pt-space-md space-y-3">
        <div className="bg-surface-container p-space-sm rounded-xl text-body-sm text-on-surface-variant flex flex-col gap-space-xs border border-outline-variant/30">
          <div className="flex justify-between items-center">
            <span className="font-label-sm uppercase text-outline text-[11px] tracking-wider">Daily Capacity</span>
            <span className="font-label-sm text-tertiary font-bold">{reviewedCount}/{capacity}</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${capacityPct > 85 ? 'bg-error' : 'bg-secondary'}`}
              style={{ width: `${capacityPct}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-outline pt-1">
            <span>Quota Slider:</span>
            <span className="font-mono text-on-surface font-semibold">{capacity} items</span>
          </div>
          <input
            type="range"
            min="10"
            max="40"
            step="5"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
            title="Adjust Daily Reviewer Quota"
          />
        </div>

        {/* System Telemetry Tag */}
        <div className="flex items-center justify-between px-2 text-[11px] text-outline">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Online</span>
          </span>
          <span className="font-mono text-[10px]">GBDT v2.4</span>
        </div>
      </div>
    </aside>
  );
}
