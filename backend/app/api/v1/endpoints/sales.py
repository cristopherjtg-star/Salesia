from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_permission, get_current_user_payload
from app.models.sale import Sale, SaleDetail, Payment  # 1. Importar el modelo Payment
from app.models.product import Product
from app.models.inventory import Inventory

router = APIRouter()

class SaleItemSchema(BaseModel):
    product_id: int
    quantity: int

class SaleCreateSchema(BaseModel):
    company_id: int
    customer_id: int
    sale_code: str
    items: list[SaleItemSchema]
    payment_method: str = "EFECTIVO"

@router.post("/", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("sales:create"))])
def create_sale(payload: SaleCreateSchema, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user_payload)):
    """Registra una venta, calcula montos, descuenta el stock de inventario y registra el pago automáticamente."""
    subtotal = 0.0
    sale_details_data = []

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Producto ID {item.product_id} no encontrado.")
        
        # Verificar inventario
        inventory = db.query(Inventory).filter(Inventory.product_id == product.id).first()
        if not inventory or inventory.current_stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para el producto: {product.name}")
        
        item_total = float(product.unit_price) * item.quantity
        subtotal += item_total
        
        sale_details_data.append({
            "product_id": product.id,
            "quantity": item.quantity,
            "unit_price": float(product.unit_price),
            "total_price": item_total
        })
        
        # Descontar stock
        inventory.current_stock -= item.quantity

    tax = subtotal * 0.18  # IGV 18%
    total = subtotal + tax

    new_sale = Sale(
        company_id=payload.company_id,
        sale_code=payload.sale_code,
        customer_id=payload.customer_id,
        seller_id=current_user.get("user_id"),
        subtotal=subtotal,
        tax=tax,
        total=total,
        status="COMPLETED"
    )
    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)

    for detail in sale_details_data:
        sale_detail = SaleDetail(sale_id=new_sale.id, **detail)
        db.add(sale_detail)

    # 2. Registrar el pago automáticamente en la tabla payments
    new_payment = Payment(
        sale_id=new_sale.id,
        payment_method=payload.payment_method,
        amount=total
    )
    db.add(new_payment)
    
    db.commit()
    return {"success": True, "sale_id": new_sale.id, "total": total, "payment_method": payload.payment_method}