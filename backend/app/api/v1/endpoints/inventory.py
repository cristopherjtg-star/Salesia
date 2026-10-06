from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_permission, get_current_user_payload
from app.models.inventory import Inventory, InventoryMovement
from app.models.audit import AuditLog  # <-- 1. Importar el modelo de auditoría

router = APIRouter()

class StockAdjustmentSchema(BaseModel):
    inventory_id: int
    quantity: int = Field(..., description="Cantidad a ajustar (positiva o negativa)")
    movement_type: str = Field(..., description="ENTRADA, SALIDA, AJUSTE")
    reason: str | None = None

@router.get("/", dependencies=[Depends(require_permission("inventory:read"))])
def get_inventory(db: Session = Depends(get_db)):
    """Obtiene el estado actual del inventario y existencias."""
    return db.query(Inventory).all()

@router.post("/adjust", dependencies=[Depends(require_permission("inventory:manage"))])
def adjust_stock(payload: StockAdjustmentSchema, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user_payload)):
    """Registra un movimiento de entrada o salida y actualiza el stock actual."""
    inventory_item = db.query(Inventory).filter(Inventory.id == payload.inventory_id).first()
    if not inventory_item:
        raise HTTPException(status_code=404, detail="Item de inventario no encontrado.")
    
    new_stock = inventory_item.current_stock + payload.quantity
    if new_stock < 0:
        raise HTTPException(status_code=400, detail="Stock insuficiente para realizar la salida.")
    
    old_stock = inventory_item.current_stock
    inventory_item.current_stock = new_stock
    
    # Registrar en el Kardex / Movimientos
    movement = InventoryMovement(
        inventory_id=inventory_item.id,
        user_id=current_user.get("user_id"),
        movement_type=payload.movement_type,
        quantity=payload.quantity,
        reason=payload.reason
    )
    db.add(movement)

    # 2. Registrar la acción en la bitácora de auditoría (RF-22)
    audit_entry = AuditLog(
        user_id=current_user.get("user_id"),
        action=f"STOCK_{payload.movement_type}",
        table_name="inventory",
        details={
            "inventory_id": inventory_item.id,
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