import React, { useState, useEffect, useRef } from 'react';

export default function QueueTable({
  items = [],
  capacity = 20,
  selectedClaimId,
  onSelectClaim,
  isReachHidden = false,
  day = 30,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const tableRef = useRef(null);

  // Format compact numbers e.g. 245000 -> 245K, 1200000 -> 1.2M
  const formatCompactNumber = (num) => {
    if (num == null) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${Math.round(num / 1000)}K`;
    return num.toLocaleString();
  };

  // Filter items based on search and action chip
  const filteredItems = items.filter((item) => {
    if (actionFilter !== 'All' && item.action_tier?.toLowerCase() !== actionFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.statement.toLowerCase().includes(q) ||
        item.claim_id.toLowerCase().includes(q) ||
        item.subject?.toLowerCase().includes(q) ||
        item.district?.toLowerCase().includes(q) ||
        item.speaker?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Action badge renderer strictly with icon + label
  const renderActionBadge = (tier) => {
    const t = (tier || '').toLowerCase();
    switch (t) {
      case 'escalate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold badge-escalate shadow-xs">
            <span>🚨</span>
            <span>Escalate</span>
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold badge-review shadow-xs">
            <span>🔍</span>
            <span>Review</span>
          </span>
        );
      case 'waitlist':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium badge-waitlist shadow-xs">
            <span>⏳</span>
            <span>Waitlist</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium badge-deprioritize shadow-xs">
            <span>💤</span>
            <span>Deprioritize</span>
          </span>
        );
    }
  };

  // Risk bar color scale (green to red) + numeric value
  const renderRiskIndicator = (riskValue) => {
    const p = Math.max(0, Math.min(1, riskValue > 1 ? riskValue / 100 : riskValue));
    const pct = Math.round(p * 100);

    let barColor = 'bg-emerald-500';
    let textColor = 'text-emerald-700';
    if (pct >= 80) {
      barColor = 'bg-rose-500';
      textColor = 'text-rose-700 font-bold';
    } else if (pct >= 60) {
      barColor = 'bg-amber-500';
      textColor = 'text-amber-700 font-semibold';
    } else if (pct >= 40) {
      barColor = 'bg-yellow-500';
      textColor = 'text-yellow-700 font-medium';
    }

    return (
      <div className="flex items-center gap-2" title={`Calibrated Risk: ${pct}%`}>
        <div className="w-12 sm:w-16 bg-slate-200 h-2 rounded-full overflow-hidden shrink-0">
          <div className={`${barColor} h-full rounded-full transition-all duration-300`} style={{ width: `${pct}%` }}></div>
        </div>
        <span className={`font-mono text-xs ${textColor}`}>{pct}%</span>
      </div>
    );
  };

  // Keyboard navigation: Up / Down arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in search input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = filteredItems.findIndex((it) => it.claim_id === selectedClaimId);
        if (e.key === 'ArrowDown') {
          const nextIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0;
          if (filteredItems[nextIndex]) {
            onSelectClaim(filteredItems[nextIndex].claim_id);
          }
        } else if (e.key === 'ArrowUp') {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1;
          if (filteredItems[prevIndex]) {
            onSelectClaim(filteredItems[prevIndex].claim_id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedClaimId, onSelectClaim]);

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredItems.length) return;
    const headers = ['Rank', 'Claim ID', 'Statement', 'District', 'Source', 'Calibrated Risk', 'Reach', 'Priority Score', 'Action Tier', 'Status'];
    const rows = filteredItems.map((it) => [
      it.rank,
      it.claim_id,
      `"${it.statement.replace(/"/g, '""')}"`,
      it.district || 'Tamil Nadu',
      it.speaker || 'Unknown',
      it.calibrated_risk || (it.score ? it.score / 100 : 0.5),
      it.estimated_reach || 0,
      it.priority_score || 0,
      it.action_tier,
      it.status || 'Pending',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `truthguard_moderation_queue_day_${day}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const actionCounts = {
    All: items.length,
    Escalate: items.filter((i) => i.action_tier?.toLowerCase() === 'escalate').length,
    Review: items.filter((i) => i.action_tier?.toLowerCase() === 'review').length,
    Waitlist: items.filter((i) => i.action_tier?.toLowerCase() === 'waitlist').length,
    Deprioritize: items.filter((i) => i.action_tier?.toLowerCase() === 'deprioritize').length,
  };

  return (
    <div className="flex flex-col w-full" ref={tableRef}>
      {/* Table Toolbar: Search, Action Filter Chips, CSV Export */}
      <div className="p-3.5 lg:p-4 border-b border-slate-200 bg-white flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search statements, speakers, or claim IDs... (Use ↑↓ arrows to navigate)"
              className="w-full bg-slate-50 text-slate-900 pl-9 pr-8 py-1.5 rounded-xl text-xs border border-slate-200 focus:bg-white focus:border-slate-900 transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            )}
          </div>

          {/* CSV Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer shrink-0"
            title="Export filtered queue as CSV"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-600">download</span>
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Chips by Action */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Filter:
          </span>
          {[
            { id: 'All', label: 'All Items', icon: 'list', count: actionCounts.All },
            { id: 'Escalate', label: 'Escalate', icon: 'emergency', count: actionCounts.Escalate, color: 'text-rose-700 bg-rose-50 border-rose-200' },
            { id: 'Review', label: 'Review', icon: 'visibility', count: actionCounts.Review, color: 'text-amber-800 bg-amber-50 border-amber-200' },
            { id: 'Waitlist', label: 'Waitlist', icon: 'hourglass_top', count: actionCounts.Waitlist, color: 'text-sky-800 bg-sky-50 border-sky-200' },
            { id: 'Deprioritize', label: 'Deprioritize', icon: 'visibility_off', count: actionCounts.Deprioritize, color: 'text-slate-600 bg-slate-100 border-slate-200' },
          ].map((chip) => {
            const isActive = actionFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActionFilter(chip.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-800 shadow-2xs ring-1 ring-slate-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table Container with Sticky Header */}
      <div className="overflow-x-auto max-h-[calc(100vh-16rem)] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse font-sans">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-2xs">
            <tr className="text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <th scope="col" className="py-2.5 px-3 w-14 text-center">Rank</th>
              <th scope="col" className="py-2.5 px-3 min-w-[200px]">Statement Snippet</th>
              <th scope="col" className="py-2.5 px-3 min-w-[110px]">Risk</th>
              <th scope="col" className="py-2.5 px-3 text-right">{isReachHidden ? 'Reach (Hidden)' : 'Reach'}</th>
              <th scope="col" className="py-2.5 px-3 text-right min-w-[70px]">Priority</th>
              <th scope="col" className="py-2.5 px-3 text-center min-w-[100px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <span className="material-symbols-outlined text-[32px] text-slate-300">search_off</span>
                    <span className="font-semibold text-slate-600">No claims match the selected filter</span>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Try clearing search keyword or switching action filter chip to "All Items".
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActionFilter('All');
                      }}
                      className="mt-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Reset Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = selectedClaimId === item.claim_id;
                const isCapacityCutoff = item.rank === capacity;
                const riskVal = item.calibrated_risk || (item.score ? item.score / 100 : 0.5);

                return (
                  <React.Fragment key={item.claim_id}>
                    <tr
                      onClick={() => onSelectClaim(item.claim_id)}
                      className={`queue-row-transition cursor-pointer select-none group ${
                        isSelected
                          ? 'bg-sky-50/80 border-l-4 border-l-slate-900 shadow-2xs font-medium'
                          : 'hover:bg-slate-50/90'
                      }`}
                      tabIndex="0"
                      role="row"
                      aria-selected={isSelected}
                    >
                      {/* 1. Rank */}
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">
                        #{item.rank.toString().padStart(2, '0')}
                      </td>

                      {/* 2. Statement Snippet (2 lines max) */}
                      <td className="py-2.5 px-3">
                        <div className="line-clamp-2 text-slate-900 leading-snug group-hover:text-sky-950 font-normal">
                          "{item.statement}"
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 flex-wrap">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 capitalize font-medium">
                            {item.subject || 'general'}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{item.district || 'Tamil Nadu'}</span>
                          {item.claim_id === 'CLM-5017' && (
                            <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-900 font-mono font-bold text-[9px] border border-sky-300" title="Outranking Showcase: 68.7% risk with 220k reach outranks 98% risk with 521 reach">
                              ★ High Exposure (220k)
                            </span>
                          )}
                          {item.claim_id === 'CLM-10223' && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono text-[9px]" title="Outranking Showcase: 98% risk deferred due to low 521 reach">
                              Low Exposure (521)
                            </span>
                          )}
                          {item.status === 'Resolved' && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[11px]">done</span> Resolved
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* 3. Risk (colored bar + %) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {renderRiskIndicator(riskVal)}
                      </td>

                      {/* 4. Reach (compact number) */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                        {isReachHidden ? (
                          <span className="italic text-slate-400 text-[11px]">[Hidden]</span>
                        ) : (
                          formatCompactNumber(item.estimated_reach)
                        )}
                      </td>

                      {/* 5. Priority (bold score) */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {(item.priority_score || 0).toFixed(3)}
                      </td>

                      {/* 6. Action Badge */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {renderActionBadge(item.action_tier)}
                      </td>
                    </tr>

                    {/* Capacity Cutoff Visual Divider */}
                    {isCapacityCutoff && idx < filteredItems.length - 1 && (
                      <tr className="bg-gradient-to-r from-sky-50 via-indigo-50 to-sky-50 border-y-2 border-sky-500 transition-all duration-300 shadow-2xs">
                        <td colSpan="6" className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-2 font-mono text-[11px] font-bold text-slate-900 flex-wrap">
                            <span className="inline-block w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
                            <span className="uppercase tracking-wider text-sky-950">
                              ⚡ Daily Moderator Capacity Waterline (K = {capacity} Items) ⚡
                            </span>
                            <span className="text-slate-400 hidden sm:inline">•</span>
                            <span className="text-[10px] text-slate-600 font-sans font-medium hidden sm:inline">
                              Items below are deferred to the Waitlist backlog with automated age-boosting
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
        <span className="font-mono">
          Showing <strong>{filteredItems.length}</strong> of {items.length} claims
        </span>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden sm:inline">Use ↑ ↓ keyboard arrows to quickly inspect claims</span>
        </div>
      </div>
    </div>
  );
}
