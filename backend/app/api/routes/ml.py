from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.seismic_event import SeismicEvent

router = APIRouter(prefix="/ml", tags=["Experimental ML"])


@router.get("/analysis")
def analyze_historical_events(
    min_magnitude: float = Query(default=0, ge=0, le=10),
    db: Session = Depends(get_db),
):
    """Descriptive baseline over observed events; not earthquake prediction."""
    filters = [SeismicEvent.magnitude >= min_magnitude]
    total = db.scalar(
        select(func.count(SeismicEvent.id)).where(*filters)
    ) or 0

    if total == 0:
        return {
            "status": "insufficient_data",
            "purpose": "descriptive_baseline",
            "is_earthquake_prediction": False,
            "filters": {"min_magnitude": min_magnitude},
            "sample_count": 0,
            "message": "No hay eventos que cumplan el filtro.",
        }

    row = db.execute(
        select(
            func.avg(SeismicEvent.magnitude),
            func.min(SeismicEvent.magnitude),
            func.max(SeismicEvent.magnitude),
            func.avg(SeismicEvent.depth_km),
            func.min(SeismicEvent.depth_km),
            func.max(SeismicEvent.depth_km),
            func.avg(SeismicEvent.latitude),
            func.avg(SeismicEvent.longitude),
        ).where(*filters)
    ).one()

    return {
        "status": "ok",
        "purpose": "descriptive_baseline",
        "is_earthquake_prediction": False,
        "model": "historical_statistical_baseline_v1",
        "filters": {"min_magnitude": min_magnitude},
        "sample_count": total,
        "metrics": {
            "mean_magnitude": float(row[0]) if row[0] is not None else None,
            "min_magnitude": float(row[1]) if row[1] is not None else None,
            "max_magnitude": float(row[2]) if row[2] is not None else None,
            "mean_depth_km": float(row[3]) if row[3] is not None else None,
            "min_depth_km": float(row[4]) if row[4] is not None else None,
            "max_depth_km": float(row[5]) if row[5] is not None else None,
            "mean_latitude": float(row[6]) if row[6] is not None else None,
            "mean_longitude": float(row[7]) if row[7] is not None else None,
        },
        "limitations": [
            "Describe eventos históricos; no estima terremotos futuros.",
            "No se ha entrenado ni validado un modelo predictivo.",
            "Los promedios geográficos no representan una zona de riesgo.",
        ],
    }
