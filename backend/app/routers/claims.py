from typing import Any, Dict
from fastapi import APIRouter, HTTPException
from backend.app.schemas.claim import ClaimTriageRequest, ClaimTriageResponse
from backend.app.services.triage_service import triage_service

router = APIRouter(prefix="/claims", tags=["Claims"])

@router.post("/triage", response_model=ClaimTriageResponse)
def triage_single_claim(request: ClaimTriageRequest):
    """
    Evaluates a single claim in real time:
    - Extracts 14-D multi-signal features
    - Computes calibrated risk probability
    - Calculates local TreeSHAP attributions
    - Performs dense semantic evidence retrieval
    - Assigns multi-factor priority score & action policy
    """
    try:
        result = triage_service.triage_custom_claim(
            statement=request.statement,
            speaker=request.speaker,
            venue=request.venue or "social_media",
            subject=request.subject,
            estimated_reach=request.estimated_reach,
            days_in_queue=request.days_in_queue,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Triage pipeline failed: {str(e)}")

@router.get("/{claim_id}")
def get_claim_detail(claim_id: str) -> Dict[str, Any]:
    """Retrieves deep SHAP attributions, metadata, and ground truth for a specific claim."""
    detail = triage_service.get_claim_detail(claim_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Claim ID '{claim_id}' not found in index.")
    return {"status": "success", "claim": detail}
