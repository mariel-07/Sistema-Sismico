
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.db.session import SessionLocal, engine


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "API del Sistema Empresarial de Predicción "
        "y Monitoreo Sísmico (SEPMS)."
    ),
    debug=settings.DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Sistema"])
def root() -> dict[str, str]:
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "message": "API SEPMS disponible",
        "docs": "/docs",
    }


@app.get(f"{settings.API_V1_PREFIX}/health", tags=["Sistema"])
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "SEPMS API",
    }


@app.get(f"{settings.API_V1_PREFIX}/system/status", tags=["Sistema"])
def system_status() -> dict[str, str]:
    if engine is None or SessionLocal is None:
        return {
            "api": "ok",
            "database": "not_configured",
            "message": "Configura DATABASE_URL en backend/.env",
        }

    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))

        return {
            "api": "ok",
            "database": "connected",
        }

    except Exception as exc:
        # El detalle técnico se registra en el servidor, no se expone
        # al cliente porque podría contener información sensible.
        print(f"Error de conexión a la base de datos: {type(exc).__name__}")

        raise HTTPException(
            status_code=503,
            detail="No se pudo conectar con la base de datos.",
        ) from exc
