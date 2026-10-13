from sqlalchemy.orm import Session
from datetime import datetime
from app.models.sale import Sale, SaleDetail, Payment
from app.models.product import Product
from app.models.inventory import Inventory, InventoryMovement  # <-- Importar InventoryMovement
from app.schemas.sale import SaleCreateSchema

def process_sale_transaction(db: Session, payload: SaleCreateSchema, seller_id: int) -> Sale:
    """
    Procesa la venta en una sola transacción atómica:
    - Valida productos y stock.
    - Descuenta inventario y registra el movimiento Kardex.
    - Desglosa Subtotal e IGV del monto total.
    - Registra Venta, Detalles y Pago de forma segura.
    """
    if not payload.items:
        raise ValueError("La venta debe contener al menos un producto.")

    # 1. Generar código de venta automático si no viene en el payload
    sale_code = getattr(payload, "sale_code", None)
    if not sale_code:
        count = db.query(Sale).filter(Sale.company_id == payload.company_id).count()
        sale_code = f"VNT-{datetime.now().strftime('%Y%m')}-{count + 1:05d}"

    total_amount = 0.0
    sale_details_data = []
    kardex_movements = []

    # 2. Iterar items, verificar stock y preparar detalles
    for item in payload.items:
        product = db.query(Product).filter(
            Product.id == item.product_id,
            Product.company_id == payload.company_id
        ).first()
        
        if not product:
            raise ValueError(f"Producto ID {item.product_id} no encontrado.")
        
        inventory = db.query(Inventory).filter(Inventory.product_id == product.id).first()
        if not inventory or inventory.current_stock < item.quantity:
            raise ValueError(f"Stock insuficiente para el producto: {product.name}")
        
        item_total = float(product.unit_price) * item.quantity
        total_amount += item_total
        
        sale_details_data.append({
            "product_id": product.id,
            "quantity": item.quantity,
            "unit_price": float(product.unit_price),
            "total_price": item_total
        })
        
        # Descontar stock de la tabla inventory
        inventory.current_stock -= item.quantity

        # Preparar registro Kardex
        kardex_movements.append(
            InventoryMovement(
                inventory_id=inventory.id,
                user_id=seller_id,
                movement_type="VENTA",
                quantity=item.quantity,
                reference_code=sale_code,
                reason=f"Venta registrada desde POS - {sale_code}"
            )
        )

    # 3. Desglose de impuestos (El precio unitario del producto ya incluye IGV)
    subtotal = total_amount / 1.18
    tax = total_amount - subtotal

    # 4. Crear objeto de Venta (sin commit aún)
    new_sale = Sale(
        company_id=payload.company_id,
        customer_id=payload.customer_id,
        seller_id=seller_id,
        sale_code=sale_code,
        subtotal=round(subtotal, 2),
        tax=round(tax, 2),
        total=round(total_amount, 2),
        status="COMPLETED"
    )
    
    db.add(new_sale)
    db.flush()  # flush() le asigna un 'id' a new_sale en memoria sin guardar cambios permanentes

    # 5. Asociar detalles de venta
    for detail in sale_details_data:
        db.add(SaleDetail(sale_id=new_sale.id, **detail))

    # 6. Guardar los movimientos de Kardex
    for movement in kardex_movements:
        db.add(movement)

    # 7. Registrar el Pago
    payment_method_val = getattr(payload, "payment_method", "EFECTIVO")
    new_payment = Payment(
        sale_id=new_sale.id,
        payment_method=payment_method_val,
        amount=round(total_amount, 2)
    )
    db.add(new_payment)
    
    # 8. Commit Único y Atómico
    db.commit()
    db.refresh(new_sale)
    
    return new_sale