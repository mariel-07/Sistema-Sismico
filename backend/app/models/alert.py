from datetime import datetime
from uuid import UUID
from sqlalchemy import Boolean, DateTime, Float, String, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class AlertRule(Base):
    __tablename__ = "alert_rules"
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    metric: Mapped[str] = mapped_column(String(80), nullable=False)
    condition: Mapped[str] = mapped_column(String(20), nullable=False)
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(30), nullable=False, default="")
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="Media")
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    channel: Mapped[str] = mapped_column(String(80), nullable=False, default="Sistema")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

class AlertRecord(Base):
    __tablename__ = "alerts"
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(String(150), nullable=False, default="Sistema")
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="Media")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Pendiente")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    event_code: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
