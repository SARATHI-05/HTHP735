from typing import Any, List, Optional
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
    id: Optional[str] = None
    initials: Optional[str] = None
    name: str
    domain: Optional[str] = None
    region: Optional[str] = None
    score: Optional[float] = None
    trend: Optional[str] = None
    status: Optional[str] = None
    status_style: Optional[str] = None
    platform: Optional[str] = None
    channels: Optional[str] = None
    reach: Optional[str] = None
    trust_index: Optional[float] = None
    badge_color: Optional[str] = None

class NarrativeTagItem(BaseModel):
    tag: Optional[str] = None
    name: Optional[str] = None
    count: Optional[Any] = None
    risk: Optional[str] = None
    isAlert: Optional[bool] = None

class SourceTrendsResponse(BaseModel):
    active_sources_tracked: int
    monitored_domains: Optional[Any] = 342
    monitored_delta: Optional[str] = None
    avg_trust_index: Optional[Any] = 68.4
    trust_index_delta: Optional[str] = None
    active_spikes_count: Optional[Any] = 7
    spikes_label: Optional[str] = None
    flagged_networks_count: Optional[Any] = 3
    networks_label: Optional[str] = None
    trends: List[SourceTrendPoint]
    alerts: List[SourceAlertItem]
    domain_narrative_tags: Optional[List[NarrativeTagItem]] = []
    publisher_directory: Optional[List[PublisherDirectoryItem]] = []
