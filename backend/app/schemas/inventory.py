from pydantic import BaseModel, Field
from datetime import datetime

class InventoryResponse(BaseModel):
    id: int
    product_id: int
    current_stock: int
    minimum_stock: int
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

class StockAdjustmentSchema(BaseModel):
    inventory_id: int
    quantity: int = Field(..., description="Cantidad positiva (entrada) o negativa (salida)")
    movement_type: str = Field(..., description="ENTRADA, SALIDA, AJUSTE")
    reason: str | None = None