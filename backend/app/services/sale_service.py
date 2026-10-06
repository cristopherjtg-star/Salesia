from sqlalchemy.orm import Session
from app.models.sale import Sale, SaleDetail
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.payment import Payment  # 1. Asegúrate de importar el modelo Payment
from app.schemas.sale import SaleCreateSchema

def process_sale_transaction(db: Session, payload: SaleCreateSchema, seller_id: int) -> Sale:
    subtotal = 0.0
    sale_details_data = []

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise ValueError(f"Producto ID {item.product_id} no encontrado.")
        
        inventory = db.query(Inventory).filter(Inventory.product_id == product.id).first()
        if not inventory or inventory.current_stock < item.quantity:
            raise ValueError(f"Stock insuficiente para el producto: {product.name}")
        
        item_total = float(product.unit_price) * item.quantity
        subtotal += item_total
        
        sale_details_data.append({
            "product_id": product.id,
            "quantity": item.quantity,
            "unit_price": float(product.unit_price),
            "total_price": item_total
        })
        
        inventory.current_stock -= item.quantity

    tax = subtotal * 0.18
    total = subtotal + tax

    new_sale = Sale(
        company_id=payload.company_id,
        customer_id=payload.customer_id,
        seller_id=seller_id,
        sale_code=payload.sale_code,
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

    # 2. Registrar automáticamente el pago vinculado a la venta recién creada
    # (Asumiendo que el payload de la venta incluye un campo 'payment_method', 
    # si usa otro nombre en tu esquema, adáptalo por ej: payload.payment_method)
    payment_method_val = getattr(payload, "payment_method", "EFECTIVO")
    
    new_payment = Payment(
        sale_id=new_sale.id,
        payment_method=payment_method_val,
        amount=total
    )
    db.add(new_payment)
    
    db.commit()
    return new_sale