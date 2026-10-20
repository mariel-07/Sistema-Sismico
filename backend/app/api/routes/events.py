from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.seismic_event import SeismicEvent
from app.schemas.seismic_event import SeismicEventResponse


router = APIRouter(
    prefix="/events",
    tags=["Seismic Events"],
)


@router.get("/", response_model=list[SeismicEventResponse])
def list_events(
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    min_magnitude: float | None = Query(default=None, ge=0),
    max_magnitude: float | None = Query(default=None, ge=0),
    start: datetime | None = None,
    end: datetime | None = None,
    db: Session = Depends(get_db),
):
    if start and end and start > end:
        raise HTTPException(
            status_code=400,
            detail="La fecha inicial no puede ser posterior a la fecha final.",
        )

    if (
        min_magnitude is not None
        and max_magnitude is not None
        and min_magnitude > max_magnitude
    ):
        raise HTTPException(
            status_code=400,
            detail="La magnitud mínima no puede ser mayor que la máxima.",
        )

    query = select(SeismicEvent)

    if min_magnitude is not None:
        query = query.where(
            SeismicEvent.magnitude >= min_magnitude
        )

    if max_magnitude is not None:
        query = query.where(
            SeismicEvent.magnitude <= max_magnitude
        )

    if start is not None:
        query = query.where(
            SeismicEvent.origin_time_utc >= start
        )

    if end is not None:
        query = query.where(
            SeismicEvent.origin_time_utc <= end
        )

    query = (
        query
        .order_by(SeismicEvent.origin_time_utc.desc())
        .offset(offset)
        .limit(limit)
    )

    return db.scalars(query).all()


@router.get("/recent", response_model=list[SeismicEventResponse])
def recent_events(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = (
        select(SeismicEvent)
        .order_by(SeismicEvent.origin_time_utc.desc())
        .limit(limit)
    )

    return db.scalars(query).all()


@router.get("/map", response_model=list[SeismicEventResponse])
def map_events(
    min_magnitude: float | None = Query(default=None, ge=0),
    limit: int = Query(default=5000, ge=1, le=10000),
    db: Session = Depends(get_db),
):
    query = select(SeismicEvent)

    if min_magnitude is not None:
        query = query.where(
            SeismicEvent.magnitude >= min_magnitude
        )

    query = (
        query
        .order_by(SeismicEvent.origin_time_utc.desc())
        .limit(limit)
    )

    return db.scalars(query).all()


@router.get("/statistics")
def event_statistics(
    start: datetime | None = None,
    end: datetime | None = None,
    db: Session = Depends(get_db),
):
    if start and end and start > end:
        raise HTTPException(
            status_code=400,
            detail="La fecha inicial no puede ser posterior a la fecha final.",
        )

    filters = []

    if start is not None:
        filters.append(
            SeismicEvent.origin_time_utc >= start
        )

    if end is not None:
        filters.append(
            SeismicEvent.origin_time_utc <= end
        )

    total = db.scalar(
        select(func.count(SeismicEvent.id)).where(*filters)
    )

    maximum = db.scalar(
        select(func.max(SeismicEvent.magnitude)).where(*filters)
    )

    average = db.scalar(
        select(func.avg(SeismicEvent.magnitude)).where(*filters)
    )

    average_depth = db.scalar(
        select(func.avg(SeismicEvent.depth_km)).where(*filters)
    )

    return {
        "total_events": total or 0,
        "maximum_magnitude": maximum,
        "average_magnitude": average,
        "average_depth_km": average_depth,
    }


@router.get("/{event_id}", response_model=SeismicEventResponse)
def get_event(
    event_id: UUID,
    db: Session = Depends(get_db),
):
    event = db.get(SeismicEvent, event_id)

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el evento sísmico.",
        )

    return event