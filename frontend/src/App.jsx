import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import KpiStrip from './components/KpiStrip';
import TabNav from './components/TabNav';
import QueueSplitView from './components/QueueSplitView';
import SourceCredibility from './components/SourceCredibility';
import TabMethodLimits from './components/TabMethodLimits';
import TabMultimodalInvestigation from './components/TabMultimodalInvestigation';
import TriageDashboard from './components/TriageDashboard';
import DemoWalkthrough from './components/DemoWalkthrough';
import { fetchQueue } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('queue');
  const [day, setDay] = useState(30);
  const [capacity, setCapacity] = useState(20);
  const [queueData, setQueueData] = useState(null);
  const [selectedClaimId, setSelectedClaimId] = useState('CLM-5017');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 30-Second Guided Tour for Judges State
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(1);

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

  const handleOpenWalkthrough = () => {
    setActiveTab('queue');
    setWalkthroughStep(1);
    setIsWalkthroughOpen(true);
  };

  // Load queue data dynamically whenever capacity or day changes
  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchQueue({ capacity, day });
        if (!isCancelled) {
          setQueueData(data);
          if (data?.items?.length > 0 && !selectedClaimId) {
            setSelectedClaimId(data.items[0].claim_id);
          }
        }
      } catch (err) {
        console.warn('Queue fetch error:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      isCancelled = true;
    };
  }, [capacity, day]);

  const handleSelectClaim = (claimIdOrClaim) => {
    if (typeof claimIdOrClaim === 'object' && claimIdOrClaim !== null) {
      setCustomClaim(claimIdOrClaim);
      setSelectedClaimId(claimIdOrClaim.claim_id || 'LAB-CLAIM');
    } else {
      setCustomClaim(null);
      setSelectedClaimId(claimIdOrClaim);
    }
  };

  const handleInjectClaim = (newClaim) => {
    if (!newClaim) return;
    setQueueData((prev) => {
      if (!prev) return prev;
      const exists = prev.items?.some((it) => it.claim_id === newClaim.claim_id);
      if (exists) return prev;
      return {
        ...prev,
        items: [newClaim, ...(prev.items || [])],
        pending_count: (prev.pending_count || 0) + 1,
      };
    });
    setSelectedClaimId(newClaim.claim_id);
    setCustomClaim(newClaim);
  };

  const [labInitialClaim, setLabInitialClaim] = useState(null);

  const handleActionComplete = (claimId, verdict) => {
    if (queueData?.items) {
      const updated = queueData.items.map((it) =>
        it.claim_id === claimId ? { ...it, status: 'Resolved', applied_verdict: verdict } : it
      );
      setQueueData({
        ...queueData,
        items: updated,
        reviewed_count: (queueData.reviewed_count || 14) + 1,
        pending_count: Math.max(0, (queueData.pending_count || 6) - 1),
      });
    }
    if (customClaim && customClaim.claim_id === claimId) {
      setCustomClaim({
        ...customClaim,
        status: 'Resolved',
        applied_verdict: verdict,
      });
    }
  };

  const handleNavigateToLab = (claim) => {
    const target =
      claim ||
      customClaim ||
      queueData?.items?.find((it) => it.claim_id === selectedClaimId) ||
      null;
    setLabInitialClaim(target);
    setActiveTab('multimodal');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased flex flex-col">
      {/* 1. Global Top Bar */}
      <TopBar
        day={day}
        setDay={setDay}
        capacity={capacity}
        setCapacity={setCapacity}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isReachHidden={isReachHidden}
        toggleHideReach={toggleHideReach}
        onOpenWalkthrough={handleOpenWalkthrough}
        onResetDemo={() => {
          setActiveTab('queue');
          setSelectedClaimId('CLM-5017');
          setCapacity(20);
        }}
      />

      {/* Main Moderator Console Shell */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5 lg:p-7 flex flex-col gap-4 sm:gap-5">
        {/* 2. KPI Strip (4 Cards: Items Today, Capacity Used, Escalations, Backlog) */}
        <KpiStrip queueData={queueData} capacity={capacity} />

        {/* 4. Tab Navigation Beside the Queue */}
        <TabNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          queueCount={queueData?.items?.length || 14}
        />

        {/* Dynamic Tab Body */}
        {activeTab === 'queue' && (
          <QueueSplitView
            queueData={queueData}
            capacity={capacity}
            day={day}
            customClaim={customClaim}
            selectedClaimId={selectedClaimId}
            onSelectClaim={handleSelectClaim}
            onActionComplete={handleActionComplete}
            isReachHidden={isReachHidden}
            toggleHideReach={toggleHideReach}
            onNavigateToLab={handleNavigateToLab}
            onOpenWalkthrough={handleOpenWalkthrough}
          />
        )}

        {activeTab === 'sources' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <SourceCredibility />
          </div>
        )}

        {activeTab === 'method' && (
          <TabMethodLimits />
        )}

        {activeTab === 'multimodal' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <TabMultimodalInvestigation
              initialClaim={labInitialClaim}
              onSelectClaim={(claim) => {
                handleSelectClaim(claim);
                setActiveTab('queue');
              }}
              onInjectClaim={handleInjectClaim}
              onNavigateToQueue={() => setActiveTab('queue')}
              isReachHidden={isReachHidden}
              toggleHideReach={toggleHideReach}
            />
          </div>
        )}

        {activeTab === 'overview' && (
          <TriageDashboard
            onSelectClaim={(claimId) => {
              handleSelectClaim(claimId);
              setActiveTab('queue');
            }}
            onNavigateToQueue={(district) => {
              if (district && typeof district === 'string') {
                setSearchQuery(district);
              }
              setActiveTab('queue');
            }}
            onNavigateToLab={(claimId) => {
              if (claimId) handleSelectClaim(claimId);
              setActiveTab('multimodal');
            }}
            isReachHidden={isReachHidden}
          />
        )}
      </main>

      {/* 30-Second Guided Tour Modal for Judges */}
      <DemoWalkthrough
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        currentStep={walkthroughStep}
        setCurrentStep={setWalkthroughStep}
        onSelectClaim={handleSelectClaim}
        setCapacity={setCapacity}
        capacity={capacity}
        items={queueData?.items || []}
      />
    </div>
  );
}
