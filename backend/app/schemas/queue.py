from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class QueueItemSummary(BaseModel):
    rank: int
    claim_id: str
    statement: str
    speaker: str
    subject: str
    calibrated_risk: float
    estimated_reach: int
    priority_score: float
    action_tier: str
    action_reason: str
    status: str
    is_source_volatile: bool = False
    harm_topic_weight: float = 1.0
    days_waiting: int = 0
    top_group: Optional[str] = None
    rationale: Optional[str] = None

class QueueResponse(BaseModel):
    total_ingested_claims: int
    daily_capacity_limit: int
    capacity_utilization_pct: float
    estimated_harm_mitigated_pct: float
    escalated_count: int
    reviewed_count: int
    pending_count: int
    items: List[QueueItemSummary]

class ModeratorActionRequest(BaseModel):
    reviewer_id: str = Field(..., description="Analyst session username")
    verdict: str = Field(..., description="VERIFIED_MISLEADING, VERIFIED_TRUE, ESCALATE, DISMISS")
    reviewer_notes: Optional[str] = Field(None, max_length=1000)

class ModeratorActionResponse(BaseModel):
    status: str = "success"
    log_id: str
    claim_id: str
    recorded_at: str
    updated_status: str
    remaining_daily_capacity: int
