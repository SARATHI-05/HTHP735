import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TabOverview from './components/TabOverview';
import TabQueue from './components/TabQueue';
import TabInvestigation from './components/TabInvestigation';
import TabSourceTrends from './components/TabSourceTrends';
import TabAudit from './components/TabAudit';
import { fetchQueue } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeUser, setActiveUser] = useState('elena.rostova');
  const [capacity, setCapacity] = useState(20);
  const [queueData, setQueueData] = useState(null);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load queue data whenever capacity changes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchQueue({ capacity });
      setQueueData(data);
      setLoading(false);
    }
    loadData();
  }, [capacity]);

  const handleSelectClaim = (claimId) => {
    setSelectedClaimId(claimId);
    setActiveTab('investigation');
  };

  const handleActionComplete = (claimId, verdict) => {
    // Update local queue status
    if (queueData?.items) {
      const updated = queueData.items.map((it) =>
        it.claim_id === claimId ? { ...it, status: 'Resolved' } : it
      );
      setQueueData({ ...queueData, items: updated, reviewed_count: (queueData.reviewed_count || 0) + 1 });
    }
  };

  const selectedClaim = queueData?.items?.find((it) => it.claim_id === selectedClaimId) || queueData?.items?.[0] || null;

  const tabs = [
    { id: 'overview', label: '📊 System Overview & KPIs' },
    { id: 'queue', label: '📋 Moderation Queue', count: queueData?.items?.length },
    { id: 'investigation', label: '🔍 Claim Investigation & XAI' },
    { id: 'trends', label: '📈 Source Credibility Trends' },
    { id: 'audit', label: '🏛️ Quantitative Audit & DSA' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Global Navigation Header */}
      <Header
        activeUser={activeUser}
        setActiveUser={setActiveUser}
        capacity={capacity}
        setCapacity={setCapacity}
        escalatedCount={queueData?.escalated_count || 0}
        onOpenEscalations={() => {
          setActiveTab('queue');
        }}
      />

      {/* Main Tab Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="border-b border-slate-800 flex items-center space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-xs font-semibold rounded-t-lg transition-all flex items-center space-x-2 border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-sky-500 text-sky-400 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab View Content */}
        {activeTab === 'overview' && (
          <TabOverview
            queueData={queueData}
            onNavigateToQueue={() => setActiveTab('queue')}
          />
        )}

        {activeTab === 'queue' && (
          <TabQueue
            queueData={queueData}
            capacity={capacity}
            onSelectClaim={handleSelectClaim}
            selectedClaimId={selectedClaimId}
          />
        )}

        {activeTab === 'investigation' && (
          <TabInvestigation
            selectedClaim={selectedClaim}
            activeUser={activeUser}
            onActionComplete={handleActionComplete}
          />
        )}

        {activeTab === 'trends' && (
          <TabSourceTrends />
        )}

        {activeTab === 'audit' && (
          <TabAudit />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Evidence-Grounded Misinformation Triage System (ML-09) • Built with React 18 & FastAPI</span>
          <span className="font-mono text-[11px] text-slate-400">EU DSA Article 34 Compliant • Calibrated GBDT & TreeSHAP</span>
        </div>
      </footer>
    </div>
  );
}
