import React, { useState, useEffect } from 'react';
import { fetchQueue, submitModeratorAction } from '../services/api';

export default function ModerationQueue({
  onSelectClaim,
  selectedClaimId,
}) {
  const [districtFilter, setDistrictFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [actionToast, setActionToast] = useState(null);

  const defaultItems = [
    {
      score: '94.2',
      isCritical: true,
      title: 'Fake WhatsApp forward claiming drinking water supply in Chennai is contaminated with heavy metals.',
      meta: 'District: Chennai • ID: #TN-8821',
      claim_id: '#TN-8821',
      sourceIcon: 'chat',
      sourceName: 'Local WhatsApp Group',
      lang: 'Tamil',
      nlpConf: '98.4%',
      reach: '245K',
      velocity: '+32K/hr',
      riskTier: 'HIGH',
      riskTierStyle: 'red',
    },
    {
      score: '88.5',
      isCritical: true,
      title: 'Altered video showing police confrontation at Madurai political gathering.',
      meta: 'District: Madurai • ID: #TN-7734',
      claim_id: '#TN-7734',
      sourceIcon: 'share',
      sourceName: 'Social Channel (X)',
      lang: 'Tamil',
      nlpConf: '92.1%',
      reach: '180K',
      velocity: '+14K/hr',
      riskTier: 'HIGH',
      riskTierStyle: 'red',
    },
    {
      score: '76.1',
      isCritical: false,
      title: 'Misattributed quote alleging sudden cancellation of rural agricultural electricity subsidies.',
      meta: 'District: Coimbatore • ID: #TN-6590',
      claim_id: '#TN-6590',
      sourceIcon: 'article',
      sourceName: 'Dinamalar (Online)',
      lang: 'Tamil',
      nlpConf: '84.6%',
      reach: '95K',
      velocity: '+5K/hr',
      riskTier: 'MEDIUM',
      riskTierStyle: 'grey',
    },
    {
      score: '68.4',
      isCritical: false,
      title: 'Unverified panic rumors claiming lockdown of local ration shops in Salem district.',
      meta: 'District: Salem • ID: #TN-5421',
      claim_id: '#TN-5421',
      sourceIcon: 'chat',
      sourceName: 'Local WhatsApp Forward',
      lang: 'Tamil',
      nlpConf: '79.2%',
      reach: '62K',
      velocity: '+2K/hr',
      riskTier: 'MEDIUM',
      riskTierStyle: 'grey',
    },
    {
      score: '42.0',
      isCritical: false,
      title: 'Outdated weather alert from 2021 reshared claiming imminent dam overflow in Trichy.',
      meta: 'District: Trichy • ID: #TN-4112',
      claim_id: '#TN-4112',
      sourceIcon: 'public',
      sourceName: 'Facebook Group',
      lang: 'English',
      nlpConf: '95.0%',
      reach: '18K',
      velocity: '+100/hr',
      riskTier: 'LOW',
      riskTierStyle: 'grey',
    },
  ];

  const [items, setItems] = useState(defaultItems);

  useEffect(() => {
    async function load() {
      const res = await fetchQueue();
      if (res?.items?.length > 0) {
        // Merge backend attributes
        const merged = res.items.slice(0, 5).map((it, idx) => ({
          score: it.score ? it.score.toFixed(1) : defaultItems[idx]?.score || '75.0',
          isCritical: Number(it.score || 0) >= 80 || defaultItems[idx]?.isCritical,
          title: it.statement || defaultItems[idx]?.title,
          meta: `District: ${it.district || 'Chennai'} • ID: ${it.claim_id || defaultItems[idx]?.claim_id}`,
          claim_id: it.claim_id || defaultItems[idx]?.claim_id,
          sourceIcon: defaultItems[idx]?.sourceIcon || 'chat',
          sourceName: it.regional_source || defaultItems[idx]?.sourceName,
          lang: it.language || defaultItems[idx]?.lang,
          nlpConf: it.nlp_confidence ? `${it.nlp_confidence}%` : defaultItems[idx]?.nlpConf,
          reach: defaultItems[idx]?.reach,
          velocity: it.reach_velocity || defaultItems[idx]?.velocity,
          riskTier: it.risk_tier || defaultItems[idx]?.riskTier,
          riskTierStyle: (it.risk_tier === 'HIGH' || Number(it.score) >= 80) ? 'red' : 'grey',
        }));
        setItems(merged);
      }
    }
    load();
  }, []);

  const handleQuickAction = async (claimId, actionName) => {
    await submitModeratorAction(claimId, { action: actionName, reviewer_id: 'elena.rostova' });
    setActionToast(`Claim ${claimId}: ${actionName} applied.`);
    setTimeout(() => setActionToast(null), 4000);
  };

  const filteredItems = items.filter((item) => {
    if (districtFilter !== 'All' && !item.meta.toLowerCase().includes(districtFilter.toLowerCase())) return false;
    if (riskFilter !== 'All') {
      if (riskFilter.includes('High') && item.riskTier !== 'HIGH') return false;
      if (riskFilter.includes('Medium') && item.riskTier !== 'MEDIUM') return false;
    }
    if (languageFilter !== 'All' && item.lang !== languageFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Toast Alert */}
      {actionToast && (
        <div className="bg-primary text-on-primary p-space-md rounded-xl flex items-center justify-between shadow-xl border border-secondary animate-fadeIn text-xs">
          <span>{actionToast}</span>
          <button onClick={() => setActionToast(null)} className="text-outline-variant hover:text-white">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Top Metrics & Context Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-space-md">
        <div>
          <div className="flex items-center gap-space-sm mb-space-xs">
            <span className="font-label-md text-primary font-bold uppercase tracking-wider text-xs">
              Active Triage Queue
            </span>
            <span className="text-outline font-label-md">/</span>
            <span className="font-label-md text-outline font-medium text-xs">Tamil Nadu Region</span>
          </div>
          <h1 className="text-headline-xl text-on-surface font-bold tracking-tight text-2xl">
            Moderation Command Center
          </h1>
        </div>

        {/* Top Right 2 Cards */}
        <div className="flex items-center gap-space-md bg-surface-container-lowest border border-outline-variant/30 p-space-sm rounded-xl shadow-xs">
          <div className="flex items-center gap-space-sm px-space-sm">
            <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
            <div>
              <div className="text-body-sm text-outline text-[11px]">Daily Quota Left</div>
              <div className="text-headline-sm font-bold text-on-surface text-sm">
                6 <span className="text-outline font-normal text-xs">/ 20 slots</span>
              </div>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-outline-variant/30"></div>
          <div className="flex items-center gap-space-sm px-space-sm">
            <span className="material-symbols-outlined text-error text-[20px]">warning</span>
            <div>
              <div className="text-body-sm text-outline text-[11px]">Critical Risk Pending</div>
              <div className="text-headline-sm font-bold text-error text-sm">4 items</div>
            </div>
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
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-transparent text-on-surface font-label-md outline-none cursor-pointer text-xs font-semibold"
            >
              <option value="All">All Districts (Tamil Nadu)</option>
              <option value="Chennai">Chennai</option>
              <option value="Madurai">Madurai</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Salem">Salem</option>
              <option value="Trichy">Trichy</option>
            </select>
          </div>

          {/* Risk Tier Filter */}
          <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg border border-outline-variant/20">
            <span className="material-symbols-outlined text-outline text-[18px]">shield</span>
            <span className="text-body-sm text-on-surface-variant text-xs">Risk Tier:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-transparent text-on-surface font-label-md outline-none cursor-pointer text-xs font-semibold"
            >
              <option value="All">All Tiers (High to Low)</option>
              <option value="High">Tier 1 - High Risk</option>
              <option value="Medium">Tier 2 - Medium Risk</option>
            </select>
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg border border-outline-variant/20">
            <span className="material-symbols-outlined text-outline text-[18px]">translate</span>
            <span className="text-body-sm text-on-surface-variant text-xs">Language:</span>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-transparent text-on-surface font-label-md outline-none cursor-pointer text-xs font-semibold"
            >
              <option value="All">All Languages</option>
              <option value="Tamil">Tamil</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-space-sm">
          <button className="px-space-md py-space-sm bg-surface-container-low border border-outline-variant/20 text-on-surface rounded-lg text-xs font-semibold flex items-center gap-space-xs shadow-xs">
            <span className="material-symbols-outlined text-[16px]">swap_vert</span>
            Sort: Reach × Risk Score
          </button>
          <button
            onClick={() => onSelectClaim('#TN-8821')}
            className="bg-primary text-on-primary px-space-md py-space-sm rounded-lg font-label-md flex items-center gap-space-xs hover:opacity-95 transition-opacity shadow-xs text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            Auto-Triage Top 3
          </button>
        </div>
      </div>

      {/* Main Data Table Grid */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20 text-outline font-label-sm uppercase tracking-wider text-[11px]">
                <th className="py-space-md px-space-md">Score</th>
                <th className="py-space-md px-space-md">Claim / Post Title</th>
                <th className="py-space-md px-space-md">Regional Source</th>
                <th className="py-space-md px-space-md">Lang</th>
                <th className="py-space-md px-space-md">NLP Conf.</th>
                <th className="py-space-md px-space-md">Est. Reach</th>
                <th className="py-space-md px-space-md">Risk Tier</th>
                <th className="py-space-md px-space-md text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-md text-xs">
              {filteredItems.map((item) => (
                <tr key={item.claim_id} className="hover:bg-surface-container-low/60 transition-colors group">
                  {/* Score */}
                  <td className="py-space-md px-space-md">
                    <div
                      className={`font-label-md font-bold px-space-sm py-space-xs rounded inline-block border font-mono text-xs ${
                        item.isCritical
                          ? 'text-error bg-error-container/20 border-error/20'
                          : 'text-on-surface bg-surface-container border-outline-variant/30'
                      }`}
                    >
                      {item.score}
                    </div>
                  </td>

                  {/* Claim / Post Title */}
                  <td className="py-space-md px-space-md max-w-xs">
                    <div className="font-headline-sm font-semibold text-on-surface line-clamp-1 text-sm">
                      {item.title}
                    </div>
                    <div className="text-body-sm text-outline text-[11px] mt-0.5">{item.meta}</div>
                  </td>

                  {/* Regional Source */}
                  <td className="py-space-md px-space-md whitespace-nowrap">
                    <div className="flex items-center gap-space-xs text-body-sm text-on-surface-variant text-xs">
                      <span className="material-symbols-outlined text-[16px] text-primary">{item.sourceIcon}</span>
                      <span>{item.sourceName}</span>
                    </div>
                  </td>

                  {/* Language */}
                  <td className="py-space-md px-space-md whitespace-nowrap">
                    <span className="font-label-sm bg-surface-container px-space-sm py-space-xs rounded text-on-surface-variant border border-outline-variant/20 text-[11px]">
                      {item.lang}
                    </span>
                  </td>

                  {/* NLP Confidence */}
                  <td className="py-space-md px-space-md whitespace-nowrap">
                    <div className="font-label-md text-on-surface font-semibold text-xs">{item.nlpConf}</div>
                  </td>

                  {/* Est Reach */}
                  <td className="py-space-md px-space-md whitespace-nowrap">
                    <div className="font-label-md font-semibold text-on-surface text-xs">{item.reach}</div>
                    <div className="text-body-sm text-outline text-[11px]">{item.velocity}</div>
                  </td>

                  {/* Risk Tier */}
                  <td className="py-space-md px-space-md whitespace-nowrap">
                    {item.riskTierStyle === 'red' ? (
                      <span className="inline-flex items-center gap-space-xs bg-error-container/30 text-error font-label-sm px-space-sm py-space-xs rounded-full border border-error/30 font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span> HIGH
                      </span>
                    ) : item.riskTier === 'MEDIUM' ? (
                      <span className="inline-flex items-center gap-space-xs bg-surface-container-high text-on-surface-variant font-label-sm px-space-sm py-space-xs rounded-full border border-outline-variant/40 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> MEDIUM
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-space-xs bg-surface-container-high text-on-surface-variant font-label-sm px-space-sm py-space-xs rounded-full border border-outline-variant/40 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> LOW
                      </span>
                    )}
                  </td>

                  {/* Quick Actions (3 square icons) */}
                  <td className="py-space-md px-space-md text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-space-xs">
                      {/* Investigate / Psychology */}
                      <button
                        onClick={() => onSelectClaim(item.claim_id)}
                        className="p-1.5 bg-surface-container-low border border-outline-variant/20 hover:bg-surface-container text-on-surface rounded-lg transition-colors shadow-xs"
                        title="Review Claim Dossier"
                      >
                        <span className="material-symbols-outlined text-[16px]">psychology</span>
                      </button>

                      {/* Fast Escalate */}
                      <button
                        onClick={() => handleQuickAction(item.claim_id, 'Escalate')}
                        className="p-1.5 bg-error-container/20 border border-error/30 hover:bg-error-container/40 text-error rounded-lg transition-colors"
                        title="Fast Escalate to Cyber Cell"
                      >
                        <span className="material-symbols-outlined text-[16px]">priority_high</span>
                      </button>

                      {/* Dismiss / Deprioritize */}
                      <button
                        onClick={() => handleQuickAction(item.claim_id, 'Dismiss')}
                        className="p-1.5 bg-surface-container-low border border-outline-variant/20 hover:bg-surface-container text-on-surface-variant rounded-lg transition-colors shadow-xs"
                        title="Dismiss from active queue"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-surface-container-low border-t border-outline-variant/20 p-space-md flex items-center justify-between text-xs">
          <div className="text-body-sm text-outline">Showing 5 of 14 items assigned for today's reviewer session</div>
          <div className="flex items-center gap-space-sm">
            <button className="px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant rounded-lg text-body-sm font-label-md disabled:opacity-50 shadow-xs">
              Previous
            </button>
            <button className="px-space-md py-space-sm bg-primary text-on-primary rounded-lg text-body-sm font-label-md shadow-xs">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Analytics / Insight Mosaic (Matching Screenshot 3 Exactly) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
        {/* Card 1: Propagation Velocity */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <span className="font-label-md text-outline uppercase font-semibold text-xs">Propagation Velocity</span>
              <span className="material-symbols-outlined text-primary text-[20px]">trending_up</span>
            </div>
            <div className="text-headline-lg font-bold text-on-surface text-xl">+42.8% Spike</div>
            <p className="text-body-sm text-outline text-xs mt-1 leading-relaxed">
              Accelerated amplification detected in WhatsApp forward clusters across Chennai urban zones.
            </p>
          </div>
          <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex justify-between text-xs text-outline">
            <span>Baseline: 12K msgs/hr</span>
            <span className="font-semibold text-on-surface">Peak: 48K msgs/hr</span>
          </div>
        </div>

        {/* Card 2: Top Targeted Vector */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <span className="font-label-md text-outline uppercase font-semibold text-xs">Top Targeted Vector</span>
              <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
            </div>
            <div className="text-headline-lg font-bold text-on-surface text-xl">Encrypted Messaging</div>
            <p className="text-body-sm text-outline text-xs mt-1 leading-relaxed">
              68% of high-risk items originate from closed groups before spilling into public timelines.
            </p>
          </div>
          <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex justify-between text-xs text-outline">
            <span>Public Social: 22%</span>
            <span className="font-semibold text-on-surface">Blogs: 10%</span>
          </div>
        </div>

        {/* Card 3: Reviewer Accuracy */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <span className="font-label-md text-outline uppercase font-semibold text-xs">Reviewer Accuracy</span>
              <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
            </div>
            <div className="text-headline-lg font-bold text-on-surface text-xl">99.1% Precision</div>
            <p className="text-body-sm text-outline text-xs mt-1 leading-relaxed">
              Consensus verification rating across Tamil Nadu regional fact-checking consortium nodes.
            </p>
          </div>
          <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex justify-between text-xs text-outline">
            <span>False Positive Rate: 0.4%</span>
            <span className="font-semibold text-emerald-600">Status: Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
