import React, { useState } from 'react';

export default function Header({
  searchQuery,
  setSearchQuery,
  activeUser,
  setActiveUser,
  onQuickSearch,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const reviewers = [
    { id: 'elena.rostova', name: 'Elena Rostova', role: 'Senior Fact-Checker (Tamil Nadu Desk)', initials: 'ER' },
    { id: 'k.saravanan', name: 'K. Saravanan', role: 'Regional T&S Specialist (Chennai)', initials: 'KS' },
    { id: 'amina.almansoor', name: 'Amina Al-Mansoor', role: 'Compliance & DSA Auditor', initials: 'AA' },
    { id: 'm.balaji', name: 'Dr. M. Balaji', role: 'NLP Research Engineer', initials: 'MB' },
  ];

  const currentUser = reviewers.find((u) => u.id === activeUser) || reviewers[0];

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 z-40 flex items-center justify-between px-space-lg select-none">
      {/* Search Input */}
      <div className="flex items-center gap-space-md flex-1 max-w-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onQuickSearch) {
                onQuickSearch(searchQuery);
              }
            }}
            placeholder="Search signals, URLs, or actors (⌘K)"
            className="w-full bg-surface-container-lowest text-on-surface pl-10 pr-space-md py-space-sm rounded-xl text-body-md outline-none border border-outline-variant/40 focus:border-outline focus:ring-1 focus:ring-outline/20 transition-all shadow-sm placeholder:text-outline"
          />
        </div>
      </div>

      {/* Right Controls: Region Alert & Reviewer Profile */}
      <div className="flex items-center gap-space-md">
        {/* Active Region Alert Pill */}
        <div className="inline-flex items-center gap-space-xs bg-tertiary-container text-on-tertiary-container font-label-md px-space-sm py-1 rounded-full border border-outline-variant/20 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
          <span className="font-semibold text-xs tracking-wide">Tamil Nadu Region</span>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full hover:bg-surface-container transition-colors border border-outline-variant/30 bg-surface-container-lowest"
            title="Switch Reviewer"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold font-mono">
              {currentUser.initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-headline-sm text-on-surface leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-outline leading-tight truncate max-w-[120px]">{currentUser.role}</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-outline-variant/20">
                <span className="text-[11px] font-semibold text-outline uppercase tracking-wider block">
                  Select Active Reviewer Session
                </span>
              </div>
              {reviewers.map((rev) => (
                <button
                  key={rev.id}
                  onClick={() => {
                    setActiveUser(rev.id);
                    setShowUserMenu(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-surface-container transition-colors ${
                    rev.id === activeUser ? 'bg-primary-container/10 font-semibold' : ''
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-mono font-bold text-primary">
                    {rev.initials}
                  </div>
                  <div>
                    <div className="text-xs text-on-surface">{rev.name}</div>
                    <div className="text-[10px] text-outline">{rev.role}</div>
                  </div>
                  {rev.id === activeUser && (
                    <span className="material-symbols-outlined text-secondary text-[16px] ml-auto">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
