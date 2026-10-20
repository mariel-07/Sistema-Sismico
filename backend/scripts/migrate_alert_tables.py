import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import text
from app.db.session import engine

def migrate():
    print("Migrando tablas de alertas en PostgreSQL Supabase...")
    with engine.connect() as conn:
        # alert_rules
        conn.execute(text("""
            ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS metric VARCHAR(80) DEFAULT 'Magnitud sísmica';
            ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS condition VARCHAR(20) DEFAULT 'mayor';
            ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS threshold DOUBLE PRECISION DEFAULT 4.0;
            ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS unit VARCHAR(30) DEFAULT 'Mw';
            ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true;
            ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS channel VARCHAR(80) DEFAULT 'Sistema';
        """))
        
        # alerts
        conn.execute(text("""
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS source VARCHAR(150) DEFAULT 'Catálogo Sísmico IGP';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS event_code VARCHAR(100) DEFAULT '';
            ALTER TABLE alerts ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
        """))
        conn.commit()
    print("Migración completada exitosamente.")

if __name__ == "__main__":
    migrate()

