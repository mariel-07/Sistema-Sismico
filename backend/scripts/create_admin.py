import getpass
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import bcrypt
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.db.session import SessionLocal
from app.models.security import SecurityUser


def main():
    print("=== Crear administrador SEPMS ===")
    name = input("Nombre: ").strip()
    email = input("Correo: ").strip().lower()
    password = getpass.getpass("Contraseña (mínimo 8 caracteres): ")
    confirm = getpass.getpass("Repite la contraseña: ")

    if len(name) < 2:
        print("ERROR: el nombre debe tener al menos 2 caracteres.")
        return
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        print("ERROR: correo no válido.")
        return
    if len(password) < 8:
        print("ERROR: la contraseña debe tener al menos 8 caracteres.")
        return
    if password != confirm:
        print("ERROR: las contraseñas no coinciden.")
        return

    with SessionLocal() as db:
        existing = db.scalar(
            select(SecurityUser).where(SecurityUser.email == email)
        )
        if existing:
            print("ERROR: ya existe una cuenta con ese correo.")
            return

        user = SecurityUser(
            name=name,
            email=email,
            password_hash=bcrypt.hashpw(
                password.encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
            role="Administrador",
            is_active=True,
        )
        db.add(user)
        try:
            db.commit()
            print("OK: administrador creado. La contraseña no se ha mostrado.")
        except IntegrityError:
            db.rollback()
            print("ERROR: no se pudo crear; revisa si el correo ya existe.")


if __name__ == "__main__":
    main()

