import React from 'react';

export default function Header({
  searchQuery,
  setSearchQuery,
  onQuickSearch,
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

      {/* Right Controls: Region Alert & Profile Avatar */}
      <div className="flex items-center gap-space-md">
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
