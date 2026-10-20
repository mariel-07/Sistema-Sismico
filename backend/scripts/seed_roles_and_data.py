import sys
from pathlib import Path
from uuid import uuid4
from datetime import datetime, timezone

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / "venv" / "Lib" / "site-packages"))
sys.path.insert(0, str(root))

import bcrypt
from sqlalchemy import select, text
from app.db.session import SessionLocal
from app.models.security import SecurityUser, AuditLog
from app.models.alert import AlertRule, AlertRecord

ROLES_USERS = [
    {
        "name": "Mariela Administradora",
        "email": "admin@gmail.com",
        "role": "Administrador",
    },
    {
        "name": "Carlos Data Scientist",
        "email": "analista.ml@sepms.pe",
        "role": "Analista ML",
    },
    {
        "name": "Elena Operadora Sísmica",
        "email": "operador.alertas@sepms.pe",
        "role": "Operador de Alertas",
    },
    {
        "name": "David Auditor de Calidad",
        "email": "auditor@sepms.pe",
        "role": "Auditor",
    },
    {
        "name": "Laura Consulta Pública",
        "email": "lector@sepms.pe",
        "role": "Solo lectura",
    },
]

SEED_RULES = [
    {
        "name": "Sismo de Gran Magnitud (M >= 6.0)",
        "description": "Notificación inmediata para eventos con magnitud mayor o igual a 6.0 Mw.",
        "metric": "Magnitud sísmica (Mw)",
        "condition": "mayor",
        "threshold": 6.0,
        "unit": "Mw",
        "priority": "Crítica",
        "enabled": True,
        "channel": "Centro de Operaciones y SMS",
    },
    {
        "name": "Sismo Moderado Cercano a Costa",
        "description": "Alerta preventiva para sismos entre 5.0 y 5.9 Mw en zona costera superficial.",
        "metric": "Magnitud sísmica (Mw)",
        "condition": "mayor",
        "threshold": 5.0,
        "unit": "Mw",
        "priority": "Alta",
        "enabled": True,
        "channel": "Panel Interno",
    },
    {
        "name": "Anomalía en Profundidad Superficial",
        "description": "Detección de hipocentro superficial menor a 30 km en áreas urbanas.",
        "metric": "Profundidad focal (km)",
        "condition": "menor",
        "threshold": 30.0,
        "unit": "km",
        "priority": "Media",
        "enabled": True,
        "channel": "Panel Interno",
    },
    {
        "name": "Frecuencia Elevada de Réplicas",
        "description": "Disparo cuando se registran más de 15 eventos en una misma provincia en 24h.",
        "metric": "Tasa de eventos diarios",
        "condition": "mayor",
        "threshold": 15.0,
        "unit": "eventos/día",
        "priority": "Baja",
        "enabled": True,
        "channel": "Correo Automático",
    },
]

SEED_ALERTS = [
    {
        "title": "Sismo M 5.8 detectado en Costa Central",
        "message": "Evento sísmico detectado a 42 km al SO de Callao con profundidad de 38 km. Evaluación en curso.",
        "source": "Catálogo Sísmico IGP",
        "priority": "Alta",
        "status": "Pendiente",
        "event_code": "IGP-2026-0842",
        "is_read": False,
    },
    {
        "title": "Sismo M 6.2 en Región Sur (Arequipa)",
        "message": "Sismo de magnitud considerable registrado frente a las costas de Camaná. Se activó protocolo de monitoreo.",
        "source": "Catálogo Sísmico IGP",
        "priority": "Crítica",
        "status": "Revisada",
        "event_code": "IGP-2026-0839",
        "is_read": True,
    },
    {
        "title": "Actividad superficial en Valle del Colca",
        "message": "Secuencia de 4 sismos de baja profundidad (< 15 km) con magnitudes entre 3.8 y 4.2.",
        "source": "Catálogo Sísmico IGP",
        "priority": "Media",
        "status": "Atendida",
        "event_code": "IGP-2026-0820",
        "is_read": True,
    },
    {
        "title": "Sincronización periódica de fuentes completada",
        "message": "Conector IGP finalizó con 21,068 registros procesados sin incidencias críticas.",
        "source": "Sistema Interno SEPMS",
        "priority": "Baja",
        "status": "Atendida",
        "event_code": "SYS-SYNC-104",
        "is_read": True,
    },
]

def seed():
    print("Iniciando seed de datos para SEPMS...")
    pwd_hash = bcrypt.hashpw("admin1234".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    with SessionLocal() as db:
        # 1. Users for the 5 roles
        for item in ROLES_USERS:
            existing = db.scalar(select(SecurityUser).where(SecurityUser.email == item["email"]))
            if existing:
                existing.name = item["name"]
                existing.role = item["role"]
                existing.password_hash = pwd_hash
                existing.is_active = True
                print(f"  * Usuario actualizado: {item['email']} ({item['role']})")
            else:
                user = SecurityUser(
                    name=item["name"],
                    email=item["email"],
                    password_hash=pwd_hash,
                    role=item["role"],
                    is_active=True,
                )
                db.add(user)
                print(f"  + Usuario creado: {item['email']} ({item['role']})")
        db.commit()

        # 2. Alert Rules
        rules_count = db.scalar(select(text("COUNT(*) FROM alert_rules"))) or 0
        if rules_count == 0:
            for r in SEED_RULES:
                rule = AlertRule(**r)
                db.add(rule)
            db.commit()
            print(f"  + {len(SEED_RULES)} reglas de alerta creadas.")
        else:
            print(f"  * alert_rules ya tiene {rules_count} registros.")

        # 3. Alerts
        alerts_count = db.scalar(select(text("COUNT(*) FROM alerts"))) or 0
        if alerts_count == 0:
            for a in SEED_ALERTS:
                alert = AlertRecord(**a)
                db.add(alert)
            db.commit()
            print(f"  + {len(SEED_ALERTS)} alertas iniciales creadas.")
        else:
            print(f"  * alerts ya tiene {alerts_count} registros.")

        # 4. Audit Log verification
        audit_count = db.scalar(select(text("COUNT(*) FROM security_audit_logs"))) or 0
        print(f"  * security_audit_logs tiene {audit_count} registros.")

        # Log system seed action
        db.add(AuditLog(
            actor_email="admin@gmail.com",
            role="Administrador",
            action="configuracion_inicial",
            module="sistema",
            resource="seed_datos",
            result="Correcto",
            description="Inicialización de usuarios para los 5 roles y catálogo de alertas.",
            ip_address="127.0.0.1",
        ))
        db.commit()

    print("Seed completado exitosamente.")

if __name__ == "__main__":
    seed()

