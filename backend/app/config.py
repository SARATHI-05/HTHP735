from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Evidence-Grounded Misinformation Triage API"
    VERSION: str = "1.4.0"
    API_V1_STR: str = "/api/v1"
    
    # Root paths
    ROOT_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = ROOT_DIR / "data"
    PROCESSED_DIR: Path = DATA_DIR / "processed"
    MODELS_DIR: Path = ROOT_DIR / "models"
    AUDIT_LOG_PATH: Path = DATA_DIR / "audit_log.jsonl"
    
    # Operational thresholds
    DEFAULT_CAPACITY: int = 20
    ESCALATE_P_THRESH: float = 0.80
    ESCALATE_REACH_THRESH: float = 0.80
    WAITLIST_P_THRESH: float = 0.50
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8501",
    ]

    class Config:
        case_sensitive = True

settings = Settings()
