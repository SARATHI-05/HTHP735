import React from 'react';

export default function Header({
  searchQuery,
  setSearchQuery,
  onQuickSearch,
  isReachHidden,
  toggleHideReach,
}) {
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
            className="w-full bg-surface-container-lowest text-on-surface pl-10 pr-space-md py-space-sm rounded-xl text-body-md outline-none border border-outline-variant/40 focus:border-outline transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Right Controls: Estimated Reach Toggle, Region Alert & Profile Avatar */}
      <div className="flex items-center gap-space-md">
        {/* Real-World Estimated Reach Visibility Toggle */}
        <button
          type="button"
          onClick={toggleHideReach}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs ${
            isReachHidden
              ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
          }`}
          title={
            isReachHidden
              ? 'Estimated Reach is hidden from application. Click to show.'
              : 'Estimated Reach is active in real-time from URLs. Click to hide.'
          }
        >
          <span className="material-symbols-outlined text-[16px]">
            {isReachHidden ? 'visibility_off' : 'visibility'}
          </span>
          <span>{isReachHidden ? 'Reach: Hidden' : 'Reach: Live URL'}</span>
        </button>

        <span className="inline-flex items-center gap-space-xs bg-red-50 text-error font-label-md px-space-sm py-space-xs rounded-full border border-error/20 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
          Tamilnadu Region
        </span>

        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer shadow-xs">
          <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
}
