from app.db.base import Base
from app.db.session import engine
from app.models.security import SecurityUser, AuditLog

Base.metadata.create_all(
    bind=engine,
    tables=[
        SecurityUser.__table__,
        AuditLog.__table__,
    ],
)

print("OK: tablas security_users y security_audit_logs verificadas/creadas.")
