from sqlalchemy.orm import Session
from app.models.inventory import Inventory, InventoryMovement

def register_stock_movement(db: Session, inventory_id: int, user_id: int, quantity: int, movement_type: str, reason: str = None) -> Inventory:
    inventory_item = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inventory_item:
        raise ValueError("Item de inventario no encontrado.")
    
    new_stock = inventory_item.current_stock + quantity
    if new_stock < 0:
        raise ValueError("Stock insuficiente para realizar la operación.")
    
    inventory_item.current_stock = new_stock
    
    movement = InventoryMovement(
        inventory_id=inventory_item.id,
        user_id=user_id,
        movement_type=movement_type,
        quantity=quantity,
        reason=reason
    )
    db.add(movement)
    db.commit()
    db.refresh(inventory_item)
    return inventory_item