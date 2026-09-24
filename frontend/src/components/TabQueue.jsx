import React, { useState } from 'react';

export default function TabQueue({
  queueData,
  capacity,
  onSelectClaim,
  selectedClaimId,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const items = queueData?.items || [];

  const filteredItems = items.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = item.statement.toLowerCase().includes(q) || item.speaker.toLowerCase().includes(q);
      if (!matchText) return false;
    }
    if (topicFilter !== 'All' && !item.subject.toLowerCase().includes(topicFilter.toLowerCase())) {
      return false;
    }
    if (tierFilter !== 'All' && item.action_tier.toLowerCase() !== tierFilter.toLowerCase()) {
      return false;
    }
    if (statusFilter !== 'All' && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  const getActionBadge = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'escalate':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">🚨 ESCALATE</span>;
      case 'review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/40">🔍 REVIEW</span>;
      case 'waitlist':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">⏳ WAITLIST</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/40">💤 DEPRIORITIZE</span>;
    }
  };

  const getRiskBadge = (p) => {
    if (p >= 0.8) {
      return <span className="font-mono text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">🔴 {Math.round(p * 100)}%</span>;
    }
    if (p >= 0.6) {
      return <span className="font-mono text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">🟠 {Math.round(p * 100)}%</span>;
    }
    if (p >= 0.4) {
      return <span className="font-mono text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">🟡 {Math.round(p * 100)}%</span>;
    }
    return <span className="font-mono text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">🟢 {Math.round(p * 100)}%</span>;
  };

  return (
    <div className="space-y-4">
      
      {/* Filter & Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">🔍</span>
          <input
            type="text"
            placeholder="Search statement text or speaker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Topic */}
          <div className="flex items-center space-x-1 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg">
            <span className="text-slate-400">Topic:</span>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              aria-label="Filter by topic"
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Topics</option>
              <option value="health" className="bg-slate-900">Health (1.5x)</option>
              <option value="election" className="bg-slate-900">Elections (1.5x)</option>
              <option value="economy" className="bg-slate-900">Economy (1.2x)</option>
            </select>
          </div>

          {/* Action Tier */}
          <div className="flex items-center space-x-1 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg">
            <span className="text-slate-400">Action:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              aria-label="Filter by action tier"
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Actions</option>
              <option value="Escalate" className="bg-slate-900">🚨 Escalate</option>
              <option value="Review" className="bg-slate-900">🔍 Review</option>
              <option value="Waitlist" className="bg-slate-900">⏳ Waitlist</option>
              <option value="Deprioritize" className="bg-slate-900">💤 Deprioritize</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-1 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by review status"
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Status</option>
              <option value="Pending" className="bg-slate-900">Pending</option>
              <option value="Resolved" className="bg-slate-900">Resolved</option>
            </select>
          </div>

          <span className="text-slate-400 text-xs font-mono ml-2">
            Showing <strong>{filteredItems.length}</strong> items
          </span>
        </div>
      </div>

      {/* Moderation Queue Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3 w-14 text-center">Rank</th>
                <th className="py-3 px-4">Statement Text</th>
                <th className="py-3 px-3">Speaker / Source</th>
                <th className="py-3 px-3 text-center">Calibrated Risk</th>
                <th className="py-3 px-3 text-right">Reach</th>
                <th className="py-3 px-3 text-right">Priority</th>
                <th className="py-3 px-3 text-center">Action Policy</th>
                <th className="py-3 px-3 text-center w-24">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item, idx) => {
                const isSelected = selectedClaimId === item.claim_id;
                const isCapacityBoundary = item.rank === capacity;

                return (
                  <React.Fragment key={item.claim_id}>
                    <tr
                      className={`hover:bg-slate-800/50 transition cursor-pointer ${
                        isSelected ? 'bg-sky-500/10 border-l-4 border-l-sky-500' : ''
                      }`}
                      onClick={() => onSelectClaim(item.claim_id)}
                    >
                      {/* Rank */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                        #{item.rank.toString().padStart(2, '0')}
                      </td>

                      {/* Statement */}
                      <td className="py-3 px-4 max-w-md">
                        <div className="font-medium text-slate-200 line-clamp-2 leading-relaxed">
                          "{item.statement}"
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-2">
                          <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {item.subject} [{item.harm_topic_weight}x]
                          </span>
                          {item.days_waiting > 0 && (
                            <span className="text-amber-400 font-mono">
                              +{item.days_waiting}d waiting
                            </span>
                          )}
                          {item.status === 'Resolved' && (
                            <span className="text-emerald-400 font-medium">✓ Reviewed</span>
                          )}
                        </div>
                      </td>

                      {/* Speaker */}
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        <div className="font-semibold">{item.speaker}</div>
                        {item.is_source_volatile && (
                          <span className="inline-block mt-0.5 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                            ⚠️ Volatile Spike
                          </span>
                        )}
                      </td>

                      {/* Calibrated Risk */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getRiskBadge(item.calibrated_risk)}
                      </td>

                      {/* Reach */}
                      <td className="py-3 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                        {item.estimated_reach.toLocaleString()}
                      </td>

                      {/* Priority Score */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-sky-400 whitespace-nowrap">
                        {item.priority_score.toFixed(3)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getActionBadge(item.action_tier)}
                      </td>

                      {/* Inspect Button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectClaim(item.claim_id);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white font-medium text-xs transition shadow-sm"
                        >
                          Inspect 🔍
                        </button>
                      </td>
                    </tr>

                    {/* Capacity Cutoff Visual Divider */}
                    {isCapacityBoundary && idx < filteredItems.length - 1 && (
                      <tr className="bg-sky-950/40 border-y-2 border-sky-500/60">
                        <td colSpan="8" className="py-2 px-4 text-center text-xs font-semibold text-sky-400 tracking-wider uppercase font-mono">
                          ⚡ DAILY REVIEW CAPACITY LIMIT (K = {capacity} ITEMS / DAY) — BELOW ITEMS DEFERRED TO BACKLOG ⚡
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
