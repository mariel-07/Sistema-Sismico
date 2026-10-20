from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SeismicEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    external_id: str | None
    data_source_id: UUID | None
    ingestion_run_id: UUID | None

    origin_time_utc: datetime

    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

    depth_km: float = Field(ge=0)
    magnitude: float = Field(ge=0)

    magnitude_type: str | None
    reference_location: str | None

    department: str | None
    province: str | None
    district: str | None

    event_status: str
    review_status: str

    source_hash: str | None
    raw_data: dict | None

    created_at: datetime
    updated_at: datetime

    source_record_id: int | None