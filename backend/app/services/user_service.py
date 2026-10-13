from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def create_new_user(db: Session, payload: UserCreate) -> User:
    # 1. Validar si ya existe un usuario con el mismo email
    existing_email = db.query(User).filter(User.email == payload.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado."
        )

    # 2. Validar si ya existe un usuario con el mismo DNI
    existing_dni = db.query(User).filter(User.dni == payload.dni).first()
    if existing_dni:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El DNI ingresado ya está asociado a otro usuario."
        )

    # 3. Hashear contraseña y instanciar el modelo
    hashed_password = get_password_hash(payload.password)
    
    db_user = User(
        company_id=payload.company_id,
        role_id=payload.role_id,
        dni=payload.dni,
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        password_hash=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user