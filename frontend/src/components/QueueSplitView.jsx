import React, { useState } from 'react';
import QueueTable from './QueueTable';
import QueueDetailPanel from './QueueDetailPanel';
import WhyThisOrderCard from './WhyThisOrderCard';

export default function QueueSplitView({
  queueData,
  capacity = 20,
  day = 30,
  customClaim,
  selectedClaimId,
  onSelectClaim,
  onActionComplete,
  isReachHidden,
  toggleHideReach,
  onNavigateToLab,
  onOpenWalkthrough,
}) {
  const [mobileTab, setMobileTab] = useState('table'); // 'table' or 'detail'

  const items = queueData?.items || [];
  const selectedClaim =
    (customClaim && customClaim.claim_id === selectedClaimId)
      ? customClaim
      : (items.find((it) => it.claim_id === selectedClaimId) || items[0] || null);

  const handleRowClick = (claimId) => {
    onSelectClaim(claimId);
    // On small screens, smoothly switch to detail tab so reviewer sees claim details immediately
    if (window.innerWidth < 1024) {
      setMobileTab('detail');
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 1. "Why This Order?" Comparative Strategy Benchmark Card */}
      <WhyThisOrderCard onOpenWalkthrough={onOpenWalkthrough} />

      {/* 2. Responsive Mobile Tab Switcher (Visible only on < 1024px) */}
      <div className="flex lg:hidden items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold select-none">
        <button
          type="button"
          onClick={() => setMobileTab('table')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === 'table'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">format_list_numbered</span>
          <span>Ranked Queue ({items.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('detail')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === 'detail'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">visibility</span>
          <span>
            Claim Detail {selectedClaim ? `(${selectedClaim.claim_id})` : ''}
          </span>
        </button>
      </div>

      {/* 3. 60 / 40 Main Split View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (about 60% -> 7 of 12 cols on desktop): Ranked Moderation Queue Table */}
        <section
          className={`lg:col-span-7 xl:col-span-7 w-full flex flex-col gap-3 min-w-0 ${
            mobileTab === 'table' ? 'block' : 'hidden lg:block'
          }`}
          aria-label="Ranked Moderation Queue Table"
        >
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <QueueTable
              items={items}
              capacity={capacity}
              day={day}
              selectedClaimId={selectedClaim?.claim_id || selectedClaimId}
              onSelectClaim={handleRowClick}
              isReachHidden={isReachHidden}
            />
          </div>
        </section>

        {/* Right Column (about 40% -> 5 of 12 cols on desktop): Sticky Detail Panel */}
        <aside
          className={`lg:col-span-5 xl:col-span-5 w-full lg:sticky lg:top-20 max-h-[calc(100vh-6rem)] overflow-y-auto min-w-0 ${
            mobileTab === 'detail' ? 'block' : 'hidden lg:block'
          }`}
          aria-label="Claim Investigation Detail Panel"
        >
          {/* Mobile Back Button banner */}
          <div className="flex lg:hidden mb-2 items-center justify-between p-2 rounded-lg bg-slate-100 text-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setMobileTab('table')}
              className="flex items-center gap-1 font-semibold text-slate-800 hover:text-slate-950 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Queue Table</span>
            </button>
            <span className="text-[11px] text-slate-500 font-mono">
              Rank #{selectedClaim?.rank || 1}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 lg:p-5 shadow-xs">
            <QueueDetailPanel
              selectedClaim={selectedClaim}
              activeUser="elena.rostova"
              onActionComplete={onActionComplete}
              onNavigateToLab={onNavigateToLab}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
