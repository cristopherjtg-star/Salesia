# app/core/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

# Inyección de OAuth2 configurada dinámicamente según la versión de la API
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def get_current_user_payload(token: str = Depends(oauth2_scheme)) -> dict:
    """Extrae y valida el payload del token JWT enviado en el header Authorization."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("sub") is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Token no válido: falta identificación (DNI)"
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token inválido o expirado"
        )


def require_permission(required_permission: str):
    """
    Middleware de autorización por permiso granular.
    Permite el acceso si el usuario posee el permiso especificado
    o si su rol es 'ADMINISTRADOR'.
    """
    def permission_checker(payload: dict = Depends(get_current_user_payload)):
        user_permissions = payload.get("permissions", [])
        user_role = payload.get("role", "")

        if required_permission not in user_permissions and user_role != "ADMINISTRADOR":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. No posee el permiso requerido: '{required_permission}'"
            )
        return payload

    return permission_checker


def get_current_user(
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
) -> User:
    """Obtiene el objeto User de la base de datos a partir del DNI (sub) en el JWT."""
    dni = payload.get("sub")
    user = db.query(User).filter(User.dni == dni).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return user