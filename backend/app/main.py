import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.routers import (
    audit_router,
    claims_router,
    overview_router,
    queue_router,
    sources_router,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production RESTful API for the Evidence-Grounded Misinformation Triage System. "
        "Provides capacity-constrained queue prioritization, TreeSHAP explainability, "
        "semantic evidence grounding, and source volatility tracking."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS configuration - Allow all local dev and browser origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request latency middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    return response

# Liveness & Readiness Probes
@app.get("/healthz", tags=["Health"])
@app.get("/livez", tags=["Health"])
def healthcheck():
    """Liveness probe returning 200 OK when API is healthy."""
    return {
        "status": "HEALTHY",
        "service": "misinfo-triage-fastapi",
        "version": settings.VERSION,
    }

@app.get("/readyz", tags=["Health"])
def readiness():
    """Readiness probe verifying that models and parquet caches are accessible."""
    models_ready = (settings.MODELS_DIR / "model.joblib").exists()
    processed_ready = (settings.PROCESSED_DIR / "explanations.parquet").exists()
    
    if models_ready and processed_ready:
        return {"status": "READY", "models_loaded": True, "data_loaded": True}
    return JSONResponse(
        status_code=503,
        content={"status": "DEGRADED", "models_loaded": models_ready, "data_loaded": processed_ready},
    )

# Register versioned API routers
app.include_router(overview_router, prefix=settings.API_V1_STR)
app.include_router(claims_router, prefix=settings.API_V1_STR)
app.include_router(queue_router, prefix=settings.API_V1_STR)
app.include_router(sources_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
