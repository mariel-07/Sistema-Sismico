from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.seismic_event import SeismicEvent

router = APIRouter(prefix="/datasets", tags=["Data Quality"])


@router.get("/quality")
def get_data_quality(db: Session = Depends(get_db)):
    total = db.scalar(
        select(func.count()).select_from(SeismicEvent)
    ) or 0

    missing_fields = (
        SeismicEvent.external_id,
        SeismicEvent.magnitude_type,
        SeismicEvent.reference_location,
        SeismicEvent.department,
        SeismicEvent.province,
        SeismicEvent.district,
        SeismicEvent.source_hash,
        SeismicEvent.raw_data,
        SeismicEvent.source_record_id,
    )

    missing = sum(
        db.scalar(
            select(func.count()).select_from(SeismicEvent).where(
                column.is_(None)
            )
        ) or 0
        for column in missing_fields
    )

    invalid_coordinates = db.scalar(
        select(func.count()).select_from(SeismicEvent).where(
            (SeismicEvent.latitude < -90)
            | (SeismicEvent.latitude > 90)
            | (SeismicEvent.longitude < -180)
            | (SeismicEvent.longitude > 180)
        )
    ) or 0

    invalid_depth = db.scalar(
        select(func.count()).select_from(SeismicEvent).where(
            SeismicEvent.depth_km < 0
        )
    ) or 0

    duplicate_hashes = (
        select(SeismicEvent.source_hash)
        .where(SeismicEvent.source_hash.is_not(None))
        .group_by(SeismicEvent.source_hash)
        .having(func.count() > 1)
        .subquery()
    )

    duplicate_hash_groups = db.scalar(
        select(func.count()).select_from(duplicate_hashes)
    ) or 0

    return {
        "total_records": total,
        "missing_optional_values": missing,
        "invalid_coordinate_records": invalid_coordinates,
        "negative_depth_records": invalid_depth,
        "duplicate_source_hash_groups": duplicate_hash_groups,
    }
