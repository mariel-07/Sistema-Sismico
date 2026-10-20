import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / "venv" / "Lib" / "site-packages"))
sys.path.insert(0, str(root))

from sqlalchemy import text
from app.db.session import engine

with engine.connect() as conn:
    for tbl in ['alert_rules', 'alerts']:
        print(f"=== Constraints on {tbl} ===")
        r = conn.execute(text(f"""
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = '{tbl}'
        """)).all()
        for name, defn in r:
            print(" ", name, "->", defn)

