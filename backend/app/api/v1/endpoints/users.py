from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from app.core.database import get_db
from app.core.dependencies import require_permission, get_current_user # Asumiendo que obtienes el usuario actual
from app.models.user import User

router = APIRouter()

# Configuración de Passlib para el hashing de contraseñas con bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Esquema Pydantic para validar los datos que envía el frontend
class UserCreate(BaseModel):
    dni: str
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role_id: int

@router.get("/", dependencies=[Depends(require_permission("users:manage"))])
def list_users(db: Session = Depends(get_db)):
    """Lista todos los usuarios del sistema exponiendo el esquema real."""
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "company_id": u.company_id,
            "role_id": u.role_id,
            "dni": u.dni,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "is_active": u.is_active,
            "created_at": u.created_at
        }
        for u in users
    ]

@router.post("/", dependencies=[Depends(require_permission("users:manage"))], status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # Extrae el admin logueado
):
    """Registra un nuevo usuario cifrando su contraseña y asignando su rol y compañía."""
    
    # 1. Verificar si ya existe un usuario con el mismo DNI o correo
    existing_user = db.query(User).filter((User.dni == user_data.dni) | (User.email == user_data.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario registrado con este DNI o correo electrónico."
        )

    # 2. Hashear la contraseña de forma segura
    hashed_password = pwd_context.hash(user_data.password)

    # 3. Crear la instancia del nuevo modelo User
    new_user = User(
        company_id=current_user.company_id, # Hereda la compañía del admin que crea
        role_id=user_data.role_id,
        dni=user_data.dni,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        password_hash=hashed_password,
        is_active=True
    )

    # 4. Guardar en la base de datos
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "Usuario registrado exitosamente",
        "user": {
            "id": new_user.id,
            "dni": new_user.dni,
            "email": new_user.email,
            "first_name": new_user.first_name,
            "role_id": new_user.role_id
        }
    }