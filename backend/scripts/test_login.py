import getpass
from fastapi.testclient import TestClient
from app.main import app

email = input("Correo del administrador: ").strip()
password = getpass.getpass("Contraseña (entrada oculta): ")
with TestClient(app) as client:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
print("Estado HTTP:", response.status_code)
if response.status_code == 200:
    data = response.json()
    print("JWT recibido:", bool(data.get("access_token")))
    print("Tipo de token:", data.get("token_type"))
    print("Rol autenticado:", data.get("user", {}).get("role"))
else:
    print("Error:", response.json().get("detail", "Error de autenticación"))
