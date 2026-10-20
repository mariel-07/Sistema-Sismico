from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes.database import router as database_router
from app.api.routes.events import router as events_router
from app.api.routes.sources import router as sources_router
from app.api.routes.ingestion import router as ingestion_router
from app.api.routes.datasets import router as datasets_router
from app.api.routes.alerts import router as alerts_router
from app.api.routes.ml import router as ml_router
from app.api.routes.security import router as security_router

app = FastAPI(
    title=settings.APP_NAME or "SEPMS",
    version=settings.APP_VERSION or "2.0.0",
    description=(
        "Sistema Empresarial de Predicción y Monitoreo Sísmico "
        "(SEPMS). Plataforma para monitoreo, análisis histórico, "
        "Machine Learning experimental y gestión responsable de alertas."
    ),
)

# Configuración robusta de CORS compatible con cualquier URL de Vercel y local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite origen amplio de forma segura para la nube
    allow_credentials=False,  # Debe ser False cuando allow_origins es ["*"] para evitar bloqueos de navegador
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    database_router,
    prefix=settings.API_V1_PREFIX,
)
app.include_router(
    events_router,
    prefix=settings.API_V1_PREFIX,
)
app.include_router(
    sources_router,
    prefix=settings.API_V1_PREFIX,
)
app.include_router(
    ingestion_router,
    prefix=settings.API_V1_PREFIX,
)
app.include_router(
    datasets_router,
    prefix=settings.API_V1_PREFIX,
)
app.include_router(alerts_router, prefix=settings.API_V1_PREFIX)
app.include_router(ml_router, prefix=settings.API_V1_PREFIX)
app.include_router(security_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "application": settings.APP_NAME or "SEPMS",
        "version": settings.APP_VERSION or "2.0.0",
        "environment": settings.ENVIRONMENT or "production",
        "status": "online",
    }


@app.get("/api/v1/status")
def status():
    return {
        "status": "ok",
        "service": "SEPMS API",
        "database": "configured",
    }
