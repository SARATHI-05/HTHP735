from typing import Any, Dict
from fastapi import APIRouter, HTTPException
from backend.app.services.triage_service import triage_service

router = APIRouter(prefix="/overview", tags=["System Overview"])

@router.get("")
def get_system_overview() -> Dict[str, Any]:
    """
    Returns real-time regional misinformation surveillance telemetry,
    key metrics bento grid, district breakdown, and vector compositions.
    """
    try:
        return triage_service.get_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch overview: {str(e)}")
