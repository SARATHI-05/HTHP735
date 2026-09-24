from fastapi import APIRouter, HTTPException
from backend.app.schemas.audit import AuditMetricsResponse
from backend.app.services.triage_service import triage_service

router = APIRouter(prefix="/audit", tags=["Regulatory Audit & Quality"])

@router.get("/metrics", response_model=AuditMetricsResponse)
def get_audit_and_compliance_metrics():
    """
    Returns quantitative model quality evaluation (AUC, PR, Brier, ECE)
    and subject-level fairness matrices for EU DSA Article 34 compliance audits.
    """
    try:
        return triage_service.get_audit_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch audit metrics: {str(e)}")
