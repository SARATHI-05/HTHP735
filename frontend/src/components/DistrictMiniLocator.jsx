import React from 'react';
import { TN_DISTRICTS_DATA } from './DistrictMisinfoMap';

export default function DistrictMiniLocator({
  districtName = 'Chennai',
  riskScore,
  className = '',
  onClick,
  showLabel = true,
  height = 96,
}) {
  const normName = (districtName || '').toLowerCase().trim();
  const district =
    TN_DISTRICTS_DATA.find(
      (d) =>
        d.id.toLowerCase() === normName ||
        d.name.toLowerCase() === normName ||
        normName.includes(d.id.toLowerCase()) ||
        d.name.toLowerCase().includes(normName)
    ) || TN_DISTRICTS_DATA[0];

  const effectiveRisk = riskScore != null ? riskScore : district.riskScore;
  const isHighRisk = effectiveRisk >= 75;

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2 group transition-all ${
        onClick ? 'cursor-pointer hover:border-sky-500/50 hover:bg-slate-900' : ''
      } ${className}`}
      style={{ height: `${height}px` }}
      title={`${district.name} District (${district.zoneName}) • Risk: ${effectiveRisk}%`}
    >
      {/* Background Radar Rings */}
      <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border border-sky-400"></div>
        <div className="w-16 h-16 rounded-full border border-sky-400"></div>
      </div>

      {/* Mini SVG Tamil Nadu Silhouette with Target Pinpoint */}
      <svg
        viewBox="0 0 540 670"
        className="h-full w-auto max-w-full opacity-70 group-hover:opacity-90 transition-opacity"
      >
        {/* Simplified Ambient State Outline */}
        {TN_DISTRICTS_DATA.map((d) => (
          <path
            key={d.id}
            d={d.path}
            fill={d.id === district.id ? (isHighRisk ? '#ef4444' : '#0ea5e9') : '#334155'}
            fillOpacity={d.id === district.id ? 0.95 : 0.35}
            stroke={d.id === district.id ? '#ffffff' : '#1e293b'}
            strokeWidth={d.id === district.id ? 2 : 0.8}
          />
        ))}

        {/* Pinpoint Target on District Centroid */}
        <g pointerEvents="none">
          <circle
            cx={district.cx}
            cy={district.cy}
            r="8"
            fill={isHighRisk ? '#ef4444' : '#38bdf8'}
            opacity="0.9"
          />
          <circle
            cx={district.cx}
            cy={district.cy}
            r="18"
            fill="none"
            stroke={isHighRisk ? '#ef4444' : '#38bdf8'}
            strokeWidth="2"
            className="animate-ping"
            style={{ transformOrigin: `${district.cx}px ${district.cy}px` }}
          />
          {/* Target Reticle Crosshairs */}
          <line
            x1={district.cx - 14}
            y1={district.cy}
            x2={district.cx + 14}
            y2={district.cy}
            stroke="#ffffff"
            strokeWidth="1.2"
          />
          <line
            x1={district.cx}
            y1={district.cy - 14}
            x2={district.cx}
            y2={district.cy + 14}
            stroke="#ffffff"
            strokeWidth="1.2"
          />
        </g>
      </svg>

      {/* Overlay Badge & Telemetry HUD */}
      {showLabel && (
        <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="font-mono text-[10px] font-bold text-white bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/80 backdrop-blur-xs truncate max-w-[100px]">
            📍 {district.name}
          </span>
          <span
            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border backdrop-blur-xs ${
              isHighRisk
                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
            }`}
          >
            {effectiveRisk}% Risk
          </span>
        </div>
      )}
    </div>
  );
}
