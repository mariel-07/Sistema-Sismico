from datetime import datetime, timedelta, timezone
from uuid import UUID

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.security import AuditLog, SecurityUser

router = APIRouter(tags=["security"])
bearer = HTTPBearer(auto_error=False)

ROLES = {
    "Administrador",
    "Analista ML",
    "Operador de Alertas",
    "Operador de alertas",
    "Auditor",
    "Solo lectura",
}


class LoginInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=12, max_length=200)
    role: str = "Solo lectura"


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    role: str | None = None
    is_active: bool | None = None


class UserOutput(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


def _secret() -> str:
    secret = settings.JWT_SECRET_KEY
    if secret == "change-me" or len(secret) < 32:
        raise HTTPException(
            status_code=503,
            detail="Configura JWT_SECRET_KEY con al menos 32 caracteres aleatorios.",
        )
    return secret


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "desconocida"


def _audit(
    db: Session,
    request: Request,
    action: str,
    result: str,
    description: str,
    actor: SecurityUser | None = None,
    resource: str = "",
) -> None:
    db.add(
        AuditLog(
            user_id=actor.id if actor else None,
            actor_email=actor.email if actor else "anónimo",
            role=actor.role if actor else "Anónimo",
            action=action,
            module="seguridad",
            resource=resource,
            result=result,
            description=description[:1000],
            ip_address=_client_ip(request),
        )
    )


def _token(user: SecurityUser) -> str:
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )
    return jwt.encode(
        {"sub": str(user.id), "exp": expires, "role": user.role},
        _secret(),
        algorithm=settings.JWT_ALGORITHM,
    )


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> SecurityUser:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inicia sesión para continuar.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(
            credentials.credentials,
            _secret(),
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = UUID(payload["sub"])
    except (JWTError, ValueError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o vencido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.get(SecurityUser, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuario inactivo o inexistente.")
    return user


def require_roles(*roles: str):
    def dependency(user: SecurityUser = Depends(current_user)) -> SecurityUser:
        normalized_allowed = {r.strip().lower() for r in roles}
        if user.role.strip().lower() not in normalized_allowed:
            raise HTTPException(status_code=403, detail="No tienes permiso para esta operación.")
        return user
    return dependency


@router.post("/auth/login")
def login(
    data: LoginInput,
    request: Request,
    db: Session = Depends(get_db),
):
    _secret()
    email = str(data.email).lower()
    user = db.scalar(select(SecurityUser).where(SecurityUser.email == email))

    valid = False
    if user is not None:
        try:
            valid = bcrypt.checkpw(
                data.password.encode("utf-8"),
                user.password_hash.encode("utf-8"),
            )
        except (ValueError, TypeError):
            valid = False

    if not valid or user is None or not user.is_active:
        _audit(db, request, "inicio_sesion", "Fallido", "Credenciales inválidas o cuenta inactiva.", resource=email)
        db.commit()
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")

    _audit(db, request, "inicio_sesion", "Correcto", "Inicio de sesión correcto.", user, email)
    db.commit()
    return {
        "access_token": _token(user),
        "token_type": "bearer",
        "user": UserOutput.model_validate(user),
    }


@router.get("/auth/me", response_model=UserOutput)
def me(user: SecurityUser = Depends(current_user)):
    return user


@router.get("/roles")
def list_roles(user: SecurityUser = Depends(current_user)):
    return [
        {
            "name": role,
            "permissions": (
                ["users:manage", "audit:read", "alerts:manage", "data:read"]
                if role == "Administrador"
                else ["audit:read", "data:read"]
                if role == "Auditor"
                else ["ml:read", "data:read"]
                if role == "Analista ML"
                else ["alerts:manage", "data:read"]
                if role == "Operador de alertas"
                else ["data:read"]
            ),
        }
        for role in sorted(ROLES)
    ]


@router.get("/users", response_model=list[UserOutput])
def list_users(
    db: Session = Depends(get_db),
    _: SecurityUser = Depends(require_roles("Administrador")),
):
    return list(db.scalars(select(SecurityUser).order_by(SecurityUser.created_at.desc())).all())


@router.post("/users", response_model=UserOutput, status_code=201)
def create_user(
    data: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    actor: SecurityUser = Depends(require_roles("Administrador")),
):
    if data.role not in ROLES:
        raise HTTPException(status_code=422, detail="Rol no reconocido.")

    user = SecurityUser(
        name=data.name.strip(),
        email=str(data.email).lower(),
        password_hash=bcrypt.hashpw(
            data.password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8"),
        role=data.role,
        is_active=True,
    )
    db.add(user)
    try:
        db.flush()
        _audit(db, request, "crear_usuario", "Correcto", "Usuario creado.", actor, user.email)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ya existe un usuario con ese correo.")
    return user


@router.patch("/users/{user_id}", response_model=UserOutput)
def update_user(
    user_id: UUID,
    data: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    actor: SecurityUser = Depends(require_roles("Administrador")),
):
    user = db.get(SecurityUser, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    changes = data.model_dump(exclude_unset=True)
    if "role" in changes and changes["role"] not in ROLES:
        raise HTTPException(status_code=422, detail="Rol no reconocido.")
    if changes.get("is_active") is False and user.id == actor.id:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propia cuenta.")

    if user.role == "Administrador" and (
        changes.get("role", user.role) != "Administrador"
        or changes.get("is_active", user.is_active) is False
    ):
        active_admins = db.scalar(
            select(SecurityUser).where(
                SecurityUser.role == "Administrador",
                SecurityUser.is_active.is_(True),
            ).with_only_columns(SecurityUser.id)
        )
        admins = list(
            db.scalars(
                select(SecurityUser).where(
                    SecurityUser.role == "Administrador",
                    SecurityUser.is_active.is_(True),
                )
            ).all()
        )
        if len(admins) <= 1:
            raise HTTPException(status_code=400, detail="Debe permanecer al menos un administrador activo.")

    for field, value in changes.items():
        setattr(user, field, value)

    _audit(db, request, "actualizar_usuario", "Correcto", "Datos del usuario actualizados.", actor, str(user.id))
    db.commit()
    db.refresh(user)
    return user


@router.get("/audit-logs")
def list_audit_logs(
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: SecurityUser = Depends(require_roles("Administrador", "Auditor")),
):
    logs = db.scalars(
        select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)
    ).all()
    return [
        {
            "id": str(log.id),
            "user_id": str(log.user_id) if log.user_id else None,
            "actor_email": log.actor_email,
            "role": log.role,
            "action": log.action,
            "module": log.module,
            "resource": log.resource,
            "result": log.result,
            "description": log.description,
            "ip_address": log.ip_address,
            "created_at": log.created_at,
        }
        for log in logs
    ]
