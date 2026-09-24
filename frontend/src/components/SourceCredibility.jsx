import React, { useState, useEffect } from 'react';
import { fetchSourceTrends } from '../services/api';

export default function SourceCredibility() {
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('90');
  const [filterQuery, setFilterQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetchSourceTrends();
      setData(res);
    }
    load();
  }, []);

  const publishers = [
    {
      initials: 'DT',
      name: 'Dinamani Express',
      domain: 'dinamaniexpress.in',
      region: 'Chennai / Statewide',
      trustScore: '94.2%',
      scoreVal: 94.2,
      trend: '+1.4%',
      trendStyle: 'text-primary',
      status: 'Whitelisted',
      statusStyle: 'whitelisted',
      actionIcon: 'visibility',
      actionStyle: 'text-outline',
    },
    {
      initials: 'KN',
      name: 'Kovai News Network',
      domain: 'kovainews24.net',
      region: 'Coimbatore',
      trustScore: '82.5%',
      scoreVal: 82.5,
      trend: 'Stable',
      trendStyle: 'text-secondary font-semibold',
      status: 'Verified',
      statusStyle: 'verified',
      actionIcon: 'visibility',
      actionStyle: 'text-outline',
    },
    {
      initials: 'MT',
      name: 'Madurai Truth Live',
      domain: 'maduraitruth.live',
      region: 'Madurai',
      trustScore: '31.0%',
      scoreVal: 31.0,
      trend: '-14.2%',
      trendStyle: 'text-error font-bold',
      status: 'Flagged Syndicate',
      statusStyle: 'flagged',
      actionIcon: 'block',
      actionStyle: 'text-error',
    },
    {
      initials: 'TN',
      name: 'Tamil Nadu Chronicle',
      domain: 'tnchronicle.org',
      region: 'Trichy / Statewide',
      trustScore: '89.7%',
      scoreVal: 89.7,
      trend: '+0.8%',
      trendStyle: 'text-primary',
      status: 'Whitelisted',
      statusStyle: 'whitelisted',
      actionIcon: 'visibility',
      actionStyle: 'text-outline',
    },
  ];

  const filteredPublishers = publishers.filter((p) => {
    if (!filterQuery) return true;
    return p.name.toLowerCase().includes(filterQuery.toLowerCase()) || p.domain.toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-primary text-on-primary p-space-md rounded-xl flex items-center justify-between shadow-xl border border-secondary animate-fadeIn text-xs">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-outline-variant hover:text-white">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Top Metrics Bar: High-contrast data density */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
        {/* Card 1: Monitored Domains */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-md rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-outline uppercase tracking-wider font-semibold text-[11px]">
              Monitored Domains
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
          </div>
          <div className="my-space-sm">
            <div className="text-headline-lg font-bold text-on-surface text-2xl">342</div>
            <div className="text-body-sm text-outline flex items-center gap-space-xs text-xs mt-0.5">
              <span><strong>+12</strong> this week across Tamilnadu</span>
            </div>
          </div>
        </div>

        {/* Card 2: Avg Regional Trust Index */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-md rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-outline uppercase tracking-wider font-semibold text-[11px]">
              Avg Regional Trust Index
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
          </div>
          <div className="my-space-sm">
            <div className="text-headline-lg font-bold text-on-surface text-2xl">68.4%</div>
            <div className="text-body-sm text-error flex items-center gap-space-xs text-xs mt-0.5">
              <span><strong>-2.1%</strong> due to election rumors</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Virality Spikes */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-md rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-outline uppercase tracking-wider font-semibold text-[11px]">
              Active Virality Spikes
            </span>
            <span className="material-symbols-outlined text-error text-[20px]">trending_up</span>
          </div>
          <div className="my-space-sm">
            <div className="text-headline-lg font-bold text-on-surface text-2xl">7 Nodes</div>
            <div className="text-body-sm text-error font-medium text-xs mt-0.5">
              <span>High velocity warning</span>
            </div>
          </div>
        </div>

        {/* Card 4: Flagged Inauthentic Networks */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-md rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-outline uppercase tracking-wider font-semibold text-[11px]">
              Flagged Inauthentic Networks
            </span>
            <span className="material-symbols-outlined text-error text-[20px]">shield</span>
          </div>
          <div className="my-space-sm">
            <div className="text-headline-lg font-bold text-on-surface text-2xl">3 Syndicates</div>
            <div className="text-body-sm text-outline text-xs mt-0.5">
              <span>Contained &amp; tracing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Virality Spikes & Automated Velocity Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        {/* Left Section (2 cols) */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-space-md">
            <div>
              <h2 className="text-headline-md font-bold text-on-surface text-base">
                Ecosystem Virality &amp; Propagation Velocity
              </h2>
              <p className="text-body-sm text-outline text-xs">
                Real-time propagation tracking across regional messaging apps and news syndicates.
              </p>
            </div>
            <div className="flex gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/20">
              <button
                onClick={() => setTimeRange('30')}
                className={`px-space-md py-0.5 rounded text-xs font-semibold ${timeRange === '30' ? 'bg-primary text-white shadow-xs' : 'text-outline hover:text-on-surface'}`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange('90')}
                className={`px-space-md py-0.5 rounded text-xs font-semibold ${timeRange === '90' ? 'bg-primary text-white shadow-xs' : 'text-outline hover:text-on-surface'}`}
              >
                90 Days
              </button>
            </div>
          </div>

          {/* Custom SVG Velocity Graph (Matching Screenshot 2 Exactly) */}
          <div className="w-full h-56 relative flex items-end my-space-xs">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 200">
              <defs>
                <linearGradient id="grad-wave" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" stopOpacity="0.12"></stop>
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0"></stop>
                </linearGradient>
              </defs>
              {/* Solid Black Wave Curve */}
              <path d="M0,150 Q100,120 200,90 T400,40 T600,110 T800,20 L800,200 L0,200 Z" fill="url(#grad-wave)"></path>
              <path d="M0,150 Q100,120 200,90 T400,40 T600,110 T800,20" fill="none" stroke="#0f172a" strokeWidth="3"></path>
              {/* Dotted Blue Wave Curve */}
              <path d="M0,180 Q150,140 300,160 T500,90 T800,130" fill="none" opacity="0.7" stroke="#2563eb" strokeDasharray="4 4" strokeWidth="2"></path>
            </svg>
          </div>

          {/* Bottom Graph Legend */}
          <div className="flex justify-between items-center mt-space-md pt-space-md border-t border-outline-variant/30 text-body-sm text-outline text-xs">
            <div className="flex items-center gap-space-md">
              <span className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span>Polling Rumors</span>
              </span>
              <span className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <span>Civic Disinformation</span>
              </span>
            </div>
            <span className="font-semibold text-on-surface">PEAK SPIKE: 14:32 IST (Madurai Node)</span>
          </div>
        </div>

        {/* Right Column: Recurring Misinformation Domain Tags & Syndicate Alerts */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-space-md">
              <h2 className="text-headline-md font-bold text-on-surface text-base">Domain &amp; Narrative Tags</h2>
              <span className="material-symbols-outlined text-outline text-[20px]">local_offer</span>
            </div>
            <p className="text-body-sm text-outline text-xs mb-space-md">
              Top recurring disinformation vectors identified across Tamilnadu portals this week.
            </p>

            <div className="flex flex-wrap gap-space-xs">
              <span className="bg-red-50 text-error px-space-md py-1 rounded-full font-label-md text-xs font-semibold border border-error/20 flex items-center gap-space-xs">
                #ElectionAadhaarRumors <span className="text-outline text-[10px]">(1.4k)</span>
              </span>
              <span className="bg-surface-container-high text-on-surface px-space-md py-1 rounded-full font-label-md text-xs font-semibold border border-outline-variant/60 flex items-center gap-space-xs">
                #FakeSchemeAlert <span className="text-outline text-[10px]">(980)</span>
              </span>
              <span className="bg-red-50 text-error px-space-md py-1 rounded-full font-label-md text-xs font-semibold border border-error/20 flex items-center gap-space-xs">
                #WaterSharingDeepfake <span className="text-outline text-[10px]">(750)</span>
              </span>
              <span className="bg-surface-container-high text-on-surface px-space-md py-1 rounded-full font-label-md text-xs font-semibold border border-outline-variant/60 flex items-center gap-space-xs">
                #CineRumorMill <span className="text-outline text-[10px]">(620)</span>
              </span>
              <span className="bg-surface-container-high text-on-surface px-space-md py-1 rounded-full font-label-md text-xs font-semibold border border-outline-variant/60 flex items-center gap-space-xs">
                #BailoutHoax <span className="text-outline text-[10px]">(410)</span>
              </span>
            </div>
          </div>

          {/* Coordinated Network Flag Warning Box */}
          <div className="mt-space-md p-space-md bg-red-50 border border-error/20 rounded-xl flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs text-error font-bold text-xs">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>Coordinated Network Flag</span>
            </div>
            <p className="text-body-sm text-on-surface text-[11px] leading-relaxed">
              Syndicate <strong>#Net-Alpha-Madurai</strong> is pushing synchronized deepfakes across 14 newly registered domains.
            </p>
          </div>
        </div>
      </div>

      {/* Publisher Directory & Reputation Leaderboard */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-space-lg">
          <div>
            <h2 className="text-headline-lg font-bold text-on-surface text-base">
              Publisher Directory &amp; Reputation Leaderboard
            </h2>
            <p className="text-body-sm text-outline text-xs">
              Historical credibility scores, bias indicators, and verification status for regional news outlets.
            </p>
          </div>

          <div className="flex items-center gap-space-sm w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                search
              </span>
              <input
                type="text"
                placeholder="Filter publishers..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none border border-outline-variant/30 placeholder:text-outline"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-space-md py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Add Portal
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-outline font-label-md uppercase tracking-wider text-[11px]">
                <th className="py-space-sm px-space-md">PUBLISHER / DOMAIN</th>
                <th className="py-space-sm px-space-md">REGION</th>
                <th className="py-space-sm px-space-md">TRUST SCORE</th>
                <th className="py-space-sm px-space-md">30-DAY TREND</th>
                <th className="py-space-sm px-space-md">STATUS</th>
                <th className="py-space-sm px-space-md text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs">
              {filteredPublishers.map((pub) => (
                <tr key={pub.name} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-space-md px-space-md flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-primary text-xs font-mono">
                      {pub.initials}
                    </div>
                    <div>
                      <div className="font-headline-sm font-semibold text-on-surface text-sm">{pub.name}</div>
                      <div className="text-body-sm text-outline text-[11px] font-mono">{pub.domain}</div>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md text-on-surface-variant text-xs">
                    {pub.region}
                  </td>
                  <td className="py-space-md px-space-md whitespace-nowrap">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-md text-on-surface font-semibold text-xs">{pub.trustScore}</span>
                      <div className="w-24 bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pub.scoreVal > 90 ? 'bg-primary' : pub.scoreVal > 60 ? 'bg-secondary' : 'bg-error'}`}
                          style={{ width: `${pub.scoreVal}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className={`py-space-md px-space-md font-medium text-xs ${pub.trendStyle}`}>
                    {pub.trend}
                  </td>
                  <td className="py-space-md px-space-md whitespace-nowrap">
                    {pub.statusStyle === 'whitelisted' ? (
                      <span className="bg-surface-container-low text-on-surface font-label-sm px-space-sm py-0.5 rounded-full border border-outline-variant/60 shadow-xs text-[11px]">
                        Whitelisted
                      </span>
                    ) : pub.statusStyle === 'verified' ? (
                      <span className="bg-blue-50 text-secondary font-label-sm px-space-sm py-0.5 rounded-full border border-secondary/30 shadow-xs text-[11px] font-semibold">
                        Verified
                      </span>
                    ) : (
                      <span className="bg-red-50 text-error font-label-sm px-space-sm py-0.5 rounded-full border border-error/30 shadow-xs text-[11px] font-bold">
                        Flagged Syndicate
                      </span>
                    )}
                  </td>
                  <td className="py-space-md px-space-md text-right">
                    <button
                      onClick={() => {
                        setToastMsg(`Inspecting audit records for ${pub.name}`);
                      }}
                      className={`${pub.actionStyle} hover:text-on-surface`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{pub.actionIcon}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Portal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest p-space-xl rounded-2xl max-w-lg w-full border border-outline-variant/30 shadow-2xl">
            <div className="flex justify-between items-center mb-space-lg">
              <h3 className="text-headline-lg font-bold text-on-surface text-base">
                Whitelist or Add Regional Portal
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowAddModal(false);
                setToastMsg('Portal added and enqueued for 7-day EWMA verification.');
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-semibold text-outline block mb-1">Publisher or Outlet Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coimbatore Daily Herald"
                  className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-xl text-xs outline-none border border-outline-variant/30"
                />
              </div>

              <div>
                <label className="font-semibold text-outline block mb-1">Domain URL or Telegram Handle</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://coimbatoreherald.in"
                  className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-xl text-xs outline-none border border-outline-variant/30"
                />
              </div>

              <div className="pt-2 flex justify-end gap-space-sm">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-space-md py-space-xs text-xs text-outline hover:text-on-surface"
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
