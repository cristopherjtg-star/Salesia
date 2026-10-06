from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_password, create_access_token

def authenticate_user(db: Session, dni: str, password: str) -> dict | None:
    user = db.query(User).filter(User.dni == dni, User.is_active == True).first()
    if not user or not verify_password(password, user.password_hash):
        return None
    
    permissions_codes = [p.code for p in user.permissions] if hasattr(user, 'permissions') else []
    
    token_data = {
        "sub": user.dni,
        "user_id": user.id,
        "role": user.role.name if user.role else "USER",
        "permissions": permissions_codes
    }
    
    access_token = create_access_token(token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "dni": user.dni,
        "full_name": f"{user.first_name} {user.last_name}",
        "role": user.role.name if user.role else "USER",
        "permissions": permissions_codes
    }