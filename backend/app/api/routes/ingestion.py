from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter(prefix="/ingestion-runs", tags=["Ingestion History"])


@router.get("/")
def list_ingestion_runs(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    status: str | None = None,
    db: Session = Depends(get_db),
):
    allowed_statuses = {"pending", "running", "success", "partial", "failed"}
    if status is not None and status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="El estado de importación no es válido.")

    rows = db.execute(text("""
        SELECT i.id, i.data_source_id, s.name AS source_name,
               i.started_at, i.finished_at, i.status,
               i.records_received, i.records_inserted, i.records_updated,
               i.records_duplicated, i.records_rejected,
               i.error_message AS error_details,
               i.execution_metadata, i.created_at,
               CASE WHEN i.finished_at IS NOT NULL
                    THEN EXTRACT(EPOCH FROM (i.finished_at - i.started_at))
                    ELSE NULL END AS duration_seconds
        FROM ingestion_runs i
        LEFT JOIN data_sources s ON s.id = i.data_source_id
        WHERE (:status IS NULL OR i.status = :status)
        ORDER BY i.created_at DESC
        LIMIT :limit OFFSET :offset
    """), {
        "status": status,
        "limit": limit,
        "offset": offset,
    }).mappings().all()

    return [dict(row) for row in rows]


@router.get("/{run_id}")
def get_ingestion_run(run_id: UUID, db: Session = Depends(get_db)):
    row = db.execute(text("""
        SELECT i.id, i.data_source_id, s.name AS source_name,
               i.started_at, i.finished_at, i.status,
               i.records_received, i.records_inserted, i.records_updated,
               i.records_duplicated, i.records_rejected,
               i.error_message AS error_details,
               i.execution_metadata, i.created_at,
               CASE WHEN i.finished_at IS NOT NULL
                    THEN EXTRACT(EPOCH FROM (i.finished_at - i.started_at))
                    ELSE NULL END AS duration_seconds
        FROM ingestion_runs i
        LEFT JOIN data_sources s ON s.id = i.data_source_id
        WHERE i.id = :run_id
    """), {"run_id": run_id}).mappings().first()

    if row is None:
        raise HTTPException(status_code=404, detail="Ejecución no encontrada")

    return dict(row)
