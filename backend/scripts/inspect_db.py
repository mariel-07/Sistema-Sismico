import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("=== ROLES ===")
    for row in conn.execute(text("SELECT id, name, description FROM roles")).mappings():
        print(dict(row))

    print("\n=== SECURITY USERS ===")
    for row in conn.execute(text("SELECT id, name, email, role, is_active FROM security_users")).mappings():
        print(dict(row))

