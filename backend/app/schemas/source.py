from typing import List, Optional
from pydantic import BaseModel

class SourceTrendPoint(BaseModel):
    speaker: str
    day: int
    daily_claims: int
    raw_risk: Optional[float]
    rolling_risk_ewma: Optional[float]
    status: str
    is_alert: bool

class SourceAlertItem(BaseModel):
    speaker: str
    baseline_risk: float
    recent_risk: float
    risk_delta: float
    alert_day: int
    alert_message: str

class SourceTrendsResponse(BaseModel):
    active_sources_tracked: int
    trends: List[SourceTrendPoint]
    alerts: List[SourceAlertItem]
