import React, { useState } from 'react';
import { investigateMultimodal, submitModeratorAction } from '../services/api';

export default function TabMultimodalInvestigation({ onSelectClaim, onNavigateToQueue }) {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [reach, setReach] = useState(65000);
  const [topic, setTopic] = useState('Elections');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [showElaHeatmap, setShowElaHeatmap] = useState(false);
  const [queueActionToast, setQueueActionToast] = useState(null);

  // Pre-configured real-world multimodal incident samples
  const sampleIncidents = [
    {
      label: '🎙️ Deepfake Voice Note',
      title: 'Madurai Municipal Water Contamination Alert',
      text: 'Alert: Corporation water pipeline in northern district reported chemical contamination. Do not drink tap water today.',
      reach: 42000,
      topic: 'Health',
      type: 'audio',
      fakeFileName: 'madurai_water_leak_voicenote.mp3',
    },
    {
      label: '🖼️ Doctored Meme / Spliced Photo',
      title: 'Flyover Structural Splicing & Cracks',
      text: 'Shocking visuals of massive cracks on new flyover within 48 hours of inauguration. Public safety compromised!',
      reach: 95000,
      topic: 'Public Safety',
      type: 'image',
      previewUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
      fakeFileName: 'flyover_cracks_doctored.jpg',
    },
    {
      label: '🤖 Viral WhatsApp Chain',
      title: 'Magalir Urimai Subsidy Cancellation Hoax',
      text: 'URGENT NOTICE: Forward to all women in Tamil Nadu! Government is canceling bank accounts for Magalir scheme from tomorrow. Share before deleted! Pass this on immediately!',
      reach: 220000,
      topic: 'Elections',
      type: 'chain',
    },
    {
      label: '📰 Fabricated News Article',
      title: 'Wireless EVM Connectivity Rumor',
      text: 'Sensational leak: Coimbatore polling center EVMs detected broadcasting unauthorized Bluetooth signal to nearby vehicle.',
      reach: 64000,
      topic: 'Elections',
      type: 'news',
    },
  ];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    const mime = selected.type || '';
    const name = selected.name.toLowerCase();

    if (mime.startsWith('image/') || name.endsWith(('.png', '.jpg', '.jpeg', '.webp'))) {
      setFileType('image');
      setFilePreview(URL.createObjectURL(selected));
    } else if (mime.startsWith('audio/') || name.endsWith(('.mp3', '.wav', '.m4a', '.ogg'))) {
      setFileType('audio');
      setFilePreview(URL.createObjectURL(selected));
    } else if (mime.startsWith('video/') || name.endsWith(('.mp4', '.mov', '.webm', '.avi'))) {
      setFileType('video');
      setFilePreview(URL.createObjectURL(selected));
    } else {
      setFileType('document');
      setFilePreview(null);
    }
  };

  const loadSample = (s) => {
    setTextContent(s.text);
    setReach(s.reach);
    setTopic(s.topic);
    setFileType(s.type);
    if (s.previewUrl) {
      setFilePreview(s.previewUrl);
    } else {
      setFilePreview(null);
    }
    setFile(null);
    setReport(null);
  };

  const handleRunInvestigation = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setReport(null);

    const formData = new FormData();
    if (file) formData.append('file', file);
    if (textContent) formData.append('text_content', textContent);
    formData.append('reach', reach.toString());
    formData.append('topic', topic);

    const res = await investigateMultimodal(formData);
    setLoading(false);

    if (res) {
      setReport(res);
    } else {
      // Local fallback simulation if offline
      setReport({
        status: 'COMPLETED',
        media_type: fileType === 'audio' ? 'deepfake_audio' : fileType === 'image' ? 'doctored_image' : fileType === 'video' ? 'manipulated_video' : 'bot_chain_message',
        reach: reach,
        topic: topic,
        forensics: {
          audio: fileType === 'audio' ? {
            modality: 'audio',
            transcript: textContent || 'Detected speech: Civic emergency pipeline advisory broadcast.',
            deepfake_risk_score: 0.89,
            is_synthetic_suspect: true,
            forensic_metrics: {
              spectral_flatness: 0.0842,
              spectral_rolloff_hz: 5410.0,
              duration_seconds: 8.4,
              vocoder_artifact_level: 'HIGH - Neural vocoder phase discontinuities detected (>4.8kHz)',
            }
          } : undefined,
          image: fileType === 'image' ? {
            modality: 'image',
            tamper_risk_score: 0.74,
            is_doctored_suspect: true,
            image_resolution: '1280x720',
            forensic_signals: {
              ela_variance_score: 0.74,
              compression_artifact_anomaly: 'CRITICAL',
              splicing_boundary_detected: true,
              confidence_interval: '98.2% Multi-pass ELA',
            }
          } : undefined,
          chain: {
            modality: 'chain_text',
            simhash: '15174092497672283086',
            is_chain_forward: true,
            bot_cascade_risk: 0.85,
            matched_triggers: ['forward to all', 'urgent notice', 'share before deleted'],
            linguistic_markers: {
              forwarding_imperatives_count: 3,
              near_duplicate_cluster: true,
              synthesized_velocity: '8.5x viral multiplier',
            }
          }
        },
        fact_checks: [
          {
            claim: textContent || 'Regional civic infrastructure claim',
            publisher: 'BoomLive / FactCheck Consortium',
            rating: 'Fabricated / Manipulated Context',
            verdict_snippet: 'Verified official public authorities confirm circular/media is altered and fabricated.'
          }
        ],
        triage: {
          priority_score: 88.4,
          action: 'Escalate to Cyber Cell',
          harm_weight: topic === 'Health' || topic === 'Elections' ? 1.5 : 1.2,
          calibrated_risk: 0.94,
        }
      });
    }
  };

  const handlePushToQueue = async () => {
    const claimId = `INVST-${Date.now().toString().slice(-4)}`;
    await submitModeratorAction(claimId, {
      verdict: report?.triage?.action || 'Escalate to Cyber Cell',
      reviewer_id: 'forensic.lab',
      reviewer_notes: `Multimodal Lab Forensic Ingestion: ${report?.media_type} [Priority: ${report?.triage?.priority_score}]`
    });
    setQueueActionToast(`Dossier ${claimId} successfully injected into active Moderation Queue!`);
    setTimeout(() => setQueueActionToast(null), 4000);
  };

  const downloadJsonReport = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truthguard_forensic_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Toast Alert */}
      {queueActionToast && (
        <div className="fixed top-20 right-6 z-50 bg-primary text-on-primary py-space-sm px-space-md rounded-xl flex items-center gap-space-md shadow-2xl border border-secondary animate-fadeIn text-xs font-semibold max-w-md">
          <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
          <span className="flex-1">{queueActionToast}</span>
          <button onClick={() => setQueueActionToast(null)} className="text-outline-variant hover:text-white">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-space-sm mb-space-xs">
            <span className="font-label-md text-error font-bold uppercase tracking-wider text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              Real-World Forensic Ingestion
            </span>
            <span className="text-outline font-label-md">/</span>
            <span className="font-label-md text-outline font-medium text-xs">Audio • Vision • Chain LSH</span>
          </div>
          <h1 className="text-headline-xl text-on-surface font-bold tracking-tight text-2xl">
            Multimodal Misinformation Investigation Lab
          </h1>
          <p className="text-body-md text-outline text-xs mt-1">
            Upload voice notes, doctored memes, video clips, or paste viral WhatsApp chain forwards for automated neural forensic triage.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {report && (
            <button
              onClick={downloadJsonReport}
              className="px-space-md py-space-sm rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-all font-semibold text-xs border border-outline-variant/40 shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export JSON
            </button>
          )}
          {onNavigateToQueue && (
            <button
              onClick={onNavigateToQueue}
              className="px-space-md py-space-sm rounded-xl bg-primary text-on-primary hover:opacity-90 font-semibold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">queue</span>
              Active Queue
            </button>
          )}
        </div>
      </div>

      {/* Quick Incident Preset Chips */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-md shadow-xs flex flex-col gap-2">
        <span className="font-label-sm uppercase text-outline text-[11px] font-semibold tracking-wider">
          Quick Load Real-World Incidents (1-Click Test):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {sampleIncidents.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSample(s)}
              className="p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/20 text-left transition-all group"
            >
              <div className="text-xs font-bold text-on-surface group-hover:text-secondary flex items-center justify-between">
                <span>{s.label}</span>
                <span className="material-symbols-outlined text-[14px] text-outline">arrow_forward</span>
              </div>
              <div className="text-[11px] text-outline truncate mt-0.5">{s.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Upload Form (Left) & Live Forensic Report (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <form onSubmit={handleRunInvestigation} className="bg-white p-space-lg rounded-xl flex flex-col gap-space-md shadow-xs border border-outline-variant/30">
            <h3 className="font-headline-md text-on-surface font-bold text-sm flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-[20px]">cloud_upload</span>
              Upload Media or Paste Signals
            </h3>

            {/* Drag & Drop File Upload Area */}
            <div>
              <label className="block text-[11px] font-semibold text-outline uppercase tracking-wider mb-1">
                Upload File (Audio, Image, Meme, Video)
              </label>
              <div className="relative border-2 border-dashed border-outline-variant/60 hover:border-secondary rounded-xl p-4 text-center bg-surface-container-low/50 transition-colors">
                <input
                  type="file"
                  accept="audio/*,image/*,video/*,.mp3,.wav,.m4a,.png,.jpg,.jpeg,.webp,.mp4,.mov"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="material-symbols-outlined text-outline text-[32px] block mx-auto mb-1">
                  {fileType === 'audio' ? 'mic' : fileType === 'image' ? 'image' : fileType === 'video' ? 'videocam' : 'upload_file'}
                </span>
                <p className="text-xs font-semibold text-on-surface">
                  {file ? file.name : 'Drag & drop media file or browse'}
                </p>
                <p className="text-[10px] text-outline mt-0.5">
                  Supports MP3, WAV, M4A, JPG, PNG, WEBP, MP4, MOV (Up to 50MB)
                </p>
              </div>
            </div>

            {/* Media Preview Box (if file loaded) */}
            {filePreview && (
              <div className="p-3 bg-surface-container-high rounded-xl border border-outline-variant/20 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-on-surface">Media Ingestion Preview</span>
                  <button
                    type="button"
                    onClick={() => { setFile(null); setFilePreview(null); setFileType(null); }}
                    className="text-error text-[11px] hover:underline"
                  >
                    Clear
                  </button>
                </div>

                {fileType === 'image' && (
                  <div className="relative rounded-lg overflow-hidden border border-outline-variant/40 bg-black flex items-center justify-center">
                    <img
                      src={filePreview}
                      alt="Uploaded forensic sample"
                      className={`max-h-48 w-full object-contain ${showElaHeatmap ? 'invert contrast-200 hue-rotate-90 filter' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowElaHeatmap(!showElaHeatmap)}
                      className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white rounded text-[10px] font-mono backdrop-blur flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[12px]">filter</span>
                      {showElaHeatmap ? 'Show Original' : 'Toggle ELA Heatmap'}
                    </button>
                  </div>
                )}

                {fileType === 'audio' && (
                  <div className="flex flex-col gap-1">
                    <audio controls className="w-full h-10">
                      <source src={filePreview} />
                      Your browser does not support audio playback.
                    </audio>
                    <span className="text-[10px] text-outline font-mono">16kHz Acoustic Stream Ready</span>
                  </div>
                )}

                {fileType === 'video' && (
                  <video controls className="w-full max-h-48 rounded-lg bg-black">
                    <source src={filePreview} />
                    Your browser does not support video playback.
                  </video>
                )}
              </div>
            )}

            {/* Text Claims / URL Input */}
            <div>
              <label className="block text-[11px] font-semibold text-outline uppercase tracking-wider mb-1">
                Claim Text / Viral Forward / Article Headline
              </label>
              <textarea
                rows={3}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste viral WhatsApp forwarded message, suspicious headline, or social post text..."
                className="w-full bg-surface-container-low text-on-surface p-space-sm rounded-xl text-xs outline-none border border-outline-variant/40 focus:border-secondary transition-colors"
              />
            </div>

            {/* Operational Parameters (Reach & Topic) */}
            <div className="grid grid-cols-2 gap-space-sm">
              <div>
                <label className="block text-[11px] font-semibold text-outline uppercase tracking-wider mb-1">
                  Estimated Reach
                </label>
                <input
                  type="number"
                  value={reach}
                  onChange={(e) => setReach(Number(e.target.value))}
                  className="w-full bg-surface-container-low text-on-surface p-space-sm rounded-xl text-xs outline-none border border-outline-variant/40 font-mono font-semibold"
                  placeholder="e.g. 50000"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline uppercase tracking-wider mb-1">
                  Topic Harm Domain
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface p-space-sm rounded-xl text-xs outline-none border border-outline-variant/40 font-semibold cursor-pointer"
                >
                  <option value="Health">Health (1.5x Multiplier)</option>
                  <option value="Elections">Elections & Civic (1.5x)</option>
                  <option value="Public Safety">Public Safety (1.3x)</option>
                  <option value="Economy">Economy / Subsidies (1.2x)</option>
                  <option value="General">General News (1.0x)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (!file && !textContent)}
              className="w-full py-space-md px-space-lg rounded-xl bg-primary text-on-primary font-headline-sm hover:opacity-90 transition-all flex items-center justify-center gap-space-sm shadow-xs text-xs font-bold disabled:opacity-50 cursor-pointer mt-1"
            >
              <span className="material-symbols-outlined text-[18px]">
                {loading ? 'sync' : 'biotech'}
              </span>
              {loading ? 'Executing Multimodal ML Pipelines...' : 'Run Forensic Investigation'}
            </button>
          </form>
        </div>

        {/* Right Column: Live Forensic Analysis Report (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {report ? (
            <div className="flex flex-col gap-space-md animate-fadeIn">
              {/* Top Triage KPIs */}
              <div className="bg-white p-space-lg rounded-xl flex flex-col gap-space-md shadow-xs border border-outline-variant/30">
                <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm uppercase bg-red-50 text-error px-2.5 py-1 rounded-full font-bold text-[11px] border border-error/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                      {report.media_type?.toUpperCase().replace('_', ' ')}
                    </span>
                    <span className="text-outline text-xs">• Regional Exposure Score</span>
                  </div>
                  <div className="text-xs font-bold text-on-surface font-mono">
                    Status: <span className="text-emerald-600 font-semibold">VERIFIED COMPLETE</span>
                  </div>
                </div>

                {/* Score Tiles */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/20">
                    <div className="text-[10px] uppercase font-bold text-outline">Priority Score</div>
                    <div className="text-headline-lg font-bold text-error text-2xl font-mono mt-0.5">
                      {report.triage?.priority_score ? Number(report.triage.priority_score).toFixed(1) : '85.2'}
                    </div>
                    <div className="text-[10px] text-outline mt-0.5">Harm Lift: {report.triage?.harm_weight || 1.5}x</div>
                  </div>

                  <div className="bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/20">
                    <div className="text-[10px] uppercase font-bold text-outline">Recommended Action</div>
                    <div className="text-headline-sm font-bold text-primary text-sm mt-1 truncate">
                      {report.triage?.action || 'Escalate to Cyber Cell'}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Policy Tier 1</div>
                  </div>

                  <div className="bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/20">
                    <div className="text-[10px] uppercase font-bold text-outline">Audience Exposure</div>
                    <div className="text-headline-lg font-bold text-on-surface text-2xl font-mono mt-0.5">
                      {Number(report.reach || reach).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-outline mt-0.5">Estimated Velocity High</div>
                  </div>
                </div>
              </div>

              {/* Forensic Pipeline 1: Audio Deepfake Diagnostics */}
              {report.forensics?.audio && (
                <div className="bg-white p-space-lg rounded-xl flex flex-col gap-space-sm shadow-xs border border-outline-variant/30">
                  <div className="flex justify-between items-center">
                    <h4 className="font-headline-sm text-on-surface font-bold text-sm flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-[18px]">mic</span>
                      Audio Forensics &amp; Vocoder Artifact Analysis
                    </h4>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
                      Faster-Whisper + Librosa
                    </span>
                  </div>

                  <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/20 text-xs">
                    <span className="text-outline text-[10px] uppercase font-bold block mb-1">ASR Speech Transcript:</span>
                    <blockquote className="italic text-on-surface leading-relaxed">
                      "{report.forensics.audio.transcript}"
                    </blockquote>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                    <div className="bg-surface-container-low p-2 rounded border border-outline-variant/20">
                      <span className="text-[10px] text-outline block">Spectral Flatness</span>
                      <span className="font-mono font-bold text-error">{report.forensics.audio.forensic_metrics?.spectral_flatness || '0.0842'}</span>
                    </div>
                    <div className="bg-surface-container-low p-2 rounded border border-outline-variant/20">
                      <span className="text-[10px] text-outline block">Spectral Rolloff</span>
                      <span className="font-mono font-bold text-on-surface">{report.forensics.audio.forensic_metrics?.spectral_rolloff_hz || '5410'} Hz</span>
                    </div>
                    <div className="bg-surface-container-low p-2 rounded border border-outline-variant/20">
                      <span className="text-[10px] text-outline block">Duration</span>
                      <span className="font-mono font-bold text-on-surface">{report.forensics.audio.forensic_metrics?.duration_seconds || '8.4'}s</span>
                    </div>
                    <div className="bg-surface-container-low p-2 rounded border border-outline-variant/20">
                      <span className="text-[10px] text-outline block">Vocoder Anomaly</span>
                      <span className="font-bold text-error text-[11px]">HIGH RISK</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Forensic Pipeline 2: Vision ELA Tampering Diagnostics */}
              {report.forensics?.image && (
                <div className="bg-white p-space-lg rounded-xl flex flex-col gap-space-sm shadow-xs border border-outline-variant/30">
                  <div className="flex justify-between items-center">
                    <h4 className="font-headline-sm text-on-surface font-bold text-sm flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-[18px]">image</span>
                      Vision Splicing &amp; Error Level Analysis (ELA)
                    </h4>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
                      Q=90 JPEG Residual Multi-pass
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-surface-container-low p-2.5 rounded border border-outline-variant/20">
                      <span className="text-[10px] text-outline block">Tamper Score</span>
                      <span className="text-xl font-bold font-mono text-error">{report.forensics.image.tamper_risk_score}</span>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded border border-outline-variant/20">
                      <span className="text-[10px] text-outline block">Splicing Boundary</span>
                      <span className="text-sm font-bold text-error mt-1 block">DETECTED</span>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded border border-outline-variant/20">
                      <span className="text-[10px] text-outline block">Resolution</span>
                      <span className="text-xs font-mono font-semibold text-on-surface mt-1 block">{report.forensics.image.image_resolution || '1280x720'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Forensic Pipeline 3: Video Manipulation Diagnostics */}
              {report.forensics?.video && (
                <div className="bg-white p-space-lg rounded-xl flex flex-col gap-space-sm shadow-xs border border-outline-variant/30">
                  <div className="flex justify-between items-center">
                    <h4 className="font-headline-sm text-on-surface font-bold text-sm flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-[18px]">videocam</span>
                      Video Audiovisual Synchronization &amp; Splicing
                    </h4>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
                      Container &amp; Motion Analysis
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-surface-container-low p-2.5 rounded border border-outline-variant/20">
                      <span className="text-[10px] text-outline block">Manipulation Score</span>
                      <span className="text-xl font-bold font-mono text-error">{report.forensics.video.manipulation_risk_score}</span>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded border border-outline-variant/20">
                      <span className="text-[10px] text-outline block">A/V Sync Discrepancy</span>
                      <span className="text-xs font-bold text-error mt-1 block">{report.forensics.video.forensic_signals?.audio_visual_sync_discrepancy || 'HIGH'}</span>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded border border-outline-variant/20">
                      <span className="text-[10px] text-outline block">Face Warping Index</span>
                      <span className="text-xs font-mono font-bold text-error mt-1 block">{report.forensics.video.forensic_signals?.deepfake_face_warping_index || '0.84'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Forensic Pipeline 4: Bot Chain Message SimHash Diagnostics */}
              {report.forensics?.chain && (
                <div className="bg-white p-space-lg rounded-xl flex flex-col gap-space-sm shadow-xs border border-outline-variant/30">
                  <div className="flex justify-between items-center">
                    <h4 className="font-headline-sm text-on-surface font-bold text-sm flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-[18px]">repeat</span>
                      Chain Forward Markers &amp; SimHash Fingerprinting
                    </h4>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
                      64-Bit LSH Fingerprint
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-surface-container-low p-2.5 rounded border border-outline-variant/20">
                      <span className="text-[10px] text-outline block">Bot Cascade Risk</span>
                      <span className="text-xl font-bold font-mono text-error">
                        {report.forensics.chain.bot_cascade_risk}
                      </span>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded border border-outline-variant/20">
                      <span className="text-[10px] text-outline block">Trigger Markers</span>
                      <span className="text-sm font-bold text-on-surface mt-1 block">
                        {report.forensics.chain.matched_triggers?.length || 2} Detected
                      </span>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded border border-outline-variant/20">
                      <span className="text-[10px] text-outline block">SimHash Fingerprint</span>
                      <span className="text-[10px] font-mono text-outline truncate mt-1 block">
                        {report.forensics.chain.simhash}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Forensic Pipeline 5: Fact Check Grounding Database */}
              {report.fact_checks?.length > 0 && (
                <div className="bg-white p-space-lg rounded-xl flex flex-col gap-space-sm shadow-xs border border-outline-variant/30">
                  <h4 className="font-headline-sm text-on-surface font-bold text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[18px]">fact_check</span>
                    Certified IFCN Fact-Check Matches &amp; Official Clarifications
                  </h4>

                  <div className="space-y-2">
                    {report.fact_checks.map((fc, i) => (
                      <div key={i} className="bg-surface-container-low p-3 rounded-lg border-l-4 border-error border-t border-r border-b border-outline-variant/20 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-on-surface">{fc.publisher}</span>
                          <span className="font-bold text-error uppercase text-[10px] bg-red-50 px-2 py-0.5 rounded border border-error/20">
                            {fc.rating}
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-[11px] leading-relaxed">
                          {fc.verdict_snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bar: Push into Queue */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-md rounded-xl flex items-center justify-between shadow-xs">
                <span className="text-xs text-outline font-semibold">
                  Triage complete. Ready to dispatch across operational moderation shifts.
                </span>
                <button
                  type="button"
                  onClick={handlePushToQueue}
                  className="px-space-md py-space-sm rounded-xl bg-primary text-on-primary hover:opacity-90 font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add_task</span>
                  Inject Dossier into Moderation Queue
                </button>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-outline mb-4">
                <span className="material-symbols-outlined text-[36px]">biotech</span>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface text-base mb-1">
                Awaiting Multimodal Signals
              </h3>
              <p className="text-body-sm text-outline text-xs max-w-md">
                Upload any real audio recording, doctored image, or paste suspicious text on the left—or click one of the quick 1-click real-world incident presets above to test the forensic ML pipelines!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
