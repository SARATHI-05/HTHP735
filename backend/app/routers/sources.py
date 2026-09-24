from fastapi import APIRouter, HTTPException
from backend.app.schemas.source import SourceTrendsResponse
from backend.app.services.triage_service import triage_service

router = APIRouter(prefix="/sources", tags=["Sources & Trends"])

@router.get("/trends", response_model=SourceTrendsResponse)
def get_source_credibility_trends():
    """
    Returns rolling 7-day EWMA misinformation rates across 30 operational days
    and flags sources exhibiting rapid degradation anomaly spikes (> 2.0 sigma).
    """
    try:
        return triage_service.get_source_trends()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch source trends: {str(e)}")
