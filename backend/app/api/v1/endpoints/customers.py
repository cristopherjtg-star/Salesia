from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_permission, get_current_user_payload
from app.models.customer import Customer

router = APIRouter()

class CustomerCreate(BaseModel):
    company_id: int | None = None  # Se vuelve opcional para llenarlo automáticamente
    document_type: str = "DNI"     # Puede ser DNI o RUC
    document_number: str
    name: str
    phone: str | None = None
    email: str | None = None
    address: str | None = None

@router.get("/", dependencies=[Depends(require_permission("customers:read"))])
def get_customers(db: Session = Depends(get_db)):
    """Obtiene el listado completo de clientes."""
    return db.query(Customer).filter(Customer.is_active == True).all()

@router.post("/", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("customers:create"))])
def create_customer(
    payload: CustomerCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload)
):
    """Registra un nuevo cliente en el sistema asignando la compañía del usuario actual."""
    existing = db.query(Customer).filter(Customer.document_number == payload.document_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="El número de documento ya se encuentra registrado.")
    
    # Asignar automáticamente el company_id del usuario logueado si no viene en el payload
    company_id = current_user.get("company_id") or payload.company_id or 1
    
    customer_data = payload.dict()
    customer_data["company_id"] = company_id
    
    new_customer = Customer(**customer_data)
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return {"success": True, "data": new_customer}