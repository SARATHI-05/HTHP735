import React, { useState, useEffect } from 'react';
import { fetchOverview } from '../services/api';
import DistrictMisinfoMap from './DistrictMisinfoMap';
import DistrictMiniLocator from './DistrictMiniLocator';

export default function TriageDashboard({ onSelectClaim, onNavigateToQueue, onNavigateToLab, isReachHidden = false }) {
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('24H');
  const [highlightedDistrictId, setHighlightedDistrictId] = useState('chennai');

  useEffect(() => {
    async function load() {
      const res = await fetchOverview();
      setData(res);
    }
    load();
  }, []);

  const tickerText = data?.ticker?.[0]?.text || "Fake voice note circulating regarding water reservoir contamination. / குடிநீர் தேக்கம் குறித்த போலி ஆடியோ செய்தி.";
  const tickerDistrict = data?.ticker?.[0]?.district || "CHENNAI";

  const keySurveillanceDistricts = [
    {
      id: "chennai",
      name: "Chennai",
      status: "Critical Alert",
      badgeClass: "bg-red-50 text-error border-error/20",
      volume: "22 signals",
      riskScore: 94.2,
      risk: "94.2%",
      isRed: true,
      claimId: "#TN-8821",
      vector: "WhatsApp Audio",
    },
    {
      id: "madurai",
      name: "Madurai",
      status: "Critical Alert",
      badgeClass: "bg-red-50 text-error border-error/20",
      volume: "14 signals",
      riskScore: 88.5,
      risk: "88.5%",
      isRed: true,
      claimId: "#TN-7734",
      vector: "Manipulated Video",
    },
    {
      id: "coimbatore",
      name: "Coimbatore",
      status: "High Alert",
      badgeClass: "bg-red-50 text-error border-error/20",
      volume: "12 signals",
      riskScore: 85.0,
      risk: "85.0%",
      isRed: true,
      claimId: "CLM-5017",
      vector: "Agri Loan Waiver",
    },
    {
      id: "salem",
      name: "Salem",
      status: "Elevated Risk",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      volume: "8 signals",
      riskScore: 68.4,
      risk: "68.4%",
      isRed: false,
      claimId: "#TN-5421",
      vector: "Ration Shop Rumors",
    },
  ];

  return (
    <div className="flex flex-col w-full gap-space-xl">
      {/* Top Banner / Breaking Claims Ticker */}
      <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-md flex items-center gap-space-md shadow-xs overflow-hidden relative">
        <div className="flex items-center gap-space-xs bg-red-50 text-error font-label-md px-space-md py-space-xs rounded-lg shrink-0 border border-error/20">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          <span className="font-bold text-xs uppercase tracking-wider">BREAKING VIRAL ALERT</span>
        </div>
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="whitespace-nowrap flex gap-space-xl animate-marquee text-on-surface font-body-md text-sm">
            <span className="flex items-center gap-space-sm">
              <strong className="text-error font-label-md font-bold">[{tickerDistrict}]</strong>
              <span>{tickerText}</span>
            </span>
            <span className="text-outline-variant select-none">•</span>
            <span className="flex items-center gap-space-sm">
              <strong className="text-error font-label-md font-bold">[MADURAI]</strong>
              <span>Doctored political rally video manipulating biometric subsidy verification rules. / மதுரை ரேஷன் கடை போலி செய்தி.</span>
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Metric 1: Total Flagged */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-outline uppercase text-[11px] font-semibold tracking-wider">
              Total Flagged Today
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">flag</span>
          </div>
          <div className="my-space-md">
            <div className="text-headline-xl text-on-surface font-bold text-3xl">48</div>
            <div className="text-body-sm text-outline flex items-center gap-space-xs mt-1 text-xs">
              <span className="material-symbols-outlined text-[14px] text-on-surface">trending_up</span>
              <span>+12% from previous 24h</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
            <div className="bg-primary h-full" style={{ width: '80%' }}></div>
          </div>
        </div>

        {/* Metric 2: Capacity / Processed */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-outline uppercase text-[11px] font-semibold tracking-wider">
              Capacity / Processed
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
          </div>
          <div className="my-space-md">
            <div className="text-headline-xl text-on-surface font-bold text-3xl">
              14<span className="text-outline text-headline-lg font-normal text-2xl">/20</span>
            </div>
            <div className="text-body-sm text-outline flex items-center gap-space-xs mt-1 text-xs">
              <span>6 slots available in queue</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
            <div className="bg-primary h-full" style={{ width: '70%' }}></div>
          </div>
        </div>

        {/* Metric 3: High-Risk Critical Alerts */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-outline uppercase text-[11px] font-semibold tracking-wider">
              High-Risk Critical Alerts
            </span>
            <span className="material-symbols-outlined text-error text-[20px]">error</span>
          </div>
          <div className="my-space-md">
            <div className="text-headline-xl text-error font-bold text-3xl">5</div>
            <div className="text-body-sm text-error flex items-center gap-space-xs mt-1 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
              <span>Immediate containment required</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
            <div className="bg-error h-full" style={{ width: '95%' }}></div>
          </div>
        </div>

        {/* Metric 4: Average Triage Time */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-outline uppercase text-[11px] font-semibold tracking-wider">
              Average Triage Time
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">timer</span>
          </div>
          <div className="my-space-md">
            <div className="text-headline-xl text-on-surface font-bold text-3xl">
              3.4<span className="text-outline text-headline-lg font-normal text-2xl">m</span>
            </div>
            <div className="text-body-sm text-outline flex items-center gap-space-xs mt-1 text-xs">
              <span className="material-symbols-outlined text-[14px]">trending_down</span>
              <span>-0.8m faster than weekly avg</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
            <div className="bg-secondary h-full" style={{ width: '45%' }}></div>
          </div>
        </div>
      </div>

      {/* Interactive Tamil Nadu District Misinformation Surveillance Map */}
      <div id="district-surveillance-map" className="w-full">
        <DistrictMisinfoMap
          onSelectClaim={onSelectClaim}
          onNavigateToQueue={onNavigateToQueue}
          onNavigateToLab={onNavigateToLab}
          isReachHidden={isReachHidden}
          highlightedDistrictId={highlightedDistrictId}
        />
      </div>

      {/* Key Hotspot District Radar Cards & Threat Vector Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        {/* Key Hotspot District Radar Cards (2 cols) */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center mb-space-md">
            <div>
              <h2 className="text-headline-md text-on-surface font-bold text-lg flex items-center gap-2">
                <span>Key Surveillance Hotspots</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                  TOP 4 CLUSTERS
                </span>
              </h2>
              <p className="text-body-sm text-outline text-xs">
                Select any district radar card to focus the live state map & view active incident dossiers
              </p>
            </div>
            <div className="flex gap-space-xs bg-surface-container-low p-1 rounded-lg border border-outline-variant/20">
              <button
                onClick={() => setTimeRange('24H')}
                className={`px-space-sm py-0.5 rounded text-xs font-semibold ${timeRange === '24H' ? 'bg-surface-container-high text-on-surface shadow-xs' : 'text-outline hover:text-on-surface'}`}
              >
                24H
              </button>
              <button
                onClick={() => setTimeRange('7D')}
                className={`px-space-sm py-0.5 rounded text-xs font-semibold ${timeRange === '7D' ? 'bg-surface-container-high text-on-surface shadow-xs' : 'text-outline hover:text-on-surface'}`}
              >
                7D
              </button>
            </div>
          </div>

          {/* 4 Interactive District Radar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space-md my-space-sm">
            {keySurveillanceDistricts.map((dist) => {
              const isSelected = highlightedDistrictId === dist.id;
              return (
                <div
                  key={dist.id}
                  onClick={() => {
                    setHighlightedDistrictId(dist.id);
                    const el = document.getElementById('district-surveillance-map');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`bg-surface-container-low border p-space-md rounded-xl flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container-high transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                      : 'border-outline-variant/30'
                  }`}
                >
                  <div className="flex justify-between items-center mb-space-xs">
                    <span className="font-headline-sm text-on-surface font-semibold text-sm">
                      {dist.name}
                    </span>
                    <span className={`font-label-sm px-2 py-0.5 rounded-full text-[10px] font-bold border ${dist.badgeClass}`}>
                      {dist.status}
                    </span>
                  </div>

                  {/* Real District Radar Mini-Map */}
                  <div className="my-1">
                    <DistrictMiniLocator
                      districtName={dist.name}
                      riskScore={dist.riskScore}
                      height={90}
                      showLabel={false}
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 truncate mb-1">
                    ⚡ {dist.vector}
                  </div>

                  <div className="flex justify-between text-body-sm text-xs pt-1 border-t border-slate-100">
                    <span className="text-outline">
                      Signals: <strong className="text-on-surface">{dist.volume}</strong>
                    </span>
                    <span className={`font-bold ${dist.isRed ? 'text-error' : 'text-secondary'}`}>
                      {dist.risk}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vector Composition (1 col) */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <h2 className="text-headline-md text-on-surface font-bold text-lg mb-space-xs">Vector Composition</h2>
            <p className="text-body-sm text-outline text-xs mb-space-md">Primary mediums utilized in flagged items</p>
          </div>
          <div className="flex flex-col gap-space-md">
            <div>
              <div className="flex justify-between text-body-sm text-xs mb-1">
                <span className="text-on-surface flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">mic</span> Deepfake Audio / Voice Notes
                </span>
                <span className="font-bold text-primary">42%</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: '42%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-body-sm text-xs mb-1">
                <span className="text-on-surface flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-outline">image</span> Doctored Imagery & Memes
                </span>
                <span className="font-bold text-outline">31%</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div className="bg-outline h-full" style={{ width: '31%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-body-sm text-xs mb-1">
                <span className="text-on-surface flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-error">description</span> Fabricated News Articles
                </span>
                <span className="font-bold text-error">19%</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div className="bg-error h-full" style={{ width: '19%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-body-sm text-xs mb-1">
                <span className="text-on-surface flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary">share</span> Bot-driven Chain Messages
                </span>
                <span className="font-bold text-secondary">8%</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full" style={{ width: '8%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex justify-between items-center text-body-sm text-outline text-xs">
            <span>Analysis engine active</span>
            <span className="text-on-surface-variant font-medium flex items-center gap-space-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span> Real-time sync
            </span>
          </div>
        </div>
      </div>

      {/* Automated Triage Activity & Prioritization */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-space-lg">
          <div>
            <h2 className="text-headline-md text-on-surface font-bold text-lg">Automated Triage Activity & Prioritization</h2>
            <p className="text-body-sm text-outline text-xs">Real-time log of ingested claims scored by reach vs. risk coefficient</p>
          </div>
          <div className="flex gap-space-sm">
            <button
              onClick={onNavigateToQueue}
              className="bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container-high text-on-surface text-body-sm px-space-md py-space-xs rounded-xl flex items-center gap-space-xs transition-colors shadow-xs text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
            </button>
            <button
              onClick={onNavigateToQueue}
              className="bg-primary text-on-primary text-body-sm px-space-md py-space-xs rounded-xl flex items-center gap-space-xs font-headline-sm transition-colors shadow-xs text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">download</span> Export Log
            </button>
          </div>
        </div>

        {/* 3 Activity Rows */}
        <div className="flex flex-col gap-space-sm">
          {/* Row 1 */}
          <div className="bg-surface-container-low border border-outline-variant/30 p-space-md rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-high transition-all shadow-xs">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-error flex items-center justify-center shrink-0 border border-error/20">
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </div>
              <div>
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-sm text-on-surface font-semibold text-sm">
                    Audio Deepfake Warning: Reservoir Contamination
                  </span>
                  <span className="font-label-sm bg-red-50 text-error px-2 py-0.5 rounded-full text-[10px] font-bold border border-error/20">
                    CRITICAL
                  </span>
                </div>
                <div className="text-body-sm text-outline text-xs mt-0.5">
                  Source: WhatsApp Forward Chain • Region: Chennai North • 12 mins ago
                </div>
              </div>
            </div>
            <div className="flex items-center gap-space-xl w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <div className="text-body-sm text-on-surface font-semibold text-xs">Reach: 45.2K</div>
                <div className="text-label-sm text-error font-bold text-xs">Risk Score: 98/100</div>
              </div>
              <button
                onClick={() => onSelectClaim('#TN-8821')}
                className="bg-primary text-on-primary px-space-md py-space-xs rounded-lg text-body-sm font-semibold hover:opacity-90 transition-opacity shadow-xs text-xs"
              >
                Review
              </button>
            </div>
          </div>

          {/* Row 2 */}
          <div className="bg-surface-container-low border border-outline-variant/30 p-space-md rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-high transition-all shadow-xs">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-error flex items-center justify-center shrink-0 border border-error/20">
                <span className="material-symbols-outlined text-[20px]">image</span>
              </div>
              <div>
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-sm text-on-surface font-semibold text-sm">
                    Manipulated Rally Footage: Assembly Disturbance
                  </span>
                  <span className="font-label-sm bg-red-50 text-error px-2 py-0.5 rounded-full text-[10px] font-bold border border-error/20">
                    MODERATE
                  </span>
                </div>
                <div className="text-body-sm text-outline text-xs mt-0.5">
                  Source: X (Twitter) Viral Thread • Region: Madurai • 34 mins ago
                </div>
              </div>
            </div>
            <div className="flex items-center gap-space-xl w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <div className="text-body-sm text-on-surface font-semibold text-xs">Reach: 18.5K</div>
                <div className="text-label-sm text-error font-bold text-xs">Risk Score: 76/100</div>
              </div>
              <button
                onClick={() => onSelectClaim('#TN-7734')}
                className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface px-space-md py-space-xs rounded-lg text-body-sm font-semibold hover:bg-surface-container-high transition-colors shadow-xs text-xs"
              >
                Review
              </button>
            </div>
          </div>

          {/* Row 3 */}
          <div className="bg-surface-container-low border border-outline-variant/30 p-space-md rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-high transition-all shadow-xs">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-secondary flex items-center justify-center shrink-0 border border-secondary/20">
                <span className="material-symbols-outlined text-[20px]">article</span>
              </div>
              <div>
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-sm text-on-surface font-semibold text-sm">
                    False Subsidy Scam Notice Targeting Farmers
                  </span>
                  <span className="font-label-sm bg-blue-50 text-secondary px-2 py-0.5 rounded-full text-[10px] font-bold border border-secondary/20">
                    ELEVATED
                  </span>
                </div>
                <div className="text-body-sm text-outline text-xs mt-0.5">
                  Source: Telegram Broadcast • Region: Coimbatore • 1 hour ago
                </div>
              </div>
            </div>
            <div className="flex items-center gap-space-xl w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <div className="text-body-sm text-on-surface font-semibold text-xs">Reach: 8.1K</div>
                <div className="text-label-sm text-secondary font-bold text-xs">Risk Score: 64/100</div>
              </div>
              <button
                onClick={() => onSelectClaim('#TN-6590')}
                className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface px-space-md py-space-xs rounded-lg text-body-sm font-semibold hover:bg-surface-container-high transition-colors shadow-xs text-xs"
              >
                Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
