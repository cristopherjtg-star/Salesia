from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_success():
    # Simula una petición POST al endpoint de autenticación por DNI
    response = client.post(
        "/api/v1/auth/login",
        json={"dni": "12345678", "password": "securepassword"}
    )
    # Verifica que la respuesta sea exitosa (200 OK) y contenga el token
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["dni"] == "12345678"

def test_login_invalid_credentials():
    # Simula un intento de login con credenciales incorrectas
    response = client.post(
        "/api/v1/auth/login",
        json={"dni": "00000000", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "DNI o contraseña incorrectos"