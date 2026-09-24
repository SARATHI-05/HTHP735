from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class ClaimTriageRequest(BaseModel):
    statement: str = Field(..., min_length=5, max_length=2000, description="Raw claim statement text")
    speaker: str = Field(..., min_length=1, max_length=128, description="Speaker or publishing domain")
    venue: Optional[str] = Field("General / Unspecified", max_length=128)
    subject: str = Field("general", max_length=64)
    estimated_reach: int = Field(5000, ge=1, le=100_000_000, description="Estimated audience exposure impressions")
    days_in_queue: int = Field(0, ge=0, le=365)

class RetrievedEvidenceItem(BaseModel):
    reference_id: str
    authority: str
    snippet: str
    cosine_similarity: float
    nli_label: str
    nli_contradiction_score: float

class ShapAttributionItem(BaseModel):
    feature: str
    attribution: str
    value: Any

class ShapExplanation(BaseModel):
    base_value: float
    top_positive_drivers: List[ShapAttributionItem]
    top_negative_drivers: List[ShapAttributionItem]

class ClaimTriageResponse(BaseModel):
    status: str = "success"
    claim_id: str
    statement: str
    speaker: str
    calibrated_risk: float
    risk_tier: str
    estimated_reach: int
    priority_score: float
    action_recommendation: str
    harm_multiplier: float
    aging_multiplier: float
    shap_explanation: ShapExplanation
    retrieved_evidence: List[RetrievedEvidenceItem]
    plain_english_rationale: str
