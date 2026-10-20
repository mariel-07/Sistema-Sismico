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


# ============================================================
# APLICACIÓN FASTAPI
# ============================================================

app = FastAPI(
    title=settings.APP_NAME or "SEPMS",
    version=settings.APP_VERSION or "2.0.0",
    description=(
        "Sistema Empresarial de Predicción y Monitoreo Sísmico "
        "(SEPMS). Plataforma para monitoreo, análisis histórico, "
        "Machine Learning experimental y gestión responsable de alertas."
    ),
)


# ============================================================
# CONFIGURACIÓN CORS
# ============================================================
#
# Permite que el frontend desplegado en Vercel pueda consumir
# correctamente la API desplegada en Render.
#
# IMPORTANTE:
# - No usar allow_origins=["*"] junto con credenciales.
# - Las URLs no deben terminar en "/".
#

ALLOWED_ORIGINS = [
    # --------------------------------------------------------
    # Vercel - URL ACTUAL
    # --------------------------------------------------------
    "https://sistema-sismico-fx9w-22rzbsrhp-mariel-8.vercel.app",

    # --------------------------------------------------------
    # Vercel - URL ANTERIOR
    # --------------------------------------------------------
    "https://sistema-sismico-3l87a88lu-mariel-8.vercel.app",

    # --------------------------------------------------------
    # Desarrollo local
    # --------------------------------------------------------
    "http://localhost:5173",
    "http://localhost:3000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# RUTAS API
# ============================================================

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

app.include_router(
    alerts_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    ml_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    security_router,
    prefix=settings.API_V1_PREFIX,
)


# ============================================================
# RUTA PRINCIPAL
# ============================================================

@app.get("/")
def root():
    return {
        "application": settings.APP_NAME or "SEPMS",
        "version": settings.APP_VERSION or "2.0.0",
        "environment": settings.ENVIRONMENT or "production",
        "status": "online",
    }


# ============================================================
# ESTADO DE LA API
# ============================================================

@app.get("/api/v1/status")
def status():
    return {
        "status": "ok",
        "service": "SEPMS API",
        "database": "configured",
    }