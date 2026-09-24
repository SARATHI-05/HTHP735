import React, { useState, useEffect } from 'react';
import { fetchOverview } from '../services/api';

export default function TriageDashboard({ onSelectClaim, onNavigateToQueue }) {
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('24H');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchOverview();
      setData(res);
      setLoading(false);
    }
    load();
  }, []);

  const ticker = data?.ticker || [
    { district: "CHENNAI", text: "Fake voice note circulating regarding water reservoir contamination. / குடிநீர் தேக்கங்களில் விஷம் கலந்ததாக பரவும் ஆடியோ செய்தி.", risk: "98/100" },
    { district: "MADURAI", text: "Doctored political rally video manipulating audio tracks. / அரசியல் கூட்டத்தில் கலவரம் மூண்டதாக மாற்றப்பட்ட வீடியோ.", risk: "91/100" },
    { district: "COIMBATORE", text: "False agricultural subsidy scam broadcast on messaging apps. / விவசாய மானியம் குறித்த போலி செய்தி வாட்ஸ்அப்பில் உலா.", risk: "88/100" },
  ];

  const kpis = data?.kpis || {
    flagged_today: 48,
    flagged_delta_pct: 12.0,
    capacity_processed: 14,
    capacity_limit: 20,
    slots_available: 6,
    critical_alerts_count: 5,
    avg_triage_time_min: 3.4,
    triage_time_delta_min: -0.8,
  };

  const districts = data?.districts || [
    { name: "Chennai", volume: "22 signals", risk: "94%", status: "Critical", isCritical: true, img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80" },
    { name: "Madurai", volume: "18 signals", risk: "89%", status: "Critical", isCritical: true, img: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=400&q=80" },
    { name: "Coimbatore", volume: "12 signals", risk: "76%", status: "Elevated", isCritical: false, img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=400&q=80" },
    { name: "Tiruchirappalli", volume: "6 signals", risk: "48%", status: "Monitoring", isCritical: false, img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80" },
  ];

  const vectors = data?.vectors || [
    { name: "Deepfake Audio / Voice Notes", icon: "mic", pct: 42, colorClass: "bg-tertiary", textClass: "text-tertiary" },
    { name: "Doctored Imagery & Memes", icon: "image", pct: 31, colorClass: "bg-primary", textClass: "text-primary" },
    { name: "Fabricated News Articles", icon: "description", pct: 19, colorClass: "bg-error", textClass: "text-error" },
    { name: "Bot-driven Chain Messages", icon: "share", pct: 8, colorClass: "bg-secondary", textClass: "text-secondary" },
  ];

  const recentClaims = data?.recent_activity?.length > 0 ? data.recent_activity : [
    {
      claim_id: "CLM-8821",
      icon: "mic",
      iconBg: "bg-error-container text-error",
      title: "Audio Deepfake Warning: Reservoir Contamination",
      badge: "CRITICAL",
      badgeClass: "bg-error-container text-error",
      meta: "Source: WhatsApp Forward Chain • Region: Chennai North • 12 mins ago",
      reach: "45.2K",
      riskScore: "98/100",
      riskClass: "text-error",
    },
    {
      claim_id: "CLM-8819",
      icon: "image",
      iconBg: "bg-tertiary-container text-tertiary",
      title: "Manipulated Rally Footage: Assembly Disturbance",
      badge: "MODERATE",
      badgeClass: "bg-tertiary-container text-tertiary",
      meta: "Source: X (Twitter) Viral Thread • Region: Madurai • 34 mins ago",
      reach: "18.5K",
      riskScore: "76/100",
      riskClass: "text-tertiary",
    },
    {
      claim_id: "CLM-8815",
      icon: "article",
      iconBg: "bg-secondary-container text-secondary",
      title: "False Subsidy Scam Notice Targeting Farmers",
      badge: "ELEVATED",
      badgeClass: "bg-secondary-container text-secondary",
      meta: "Source: Telegram Broadcast • Region: Coimbatore • 1 hour ago",
      reach: "8.1K",
      riskScore: "64/100",
      riskClass: "text-secondary",
    },
  ];

  return (
    <div className="flex flex-col w-full gap-space-xl">
      {/* Top Banner / Breaking Claims Marquee Ticker */}
      <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-md flex items-center gap-space-md shadow-sm overflow-hidden relative">
        <div className="flex items-center gap-space-xs bg-error-container text-error font-label-md px-space-md py-space-xs rounded-lg shrink-0 border border-error/20">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          <span className="font-semibold text-xs tracking-wider">BREAKING VIRAL ALERT</span>
        </div>
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="whitespace-nowrap flex gap-space-xl animate-marquee text-on-surface font-body-md">
            {ticker.concat(ticker).map((item, idx) => (
              <React.Fragment key={idx}>
                <span className="flex items-center gap-space-sm">
                  <strong className="text-error font-label-md">[{item.district}]</strong>
                  <span>{item.text}</span>
                  <span className="text-outline font-mono text-xs">Risk: {item.risk}</span>
                </span>
                <span className="text-outline-variant select-none">•</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Metric 1: Total Flagged */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <span className="font-label-md text-outline uppercase text-[11px] font-semibold tracking-wider">
              Total Flagged Today
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">flag</span>
          </div>
          <div className="my-space-md">
            <div className="text-headline-xl text-on-surface font-bold">{kpis.flagged_today}</div>
            <div className="text-body-sm text-tertiary flex items-center gap-space-xs mt-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>+{kpis.flagged_delta_pct}% from previous 24h</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
            <div className="bg-primary h-full" style={{ width: '80%' }}></div>
          </div>
        </div>

        {/* Metric 2: Capacity Processed */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-secondary/5 rounded-full blur-xl group-hover:bg-secondary/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <span className="font-label-md text-outline uppercase text-[11px] font-semibold tracking-wider">
              Capacity / Processed
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">bolt</span>
          </div>
          <div className="my-space-md">
            <div className="text-headline-xl text-on-surface font-bold">
              {kpis.capacity_processed}
              <span className="text-outline text-headline-lg font-normal">/{kpis.capacity_limit}</span>
            </div>
            <div className="text-body-sm text-on-surface-variant flex items-center gap-space-xs mt-1">
              <span>{kpis.slots_available} slots available in queue</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
            <div className="bg-secondary h-full" style={{ width: '70%' }}></div>
          </div>
        </div>

        {/* Metric 3: High Risk Alerts */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-error/5 rounded-full blur-xl group-hover:bg-error/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <span className="font-label-md text-outline uppercase text-[11px] font-semibold tracking-wider">
              High-Risk Critical Alerts
            </span>
            <span className="material-symbols-outlined text-error text-[20px]">error</span>
          </div>
          <div className="my-space-md">
            <div className="text-headline-xl text-error font-bold">{kpis.critical_alerts_count}</div>
            <div className="text-body-sm text-error flex items-center gap-space-xs mt-1">
              <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
              <span>Immediate containment required</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
            <div className="bg-error h-full" style={{ width: '95%' }}></div>
          </div>
        </div>

        {/* Metric 4: Triage Time */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-secondary/5 rounded-full blur-xl group-hover:bg-secondary/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <span className="font-label-md text-outline uppercase text-[11px] font-semibold tracking-wider">
              Average Triage Time
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">timer</span>
          </div>
          <div className="my-space-md">
            <div className="text-headline-xl text-on-surface font-bold">
              {kpis.avg_triage_time_min}
              <span className="text-outline text-headline-lg font-normal">m</span>
            </div>
            <div className="text-body-sm text-tertiary flex items-center gap-space-xs mt-1">
              <span className="material-symbols-outlined text-[14px]">trending_down</span>
              <span>{kpis.triage_time_delta_min}m faster than weekly avg</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
            <div className="bg-secondary h-full" style={{ width: '45%' }}></div>
          </div>
        </div>
      </div>

      {/* Regional Spread & Threat Vector Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        {/* Regional Misinformation Distribution (2 cols) */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center mb-space-md">
            <div>
              <h2 className="text-headline-md text-on-surface font-bold">Regional Misinformation Distribution</h2>
              <p className="text-body-sm text-outline">Active cluster surveillance across key Tamil Nadu districts</p>
            </div>
            <div className="flex gap-space-xs bg-surface-container-low p-1 rounded-lg border border-outline-variant/20">
              <button
                onClick={() => setTimeRange('24H')}
                className={`px-space-sm py-space-xs rounded-md text-label-md transition-colors ${
                  timeRange === '24H' ? 'bg-surface-container-high text-on-surface font-semibold shadow-xs' : 'text-outline hover:text-on-surface'
                }`}
              >
                24H
              </button>
              <button
                onClick={() => setTimeRange('7D')}
                className={`px-space-sm py-space-xs rounded-md text-label-md transition-colors ${
                  timeRange === '7D' ? 'bg-surface-container-high text-on-surface font-semibold shadow-xs' : 'text-outline hover:text-on-surface'
                }`}
              >
                7D
              </button>
            </div>
          </div>

          {/* Regional Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space-md my-space-md">
            {districts.map((dist) => (
              <div
                key={dist.name}
                onClick={onNavigateToQueue}
                className="bg-surface-container-low border border-outline-variant/30 p-space-md rounded-xl flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container-high hover:border-outline-variant transition-all cursor-pointer shadow-xs"
              >
                <div className="flex justify-between items-center mb-space-sm">
                  <span className="font-headline-sm text-on-surface font-semibold">{dist.name}</span>
                  <span
                    className={`font-label-sm px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      dist.isCritical || dist.status === 'Critical' || dist.status === 'High Alert'
                        ? 'text-error bg-error-container'
                        : 'text-secondary bg-secondary-fixed'
                    }`}
                  >
                    {dist.status || (dist.isCritical ? 'Critical' : 'Elevated')}
                  </span>
                </div>
                <div
                  className="w-full h-24 rounded-lg bg-cover bg-center mb-space-sm opacity-90 group-hover:opacity-100 transition-opacity bg-slate-200"
                  style={{ backgroundImage: `url('${dist.img}')` }}
                />
                <div className="flex justify-between text-body-sm pt-1">
                  <span className="text-outline text-xs">Volume: <strong className="text-on-surface">{dist.volume || `${dist.claims} signals`}</strong></span>
                  <span className={`text-xs font-mono font-semibold ${dist.isCritical || dist.status === 'Critical' ? 'text-error' : 'text-secondary'}`}>
                    Risk: {dist.risk || '85%'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Vector Breakdown (1 col) */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-sm">
          <div>
            <h2 className="text-headline-md text-on-surface font-bold mb-space-xs">Vector Composition</h2>
            <p className="text-body-sm text-outline mb-space-md">Primary mediums utilized in flagged items</p>
          </div>
          <div className="flex flex-col gap-space-md">
            {vectors.map((vec) => (
              <div key={vec.name}>
                <div className="flex justify-between text-body-sm mb-1">
                  <span className="text-on-surface flex items-center gap-space-xs text-xs">
                    <span className={`material-symbols-outlined text-[16px] ${vec.textClass}`}>{vec.icon}</span>
                    {vec.name}
                  </span>
                  <span className={`font-label-md font-bold text-xs ${vec.textClass}`}>{vec.pct}%</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${vec.colorClass}`} style={{ width: `${vec.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex justify-between items-center text-body-sm text-outline">
            <span className="text-xs">Analysis engine active</span>
            <span className="text-tertiary font-label-md flex items-center gap-space-xs text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span> Real-time sync
            </span>
          </div>
        </div>
      </div>

      {/* Automated Triage Activity & Prioritization Feed */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-space-lg">
          <div>
            <h2 className="text-headline-md text-on-surface font-bold">Automated Triage Activity & Prioritization</h2>
            <p className="text-body-sm text-outline">Real-time log of ingested claims scored by reach vs. risk coefficient</p>
          </div>
          <div className="flex gap-space-sm">
            <button
              onClick={onNavigateToQueue}
              className="bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container-high text-on-surface text-body-sm px-space-md py-space-xs rounded-xl flex items-center gap-space-xs transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
            </button>
            <button
              onClick={onNavigateToQueue}
              className="bg-primary text-on-primary text-body-sm px-space-md py-space-xs rounded-xl flex items-center gap-space-xs font-headline-sm hover:opacity-90 transition-opacity shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span> View Full Queue
            </button>
          </div>
        </div>

        {/* Triage Rows */}
        <div className="flex flex-col gap-space-sm">
          {recentClaims.map((item) => (
            <div
              key={item.claim_id}
              className="bg-surface-container-low border border-outline-variant/30 p-space-md rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-high transition-all shadow-xs"
            >
              <div className="flex items-center gap-space-md">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-space-sm">
                    <span className="font-headline-sm text-on-surface font-semibold text-sm">{item.title}</span>
                    <span className={`font-label-sm px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  </div>
                  <div className="text-body-sm text-outline text-xs mt-0.5">{item.meta}</div>
                </div>
              </div>
              <div className="flex items-center gap-space-xl w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <div className="text-body-sm text-on-surface font-headline-sm font-semibold">Reach: {item.reach}</div>
                  <div className={`text-label-sm font-mono font-bold ${item.riskClass}`}>Risk Score: {item.riskScore}</div>
                </div>
                <button
                  onClick={() => onSelectClaim(item.claim_id)}
                  className="bg-primary text-on-primary px-space-md py-space-xs rounded-lg text-body-sm font-headline-sm hover:opacity-90 transition-opacity shadow-xs text-xs font-semibold"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
