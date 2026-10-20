import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / "venv" / "Lib" / "site-packages"))
sys.path.insert(0, str(root))

from sqlalchemy import text
from app.db.session import engine

def update_constraints():
    print("Actualizando constraints de alert_rules y alerts en PostgreSQL...")
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE alert_rules DROP CONSTRAINT IF EXISTS chk_alert_priority;
            ALTER TABLE alert_rules ADD CONSTRAINT chk_alert_priority CHECK (
                lower(priority) IN ('low', 'medium', 'high', 'critical', 'baja', 'media', 'alta', 'crítica', 'critica')
            );

            ALTER TABLE alerts DROP CONSTRAINT IF EXISTS chk_alert_priority;
            ALTER TABLE alerts ADD CONSTRAINT chk_alert_priority CHECK (
                lower(priority) IN ('low', 'medium', 'high', 'critical', 'baja', 'media', 'alta', 'crítica', 'critica')
            );

            ALTER TABLE alerts DROP CONSTRAINT IF EXISTS chk_alert_status;
            ALTER TABLE alerts ADD CONSTRAINT chk_alert_status CHECK (
                lower(status) IN ('pending', 'processing', 'sent', 'failed', 'acknowledged', 'cancelled', 'pendiente', 'revisada', 'atendida')
            );
        """))
        conn.commit()
    print("Constraints actualizados con éxito para soportar español e inglés.")

if __name__ == "__main__":
    update_constraints()

