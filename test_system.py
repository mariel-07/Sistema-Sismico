import sys
from pathlib import Path

root = Path(__file__).resolve().parent
sys.path.insert(0, str(root / "backend" / "venv" / "Lib" / "site-packages"))
sys.path.insert(0, str(root / "backend"))

from fastapi.testclient import TestClient
from app.main import app
from app.db.session import engine
from sqlalchemy import text

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("    VERIFICACION INTEGRAL DEL SISTEMA SEPMS")
    print("=" * 60)

    # 1. Base de datos
    print("\n[1] Verificando conexion con PostgreSQL Supabase...")
    try:
        with engine.connect() as conn:
            res = conn.execute(text("SELECT 1")).scalar()
            total_events = conn.execute(text("SELECT COUNT(*) FROM seismic_events")).scalar()
            total_users = conn.execute(text("SELECT COUNT(*) FROM security_users")).scalar()
            total_rules = conn.execute(text("SELECT COUNT(*) FROM alert_rules")).scalar()
            total_alerts = conn.execute(text("SELECT COUNT(*) FROM alerts")).scalar()
            print(f"  OK: Conexion exitosa (SELECT 1 = {res})")
            print(f"  OK: Eventos sismicos en BD: {total_events:,}")
            print(f"  OK: Usuarios de seguridad: {total_users}")
            print(f"  OK: Reglas de alerta: {total_rules}")
            print(f"  OK: Alertas registradas: {total_alerts}")
    except Exception as e:
        print(f"  FAIL: Error en base de datos: {e}")
        return

    # 2. Endpoints publicos
    print("\n[2] Verificando endpoints publicos...")
    r_health = client.get("/api/v1/database/health")
    assert r_health.status_code == 200, f"Health check fallo: {r_health.text}"
    print(f"  OK: /api/v1/database/health -> {r_health.json()}")

    r_events = client.get("/api/v1/events/recent?limit=5")
    assert r_events.status_code == 200, f"Recent events fallo: {r_events.text}"
    print(f"  OK: /api/v1/events/recent -> {len(r_events.json())} eventos obtenidos")

    r_rules = client.get("/api/v1/alert-rules")
    assert r_rules.status_code == 200, f"Alert rules fallo: {r_rules.text}"
    print(f"  OK: /api/v1/alert-rules -> {len(r_rules.json())} reglas obtenidas")

    r_alerts = client.get("/api/v1/alerts")
    assert r_alerts.status_code == 200, f"Alerts fallo: {r_alerts.text}"
    print(f"  OK: /api/v1/alerts -> {len(r_alerts.json())} alertas obtenidas")

    r_ml = client.get("/api/v1/ml/analysis")
    assert r_ml.status_code == 200, f"ML analysis fallo: {r_ml.text}"
    print(f"  OK: /api/v1/ml/analysis -> Muestra de {r_ml.json().get('sample_count')} eventos")

    # 3. Autenticacion de los 5 roles
    print("\n[3] Verificando autenticacion de los 5 roles...")
    test_accounts = [
        ("admin@gmail.com", "admin1234", "Administrador"),
        ("analista.ml@sepms.pe", "admin1234", "Analista ML"),
        ("operador.alertas@sepms.pe", "admin1234", "Operador de Alertas"),
        ("auditor@sepms.pe", "admin1234", "Auditor"),
        ("lector@sepms.pe", "admin1234", "Solo lectura"),
    ]

    tokens = {}
    for email, pwd, expected_role in test_accounts:
        r = client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
        assert r.status_code == 200, f"Login fallo para {email}: {r.text}"
        data = r.json()
        token = data["access_token"]
        tokens[expected_role] = token
        actual_role = data["user"]["role"]
        print(f"  OK: Login correcto para '{email}' -> Rol obtenido: '{actual_role}'")

    # 4. Control de acceso por rol (RBAC)
    print("\n[4] Verificando permisos por rol (RBAC)...")
    # Auditoria permitida para Administrador y Auditor
    headers_admin = {"Authorization": f"Bearer {tokens['Administrador']}"}
    headers_auditor = {"Authorization": f"Bearer {tokens['Auditor']}"}
    headers_reader = {"Authorization": f"Bearer {tokens['Solo lectura']}"}

    r_audit_admin = client.get("/api/v1/audit-logs", headers=headers_admin)
    assert r_audit_admin.status_code == 200
    print("  OK: Administrador accede a /api/v1/audit-logs (200)")

    r_audit_auditor = client.get("/api/v1/audit-logs", headers=headers_auditor)
    assert r_audit_auditor.status_code == 200
    print("  OK: Auditor accede a /api/v1/audit-logs (200)")

    r_audit_reader = client.get("/api/v1/audit-logs", headers=headers_reader)
    assert r_audit_reader.status_code == 403, "Solo lectura no debe acceder a audit-logs"
    print("  OK: Solo lectura es RECHAZADO con 403 en /api/v1/audit-logs")

    # Usuarios permitidos solo para Administrador
    r_users_admin = client.get("/api/v1/users", headers=headers_admin)
    assert r_users_admin.status_code == 200
    print(f"  OK: Administrador lista {len(r_users_admin.json())} usuarios en /api/v1/users (200)")

    r_users_reader = client.get("/api/v1/users", headers=headers_reader)
    assert r_users_reader.status_code == 403
    print("  OK: Solo lectura es RECHAZADO con 403 en /api/v1/users")

    print("\n" + "=" * 60)
    print("    TODAS LAS PRUEBAS PASARON EXITOSAMENTE (100% OK)")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()

