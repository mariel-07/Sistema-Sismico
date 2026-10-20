from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db


router = APIRouter(
    prefix="/database",
    tags=["Database"],
)


@router.get("/health")
def database_health(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1"))
    value = result.scalar()

    return {
        "status": "ok",
        "database": "PostgreSQL - Supabase",
        "connection": value == 1,
    }