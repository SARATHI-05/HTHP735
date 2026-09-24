from typing import Any, Dict, List
from pydantic import BaseModel

class EvaluationMetrics(BaseModel):
    auc_roc: float
    pr_auc: float
    brier_score: float
    expected_calibration_error_ece: float
    precision_at_20: float
    harm_exposure_mitigated_top20_pct: float

class SubjectFairnessItem(BaseModel):
    subject: str
    sample_size: int
    precision: float
    false_positive_rate: float
    calibration_brier: float
    fairness_status: str

class AuditMetricsResponse(BaseModel):
    model_name: str
    model_version: str
    calibration_method: str
    evaluation_metrics: EvaluationMetrics
    confusion_matrix: Dict[str, int]
    fairness_audit: List[SubjectFairnessItem]
