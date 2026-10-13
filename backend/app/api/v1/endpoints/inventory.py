from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_permission, get_current_user_payload
from app.models.inventory import Inventory, InventoryMovement
from app.models.audit import AuditLog

router = APIRouter()

class StockAdjustmentSchema(BaseModel):
    product_id: int
    warehouse_id: int = 1
    quantity: int = Field(..., description="Cantidad a ajustar (positiva o negativa)")
    movement_type: str = Field(..., description="ENTRADA, SALIDA, AJUSTE")
    reason: str | None = None

@router.get("/", dependencies=[Depends(require_permission("inventory:read"))])
def get_inventory(db: Session = Depends(get_db)):
    """Obtiene el estado actual del inventario y existencias."""
    return db.query(Inventory).all()

@router.post("/adjust", dependencies=[Depends(require_permission("inventory:manage"))])
def adjust_stock(
    payload: StockAdjustmentSchema, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user_payload)
):
    """Registra un movimiento de entrada o salida identificando el inventario por producto y almacén."""
    
    # Búsqueda exacta combinando product_id y warehouse_id
    inventory_item = db.query(Inventory).filter(
        Inventory.product_id == payload.product_id,
        Inventory.warehouse_id == payload.warehouse_id
    ).first()

    if not inventory_item:
        raise HTTPException(
            status_code=404, 
            detail=f"No se encontró registro de inventario para el producto ID {payload.product_id} en la sede ID {payload.warehouse_id}."
        )
    
    new_stock = inventory_item.current_stock + payload.quantity
    if new_stock < 0:
        raise HTTPException(status_code=400, detail="Stock insuficiente para realizar la salida.")
    
    old_stock = inventory_item.current_stock
    inventory_item.current_stock = new_stock
    
    # Registrar en el Kardex / Movimientos con la PK real de la tabla inventory
    movement = InventoryMovement(
        inventory_id=inventory_item.id,
        user_id=current_user.get("user_id"),
        movement_type=payload.movement_type,
        quantity=payload.quantity,
        reason=payload.reason
    )
    db.add(movement)

    # Registrar en bitácora de auditoría
    audit_entry = AuditLog(
        user_id=current_user.get("user_id"),
        action=f"STOCK_{payload.movement_type}",
        table_name="inventory",
        details={
            "inventory_id": inventory_item.id,
            "product_id": payload.product_id,
            "warehouse_id": payload.warehouse_id,
            "previous_stock": old_stock,
            "new_stock": new_stock,
            "quantity_changed": payload.quantity,
            "reason": payload.reason
        }
    )
    db.add(audit_entry)

    db.commit()
    db.refresh(inventory_item)
    
    return {"success": True, "current_stock": inventory_item.current_stock}

@router.get("/movements", dependencies=[Depends(require_permission("inventory:read"))])
def get_inventory_movements(
    product_id: int, 
    warehouse_id: int = 1, 
    db: Session = Depends(get_db)
):
    """Devuelve la bitácora Kardex calculando saldos históricos reales hacia atrás."""
    inventory_item = db.query(Inventory).filter(
        Inventory.product_id == product_id,
        Inventory.warehouse_id == warehouse_id
    ).first()

    if not inventory_item:
        return []

    # Obtenemos los movimientos ordenados del más antiguo al más reciente
    movements = db.query(InventoryMovement).filter(
        InventoryMovement.inventory_id == inventory_item.id
    ).order_by(InventoryMovement.created_at.asc()).all()

    if not movements:
        return []

    # 1. Calcular el cambio neto total de todos los movimientos registrados
    net_changes = []
    total_net_change = 0

    for m in movements:
        # VENTAS y SALIDAS restan stock
        if m.movement_type in ['SALIDA', 'VENTA']:
            change = -abs(m.quantity)
        else: # ENTRADA o AJUSTE positivo
            change = abs(m.quantity)

        # Si en la BD se guardó con signo negativo
        if m.quantity < 0:
            change = m.quantity

        net_changes.append(change)
        total_net_change += change

    # 2. El stock inicial antes de la primera transacción registrada
    # es: Stock Actual - Cambio Neto Total
    starting_stock = inventory_item.current_stock - total_net_change

    # 3. Reconstruir la secuencia histórica hacia adelante
    running_stock = starting_stock
    result = []

    for m, change in zip(movements, net_changes):
        prev_stock = running_stock
        final_stock = prev_stock + change
        running_stock = final_stock

        result.append({
            "id": m.id,
            "created_at": m.created_at,
            "movement_type": m.movement_type,
            "quantity": change,  # Devolvemos la cantidad con el signo correcto
            "previous_stock": prev_stock,
            "new_stock": final_stock,
            "reason": m.reason or m.reference_code or "Movimiento de inventario"
        })

    # Invertir para que los movimientos más recientes aparezcan arriba
    return list(reversed(result))