from pathlib import Path
p = Path("app/models/__init__.py")
s = p.read_text(encoding="utf-8-sig")
if "from app.models.alert import AlertRecord, AlertRule" not in s:
    s += "\nfrom app.models.alert import AlertRecord, AlertRule\n"
if '"AlertRecord"' not in s:
    s = s.rstrip() + '\n\n__all__ = list(dict.fromkeys([*__all__, "AlertRecord", "AlertRule"]))\n'
p.write_text(s, encoding="utf-8")
from app.db.base import Base
from app.db.session import engine
import app.models.alert
Base.metadata.create_all(bind=engine, tables=[
    app.models.alert.AlertRule.__table__,
    app.models.alert.AlertRecord.__table__,
])
print("OK: tablas alert_rules y alerts verificadas/creadas; tablas existentes intactas.")
