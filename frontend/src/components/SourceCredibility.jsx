import React, { useState, useEffect } from 'react';
import { fetchSourceTrends } from '../services/api';

export default function SourceCredibility() {
  const [trendsData, setTrendsData] = useState(null);
  const [timeRange, setTimeRange] = useState('7D');
  const [searchPublisher, setSearchPublisher] = useState('');
  const [showWhitelistModal, setShowWhitelistModal] = useState(false);
  const [newPortalName, setNewPortalName] = useState('');
  const [newPortalUrl, setNewPortalUrl] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await fetchSourceTrends();
      setTrendsData(data);
    }
    load();
  }, []);

  const metrics = trendsData?.metrics || {
    monitored_domains: 142,
    credibility_index: '71.4',
    active_clusters: 18,
    high_risk_outlets: 9,
  };

  const narrativeTags = trendsData?.domain_narrative_tags || [
    { tag: '#RedHillsContamination', count: '14.2K', risk: 'Critical', color: 'bg-error-container text-error' },
    { tag: '#RationShopPanic', count: '9.8K', risk: 'High', color: 'bg-error-container text-error' },
    { tag: '#FarmerSubsidyRumor', count: '6.4K', risk: 'Moderate', color: 'bg-tertiary-container text-tertiary' },
    { tag: '#TNPowerGridGlitch', count: '3.1K', risk: 'Elevated', color: 'bg-secondary-fixed text-secondary' },
  ];

  const publishers = trendsData?.publisher_directory || [
    {
      name: 'The Hindu (Tamil)',
      domain: 'hindutamil.in',
      type: 'Regional Daily',
      score: 96.4,
      bias: 'Neutral / Fact-Based',
      violations: 0,
      status: 'Verified Authentic',
      statusClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      name: 'Dinamalar Online',
      domain: 'dinamalar.com',
      type: 'Digital Portal',
      score: 84.1,
      bias: 'Center-Right',
      violations: 1,
      status: 'Verified Authentic',
      statusClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      name: 'Kovai News Express',
      domain: 'kovainews-express.in',
      type: 'Digital Portal',
      score: 41.2,
      bias: 'Sensationalist',
      violations: 6,
      status: 'Under Surveillance',
      statusClass: 'bg-tertiary-container text-tertiary',
    },
    {
      name: 'TN Voice Wire (WhatsApp/TG)',
      domain: 't.me/tnvoicewire',
      type: 'Messaging Syndicate',
      score: 18.5,
      bias: 'Hyper-Partisan Deceptive',
      violations: 14,
      status: 'Blacklisted Syndicate',
      statusClass: 'bg-error-container text-error',
    },
    {
      name: 'Madurai Bulletin Today',
      domain: 'maduraibulletin.co',
      type: 'Unregistered Blog',
      score: 34.8,
      bias: 'Unverified / Clickbait',
      violations: 5,
      status: 'Under Surveillance',
      statusClass: 'bg-tertiary-container text-tertiary',
    },
  ];

  const filteredPublishers = publishers.filter((p) => {
    if (!searchPublisher) return true;
    return (
      p.name.toLowerCase().includes(searchPublisher.toLowerCase()) ||
      p.domain.toLowerCase().includes(searchPublisher.toLowerCase()) ||
      p.type.toLowerCase().includes(searchPublisher.toLowerCase())
    );
  });

  const handleAddPortal = (e) => {
    e.preventDefault();
    if (!newPortalName) return;
    setAlertSuccess(`Portal "${newPortalName}" submitted for automated 7-day EWMA verification & DNS audit.`);
    setShowWhitelistModal(false);
    setNewPortalName('');
    setNewPortalUrl('');
    setTimeout(() => setAlertSuccess(null), 5000);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Success Notification */}
      {alertSuccess && (
        <div className="bg-primary text-on-primary p-space-md rounded-xl flex items-center justify-between shadow-xl border border-secondary animate-fadeIn">
          <div className="flex items-center gap-space-sm text-xs">
            <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            <span>{alertSuccess}</span>
          </div>
          <button onClick={() => setAlertSuccess(null)} className="text-outline-variant hover:text-white">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Top Context Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-space-md">
        <div>
          <div className="flex items-center gap-space-sm mb-space-xs">
            <span className="font-label-md text-primary font-bold uppercase tracking-wider text-xs">
              Ecosystem Surveillance
            </span>
            <span className="text-outline font-label-md">/</span>
            <span className="font-label-md text-outline font-medium text-xs">Tamil Nadu Publisher Index</span>
          </div>
          <h1 className="text-headline-xl text-on-surface font-bold tracking-tight">
            Source Credibility & Trend Tracking
          </h1>
          <p className="text-body-md text-outline mt-1">
            7-day Exponential Weighted Moving Average (EWMA) tracking publisher reputation decay and coordinated campaigns.
          </p>
        </div>

        <button
          onClick={() => setShowWhitelistModal(true)}
          className="px-space-md py-space-xs bg-primary text-on-primary rounded-xl text-body-sm font-semibold hover:opacity-90 transition-opacity shadow-xs flex items-center gap-1.5 text-xs"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          Whitelist or Add Portal
        </button>
      </div>

      {/* Top Metrics Bar: High-contrast data density */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-md rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-outline uppercase tracking-wider font-semibold text-[10px]">
              Monitored Domains
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
          </div>
          <div className="my-space-sm">
            <div className="text-headline-lg font-bold text-on-surface">{metrics.monitored_domains}</div>
            <div className="text-body-sm text-secondary flex items-center gap-1 text-xs mt-0.5">
              <span>+12 added this week</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-md rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-outline uppercase tracking-wider font-semibold text-[10px]">
              Credibility Index
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">analytics</span>
          </div>
          <div className="my-space-sm">
            <div className="text-headline-lg font-bold text-on-surface">{metrics.credibility_index}<span className="text-outline text-sm font-normal">/100</span></div>
            <div className="text-body-sm text-error flex items-center gap-1 text-xs mt-0.5">
              <span>-2.1% degradation</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-md rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-outline uppercase tracking-wider font-semibold text-[10px]">
              Active Propagation Clusters
            </span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">group_work</span>
          </div>
          <div className="my-space-sm">
            <div className="text-headline-lg font-bold text-tertiary">{metrics.active_clusters}</div>
            <div className="text-body-sm text-outline text-xs mt-0.5">
              <span>4 coordinated syndicates</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-md rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-outline uppercase tracking-wider font-semibold text-[10px]">
              High-Risk Outlets
            </span>
            <span className="material-symbols-outlined text-error text-[20px]">warning</span>
          </div>
          <div className="my-space-sm">
            <div className="text-headline-lg font-bold text-error">{metrics.high_risk_outlets}</div>
            <div className="text-body-sm text-error text-xs mt-0.5">
              <span>Containment action required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Virality Spikes & Automated Velocity Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        {/* SVG Velocity Graph (2 cols) */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-space-md">
            <div>
              <h2 className="text-headline-md font-bold text-on-surface text-base">
                Ecosystem Virality & Propagation Velocity
              </h2>
              <p className="text-body-sm text-outline text-xs">
                Real-time surge detection mapped against 30-day baseline threshold.
              </p>
            </div>
            <div className="flex gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/20">
              {['24H', '7D', '30D'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-space-sm py-0.5 rounded text-xs font-semibold transition-colors ${
                    timeRange === t ? 'bg-surface-container-high text-on-surface shadow-xs' : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Custom SVG Velocity Graph */}
          <div className="w-full h-56 relative flex items-end my-space-sm">
            <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="velocityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ba1a1a" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0051d5" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {/* Horizontal Gridlines */}
              <line x1="0" y1="45" x2="500" y2="45" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="0" y1="135" x2="500" y2="135" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" />

              {/* Area */}
              <path
                d="M 0,160 Q 50,150 100,120 T 200,130 T 300,70 T 400,30 T 500,85 L 500,180 L 0,180 Z"
                fill="url(#velocityGrad)"
              />
              {/* Line */}
              <path
                d="M 0,160 Q 50,150 100,120 T 200,130 T 300,70 T 400,30 T 500,85"
                fill="none"
                stroke="#ba1a1a"
                strokeWidth="2.5"
              />
              {/* Peak Circle */}
              <circle cx="400" cy="30" r="5" fill="#ba1a1a" stroke="#ffffff" strokeWidth="2" />
            </svg>
            <div className="absolute top-2 right-24 bg-error text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Peak: 4.2x Surge (Madurai)
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-outline pt-space-xs border-t border-outline-variant/20">
            <span>Baseline: 420 items/day</span>
            <span className="text-error font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
              Surge detected across 3 rural networks
            </span>
          </div>
        </div>

        {/* Narrative & Domain Tags (1 col) */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-space-md">
              <h2 className="text-headline-md font-bold text-on-surface text-base">Domain & Narrative Tags</h2>
              <span className="material-symbols-outlined text-outline text-[20px]">local_offer</span>
            </div>
            <p className="text-body-sm text-outline text-xs mb-space-md">
              Fastest propagating disinformation hashtags in Tamil Nadu.
            </p>

            <div className="flex flex-col gap-space-sm">
              {narrativeTags.map((tag) => (
                <div
                  key={tag.tag}
                  className="bg-surface-container-low p-space-sm px-space-md rounded-xl border border-outline-variant/20 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-on-surface">{tag.tag}</div>
                    <div className="text-[10px] text-outline font-mono">{tag.count} broadcasts</div>
                  </div>
                  <span className={`font-label-sm font-bold text-[10px] px-2 py-0.5 rounded-full ${tag.color}`}>
                    {tag.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-space-md pt-space-md border-t border-outline-variant/20 text-xs text-outline flex justify-between">
            <span>Automated clustering:</span>
            <span className="font-semibold text-secondary">Active</span>
          </div>
        </div>
      </div>

      {/* Publisher Directory & Leaderboard */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-space-lg">
          <div>
            <h2 className="text-headline-lg font-bold text-on-surface text-lg">
              Publisher Directory & Reputation Leaderboard
            </h2>
            <p className="text-body-sm text-outline text-xs">
              Historical credibility scores, bias indicators, and verification status for regional news outlets.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search publisher or domain..."
              value={searchPublisher}
              onChange={(e) => setSearchPublisher(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface px-3 py-1.5 rounded-lg text-xs outline-none border border-outline-variant/30 placeholder:text-outline"
            />
          </div>
        </div>

        {/* Directory Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-outline font-label-md uppercase tracking-wider text-[11px]">
                <th className="py-space-sm px-space-md">Publisher / Domain</th>
                <th className="py-space-sm px-space-md">Network Type</th>
                <th className="py-space-sm px-space-md">Credibility Score</th>
                <th className="py-space-sm px-space-md">Bias Rating</th>
                <th className="py-space-sm px-space-md">Violations</th>
                <th className="py-space-sm px-space-md">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs">
              {filteredPublishers.map((pub) => (
                <tr key={pub.name} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-space-md px-space-md">
                    <div className="font-semibold text-on-surface text-sm">{pub.name}</div>
                    <div className="text-outline text-[11px] font-mono">{pub.domain}</div>
                  </td>
                  <td className="py-space-md px-space-md text-on-surface-variant font-medium">
                    {pub.type}
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs">{pub.score.toFixed(1)}</span>
                      <div className="w-20 bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pub.score > 80 ? 'bg-emerald-600' : pub.score > 50 ? 'bg-secondary' : 'bg-error'}`}
                          style={{ width: `${pub.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md text-on-surface-variant">
                    {pub.bias}
                  </td>
                  <td className="py-space-md px-space-md">
                    <span className={`font-mono font-bold ${pub.violations > 0 ? 'text-error' : 'text-outline'}`}>
                      {pub.violations}
                    </span>
                  </td>
                  <td className="py-space-md px-space-md">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${pub.statusClass}`}>
                      {pub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Whitelist / Add Portal Modal */}
      {showWhitelistModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest p-space-xl rounded-2xl max-w-lg w-full border border-outline-variant/30 shadow-2xl">
            <div className="flex justify-between items-center mb-space-lg">
              <h3 className="text-headline-lg font-bold text-on-surface text-base">
                Whitelist or Add Regional Portal
              </h3>
              <button onClick={() => setShowWhitelistModal(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddPortal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-outline block mb-1">Publisher or Outlet Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coimbatore Daily Herald"
                  value={newPortalName}
                  onChange={(e) => setNewPortalName(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-xl text-xs outline-none border border-outline-variant/30 focus:border-outline"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-outline block mb-1">Domain URL or Telegram Handle</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://coimbatoreherald.in"
                  value={newPortalUrl}
                  onChange={(e) => setNewPortalUrl(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-xl text-xs outline-none border border-outline-variant/30 focus:border-outline"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-outline block mb-1">Primary Medium</label>
                <select className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-xl text-xs outline-none border border-outline-variant/30">
                  <option>Digital News Portal</option>
                  <option>Regional Print Syndicate</option>
                  <option>Telegram Channel</option>
                  <option>WhatsApp Community Lead</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-space-sm">
                <button
                  type="button"
                  onClick={() => setShowWhitelistModal(false)}
                  className="px-space-md py-space-xs rounded-xl text-xs text-outline hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-space-lg py-space-xs rounded-xl bg-primary text-on-primary font-semibold text-xs hover:opacity-90 shadow-xs"
                >
                  Submit for Ingestion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
