from backend.app.routers.claims import router as claims_router
from backend.app.routers.queue import router as queue_router
from backend.app.routers.sources import router as sources_router
from backend.app.routers.audit import router as audit_router
from backend.app.routers.overview import router as overview_router
from backend.app.routers.investigation import router as investigation_router

__all__ = [
    "claims_router",
    "queue_router",
    "sources_router",
    "audit_router",
    "overview_router",
    "investigation_router",
]

