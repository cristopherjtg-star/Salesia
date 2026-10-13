from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    dni: str = Field(..., max_length=20, description="DNI del usuario para autenticación")
    password: str = Field(..., description="Contraseña en texto plano")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    dni: str
    full_name: str
    role: str
    permissions: list[str]