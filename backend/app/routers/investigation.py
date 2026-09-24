import os
import shutil
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form
from backend.app.services.audio_forensics import AudioForensicsDetector
from backend.app.services.image_forensics import ImageForensicsDetector
from backend.app.services.chain_detector import ChainMessageDetector
from backend.app.services.news_verifier import NewsClaimVerifier
from backend.app.services.triage_service import triage_service

router = APIRouter(tags=["Multimodal Investigation"])

audio_svc = AudioForensicsDetector()
image_svc = ImageForensicsDetector()
chain_svc = ChainMessageDetector()
news_svc = NewsClaimVerifier()

@router.post("/api/investigate/multimodal")
@router.post("/api/v1/investigate/multimodal")
async def investigate_multimodal_content(
    file: Optional[UploadFile] = File(None),
    text_content: Optional[str] = Form(None),
    reach: int = Form(5000),
    topic: str = Form("General"),
):
    """
    Ingests and triages multimodal content (Deepfake Audio, Doctored Images,
    News Articles, Viral Chain Messages) using forensic pipelines and evidence grounding.
    """
    investigation_report = {
        "status": "COMPLETED",
        "reach": reach,
        "topic": topic,
        "media_type": "text_only",
        "forensics": {},
        "fact_checks": [],
        "triage": {},
    }

    claim_for_triage = (text_content or "").strip()

    # 1. Process Uploaded File (Audio or Image)
    if file and file.filename:
        safe_filename = file.filename.replace(" ", "_")
        temp_file = f"temp_{safe_filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        content_type = file.content_type or ""
        lower_name = file.filename.lower()

        if "audio" in content_type or lower_name.endswith((".mp3", ".wav", ".m4a", ".ogg", ".aac")):
            investigation_report["media_type"] = "deepfake_audio"
            audio_res = audio_svc.analyze(temp_file)
            investigation_report["forensics"]["audio"] = audio_res
            if not claim_for_triage:
                claim_for_triage = audio_res.get("transcript", "")
                
        elif "image" in content_type or lower_name.endswith((".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif")):
            investigation_report["media_type"] = "doctored_image"
            img_res = image_svc.analyze(temp_file)
            investigation_report["forensics"]["image"] = img_res

        if os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except Exception:
                pass

    # 2. Process Text Claims & Chain Triggers
    if claim_for_triage:
        chain_res = chain_svc.analyze(claim_for_triage)
        investigation_report["forensics"]["chain"] = chain_res
        if chain_res.get("is_chain_forward") and investigation_report["media_type"] == "text_only":
            investigation_report["media_type"] = "bot_chain_message"
            
        # 3. Query Verified Fact Check Database / Google Fact Check Tools API
        fact_checks = news_svc.query_fact_checks(claim_for_triage)
        investigation_report["fact_checks"] = fact_checks

    # 4. Run Core ML Triage Scoring
    claim_summary = claim_for_triage or "Multimodal Media Forensic Submission"
    triage_result = triage_service.evaluate_claim(claim_summary, reach=reach, topic=topic)
    investigation_report["triage"] = triage_result

    return investigation_report


@router.get("/api/v1/investigate/samples")
def get_sample_investigations():
    """Returns pre-configured multimodal investigation samples for quick demonstrations."""
    return [
        {
            "id": "sample-audio",
            "title": "Voice Note: Madurai Municipal Water Supply Alert",
            "modality": "Deepfake Audio",
            "text": "Alert: Corporation water pipeline in Madurai north has reported chemical contamination. Do not drink.",
            "reach": 42000,
            "topic": "Health",
            "risk": "Critical (89%)"
        },
        {
            "id": "sample-image",
            "title": "Doctored Photo: Flyover Structural Splicing",
            "modality": "Doctored Imagery",
            "text": "Shocking visuals of massive cracks on new flyover within 48 hours of inauguration.",
            "reach": 95000,
            "topic": "Public Safety",
            "risk": "High (94%)"
        },
        {
            "id": "sample-chain",
            "title": "Viral Forward: Magalir Urimai Subsidy Revocation",
            "modality": "Chain Forward",
            "text": "URGENT NOTICE: Forward to all women in Tamil Nadu! Government is canceling bank accounts for Magalir scheme from tomorrow. Share before deleted!",
            "reach": 180000,
            "topic": "Elections / Welfare",
            "risk": "Critical (96%)"
        },
        {
            "id": "sample-news",
            "title": "Fabricated Article: Wireless EVM Connectivity",
            "modality": "Fabricated News",
            "text": "Sensational leak: Coimbatore polling center EVMs detected broadcasting unauthorized Bluetooth signal.",
            "reach": 64000,
            "topic": "Elections",
            "risk": "High (88%)"
        }
    ]
