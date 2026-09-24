import React, { useState, useEffect } from 'react';
import { fetchSourceTrends } from '../services/api';

export default function TabSourceTrends() {
  const [trendsData, setTrendsData] = useState({ active_sources_tracked: 0, trends: [], alerts: [] });
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrends() {
      const data = await fetchSourceTrends();
      setTrendsData(data);
      if (data.trends?.length > 0) {
        setSelectedSpeaker(data.trends[0].speaker);
      }
      setLoading(false);
    }
    loadTrends();
  }, []);

  const uniqueSpeakers = Array.from(new Set(trendsData.trends.map((t) => t.speaker)));
  const speakerTrends = trendsData.trends.filter((t) => t.speaker === selectedSpeaker);

  return (
    <div className="space-y-6">
      
      {/* Header & Source Selector */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            📈 Dynamic Source Credibility & Volatility Engine
          </h2>
          <p className="text-xs text-slate-400">
            Tracking 7-day Exponentially Weighted Moving Averages (EWMA) to flag rapidly degrading publishers.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Select Source / Speaker:</span>
          <select
            value={selectedSpeaker}
            onChange={(e) => setSelectedSpeaker(e.target.value)}
            aria-label="Select source to inspect trendline"
            className="bg-slate-800 border border-slate-700 text-white font-medium rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            {uniqueSpeakers.map((sp) => (
              <option key={sp} value={sp} className="bg-slate-900">
                {sp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Volatility Alerts Hub */}
      {trendsData.alerts?.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>⚠️</span> Active Rapid Degradation Alerts ({trendsData.alerts.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {trendsData.alerts.map((al, idx) => (
              <div key={idx} className="bg-slate-900/90 border border-amber-500/20 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between font-semibold text-white">
                  <span>{al.speaker}</span>
                  <span className="text-amber-400 font-mono">Day #{al.alert_day}</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {al.alert_message}
                </p>
                <div className="text-[10px] text-slate-500 font-mono">
                  Baseline: {(al.baseline_risk * 100).toFixed(1)}% → Recent 5d: {(al.recent_risk * 100).toFixed(1)}% (Δ +{(al.risk_delta * 100).toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 30-Day Trendline Visualizer */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              30-Day Rolling EWMA Trajectory: <span className="text-sky-400">{selectedSpeaker}</span>
            </h3>
            <span className="text-[11px] text-slate-400">EWMA span = 7 days | Anomaly trigger threshold = +2.0σ</span>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1 text-slate-400 text-[11px]">
              <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span>
              <span>7-Day EWMA Rate</span>
            </span>
          </div>
        </div>

        {/* CSS Trendline Simulation Grid */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 h-52 flex items-end justify-between gap-1">
          {speakerTrends.slice(0, 30).map((pt) => {
            const heightPct = Math.min(100, Math.max(10, Math.round((pt.rolling_risk_ewma || 0.3) * 100)));
            const isSpike = pt.is_alert;

            return (
              <div key={pt.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition absolute -top-10 bg-slate-800 border border-slate-700 text-white text-[10px] py-0.5 px-2 rounded font-mono pointer-events-none z-10 whitespace-nowrap shadow-lg">
                  Day {pt.day}: {heightPct}% risk
                </div>

                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isSpike ? 'bg-red-500 animate-pulse' : 'bg-sky-500/70 hover:bg-sky-400'
                  }`}
                  style={{ height: `${heightPct}%` }}
                ></div>
                <span className="text-[9px] text-slate-500 font-mono">
                  {pt.day % 5 === 0 ? pt.day : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
