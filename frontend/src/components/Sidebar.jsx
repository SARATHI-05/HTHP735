import React from 'react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  capacity = 20,
  reviewedCount = 14,
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'queue', label: 'Moderation Queue', icon: 'queue' },
    { id: 'investigation', label: 'Investigation', icon: 'manage_search' },
    { id: 'sources', label: 'Source Credibility', icon: 'verified' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col pt-space-lg pb-space-lg select-none">
      {/* Brand Header */}
      <div
        className="px-space-lg mb-space-xl flex items-center gap-space-sm cursor-pointer"
        onClick={() => setActiveTab('dashboard')}
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-white">shield</span>
        </div>
        <span className="text-headline-sm font-headline-sm font-bold tracking-tight uppercase text-primary">
          TruthGuard
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-space-md flex flex-col gap-space-xs">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-space-md py-space-sm rounded-xl transition-all text-left text-body-md ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-headline-sm shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined mr-space-sm text-[20px] ${isActive ? 'text-on-primary-container' : 'text-outline'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Daily Capacity Widget (Matching Screenshot Exactly) */}
      <div className="px-space-lg pt-space-md">
        <div className="bg-surface-container p-space-sm rounded-xl text-body-sm text-on-surface-variant flex flex-col gap-space-xs border border-outline-variant/30">
          <div className="flex justify-between items-center">
            <span className="font-label-sm uppercase text-outline text-[11px] font-semibold tracking-wider">
              Daily Capacity
            </span>
            <span className="font-label-sm text-tertiary font-bold">{reviewedCount}/{capacity}</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
            <div className="bg-tertiary h-full" style={{ width: `${Math.min(100, (reviewedCount / capacity) * 100)}%` }}></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
