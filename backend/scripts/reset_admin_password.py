import bcrypt
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.security import SecurityUser

with SessionLocal() as db:
    user = db.scalar(
        select(SecurityUser).where(SecurityUser.email == "admin@gmail.com")
    )

    if user is None:
        print("ERROR: no existe admin@gmail.com")
    else:
        user.password_hash = bcrypt.hashpw(
            "admin1234".encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")
        db.commit()
        print("OK: contraseña actualizada para admin@gmail.com")
