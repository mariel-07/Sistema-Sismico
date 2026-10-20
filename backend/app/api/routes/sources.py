from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter(prefix="/sources", tags=["Data Sources"])


class SourceCreate(BaseModel):
    name: str = Field(min_length=3, max_length=150)
    organization: str | None = None
    source_type: str = Field(default="catalog", max_length=50)
    base_url: HttpUrl | None = None
    description: str | None = None
    license_info: str | None = None
    is_active: bool = True


class SourceStatusUpdate(BaseModel):
    is_active: bool


@router.get("/")
def list_sources(db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT ds.id, ds.name, ds.organization, ds.source_type,
               ds.base_url, ds.description, ds.license_info,
               ds.is_active, ds.last_success_at, ds.last_failure_at,
               ds.last_latency_ms, ds.created_at, ds.updated_at,
               (SELECT COUNT(*) FROM ingestion_runs i
                WHERE i.data_source_id = ds.id) AS total_runs,
               (SELECT i.status FROM ingestion_runs i
                WHERE i.data_source_id = ds.id
                ORDER BY i.created_at DESC LIMIT 1) AS last_sync_status,
               (SELECT i.finished_at FROM ingestion_runs i
                WHERE i.data_source_id = ds.id
                ORDER BY i.created_at DESC LIMIT 1) AS last_sync
        FROM data_sources ds
        ORDER BY ds.name
    """)).mappings().all()
    return [dict(row) for row in rows]


@router.post("/")
def create_source(source: SourceCreate, db: Session = Depends(get_db)):
    row = db.execute(text("""
        INSERT INTO data_sources
            (name, organization, source_type, base_url, description,
             license_info, is_active)
        VALUES
            (:name, :organization, :source_type, :base_url, :description,
             :license_info, :is_active)
        RETURNING id, name, organization, source_type, base_url,
                  description, license_info, is_active, created_at, updated_at
    """), {
        "name": source.name,
        "organization": source.organization,
        "source_type": source.source_type,
        "base_url": str(source.base_url) if source.base_url else None,
        "description": source.description,
        "license_info": source.license_info,
        "is_active": source.is_active,
    }).mappings().first()
    db.commit()
    return dict(row)


@router.patch("/{source_id}")
def update_source_status(
    source_id: str,
    payload: SourceStatusUpdate,
    db: Session = Depends(get_db),
):
    row = db.execute(text("""
        UPDATE data_sources
        SET is_active = :is_active, updated_at = NOW()
        WHERE id = CAST(:source_id AS uuid)
        RETURNING id, name, is_active
    """), {"source_id": source_id, "is_active": payload.is_active}).mappings().first()
    if row is None:
        db.rollback()
        raise HTTPException(status_code=404, detail="Fuente no encontrada")
    db.commit()
    return dict(row)
