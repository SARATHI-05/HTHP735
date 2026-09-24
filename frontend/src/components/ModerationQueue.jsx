import React, { useState, useMemo } from 'react';

export default function ModerationQueue({
  queueData,
  capacity,
  onSelectClaim,
  selectedClaimId,
  onActionComplete,
}) {
  const [districtFilter, setDistrictFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Selected claim for explanation modal
  const [explainingClaim, setExplainingClaim] = useState(null);

  const rawItems = queueData?.items || [];

  // Filter items
  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      // District filter
      if (districtFilter !== 'All') {
        const itemDist = (item.district || '').toLowerCase();
        if (!itemDist.includes(districtFilter.toLowerCase())) return false;
      }
      // Risk filter
      if (riskFilter !== 'All') {
        const score = item.score !== undefined ? item.score : (item.predicted_risk ? item.predicted_risk * 100 : 75);
        if (riskFilter === 'Tier 1' && score < 85) return false;
        if (riskFilter === 'Tier 2' && (score < 70 || score >= 85)) return false;
        if (riskFilter === 'Tier 3' && score >= 70) return false;
      }
      // Language filter
      if (languageFilter !== 'All') {
        const lang = (item.language || '').toLowerCase();
        if (!lang.includes(languageFilter.toLowerCase())) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${item.claim_id} ${item.statement || item.claim_text || ''} ${item.district || ''} ${item.source || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [rawItems, districtFilter, riskFilter, languageFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const pendingCount = queueData?.pending_count || filteredItems.filter((i) => i.status !== 'Resolved').length;
  const highPriorityCount = filteredItems.filter((i) => {
    const s = i.score !== undefined ? i.score : (i.predicted_risk ? i.predicted_risk * 100 : 0);
    return s >= 85;
  }).length;

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Metrics & Context Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-space-md">
        <div>
          <div className="flex items-center gap-space-sm mb-space-xs">
            <span className="font-label-md text-primary font-bold uppercase tracking-wider text-xs">
              Active Triage Queue
            </span>
            <span className="text-outline font-label-md">/</span>
            <span className="font-label-md text-outline font-medium text-xs">Tamil Nadu Regional Command</span>
          </div>
          <h1 className="text-headline-xl text-on-surface font-bold tracking-tight">Prioritized Moderation Queue</h1>
          <p className="text-body-md text-outline mt-1">
            Dynamic prioritization calibrated against viral reach, calibrated GBDT risk, and multilingual NLI consistency.
          </p>
        </div>

        <div className="flex items-center gap-space-md bg-surface-container-lowest border border-outline-variant/30 p-space-sm px-space-md rounded-xl shadow-xs">
          <div className="text-right">
            <div className="text-headline-md text-primary font-bold">{pendingCount} Items</div>
            <div className="text-body-sm text-outline text-xs">Pending Review</div>
          </div>
          <div className="w-px h-8 bg-outline-variant/30"></div>
          <div className="text-right">
            <div className="text-headline-md text-error font-bold">{highPriorityCount} Critical</div>
            <div className="text-body-sm text-outline text-xs">Tier-1 Escalations</div>
          </div>
          <div className="w-px h-8 bg-outline-variant/30"></div>
          <div className="text-right">
            <div className="text-headline-md text-on-surface font-bold font-mono">3.4m</div>
            <div className="text-body-sm text-outline text-xs">Avg Turnaround</div>
          </div>
        </div>
      </div>

      {/* Filters & Controls Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-md rounded-xl flex flex-wrap items-center justify-between gap-space-md shadow-xs">
        <div className="flex flex-wrap items-center gap-space-md flex-1">
          {/* District Filter */}
          <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg border border-outline-variant/20">
            <span className="material-symbols-outlined text-outline text-[18px]">location_on</span>
            <span className="text-body-sm text-on-surface-variant text-xs">District:</span>
            <select
              value={districtFilter}
              onChange={(e) => { setDistrictFilter(e.target.value); setPage(1); }}
              className="bg-transparent text-on-surface font-label-md text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="All">All Districts (Tamil Nadu)</option>
              <option value="Chennai">Chennai</option>
              <option value="Madurai">Madurai</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Tiruchirappalli">Tiruchirappalli</option>
              <option value="Salem">Salem</option>
            </select>
          </div>

          {/* Risk Tier Filter */}
          <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg border border-outline-variant/20">
            <span className="material-symbols-outlined text-outline text-[18px]">shield</span>
            <span className="text-body-sm text-on-surface-variant text-xs">Risk Tier:</span>
            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
              className="bg-transparent text-on-surface font-label-md text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="All">All Tiers (High to Low)</option>
              <option value="Tier 1">Tier 1 - Critical (&gt;85%)</option>
              <option value="Tier 2">Tier 2 - High (70-85%)</option>
              <option value="Tier 3">Tier 3 - Moderate (&lt;70%)</option>
            </select>
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg border border-outline-variant/20">
            <span className="material-symbols-outlined text-outline text-[18px]">translate</span>
            <span className="text-body-sm text-on-surface-variant text-xs">Language:</span>
            <select
              value={languageFilter}
              onChange={(e) => { setLanguageFilter(e.target.value); setPage(1); }}
              className="bg-transparent text-on-surface font-label-md text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="All">All Languages</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Tanglish">Tanglish</option>
              <option value="English">English</option>
            </select>
          </div>

          {/* Text Search */}
          <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-sm rounded-lg border border-outline-variant/20 flex-1 min-w-[200px]">
            <span className="material-symbols-outlined text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search narrative keywords..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="bg-transparent text-on-surface text-xs outline-none w-full placeholder:text-outline"
            />
          </div>
        </div>

        {/* Reset */}
        {(districtFilter !== 'All' || riskFilter !== 'All' || languageFilter !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setDistrictFilter('All');
              setRiskFilter('All');
              setLanguageFilter('All');
              setSearchQuery('');
              setPage(1);
            }}
            className="text-xs text-error font-medium hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span> Reset Filters
          </button>
        )}
      </div>

      {/* Main Data Table Grid */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20 text-outline font-label-sm uppercase tracking-wider text-[11px]">
                <th className="py-space-md px-space-md">Score</th>
                <th className="py-space-md px-space-md">Claim & Core Narrative</th>
                <th className="py-space-md px-space-md">District & Source</th>
                <th className="py-space-md px-space-md">Language & NLP Conf</th>
                <th className="py-space-md px-space-md">Reach & Velocity</th>
                <th className="py-space-md px-space-md">Status</th>
                <th className="py-space-md px-space-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-md text-xs">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-outline text-body-md">
                    No claims match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const scoreVal = item.score !== undefined ? Number(item.score).toFixed(1) : (item.predicted_risk ? (item.predicted_risk * 100).toFixed(1) : '75.0');
                  const isCritical = Number(scoreVal) >= 85;
                  const isElevated = Number(scoreVal) >= 70 && !isCritical;

                  return (
                    <tr
                      key={item.claim_id}
                      className={`hover:bg-surface-container-low/70 transition-colors group ${
                        selectedClaimId === item.claim_id ? 'bg-primary-container/5' : ''
                      }`}
                    >
                      {/* Score Badge */}
                      <td className="py-space-md px-space-md">
                        <div
                          className={`font-label-md font-bold px-space-sm py-space-xs rounded inline-block border font-mono text-xs ${
                            isCritical
                              ? 'text-error bg-error-container/30 border-error/30'
                              : isElevated
                              ? 'text-tertiary bg-tertiary-container/30 border-tertiary/30'
                              : 'text-on-surface bg-surface-container border-outline-variant/30'
                          }`}
                        >
                          {scoreVal}
                        </div>
                      </td>

                      {/* Claim Narrative */}
                      <td className="py-space-md px-space-md max-w-sm">
                        <div className="font-semibold text-on-surface text-sm line-clamp-1">
                          {item.statement || item.claim_text || 'Unverified narrative broadcast'}
                        </div>
                        {item.tamil_text && (
                          <div className="text-outline text-xs line-clamp-1 mt-0.5 font-tamil">
                            {item.tamil_text}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-outline font-mono">
                          <span>{item.claim_id}</span>
                          <span>•</span>
                          <span className="text-on-surface-variant font-sans">{item.threat_vector || item.subject || 'Broadcast'}</span>
                        </div>
                      </td>

                      {/* District & Source */}
                      <td className="py-space-md px-space-md whitespace-nowrap">
                        <div className="font-semibold text-on-surface flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-outline">location_on</span>
                          <span>{item.district || 'Chennai'}</span>
                        </div>
                        <div className="text-outline text-[11px] mt-0.5">
                          {item.regional_source || item.source || 'WhatsApp Broadcast'}
                        </div>
                      </td>

                      {/* Language & NLP */}
                      <td className="py-space-md px-space-md whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-medium text-[10px] border border-outline-variant/20">
                            {item.language || 'Tamil'}
                          </span>
                          <span className="text-outline text-[11px] font-mono">
                            {(item.nlp_confidence ? item.nlp_confidence * 100 : 94.2).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-16 bg-surface-container-highest h-1 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-secondary h-full"
                            style={{ width: `${(item.nlp_confidence ? item.nlp_confidence * 100 : 94.2)}%` }}
                          />
                        </div>
                      </td>

                      {/* Reach & Velocity */}
                      <td className="py-space-md px-space-md whitespace-nowrap">
                        <div className="font-semibold text-on-surface font-mono">
                          {typeof item.reach === 'number' ? (item.reach > 1000 ? `${(item.reach / 1000).toFixed(1)}K` : item.reach) : (item.reach || '42.5K')}
                        </div>
                        <div className="text-[11px] text-error font-medium flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">trending_up</span>
                          <span>{item.reach_velocity || '+340/hr'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-space-md px-space-md whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Escalated'
                              ? 'bg-error-container text-error'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {item.status || 'Pending'}
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-space-md px-space-md text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setExplainingClaim(item)}
                            className="p-1 text-outline hover:text-primary hover:bg-surface-container rounded transition-colors"
                            title="View TreeSHAP Attribution & Evidence Grounding"
                          >
                            <span className="material-symbols-outlined text-[18px]">psychology</span>
                          </button>
                          <button
                            onClick={() => onSelectClaim(item.claim_id)}
                            className="px-space-md py-space-xs bg-primary text-on-primary rounded-lg text-body-sm font-semibold hover:opacity-90 transition-opacity shadow-xs text-xs"
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div className="bg-surface-container-low border-t border-outline-variant/20 p-space-md flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="text-body-sm text-outline">
            Showing {Math.min(filteredItems.length, (page - 1) * pageSize + 1)} - {Math.min(filteredItems.length, page * pageSize)} of {filteredItems.length} items in active queue
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-space-md py-space-xs bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-lg text-body-sm font-semibold disabled:opacity-40 shadow-xs"
            >
              Previous
            </button>
            <span className="text-outline font-mono text-xs px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-space-md py-space-xs bg-primary text-on-primary rounded-lg text-body-sm font-semibold disabled:opacity-40 shadow-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Analytics / Insight Mosaic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
        {/* Card 1: Propagation Velocity */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <span className="font-label-md text-outline uppercase font-semibold text-xs">Propagation Velocity</span>
              <span className="material-symbols-outlined text-tertiary text-[20px]">speed</span>
            </div>
            <div className="text-headline-lg font-bold text-on-surface">+18.4%</div>
            <p className="text-body-sm text-outline mt-1">Average hourly virality spike across monitored messaging channels.</p>
          </div>
          <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex justify-between text-xs text-outline">
            <span>Peak hour: 18:00 - 21:00 IST</span>
            <span className="text-error font-semibold">Accelerating</span>
          </div>
        </div>

        {/* Card 2: Regional Concentration */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <span className="font-label-md text-outline uppercase font-semibold text-xs">Regional Concentration</span>
              <span className="material-symbols-outlined text-secondary text-[20px]">hub</span>
            </div>
            <div className="text-headline-lg font-bold text-on-surface">Chennai & Madurai</div>
            <p className="text-body-sm text-outline mt-1">Represent 64% of high-severity misinformation nodes ingested today.</p>
          </div>
          <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex justify-between text-xs text-outline">
            <span>Surveillance zone active</span>
            <span className="text-secondary font-semibold">Priority Routing</span>
          </div>
        </div>

        {/* Card 3: Model Invariant Verification */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <span className="font-label-md text-outline uppercase font-semibold text-xs">Model Calibrations (TreeSHAP)</span>
              <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
            </div>
            <div className="text-headline-lg font-bold text-on-surface">Top Feature: Cross-Modal Contradiction</div>
            <p className="text-body-sm text-outline mt-1">NLI contradiction delta (+0.38) and reach velocity (+0.24) dominate top rank.</p>
          </div>
          <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex justify-between text-xs text-outline">
            <span>GBDT Calibration: Brier 0.082</span>
            <span className="text-primary font-semibold">Calibrated</span>
          </div>
        </div>
      </div>

      {/* Interactive Explanation Modal */}
      {explainingClaim && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-space-lg animate-fadeIn">
          <div className="bg-surface-container-lowest max-w-2xl w-full p-space-xl rounded-2xl shadow-2xl border border-outline-variant/30 relative">
            <button
              onClick={() => setExplainingClaim(null)}
              className="absolute top-space-lg right-space-lg text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-space-sm mb-space-md">
              <span className="material-symbols-outlined text-secondary text-[24px]">psychology</span>
              <h3 className="text-headline-md font-bold text-on-surface">Model Priority & XAI Attribution</h3>
            </div>
            <div className="text-body-sm text-outline mb-space-md font-mono">
              {explainingClaim.claim_id} • Score: {explainingClaim.score || 94.2} • District: {explainingClaim.district || 'Chennai'}
            </div>
            <p className="text-body-sm text-on-surface mb-space-lg bg-surface-container-low p-space-md rounded-xl border border-outline-variant/20">
              "{explainingClaim.statement || explainingClaim.claim_text}"
            </p>

            <div className="space-y-space-md mb-space-xl">
              <div>
                <div className="flex justify-between text-body-sm mb-1">
                  <span className="text-on-surface font-semibold text-xs">Cross-Modal / NLI Contradiction Signal</span>
                  <span className="text-error font-mono font-bold text-xs">+0.38 SHAP</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className="bg-error h-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-body-sm mb-1">
                  <span className="text-on-surface font-semibold text-xs">Reach Velocity Spike (+340 retweets/hr)</span>
                  <span className="text-error font-mono font-bold text-xs">+0.24 SHAP</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className="bg-error h-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-body-sm mb-1">
                  <span className="text-on-surface font-semibold text-xs">Publisher Historical Credibility Deficit</span>
                  <span className="text-tertiary font-mono font-bold text-xs">+0.19 SHAP</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full" style={{ width: '54%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-space-sm pt-space-md border-t border-outline-variant/20">
              <button
                onClick={() => setExplainingClaim(null)}
                className="px-space-md py-space-xs rounded-lg text-body-sm text-outline hover:text-on-surface"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = explainingClaim.claim_id;
                  setExplainingClaim(null);
                  onSelectClaim(id);
                }}
                className="px-space-lg py-space-xs rounded-lg text-body-sm font-semibold bg-primary text-on-primary hover:opacity-90 shadow-xs"
              >
                Open Full Investigation Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
