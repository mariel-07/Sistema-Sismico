
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    """Clase base para los modelos SQLAlchemy de SEPMS."""


engine: Engine | None = None
SessionLocal: sessionmaker[Session] | None = None

if settings.DATABASE_URL:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=1800,
    )

    SessionLocal = sessionmaker(
        bind=engine,
        autoflush=False,
        autocommit=False,
        expire_on_commit=False,
    )


def get_db() -> Generator[Session, None, None]:
    """Entrega una sesión de base de datos a cada endpoint."""
    if SessionLocal is None:
        raise RuntimeError(
            "Base de datos no configurada. "
            "Define DATABASE_URL en el archivo backend/.env."
        )

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
