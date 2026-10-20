from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SecurityUser(Base):
    __tablename__ = "security_users"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(40), nullable=False, default="Solo lectura")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class AuditLog(Base):
    __tablename__ = "security_audit_logs"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), nullable=True, index=True)
    actor_email: Mapped[str] = mapped_column(String(255), nullable=False, default="sistema")
    role: Mapped[str] = mapped_column(String(40), nullable=False, default="Sistema")
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    module: Mapped[str] = mapped_column(String(100), nullable=False)
    resource: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    result: Mapped[str] = mapped_column(String(30), nullable=False, default="Correcto")
    description: Mapped[str] = mapped_column(String(1000), nullable=False, default="")
    ip_address: Mapped[str] = mapped_column(String(64), nullable=False, default="desconocida")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
