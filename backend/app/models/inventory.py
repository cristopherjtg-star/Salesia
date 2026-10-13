from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), unique=True, nullable=False)
    current_stock = Column(Integer, nullable=False, default=0)
    min_stock = Column(Integer, nullable=False, default=5)
    
    # 1. Foreign Key explícita hacia la tabla warehouses
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True) 
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # 2. Relaciones ORM
    product = relationship("Product", back_populates="inventory")
    warehouse = relationship("Warehouse", back_populates="inventories")


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    movement_type = Column(String(50), nullable=False) # ENTRADA, SALIDA, AJUSTE
    quantity = Column(Integer, nullable=False)
    reference_code = Column(String(100), nullable=True)
    reason = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())