from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_permission, get_current_user_payload
from app.models.product import Category, Product
from app.models.audit import AuditLog

router = APIRouter()

class CategoryCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: str | None = None

class ProductCreate(BaseModel):
    company_id: int
    category_id: int
    sku: str = Field(..., max_length=50)
    name: str = Field(..., max_length=150)
    description: str | None = None
    unit_price: float = Field(..., ge=0)
    cost_price: float = Field(..., ge=0)

class ProductUpdate(BaseModel):
    category_id: int | None = None
    sku: str | None = Field(None, max_length=50)
    name: str | None = Field(None, max_length=150)
    description: str | None = None
    unit_price: float | None = Field(None, ge=0)
    cost_price: float | None = Field(None, ge=0)
    is_active: bool | None = None

@router.get("/", dependencies=[Depends(require_permission("products:read"))])
def get_products(db: Session = Depends(get_db)):
    """Obtiene el listado activo de productos del catálogo."""
    return db.query(Product).filter(Product.is_active == True).all()

@router.post("/", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("products:create"))])
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    """Registra un nuevo producto en el sistema."""
    existing_sku = db.query(Product).filter(Product.sku == payload.sku).first()
    if existing_sku:
        raise HTTPException(status_code=400, detail="El código SKU ya se encuentra registrado.")
    
    new_product = Product(**payload.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {"success": True, "data": new_product}

@router.put("/{product_id}", dependencies=[Depends(require_permission("products:update"))])
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    """Actualiza un producto existente."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    return {"success": True, "data": product}

@router.delete("/{product_id}", dependencies=[Depends(require_permission("products:delete"))])
def delete_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload)  # Extermina el "Sistema" extrayendo el usuario real
):
    """Elimina un producto del catálogo y registra el usuario exacto en la auditoría."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Extraer ID del payload del token JWT
    user_id = current_user.get("user_id") or current_user.get("id") or current_user.get("sub")
    
    audit_entry = AuditLog(
        user_id=user_id,
        action="DELETE",
        table_name="products",
        details={"product_id": product.id, "name": product.name, "sku": product.sku}
    )
    db.add(audit_entry)
    
    db.delete(product)
    db.commit()
    
    return {"success": True, "message": "Producto eliminado exitosamente y registrado en auditoría"}