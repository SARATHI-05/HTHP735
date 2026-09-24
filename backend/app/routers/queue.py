from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.app.schemas.queue import (
    ModeratorActionRequest,
    ModeratorActionResponse,
    QueueResponse,
)
from backend.app.services.triage_service import triage_service

router = APIRouter(prefix="/queue", tags=["Moderation Queue"])

@router.get("", response_model=QueueResponse)
def get_moderation_queue(
    capacity: int = Query(20, ge=5, le=100, description="Daily human review capacity quota"),
    day: int = Query(30, ge=1, le=30, description="Operational timeline day"),
    action_tier: Optional[str] = Query(None, description="ESCALATE, REVIEW, WAITLIST, DEPRIORITIZE, or All"),
    subject: Optional[str] = Query(None, description="Topic filter"),
    status: Optional[str] = Query(None, description="Pending, Resolved, or All"),
    q: Optional[str] = Query(None, description="Search keyword in statement or speaker"),
):
    """
    Retrieves the exposure-optimized moderation queue partitioned strictly at capacity limit K.
    """
    try:
        return triage_service.get_queue(
            capacity=capacity,
            day=day,
            action_tier=action_tier,
            subject=subject,
            status=status,
            search_query=q,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve queue: {str(e)}")

@router.post("/action", response_model=ModeratorActionResponse)
@router.post("/{claim_id}/action", response_model=ModeratorActionResponse)
def submit_moderator_verdict(action_req: ModeratorActionRequest, claim_id: Optional[str] = None):
    """
    Submits a human reviewer verdict (`VERIFIED_MISLEADING`, `VERIFIED_TRUE`, `ESCALATE`, `DISMISS`),
    updates queue item status, and logs an immutable audit entry to JSONL ledger.
    """
    try:
        raw_id = claim_id or action_req.claim_id or "TN-8821"
        target_claim_id = str(raw_id).strip()
        reviewer = action_req.reviewer_id or action_req.moderator_id or "reviewer"
        action_verdict = action_req.verdict or action_req.action or "REVIEWED"
        action_notes = action_req.reviewer_notes or action_req.notes or ""

        res = triage_service.record_action(
            claim_id=target_claim_id,
            reviewer_id=reviewer,
            verdict=action_verdict,
            notes=action_notes,
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record action: {str(e)}")


@router.post("/auto-triage")
@router.post("/auto-moderate")
def auto_moderate_queue_endpoint():
    """
    Executes autonomous GBDT policy triage across all active pending claims in the queue.
    Automatically assigns escalations, fact-check attachments, and deprioritizations.
    """
    try:
        return triage_service.auto_moderate_queue()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-triage execution failed: {str(e)}")

