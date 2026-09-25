import React from 'react';

export default function TabNav({
  activeTab,
  setActiveTab,
  queueCount = 14,
  alertsCount = 7,
}) {
  const tabs = [
    {
      id: 'queue',
      label: 'Queue',
      icon: 'format_list_numbered',
      badge: queueCount ? `${queueCount}` : null,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    },
    {
      id: 'sources',
      label: 'Source Trends',
      icon: 'trending_up',
      badge: alertsCount ? `${alertsCount} alerts` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'method',
      label: 'Method & Limits',
      icon: 'rule',
      badge: 'DSA Art. 34',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'multimodal',
      label: 'Multimodal Lab',
      icon: 'biotech',
      badge: 'Forensics',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      id: 'overview',
      label: 'Regional Overview',
      icon: 'dashboard',
    },
  ];

  return (
    <div className="w-full border-b border-slate-200 mb-2">
      <nav
        className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1"
        role="tablist"
        aria-label="Moderator console navigation tabs"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`material-symbols-outlined text-[17px] ${isActive ? 'text-sky-400' : 'text-slate-400'}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                    isActive ? 'bg-white/20 text-white border-white/20' : tab.badgeColor
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
