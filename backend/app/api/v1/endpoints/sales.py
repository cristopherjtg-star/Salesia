from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.dependencies import require_permission, get_current_user_payload
from app.models.sale import Sale, SaleDetail, Payment
from app.models.product import Product
from app.models.inventory import Inventory, InventoryMovement  # <-- Importar InventoryMovement

router = APIRouter()

class SaleItemSchema(BaseModel):
    product_id: int
    quantity: int

class SaleCreateSchema(BaseModel):
    company_id: int
    customer_id: int
    items: list[SaleItemSchema]
    payment_method: str = "EFECTIVO"
    sale_code: str | None = None  # Opcional: Si el frontend no lo manda, el backend lo genera

@router.post("/", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("sales:create"))])
def create_sale(
    payload: SaleCreateSchema, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user_payload)
):
    """Registra una venta de forma atómica: desglosa precios, descuenta stock, genera Kardex y registra pago."""
    if not payload.items:
        raise HTTPException(status_code=400, detail="El pedido no contiene productos.")

    try:
        # 1. Generar código de venta autoincremental si no se proporciona
        sale_code = payload.sale_code
        if not sale_code:
            count = db.query(Sale).filter(Sale.company_id == payload.company_id).count()
            sale_code = f"VNT-{datetime.now().strftime('%Y%m')}-{count + 1:05d}"

        total_amount = 0.0
        sale_details_data = []
        movements_data = []

        # 2. Procesar ítems y validar stock
        for item in payload.items:
            product = db.query(Product).filter(
                Product.id == item.product_id, 
                Product.company_id == payload.company_id
            ).first()
            
            if not product:
                raise HTTPException(status_code=404, detail=f"Producto ID {item.product_id} no encontrado.")
            
            inventory = db.query(Inventory).filter(Inventory.product_id == product.id).first()
            if not inventory or inventory.current_stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Stock insuficiente para: {product.name}")

            # Precios (Asumiendo que unit_price ya incluye IGV)
            item_total = float(product.unit_price) * item.quantity
            total_amount += item_total

            sale_details_data.append({
                "product_id": product.id,
                "quantity": item.quantity,
                "unit_price": float(product.unit_price),
                "total_price": item_total
            })

            # Descontar Stock
            inventory.current_stock -= item.quantity

            # Preparar movimiento de Kardex
            movements_data.append(InventoryMovement(
                inventory_id=inventory.id,
                user_id=current_user.get("user_id"),
                movement_type="VENTA",
                quantity=item.quantity,
                reference_code=sale_code,
                reason=f"Venta desde POS - {sale_code}"
            ))

        # 3. Desglose de impuestos (Total / 1.18 = Subtotal)
        subtotal = total_amount / 1.18
        tax = total_amount - subtotal

        # 4. Crear Cabecera de Venta
        new_sale = Sale(
            company_id=payload.company_id,
            sale_code=sale_code,
            customer_id=payload.customer_id,
            seller_id=current_user.get("user_id"),
            subtotal=round(subtotal, 2),
            tax=round(tax, 2),
            total=round(total_amount, 2),
            status="COMPLETED"
        )
        db.add(new_sale)
        db.flush()  # Obtiene new_sale.id sin hacer commit aún

        # 5. Guardar Detalles de la Venta
        for detail in sale_details_data:
            db.add(SaleDetail(sale_id=new_sale.id, **detail))

        # 6. Guardar Movimientos de Kardex
        for m in movements_data:
            db.add(m)

        # 7. Registrar el Pago
        db.add(Payment(
            sale_id=new_sale.id,
            payment_method=payload.payment_method,
            amount=round(total_amount, 2)
        ))

        # 8. Un solo COMMIT final para todo
        db.commit()
        db.refresh(new_sale)

        return {
            "success": True, 
            "sale_id": new_sale.id, 
            "sale_code": new_sale.sale_code,
            "total": new_sale.total, 
            "payment_method": payload.payment_method
        }

    except Exception as e:
        db.rollback()  # Si algo falla, revierte todos los cambios
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error al procesar la venta: {str(e)}")