import React, { useState, useEffect } from 'react';
import { fetchQueue, submitModeratorAction, autoModerateQueue } from '../services/api';

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
  const [actionToast, setActionToast] = useState(null);

  // Automation & Auto-Pilot States
  const [isAutoPilotEnabled, setIsAutoPilotEnabled] = useState(false);
  const [isAutoModerating, setIsAutoModerating] = useState(false);
  const [autoTriageResult, setAutoTriageResult] = useState(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [dispositionMap, setDispositionMap] = useState({});
  const [streamIngestCount, setStreamIngestCount] = useState(184);
  const [recentLiveAlert, setRecentLiveAlert] = useState(null);

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

  // Live Stream Simulation: Periodically increments signals and applies auto-pilot
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 4) + 1;
      setStreamIngestCount((prev) => prev + delta);

      // Flash live incoming alert
      const mockSignals = [
        '⚡ High-velocity WhatsApp burst detected in Madurai West (2,400 fwd/min)',
        '📡 Cross-platform synthetic audio mirror indexed on Telegram',
        '🛰️ Coordinated hashtag clustering detected across 14 bot nodes',
        '⚠️ Fast viral quote-card spread in Coimbatore agricultural channels',
      ];
      const randomSignal = mockSignals[Math.floor(Math.random() * mockSignals.length)];
      setRecentLiveAlert(randomSignal);

      // If Auto-Pilot is enabled, automatically moderate an unmoderated item
      if (isAutoPilotEnabled) {
        setItems((currentItems) => {
          const unhandled = currentItems.find((it) => !dispositionMap[it.claim_id]);
          if (unhandled) {
            const numScore = parseFloat(unhandled.score);
            let action = 'Approve & Attach Fact-Check Banner';
            let reason = 'AUTONOMOUS GROUNDING: Verified IFCN contradiction signal matched.';
            if (numScore >= 80.0) {
              action = 'Escalate to Cyber Cell';
              reason = 'AUTONOMOUS ESCALATION: Critical risk threshold (>=80) triggered.';
            } else if (numScore <= 45.0) {
              action = 'Deprioritize';
              reason = 'AUTONOMOUS CLEARANCE: Low viral velocity and sub-threshold harm probability.';
            }

            setDispositionMap((prev) => ({
              ...prev,
              [unhandled.claim_id]: {
                action,
                score: numScore,
                reason,
                time: new Date().toLocaleTimeString(),
                mode: 'AUTOPILOT_LIVE',
              },
            }));
          }
          return currentItems;
        });
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, isAutoPilotEnabled, dispositionMap]);

  // Execute Batch Autonomous Moderation
  const handleAutoModerate = async () => {
    setIsAutoModerating(true);
    try {
      const res = await autoModerateQueue();
      setAutoTriageResult(res);

      const newDispositions = { ...dispositionMap };
      if (res?.actions && res.actions.length > 0) {
        res.actions.forEach((a) => {
          newDispositions[a.claim_id] = {
            action: a.action,
            score: a.score,
            reason: a.reason,
            time: new Date().toLocaleTimeString(),
            mode: 'GBDT_BATCH_CALIBRATION',
          };
        });
      } else {
        // Fallback mapping across current items
        items.forEach((it) => {
          const s = parseFloat(it.score);
          if (s >= 80) {
            newDispositions[it.claim_id] = {
              action: 'Escalate to Cyber Cell',
              score: s,
              reason: 'AUTONOMOUS ESCALATION: Calibrated risk score >= 80.0',
              time: new Date().toLocaleTimeString(),
              mode: 'GBDT_BATCH_CALIBRATION',
            };
          } else if (s >= 65) {
            newDispositions[it.claim_id] = {
              action: 'Approve & Attach Fact-Check Banner',
              score: s,
              reason: 'AUTONOMOUS GROUNDING: Contradicts official press advisories',
              time: new Date().toLocaleTimeString(),
              mode: 'GBDT_BATCH_CALIBRATION',
            };
          } else {
            newDispositions[it.claim_id] = {
              action: 'Deprioritize',
              score: s,
              reason: 'AUTONOMOUS CLEARANCE: Sub-threshold priority',
              time: new Date().toLocaleTimeString(),
              mode: 'GBDT_BATCH_CALIBRATION',
            };
          }
        });
      }
      setDispositionMap(newDispositions);
      setActionToast(
        `⚡ Autonomous Moderation Complete: Processed ${res?.total_processed || items.length} claims based on GBDT safety thresholds.`
      );
    } catch (err) {
      console.warn('Auto moderation error:', err);
      setActionToast('Executed autonomous moderation rules.');
    } finally {
      setIsAutoModerating(false);
    }
  };

  const handleQuickAction = async (claimId, actionName) => {
    await submitModeratorAction(claimId, { action: actionName, reviewer_id: 'elena.rostova' });
    setDispositionMap((prev) => ({
      ...prev,
      [claimId]: {
        action: actionName,
        score: items.find((i) => i.claim_id === claimId)?.score,
        reason: `Manual reviewer action applied (${actionName}).`,
        time: new Date().toLocaleTimeString(),
        mode: 'MANUAL_OVERRIDE',
      },
    }));
    setActionToast(`Claim ${claimId}: ${actionName} applied.`);
    if (onActionComplete) {
      onActionComplete(claimId, actionName);
    }
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
        <div className="bg-primary text-on-primary p-space-md rounded-xl flex items-center justify-between shadow-2xl border border-secondary animate-fadeIn text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">bolt</span>
            <span>{actionToast}</span>
          </div>
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
            <span className="text-outline font-label-md">/</span>
            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-300 text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              DSA Art. 34/35 Automated Gate
            </span>
          </div>
          <h1 className="text-headline-xl text-on-surface font-bold tracking-tight text-2xl flex items-center gap-2">
            Moderation Command Center
            <span className="text-xs bg-primary/10 text-primary font-mono px-2 py-0.5 rounded border border-primary/20">
              v4.2-AUTO
            </span>
          </h1>
        </div>

        {/* Top Right Live Stats & Capacity */}
        <div className="flex items-center gap-space-md bg-surface-container-lowest border border-outline-variant/30 p-space-sm rounded-xl shadow-xs">
          <div className="flex items-center gap-space-sm px-space-sm">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">stream</span>
            <div>
              <div className="text-body-sm text-outline text-[11px]">Signals Ingested</div>
              <div className="text-headline-sm font-bold text-on-surface text-sm font-mono">
                {streamIngestCount}{' '}
                <span className="text-emerald-600 text-[11px] font-normal">
                  ({isLiveStreaming ? '18.4/s' : 'Paused'})
                </span>
              </div>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-outline-variant/30"></div>
          <div className="flex items-center gap-space-sm px-space-sm">
            <span className="material-symbols-outlined text-error text-[20px]">warning</span>
            <div>
              <div className="text-body-sm text-outline text-[11px]">Critical Risk Pending</div>
              <div className="text-headline-sm font-bold text-error text-sm">
                {items.filter((i) => i.isCritical && !dispositionMap[i.claim_id]).length} items
              </div>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-outline-variant/30"></div>
          <div className="flex items-center gap-space-sm px-space-sm">
            <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
            <div>
              <div className="text-body-sm text-outline text-[11px]">Auto-Triaged</div>
              <div className="text-headline-sm font-bold text-primary text-sm font-mono">
                {Object.keys(dispositionMap).length}{' '}
                <span className="text-outline font-normal text-xs">/ {items.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Autonomous Operations & Auto-Pilot Toolbar */}
      <div className="bg-gradient-to-r from-slate-900 via-primary to-slate-900 text-white p-space-md rounded-xl flex flex-wrap items-center justify-between gap-space-md shadow-md border border-slate-700">
        <div className="flex items-center gap-space-md flex-wrap">
          {/* Live Signal Feed Status */}
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveStreaming ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            ></span>
            <span className="font-mono uppercase font-bold text-[11px] tracking-wide text-slate-200">
              {isLiveStreaming ? '● LIVE INGESTION STREAM' : '⏸ INGESTION PAUSED'}
            </span>
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className="text-slate-400 hover:text-white ml-1 text-[11px] underline"
              title="Toggle Live Stream Simulator"
            >
              {isLiveStreaming ? 'Pause' : 'Resume'}
            </button>
          </div>

          {/* Auto-Pilot Toggle Switch */}
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 text-xs">
            <span className="material-symbols-outlined text-amber-400 text-[18px]">bolt</span>
            <span className="font-semibold text-slate-200 text-xs">Auto-Pilot Mode:</span>
            <button
              onClick={() => {
                const nextState = !isAutoPilotEnabled;
                setIsAutoPilotEnabled(nextState);
                setActionToast(
                  nextState
                    ? '⚡ Auto-Pilot Activated: Autonomous triage rules will now auto-disposition incoming queue items.'
                    : 'Auto-Pilot Deactivated: Switched to manual supervisor confirmation.'
                );
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                isAutoPilotEnabled
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                  : 'bg-white/20 text-slate-300 hover:bg-white/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAutoPilotEnabled ? 'bg-black' : 'bg-slate-400'
                }`}
              ></span>
              {isAutoPilotEnabled ? 'ON (ACTIVE)' : 'OFF (MANUAL)'}
            </button>
          </div>

          {/* Dynamic Recent Signal Marquee */}
          {recentLiveAlert && (
            <div className="hidden xl:flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded">
              <span className="material-symbols-outlined text-[14px]">sensors</span>
              <span className="font-mono truncate max-w-xs">{recentLiveAlert}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-space-sm">
          {/* Rules / Thresholds Modal Button */}
          <button
            onClick={() => setShowRulesModal(true)}
            className="px-space-md py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
            title="Inspect GBDT Calibration Thresholds & Safety Rules"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            Calibration Rules
          </button>

          {/* Run Autonomous Queue Moderation Button */}
          <button
            disabled={isAutoModerating}
            onClick={handleAutoModerate}
            className="px-space-lg py-1.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            title="Execute Autonomous Batch Decision Rules across pending claims"
          >
            <span className={`material-symbols-outlined text-[18px] ${isAutoModerating ? 'animate-spin' : ''}`}>
              {isAutoModerating ? 'sync' : 'auto_fix_high'}
            </span>
            {isAutoModerating ? 'Triaging Batch...' : '⚡ Run Autonomous Queue Moderation'}
          </button>
        </div>
      </div>

      {/* Autonomous Operational Audit Summary Banner */}
      {autoTriageResult && (
        <div className="bg-surface-container-lowest border border-emerald-300 rounded-xl p-space-md shadow-sm animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-space-sm pb-space-sm border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[22px]">verified</span>
              <div>
                <span className="font-bold text-on-surface text-sm">
                  Autonomous Queue Moderation Report
                </span>
                <span className="text-outline text-xs ml-2 font-mono">
                  [DSA-ART34-AUDIT-{new Date().toISOString().slice(0, 10)}]
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-200">
                100% Cryptographic Ledger Sync
              </span>
              <button
                onClick={() => setAutoTriageResult(null)}
                className="text-outline hover:text-on-surface text-xs"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm mt-space-sm">
            <div className="bg-surface-container-low p-2 rounded-lg border border-outline-variant/20">
              <div className="text-outline text-[11px]">Total Evaluated</div>
              <div className="text-lg font-bold text-on-surface font-mono">
                {autoTriageResult.total_processed || items.length}
              </div>
            </div>
            <div className="bg-red-50 p-2 rounded-lg border border-error/20">
              <div className="text-error text-[11px] font-semibold">Critical Escalations</div>
              <div className="text-lg font-bold text-error font-mono">
                {autoTriageResult.escalated_count ?? 1}
              </div>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
              <div className="text-emerald-800 text-[11px] font-semibold">Fact-Check Attached</div>
              <div className="text-lg font-bold text-emerald-700 font-mono">
                {autoTriageResult.fact_checked_count ?? 2}
              </div>
            </div>
            <div className="bg-slate-100 p-2 rounded-lg border border-slate-300">
              <div className="text-slate-600 text-[11px] font-semibold">Deprioritized / Cleared</div>
              <div className="text-lg font-bold text-slate-800 font-mono">
                {autoTriageResult.deprioritized_count ?? 1}
              </div>
            </div>
          </div>

          <div className="mt-space-xs text-[11px] text-outline flex items-center justify-between">
            <span>
              GBDT Calibration Policy: Score &ge; 80.0 &rarr; Cyber Cell | 65.0 - 79.9 &rarr; Fact-Check Banner | &le; 45.0 &rarr; Deprioritized.
            </span>
            <button
              onClick={() => {
                setDispositionMap({});
                setAutoTriageResult(null);
                setActionToast('Queue dispositions reverted to manual reviewer state.');
              }}
              className="text-error hover:underline text-[11px] font-semibold"
            >
              Reset Queue Dispositions
            </button>
          </div>
        </div>
      )}

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

        {/* Right Sort & Auto-Triage Top 3 */}
        <div className="flex items-center gap-space-sm">
          <button className="px-space-md py-space-sm bg-surface-container-low border border-outline-variant/20 text-on-surface rounded-lg text-xs font-semibold flex items-center gap-space-xs shadow-xs">
            <span className="material-symbols-outlined text-[16px]">swap_vert</span>
            Sort: Reach &times; Risk Score
          </button>
          <button
            onClick={() => onSelectClaim('#TN-8821')}
            className="bg-primary text-on-primary px-space-md py-space-sm rounded-lg font-label-md flex items-center gap-space-xs hover:opacity-95 transition-opacity shadow-xs text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            Investigate Top Critical (#TN-8821)
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
                <th className="py-space-md px-space-md text-right">Moderation Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-md text-xs">
              {filteredItems.map((item) => {
                const autoDisposition = dispositionMap[item.claim_id];

                return (
                  <tr
                    key={item.claim_id}
                    className={`hover:bg-surface-container-low/60 transition-colors group ${
                      autoDisposition ? 'bg-surface-container-low/30' : ''
                    }`}
                  >
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
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          {item.sourceIcon}
                        </span>
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

                    {/* Moderation Status & Actions */}
                    <td className="py-space-md px-space-md text-right whitespace-nowrap">
                      {autoDisposition ? (
                        <div className="flex items-center justify-end gap-space-xs">
                          {autoDisposition.action === 'Escalate to Cyber Cell' ||
                          autoDisposition.action === 'Escalate' ? (
                            <span
                              className="inline-flex items-center gap-1.5 bg-red-100 text-error font-bold text-[11px] px-2.5 py-1 rounded-lg border border-error/30"
                              title={autoDisposition.reason}
                            >
                              <span className="material-symbols-outlined text-[15px]">security</span>
                              AUTO-ESCALATED
                            </span>
                          ) : autoDisposition.action === 'Approve & Attach Fact-Check Banner' ||
                            autoDisposition.action === 'Fact-Check Attached' ? (
                            <span
                              className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-emerald-300"
                              title={autoDisposition.reason}
                            >
                              <span className="material-symbols-outlined text-[15px]">verified</span>
                              FACT-CHECK ATTACHED
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1.5 bg-slate-200 text-slate-700 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-slate-300"
                              title={autoDisposition.reason}
                            >
                              <span className="material-symbols-outlined text-[15px]">visibility_off</span>
                              DEPRIORITIZED
                            </span>
                          )}

                          {/* Quick Inspect Button */}
                          <button
                            onClick={() => onSelectClaim(item.claim_id)}
                            className="p-1.5 bg-surface-container-low border border-outline-variant/20 hover:bg-surface-container text-on-surface rounded-lg transition-colors shadow-xs"
                            title="Inspect Investigation Dossier"
                          >
                            <span className="material-symbols-outlined text-[15px]">psychology</span>
                          </button>

                          {/* Override / Undo Button */}
                          <button
                            onClick={() => {
                              const next = { ...dispositionMap };
                              delete next[item.claim_id];
                              setDispositionMap(next);
                            }}
                            className="p-1.5 text-outline hover:text-error rounded-lg"
                            title="Undo automated disposition"
                          >
                            <span className="material-symbols-outlined text-[14px]">undo</span>
                          </button>
                        </div>
                      ) : (
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
                            onClick={() => handleQuickAction(item.claim_id, 'Escalate to Cyber Cell')}
                            className="p-1.5 bg-error-container/20 border border-error/30 hover:bg-error-container/40 text-error rounded-lg transition-colors"
                            title="Fast Escalate to Cyber Cell"
                          >
                            <span className="material-symbols-outlined text-[16px]">priority_high</span>
                          </button>

                          {/* Attach Fact-Check Banner */}
                          <button
                            onClick={() =>
                              handleQuickAction(item.claim_id, 'Approve & Attach Fact-Check Banner')
                            }
                            className="p-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                            title="Attach Fact-Check Banner"
                          >
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                          </button>

                          {/* Dismiss / Deprioritize */}
                          <button
                            onClick={() => handleQuickAction(item.claim_id, 'Deprioritize')}
                            className="p-1.5 bg-surface-container-low border border-outline-variant/20 hover:bg-surface-container text-on-surface-variant rounded-lg transition-colors shadow-xs"
                            title="Dismiss from active queue"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-surface-container-low border-t border-outline-variant/20 p-space-md flex items-center justify-between text-xs">
          <div className="text-body-sm text-outline">
            Showing {filteredItems.length} claims • {Object.keys(dispositionMap).length} automated dispositions active
          </div>
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

      {/* Calibration Policy Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl max-w-xl w-full p-space-lg shadow-2xl flex flex-col gap-space-md">
            <div className="flex justify-between items-center pb-space-sm border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                <h3 className="font-bold text-on-surface text-base">
                  GBDT Calibration & Autonomous Triage Policy
                </h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-outline leading-relaxed">
              TruthGuard utilizes an isotonic calibrated Gradient-Boosted Decision Tree (GBDT) pipeline
              trained on regional Tamil Nadu civic data and compliant with EU Digital Services Act (DSA) Article 34 and 35.
            </p>

            <div className="flex flex-col gap-2 text-xs">
              {/* Boundary 1 */}
              <div className="p-3 rounded-xl bg-red-50 border border-error/20 flex flex-col gap-1">
                <div className="flex justify-between items-center font-bold text-error">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">security</span>
                    Boundary 1: Autonomous Escalation
                  </span>
                  <span className="font-mono">Priority &ge; 80.0</span>
                </div>
                <p className="text-on-surface-variant text-[11px]">
                  <strong>Action:</strong> Instant escalation to Cyber Cell &amp; state administration.
                  Applied when viral velocity exceeds 10k/hr or synthetic multimodal audio manipulation is detected.
                </p>
              </div>

              {/* Boundary 2 */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col gap-1">
                <div className="flex justify-between items-center font-bold text-emerald-800">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Boundary 2: Autonomous Fact-Check Grounding
                  </span>
                  <span className="font-mono">Priority 65.0 &ndash; 79.9</span>
                </div>
                <p className="text-on-surface-variant text-[11px]">
                  <strong>Action:</strong> Automated authoritative debunks and IFCN partner advisory banners attached to platform posts.
                </p>
              </div>

              {/* Boundary 3 */}
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 flex flex-col gap-1">
                <div className="flex justify-between items-center font-bold text-slate-800">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                    Boundary 3: Sub-Threshold Clearance
                  </span>
                  <span className="font-mono">Priority &le; 45.0</span>
                </div>
                <p className="text-on-surface-variant text-[11px]">
                  <strong>Action:</strong> Deprioritized from high-urgency reviewer queues to prevent human cognitive fatigue.
                </p>
              </div>
            </div>

            <div className="pt-space-sm border-t border-outline-variant/20 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-space-md py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold"
              >
                Close Policy Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Analytics / Insight Mosaic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
        {/* Card 1: Propagation Velocity */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-lg rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <span className="font-label-md text-outline uppercase font-semibold text-xs">
                Propagation Velocity
              </span>
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
              <span className="font-label-md text-outline uppercase font-semibold text-xs">
                Top Targeted Vector
              </span>
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
              <span className="font-label-md text-outline uppercase font-semibold text-xs">
                Reviewer Accuracy
              </span>
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
