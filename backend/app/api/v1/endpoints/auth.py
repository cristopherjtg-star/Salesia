from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.user import User

router = APIRouter()

class LoginRequest(BaseModel):
    dni: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    dni: str
    full_name: str
    role: str
    permissions: list[str]

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # Buscar usuario por DNI y validar si está activo
    user = db.query(User).filter(User.dni == payload.dni, User.is_active == True).first()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="DNI o contraseña incorrectos"
        )
    
    # Extraer códigos de permisos granulares asignados al usuario
    permissions_codes = [p.code for p in user.permissions] if hasattr(user, 'permissions') else []

    token_data = {
        "sub": user.dni,
        "user_id": user.id,
        "role": user.role.name if user.role else "USER",
        "permissions": permissions_codes
    }
    
    token = create_access_token(token_data)
    
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        dni=user.dni,
        full_name=f"{user.first_name} {user.last_name}",
        role=user.role.name if user.role else "USER",
        permissions=permissions_codes
    )