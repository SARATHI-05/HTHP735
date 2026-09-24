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

@router.post("/{claim_id}/action", response_model=ModeratorActionResponse)
def submit_moderator_verdict(claim_id: str, action_req: ModeratorActionRequest):
    """
    Submits a human reviewer verdict (`VERIFIED_MISLEADING`, `VERIFIED_TRUE`, `ESCALATE`, `DISMISS`),
    updates queue item status, and logs an immutable audit entry to JSONL ledger.
    """
    try:
        res = triage_service.record_action(
            claim_id=claim_id,
            reviewer_id=action_req.reviewer_id,
            verdict=action_req.verdict,
            notes=action_req.reviewer_notes,
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record action: {str(e)}")
