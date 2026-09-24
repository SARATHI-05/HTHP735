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

class PublisherDirectoryItem(BaseModel):
    id: str
    name: str
    platform: str
    channels: str
    reach: str
    trust_index: float
    status: str
    badge_color: str

class NarrativeTagItem(BaseModel):
    name: str
    count: int
    risk: str

class SourceTrendsResponse(BaseModel):
    active_sources_tracked: int
    monitored_domains: Optional[int] = 342
    avg_trust_index: Optional[float] = 68.4
    active_spikes_count: Optional[int] = 7
    flagged_networks_count: Optional[int] = 3
    trends: List[SourceTrendPoint]
    alerts: List[SourceAlertItem]
    domain_narrative_tags: Optional[List[NarrativeTagItem]] = []
    publisher_directory: Optional[List[PublisherDirectoryItem]] = []
