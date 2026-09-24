import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TriageDashboard from './components/TriageDashboard';
import ModerationQueue from './components/ModerationQueue';
import ItemInvestigation from './components/ItemInvestigation';
import SourceCredibility from './components/SourceCredibility';
import TabAudit from './components/TabAudit';
import TabMultimodalInvestigation from './components/TabMultimodalInvestigation';
import { fetchQueue } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeUser, setActiveUser] = useState('elena.rostova');
  const [capacity, setCapacity] = useState(20);
  const [queueData, setQueueData] = useState(null);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [customClaim, setCustomClaim] = useState(null);
  const [isReachHidden, setIsReachHidden] = useState(() => {
    return localStorage.getItem('truthguard_hide_reach') === 'true';
  });

  const toggleHideReach = () => {
    setIsReachHidden((prev) => {
      const next = !prev;
      localStorage.setItem('truthguard_hide_reach', next.toString());
      return next;
    });
  };

  // Load queue data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchQueue({ capacity });
      setQueueData(data);
      if (!selectedClaimId && data?.items?.length > 0) {
        setSelectedClaimId(data.items[0].claim_id);
      }
      setLoading(false);
    }
    loadData();
  }, [capacity]);

  const handleSelectClaim = (claimIdOrClaim) => {
    if (typeof claimIdOrClaim === 'object' && claimIdOrClaim !== null) {
      setCustomClaim(claimIdOrClaim);
      setSelectedClaimId(claimIdOrClaim.claim_id || 'LAB-CLAIM');
    } else {
      setCustomClaim(null);
      setSelectedClaimId(claimIdOrClaim);
    }
    setActiveTab('investigation');
  };

  const handleActionComplete = (claimId, verdict) => {
    if (queueData?.items) {
      const updated = queueData.items.map((it) =>
        it.claim_id === claimId ? { ...it, status: 'Resolved' } : it
      );
      setQueueData({
        ...queueData,
        items: updated,
        reviewed_count: (queueData.reviewed_count || 14) + 1,
        pending_count: Math.max(0, (queueData.pending_count || 6) - 1),
      });
    }
  };

  const handleQuickSearch = (query) => {
    setActiveTab('queue');
  };

  const selectedClaim =
    customClaim ||
    queueData?.items?.find((it) => it.claim_id === selectedClaimId) ||
    queueData?.items?.[0] ||
    null;

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased">
      {/* Enterprise Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        capacity={capacity}
        setCapacity={setCapacity}
        queueCount={queueData?.items?.length || 14}
        reviewedCount={queueData?.reviewed_count || 14}
      />

      {/* Main Content Area (Offset by Sidebar 64 = 16rem) */}
      <div className="pl-64">
        {/* Fixed Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          onQuickSearch={handleQuickSearch}
          isReachHidden={isReachHidden}
          toggleHideReach={toggleHideReach}
        />

        {/* Dynamic Screen Content */}
        <main className="relative pt-16 bg-surface min-h-screen">
          <div className="flex flex-col w-full p-space-lg gap-space-xl max-w-7xl mx-auto">
            {/* Screen 1: Dashboard */}
            {activeTab === 'dashboard' && (
              <TriageDashboard
                onSelectClaim={handleSelectClaim}
                onNavigateToQueue={() => setActiveTab('queue')}
                isReachHidden={isReachHidden}
              />
            )}

            {/* Screen 2: Prioritized Moderation Queue */}
            {activeTab === 'queue' && (
              <ModerationQueue
                queueData={queueData}
                capacity={capacity}
                onSelectClaim={handleSelectClaim}
                selectedClaimId={selectedClaimId}
                onActionComplete={handleActionComplete}
                isReachHidden={isReachHidden}
                toggleHideReach={toggleHideReach}
              />
            )}

            {/* Screen 3: Item Investigation & NLP Breakdown */}
            {activeTab === 'investigation' && (
              <ItemInvestigation
                selectedClaim={selectedClaim}
                activeUser={activeUser}
                onActionComplete={handleActionComplete}
                onBackToQueue={() => setActiveTab('queue')}
                onNavigateToLab={() => setActiveTab('multimodal')}
                isReachHidden={isReachHidden}
                toggleHideReach={toggleHideReach}
              />
            )}

            {/* Screen 3b: Real-World Multimodal Forensics Lab (Audio/Image/Video/Chain/News) */}
            {activeTab === 'multimodal' && (
              <TabMultimodalInvestigation
                onSelectClaim={handleSelectClaim}
                onNavigateToQueue={() => setActiveTab('queue')}
                isReachHidden={isReachHidden}
                toggleHideReach={toggleHideReach}
              />
            )}

            {/* Screen 4: Source Credibility & Trend Tracking */}
            {activeTab === 'sources' && (
              <SourceCredibility />
            )}

            {/* Screen 5: Quantitative Audit & DSA Compliance */}
            {activeTab === 'audit' && (
              <TabAudit />
            )}

            {/* Screen 6: System & Model Settings */}
            {activeTab === 'settings' && (
              <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-xl rounded-xl shadow-xs">
                <div className="flex items-center gap-space-sm mb-space-md">
                  <span className="material-symbols-outlined text-primary text-[24px]">settings</span>
                  <h2 className="text-headline-lg font-bold text-on-surface text-xl">Platform &amp; Model Settings</h2>
                </div>
                <p className="text-body-sm text-outline text-xs mb-space-lg">
                  Configure regional surveillance thresholds, GBDT decision boundaries, and automated webhook triggers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md text-xs">
                  <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <span className="font-bold text-on-surface block mb-1">Active Model Checkpoint</span>
                    <span className="text-outline font-mono">gbdt-calibrated-v1.4.0 (Tamil Nadu Custom)</span>
                  </div>
                  <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <span className="font-bold text-on-surface block mb-1">State Cyber Cell Webhook</span>
                    <span className="text-emerald-600 font-mono font-semibold">ONLINE • Latency: 14ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
