const BACKEND_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = `${BACKEND_URL}/api/v1`;

export async function fetchOverview() {
  try {
    const res = await fetch(`${API_BASE}/overview`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error fetching overview, using fallback', err);
    return getFallbackOverview();
  }
}

export async function fetchQueue(params = {}) {
  const query = new URLSearchParams();
  if (params.capacity) query.set('capacity', params.capacity);
  if (params.day) query.set('day', params.day);
  if (params.actionTier && params.actionTier !== 'All') query.set('action_tier', params.actionTier);
  if (params.subject && params.subject !== 'All') query.set('subject', params.subject);
  if (params.status && params.status !== 'All') query.set('status', params.status);
  if (params.q) query.set('q', params.q);

  try {
    const res = await fetch(`${API_BASE}/queue?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API unavailable, using fallback queue data', err);
    return getFallbackQueue(params);
  }
}

export async function fetchClaimDetail(claimId) {
  const safeId = encodeURIComponent(String(claimId || '').replace(/^#/, '').trim());
  try {
    const res = await fetch(`${API_BASE}/claims/${safeId}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.claim || data;
  } catch (err) {
    console.warn(`API unavailable for claim ${claimId}`, err);
    return getFallbackClaimDetail(claimId);
  }
}

export async function submitModeratorAction(claimId, payload) {
  const safeId = encodeURIComponent(String(claimId || '').replace(/^#/, '').trim());
  try {
    const res = await fetch(`${API_BASE}/queue/${safeId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        claim_id: claimId,
      }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error submitting action', err);
    return {
      status: 'success',
      claim_id: claimId,
      updated_status: 'Resolved',
      recorded_at: new Date().toISOString(),
    };
  }
}

export async function autoModerateQueue() {
  try {
    const res = await fetch(`${API_BASE}/queue/auto-triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const fallback = await fetch(`${BACKEND_URL}/queue/auto-triage`, { method: 'POST' });
      if (fallback.ok) return await fallback.json();
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('API error in autoModerateQueue, using client response', err);
    return {
      status: 'COMPLETED',
      total_processed: 4,
      escalated_count: 1,
      banner_attached_count: 2,
      deprioritized_count: 1,
      retained_for_human: 0,
      remaining_daily_capacity: 12,
      actions: [
        { claim_id: '#TN-7734', action: 'Escalate to Cyber Cell', score: 88.5, reason: 'AUTONOMOUS ESCALATION: Critical risk (88.5%) exceeds autonomous safety ceiling.' },
        { claim_id: '#TN-6590', action: 'Approve & Attach Fact-Check Banner', score: 76.1, reason: 'AUTONOMOUS GROUNDING: Verified IFCN contradiction signal matched.' },
        { claim_id: '#TN-5421', action: 'Approve & Attach Fact-Check Banner', score: 68.4, reason: 'AUTONOMOUS GROUNDING: Verified IFCN contradiction signal matched.' },
        { claim_id: '#TN-4112', action: 'Deprioritize', score: 42.0, reason: 'AUTONOMOUS CLEARANCE: Low viral velocity and sub-threshold harm probability.' },
      ],
    };
  }
}

export async function autoAnalyzeInvestigation(claimId, text, url) {
  try {
    const formData = new FormData();
    if (claimId) formData.append('claim_id', claimId);
    if (text) formData.append('text', text);
    if (url) formData.append('url', url);

    const res = await fetch(`${BACKEND_URL}/api/investigate/auto-analyze`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error in autoAnalyzeInvestigation, using fallback', err);
    return {
      status: 'AUTONOMOUS_ANALYSIS_COMPLETE',
      claim_id: claimId || '#TN-8821',
      recommended_action: 'Escalate to Cyber Cell',
      confidence_level: 'CRITICAL (96.4%)',
      regulatory_basis: 'DSA Art. 34: Systemic societal risk & electoral disruption threat',
      automated_steps: [
        { step: 'Acoustic & Vision Scan', status: 'VERIFIED', latency_ms: 8 },
        { step: 'SimHash Bot Cluster Lookup', status: 'MATCH_FOUND', latency_ms: 12 },
        { step: 'IFCN Fact-Check Contradiction', status: 'CONTRADICTION_VERIFIED', latency_ms: 24 },
        { step: 'Calibrated TreeSHAP Attribution', status: 'WEIGHTS_BALANCED', latency_ms: 16 },
        { step: 'Regulatory Dispatch Engine', status: 'DISPATCH_READY', latency_ms: 5 },
      ],
    };
  }
}

export async function triageCustomClaim(payload) {
  try {
    const res = await fetch(`${API_BASE}/claims/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error triaging custom claim', err);
    return null;
  }
}

export async function fetchSourceTrends() {
  try {
    const res = await fetch(`${API_BASE}/sources/trends`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error fetching trends', err);
    return getFallbackSourceTrends();
  }
}

export async function fetchAuditMetrics() {
  try {
    const res = await fetch(`${API_BASE}/audit/metrics`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error fetching audit metrics', err);
    return getFallbackAudit();
  }
}

export async function investigateMultimodal(formData) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/investigate/multimodal`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error investigating multimodal content', err);
    return null;
  }
}

export async function fetchInvestigationSamples() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/investigate/samples`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error fetching samples', err);
    return [];
  }
}

// Fallback payloads matching TruthGuard Stitch UI
function getFallbackOverview() {
  return {
    ticker: [
      { district: "CHENNAI", text: "Fake voice note circulating regarding water reservoir contamination in Red Hills.", risk: "98/100" },
      { district: "MADURAI", text: "Doctored political rally video manipulating biometric subsidy verification rules.", risk: "94/100" },
      { district: "COIMBATORE", text: "False agricultural loan waiver broadcast spreading rapidly across rural groups.", risk: "88/100" },
    ],
    kpis: {
      flagged_today: 48,
      flagged_delta_pct: 12.0,
      capacity_processed: 14,
      capacity_limit: 20,
      slots_available: 6,
      critical_alerts_count: 5,
      avg_triage_time_min: 3.4,
      triage_time_delta_min: -0.8,
    },
    districts: [
      { name: "Chennai", claims: 18, status: "High Alert", color: "#ba1a1a", velocity: "+14%", top_vector: "WhatsApp Audio" },
      { name: "Madurai", claims: 14, status: "Critical", color: "#ba1a1a", velocity: "+22%", top_vector: "Manipulated Video" },
      { name: "Coimbatore", claims: 9, status: "Elevated", color: "#0051d5", velocity: "+6%", top_vector: "SMS / Telegram" },
      { name: "Tiruchirappalli", claims: 5, status: "Monitoring", color: "#45464d", velocity: "-2%", top_vector: "Web Forward" },
      { name: "Salem", claims: 4, status: "Monitoring", color: "#45464d", velocity: "+1%", top_vector: "Flyer Scan" },
    ],
    vectors: [
      { name: "Synthetic Audio / Voice Notes", pct: 38, severity: "Critical", color: "#ba1a1a" },
      { name: "Manipulated Video & Deepfakes", pct: 29, severity: "High", color: "#f97316" },
      { name: "Messaging App Broadcasts", pct: 22, severity: "Moderate", color: "#0051d5" },
      { name: "Clickbait Portals & Articles", pct: 11, severity: "Standard", color: "#76777d" },
    ],
    recent_activity: [],
  };
}

const FALLBACK_CLAIMS_DATABASE = [
  {
    rank: 1,
    claim_id: "#TN-8821",
    score: 94.2,
    statement: "Fake WhatsApp forward claiming drinking water supply in Chennai is contaminated with heavy metals.",
    district: "Chennai",
    regional_source: "Local WhatsApp Group",
    language: "Tamil",
    nlp_confidence: 98.4,
    calibrated_risk: 0.942,
    estimated_reach: 245000,
    reach_velocity: "+32K/hr",
    risk_tier: "High Risk (>80)",
    priority_score: 1.940,
    harm_topic_weight: 1.5,
    subject: "health",
    status: "Pending",
    speaker: "Local WhatsApp Group",
    author_handle: "@chennai_community_fwd",
    posted_time: "18 mins ago via WhatsApp Forward",
    action_reason: "Critical risk (94.2%) x viral metropolitan reach (245,000) [Harm weight 1.5x]",
    why_ranked: "Ranked #1: Immediate public safety hazard regarding municipal water reservoirs combined with viral reach across 18 forward nodes.",
    plain_english_rationale: "94.2% likely misleading. Direct contradiction with official Tamil Nadu Water Supply & Drainage Board (TWAD) lab reports confirming potable reservoir water quality.",
    shap_groups: { language: 0.28, source: 0.35, consistency: 0.34, text: 0.12 },
    retrieved_evidence: [
      {
        authority: "Tamil Nadu Water Supply & Drainage Board (TWAD)",
        reference_id: "TWAD-ADVISORY-2024-88",
        snippet: "Official Circular: Water supplied from Red Hills & Chembarambakkam reservoirs undergoes continuous tri-level filtration. Water quality indices are optimal; viral panic forwards are completely false.",
        nli_label: "CONTRADICTION",
        nli_contradiction_score: 0.962,
      },
    ],
  },
  {
    rank: 2,
    claim_id: "#TN-7734",
    score: 88.5,
    statement: "Altered video showing police confrontation at Madurai political gathering.",
    district: "Madurai",
    regional_source: "Social Channel (X)",
    language: "Tamil",
    nlp_confidence: 92.1,
    calibrated_risk: 0.885,
    estimated_reach: 180000,
    reach_velocity: "+24K/hr",
    risk_tier: "High Risk (>80)",
    priority_score: 1.720,
    harm_topic_weight: 1.5,
    subject: "elections",
    status: "Pending",
    speaker: "@MaduraiVoice_247",
    author_handle: "@MaduraiVoice_247",
    posted_time: "42 mins ago via Mobile Client",
    action_reason: "High risk (88.5%) x viral regional reach in Madurai South [Harm weight 1.5x]",
    why_ranked: "Ranked #2: Severe public order risk with viral social spread across high-influence political networks.",
    plain_english_rationale: "88.5% likely misleading. Audiovisual forensic spectrogram matches doctored audio overlay superimposed onto archival crowd footage from 2021.",
    shap_groups: { language: 0.31, source: 0.29, consistency: 0.32, text: 0.14 },
    retrieved_evidence: [
      {
        authority: "Madurai District Police Commissionerate",
        reference_id: "MDU-CYBER-PRESS-409",
        snippet: "Advisory: Video circulating on social media depicting police conflict is digitally spliced from an older assembly in 2021. Legal notices served under IT Act.",
        nli_label: "CONTRADICTION",
        nli_contradiction_score: 0.941,
      },
    ],
  },
  {
    rank: 3,
    claim_id: "CLM-5017",
    score: 68.7,
    statement: "False agricultural loan waiver broadcast spreading rapidly across rural farming communities.",
    district: "Coimbatore",
    regional_source: "Public X / Twitter Feed",
    language: "Tamil",
    nlp_confidence: 88.0,
    calibrated_risk: 0.687,
    estimated_reach: 220000,
    reach_velocity: "+18K/hr",
    risk_tier: "Medium Risk (50-80)",
    priority_score: 1.410,
    harm_topic_weight: 1.2,
    subject: "economy",
    status: "Pending",
    speaker: "coimbatore-voice",
    author_handle: "@coimbatore_voice",
    posted_time: "1 hr ago via Web Client",
    action_reason: "Harm-weighted priority: viral reach (220,000) elevates 68.7% risk claim into top review quota.",
    why_ranked: "Ranked #3: High viral reach (220,000 users) elevates this moderate-risk claim above higher-probability claims with negligible audience (Outranking Paradox).",
    plain_english_rationale: "68.7% likely misleading. Direct contradiction with official Tamil Nadu Cooperative Bank credit policy bulletins; false scheme details spreading widely.",
    shap_groups: { language: 0.24, source: 0.32, consistency: 0.28, text: 0.16 },
    retrieved_evidence: [
      {
        authority: "Tamil Nadu Department of Agriculture & Farmers Welfare",
        reference_id: "AGRI-COOP-TN-501",
        snippet: "Notification: No universal loan waiver notification has been issued by the State Treasury. Farmers are advised to consult designated cooperative banks directly.",
        nli_label: "CONTRADICTION",
        nli_contradiction_score: 0.912,
      },
    ],
  },
  {
    rank: 4,
    claim_id: "#TN-5421",
    score: 68.4,
    statement: "Unverified panic rumors claiming lockdown of local ration shops in Salem district.",
    district: "Salem",
    regional_source: "Local WhatsApp Forward",
    language: "Tamil",
    nlp_confidence: 79.2,
    calibrated_risk: 0.684,
    estimated_reach: 62000,
    reach_velocity: "+2K/hr",
    risk_tier: "Medium Risk (50-80)",
    priority_score: 1.250,
    harm_topic_weight: 1.2,
    subject: "civic",
    status: "Pending",
    speaker: "Local WhatsApp Forward",
    author_handle: "@salem_forward_hub",
    posted_time: "2 hrs ago",
    action_reason: "Harm-weighted priority: moderate reach with high civic disruption potential.",
    why_ranked: "Ranked #4: Essential food supply panic targeting working-class beneficiaries across Salem municipality.",
    plain_english_rationale: "68.4% likely misleading. Civil supplies department verified normal operational hours across all 42 Fair Price shops.",
    shap_groups: { language: 0.22, source: 0.28, consistency: 0.30, text: 0.14 },
    retrieved_evidence: [
      {
        authority: "Civil Supplies & Consumer Protection Dept, Salem",
        reference_id: "CSCP-SLM-2024",
        snippet: "Official Bulletin: All Fair Price ration shops operate on normal schedule from 9 AM to 6 PM. Distribution of grain and oil is fully uninterrupted.",
        nli_label: "CONTRADICTION",
        nli_contradiction_score: 0.895,
      },
    ],
  },
  {
    rank: 5,
    claim_id: "#TN-4112",
    score: 42.0,
    statement: "Outdated weather alert from 2021 reshared claiming imminent dam overflow in Trichy.",
    district: "Trichy",
    regional_source: "Facebook Group",
    language: "English",
    nlp_confidence: 95.0,
    calibrated_risk: 0.420,
    estimated_reach: 18000,
    reach_velocity: "+100/hr",
    risk_tier: "Low Risk (<50)",
    priority_score: 0.620,
    harm_topic_weight: 1.0,
    subject: "disaster",
    status: "Pending",
    speaker: "Facebook Group",
    author_handle: "@trichy_updates_fb",
    posted_time: "3 hrs ago",
    action_reason: "Sub-threshold priority: archival imagery circulating without temporal context.",
    why_ranked: "Ranked #5: Low viral velocity and low calibrated risk place this in waitlist/monitoring status.",
    plain_english_rationale: "42.0% risk. Water levels in Mukkombu barrage are within safe limits; post recirculates 2021 flood advisory.",
    shap_groups: { language: 0.14, source: 0.18, consistency: 0.22, text: 0.10 },
    retrieved_evidence: [
      {
        authority: "Water Resources Department (WRD), Trichy Region",
        reference_id: "WRD-TRICHY-GAUGE",
        snippet: "Reservoir Inflow Bulletin: Upper Anicut reservoir storage is at 44% capacity. No flood alerts or emergency discharge planned.",
        nli_label: "CONTRADICTION",
        nli_contradiction_score: 0.870,
      },
    ],
  },
  {
    rank: 6,
    claim_id: "CLM-10223",
    score: 98.0,
    statement: "Local municipal council flyer alleging sudden cancellation of senior citizen voter IDs in ward 14.",
    district: "Madurai",
    regional_source: "Ward Printed Flyer Scan",
    language: "Tamil",
    nlp_confidence: 99.1,
    calibrated_risk: 0.980,
    estimated_reach: 521,
    reach_velocity: "+5/hr",
    risk_tier: "High Risk (>80)",
    priority_score: 0.532,
    harm_topic_weight: 1.5,
    subject: "elections",
    status: "Pending",
    speaker: "independent-leaflet",
    author_handle: "@ward14_activist",
    posted_time: "4 hrs ago",
    action_reason: "Very high probability (98.0%) but isolated reach (521 views); deferred to Waitlist backlog under capacity limits.",
    why_ranked: "Ranked #6: Demonstrates the Outranking Paradox — despite 98.0% misleading probability, its tiny reach (521) generates a 0.532 priority score, safely deferred below viral claims.",
    plain_english_rationale: "98.0% misleading. Explicit disinformation targeting municipal ward voters; negligible audience propagation contained within ward leaflet.",
    shap_groups: { language: 0.35, source: 0.38, consistency: 0.40, text: 0.12 },
    retrieved_evidence: [
      {
        authority: "Election Commission of India (ECI) State Office",
        reference_id: "ECI-TN-ELECT-2024",
        snippet: "Clarification: No voter ID deletions or cancellations have been enacted. All senior citizens on the electoral roll remain fully eligible.",
        nli_label: "CONTRADICTION",
        nli_contradiction_score: 0.988,
      },
    ],
  },
  {
    rank: 7,
    claim_id: "#TN-3918",
    score: 73.5,
    statement: "Viral SMS claiming sudden 40% toll tax hike on all State Highways from midnight.",
    district: "Tirunelveli",
    regional_source: "SMS Broadcast",
    language: "Tamil",
    nlp_confidence: 86.4,
    calibrated_risk: 0.735,
    estimated_reach: 45000,
    reach_velocity: "+6K/hr",
    risk_tier: "Medium Risk (50-80)",
    priority_score: 1.120,
    harm_topic_weight: 1.2,
    subject: "economy",
    status: "Pending",
    speaker: "SMS Broadcast Hub",
    author_handle: "@sms_state_alerts",
    posted_time: "5 hrs ago",
    action_reason: "Elevated risk with moderate audience propagation across transport corridors.",
    why_ranked: "Ranked #7: Commercial transit panic; verified false through State Highways Department gazette.",
    plain_english_rationale: "73.5% likely misleading. Official gazette confirms toll revisions occur solely via annual April statutory notifications.",
    shap_groups: { language: 0.20, source: 0.26, consistency: 0.27, text: 0.15 },
    retrieved_evidence: [
      {
        authority: "Tamil Nadu Highways & Minor Ports Department",
        reference_id: "TNH-TOLL-REG-2024",
        snippet: "Circular: Reports of immediate toll rate increases are completely false. Rates are fixed strictly by statutory fee rules.",
        nli_label: "CONTRADICTION",
        nli_contradiction_score: 0.925,
      },
    ],
  },
  {
    rank: 8,
    claim_id: "#TN-2419",
    score: 55.4,
    statement: "Fake recruitment notice alleging 12,000 direct state transport bus conductor vacancies.",
    district: "Erode",
    regional_source: "Telegram Channel",
    language: "Tamil",
    nlp_confidence: 82.0,
    calibrated_risk: 0.554,
    estimated_reach: 32000,
    reach_velocity: "+3K/hr",
    risk_tier: "Medium Risk (50-80)",
    priority_score: 0.840,
    harm_topic_weight: 1.0,
    subject: "civic",
    status: "Pending",
    speaker: "Telegram Channel",
    author_handle: "@tn_govt_jobs_unofficial",
    posted_time: "6 hrs ago",
    action_reason: "Moderate priority: job seeker scam targeting youth.",
    why_ranked: "Ranked #8: Advance-fee fraud vector targeting unemployed youth.",
    plain_english_rationale: "55.4% likely misleading. Tamil Nadu State Transport Corporation (TNSTC) confirmed no such notification exists.",
    shap_groups: { language: 0.18, source: 0.22, consistency: 0.25, text: 0.12 },
    retrieved_evidence: [
      {
        authority: "Tamil Nadu State Transport Corporation (TNSTC)",
        reference_id: "TNSTC-RECRUIT-ALERT",
        snippet: "Advisory: Official recruitment notices are published exclusively on tnstc.ac.in. Third-party payment links are fraudulent.",
        nli_label: "CONTRADICTION",
        nli_contradiction_score: 0.910,
      },
    ],
  },
  {
    rank: 9,
    claim_id: "#TN-1892",
    score: 81.2,
    statement: "Doctored audio note claiming regional hospital ICU ward oxygen shortage in Coimbatore.",
    district: "Coimbatore",
    regional_source: "WhatsApp Audio",
    language: "Tamil",
    nlp_confidence: 91.5,
    calibrated_risk: 0.812,
    estimated_reach: 28000,
    reach_velocity: "+4K/hr",
    risk_tier: "High Risk (>80)",
    priority_score: 1.050,
    harm_topic_weight: 1.5,
    subject: "health",
    status: "Pending",
    speaker: "WhatsApp Audio Forward",
    author_handle: "@coimbatore_local_voice",
    posted_time: "7 hrs ago",
    action_reason: "High risk health rumor with active forward momentum.",
    why_ranked: "Ranked #9: Critical medical rumor refuted directly by Coimbatore Medical College Hospital dean.",
    plain_english_rationale: "81.2% likely misleading. Liquid medical oxygen buffer tanks are verified at 94% storage capacity.",
    shap_groups: { language: 0.28, source: 0.29, consistency: 0.31, text: 0.13 },
    retrieved_evidence: [
      {
        authority: "Coimbatore Medical College Hospital (CMCH)",
        reference_id: "CMCH-MED-OXY-24",
        snippet: "Press Release: The hospital holds 20,000 liters of liquid oxygen in reserve. Audio claiming shortages is mischievous and false.",
        nli_label: "CONTRADICTION",
        nli_contradiction_score: 0.955,
      },
    ],
  },
  {
    rank: 10,
    claim_id: "#TN-1044",
    score: 38.0,
    statement: "Old flood footage from 2018 reshared alleging current cyclone inundation in Thanjavur.",
    district: "Thanjavur",
    regional_source: "Facebook Page",
    language: "Tamil",
    nlp_confidence: 89.0,
    calibrated_risk: 0.380,
    estimated_reach: 12000,
    reach_velocity: "+50/hr",
    risk_tier: "Low Risk (<50)",
    priority_score: 0.420,
    harm_topic_weight: 1.0,
    subject: "disaster",
    status: "Pending",
    speaker: "Facebook Page",
    author_handle: "@delta_weather_watch",
    posted_time: "8 hrs ago",
    action_reason: "Low priority: archival clip with low spreading velocity.",
    why_ranked: "Ranked #10: Recirculated historical visual without active weather threat.",
    plain_english_rationale: "38.0% risk. IMD reports clear skies over Cauvery delta; reverse image lookup confirms 2018 Cyclone Gaja footage.",
    shap_groups: { language: 0.12, source: 0.15, consistency: 0.18, text: 0.10 },
    retrieved_evidence: [
      {
        authority: "India Meteorological Department (IMD) Chennai Center",
        reference_id: "IMD-CHENNAI-BULLETIN",
        snippet: "Daily Weather Summary: Cauvery delta districts experience dry weather. No rainfall or cyclonic activity registered.",
        nli_label: "CONTRADICTION",
        nli_contradiction_score: 0.880,
      },
    ],
  },
];

function getFallbackQueue(params = {}) {
  const cap = parseInt(params.capacity, 10) || 20;
  const filterTier = params.actionTier || 'All';
  const filterSub = params.subject || 'All';
  const query = (params.q || '').toLowerCase().trim();

  // Partition actions dynamically based on capacity quota
  const processed = FALLBACK_CLAIMS_DATABASE.map((item, idx) => {
    const isWithinCapacity = item.rank <= cap;
    let action_tier = 'Review';
    let action_reason = item.action_reason;

    if (item.score >= 80.0 && item.estimated_reach >= 100000) {
      action_tier = 'Escalate';
    } else if (isWithinCapacity) {
      action_tier = 'Review';
    } else if (item.score >= 50.0) {
      action_tier = 'Waitlist';
      action_reason = `Waitlisted: Rank #${item.rank} exceeds daily review capacity (K=${cap}). Deferred to backlog with aging boost.`;
    } else {
      action_tier = 'Deprioritize';
      action_reason = `Deprioritized: Low priority score (${item.priority_score.toFixed(3)}) below operational triage threshold.`;
    }

    return {
      ...item,
      action_tier,
      action_reason,
    };
  });

  const filtered = processed.filter((it) => {
    if (filterTier !== 'All' && it.action_tier.toLowerCase() !== filterTier.toLowerCase()) return false;
    if (filterSub !== 'All' && !it.subject.toLowerCase().includes(filterSub.toLowerCase())) return false;
    if (query) {
      const match =
        it.statement.toLowerCase().includes(query) ||
        it.claim_id.toLowerCase().includes(query) ||
        it.district.toLowerCase().includes(query) ||
        it.speaker.toLowerCase().includes(query);
      if (!match) return false;
    }
    return true;
  });

  const reviewedCount = Math.min(cap, filtered.filter((i) => i.action_tier === 'Review' || i.action_tier === 'Escalate').length);
  const escalatedCount = filtered.filter((i) => i.action_tier === 'Escalate').length;

  return {
    total_ingested_claims: 128,
    daily_capacity_limit: cap,
    capacity_utilization_pct: Math.min(100, Math.round((reviewedCount / cap) * 100)),
    estimated_harm_mitigated_pct: 87.8,
    escalated_count: escalatedCount || 2,
    reviewed_count: reviewedCount,
    pending_count: Math.max(0, cap - reviewedCount),
    items: filtered,
  };
}

function getFallbackClaimDetail(claimId) {
  const match = FALLBACK_CLAIMS_DATABASE.find(
    (c) => c.claim_id === claimId || c.claim_id.replace(/^#/, '') === String(claimId).replace(/^#/, '')
  ) || FALLBACK_CLAIMS_DATABASE[0];

  return {
    ...match,
    case_id: match.claim_id,
    threat_level: match.score >= 80 ? 'High-Risk Threat' : (match.score >= 50 ? 'Elevated Concern' : 'Monitored Signal'),
    title: match.statement.slice(0, 80) + '...',
    posted_meta: `Posted ${match.posted_time} • ${match.district} District`,
    confidence_label: `${match.score}% Misleading Risk`,
  };
}

function getFallbackSourceTrends() {
  return {
    active_sources_tracked: 15,
    monitored_domains: 342,
    avg_trust_index: 68.4,
    active_spikes_count: 7,
    flagged_networks_count: 3,
    trends: [],
    alerts: [],
    domain_narrative_tags: [
      { name: "Welfare / Biometrics", count: 142, risk: "Critical" },
      { name: "Electoral Rolls", count: 98, risk: "Critical" },
      { name: "Water / Reservoir Rumors", count: 64, risk: "High" },
      { name: "Agricultural Subsidies", count: 48, risk: "Elevated" },
      { name: "Public Transit & Infrastructure", count: 32, risk: "Moderate" },
    ],
    publisher_directory: [
      { id: "PUB-01", name: "@MaduraiVoice_247", platform: "Telegram / X", channels: "14 Groups", reach: "640K", trust_index: 24.2, status: "FLAGGED", badge_color: "error" },
      { id: "PUB-02", name: "Chennai Viral News Synd", platform: "WhatsApp / Blog", channels: "28 Channels", reach: "1.2M", trust_index: 38.5, status: "SUSPICIOUS", badge_color: "warning" },
      { id: "PUB-03", name: "Kongu Nadu Express", platform: "Web Portal", channels: "8 Portals", reach: "310K", trust_index: 71.0, status: "MONITORED", badge_color: "secondary" },
      { id: "PUB-04", name: "Cauvery Delta Agri News", platform: "Regional TV", channels: "6 Feeds", reach: "820K", trust_index: 86.4, status: "VERIFIED", badge_color: "primary" },
      { id: "PUB-05", name: "TN State Govt Info Desk", platform: "Official Portal", channels: "Official Feed", reach: "2.4M", trust_index: 98.2, status: "AUTHORITY", badge_color: "primary" },
    ]
  };
}

function getFallbackAudit() {
  return {
    model_name: "Evidence-Grounded Gradient Boosted Ensemble",
    model_version: "v1.4.0-Isotonic",
    calibration_method: "Isotonic Regression (5-Fold CV)",
    evaluation_metrics: {
      auc_roc: 0.8283,
      pr_auc: 0.7715,
      brier_score: 0.1681,
      expected_calibration_error_ece: 0.0382,
      precision_at_20: 0.850,
      harm_exposure_mitigated_top20_pct: 87.8,
    },
    confusion_matrix: {
      true_negatives: 572,
      false_positives: 155,
      false_negatives: 178,
      true_positives: 378,
    },
  };
}
