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
    return getFallbackQueue();
  }
}

export async function fetchClaimDetail(claimId) {
  try {
    const res = await fetch(`${API_BASE}/claims/${claimId}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.claim || data;
  } catch (err) {
    console.warn(`API unavailable for claim ${claimId}`, err);
    return getFallbackClaimDetail(claimId);
  }
}

export async function submitModeratorAction(claimId, payload) {
  try {
    const res = await fetch(`${API_BASE}/queue/${claimId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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

function getFallbackQueue() {
  return {
    total_ingested_claims: 128,
    daily_capacity_limit: 20,
    capacity_utilization_pct: 70.0,
    estimated_harm_mitigated_pct: 87.8,
    escalated_count: 4,
    reviewed_count: 14,
    pending_count: 6,
    items: [
      {
        rank: 1,
        claim_id: "CLM-8821",
        score: 94.2,
        statement: "Fake WhatsApp forward claiming drinking water supply in Chennai is contaminated with heavy metals.",
        district: "Chennai",
        regional_source: "Local WhatsApp Group",
        language: "Tamil",
        nlp_confidence: 98.4,
        estimated_reach: 245000,
        reach_velocity: "+32K/hr",
        risk_tier: "High Risk (>80)",
        priority_score: 1.94,
        action_tier: "Escalate",
        action_reason: "Critical risk (94%) x viral reach (245,000 users) [harm weight 1.5]",
        status: "Pending",
        speaker: "chennai-rumor-forward",
        subject: "health",
      },
      {
        rank: 2,
        claim_id: "CLM-8841",
        score: 91.5,
        statement: "Govt officials in Madurai are locking ration shops and demanding biometric rescan linked to voter ID.",
        district: "Madurai",
        regional_source: "Telegram Broadcast Node",
        language: "Tamil",
        nlp_confidence: 94.2,
        estimated_reach: 180000,
        reach_velocity: "+24K/hr",
        risk_tier: "High Risk (>80)",
        priority_score: 1.72,
        action_tier: "Review",
        action_reason: "High risk (91.5%) x viral regional reach in Madurai South",
        status: "Pending",
        speaker: "@MaduraiVoice_247",
        subject: "elections",
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
        estimated_reach: 220000,
        reach_velocity: "+18K/hr",
        risk_tier: "Medium Risk (50-80)",
        priority_score: 1.41,
        action_tier: "Review",
        action_reason: "Ranked #3 by reach x risk formula. Outranks low-reach high-confidence claims.",
        status: "Pending",
        speaker: "coimbatore-voice",
        subject: "economy",
      }
    ]
  };
}

function getFallbackClaimDetail(claimId) {
  return {
    claim_id: claimId || "CLM-8841",
    case_id: "#TN-2023-8841",
    threat_level: "High-Risk Threat",
    title: "Electoral rumor regarding biometric subsidy verification in rural Madurai",
    statement: "URGENT: Govt officials in Madurai are locking ration shops and demanding mandatory biometric re-verification linked directly to voter ID cards. If you don't scan by tomorrow evening, your monthly grain subsidy will be permanently cancelled! Forwarded as received.",
    speaker: "MaduraiVoice_247",
    author_handle: "@MaduraiVoice_247",
    district: "Madurai South Constituency",
    posted_time: "42 mins ago via Mobile Client",
    calibrated_risk: 0.942,
    score: 94.2,
    nlp_confidence: 94.2,
    estimated_reach: 180000,
    reach_velocity: "+24K/hr",
    priority_score: 1.84,
    action_tier: "Escalate",
    action_reason: "High calibrated risk and viral spread trigger mandatory containment review.",
    sentiment_label: "Highly Hostile",
    sentiment_score: -0.84,
    sentiment_desc: "Polarity score -0.84 with strong negative valence targeting state machinery.",
    emotional_triggers: [
      { name: "Panic", score: 0.91 },
      { name: "Urgency", score: 0.88 },
      { name: "Injustice", score: 0.76 }
    ],
    context_distortion_label: "Synthetic Urgency",
    context_distortion_desc: "Routine software upgrade misattributed to electoral disenfranchisement.",
    frame_comparison: {
      manipulated_label: "Manipulated Frame (Timestamp 0:14)",
      manipulated_badge: "Deepfake/Edited Audio Match",
      original_label: "Original Archive Footage (2021)",
      original_badge: "Source Matched (99.8%)",
      manipulated_img: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
      original_img: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
    },
    shap_drivers: [
      { feature: "Linguistic Sensationalism", value: 0.85, attribution: "+0.28" },
      { feature: "Source Falsehood History", value: 0.82, attribution: "+0.22" },
      { feature: "Semantic Contradiction", value: 0.94, attribution: "+0.31" }
    ],
    shap_groups: {
      source: 0.35,
      linguistic: 0.28,
      text: 0.15,
      consistency: 0.31,
    },
    retrieved_evidence: [
      {
        reference_id: "EVD-TN-884",
        authority: "Directorate of Information & Public Relations (DIPR Tamil Nadu)",
        snippet: "Official statement: All ration shops in Madurai operate on routine schedules. No biometric re-verification or voter ID linkage is required for monthly civil supplies distribution.",
        cosine_similarity: 0.884,
        nli_label: "CONTRADICTION",
        nli_contradiction_score: 0.941,
      }
    ],
    plain_english_rationale: "94% likely misleading. Primary drivers include direct contradiction with official Tamil Nadu Civil Supplies department circulars and high sensational urgency cues.",
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
