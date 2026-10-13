from pydantic import BaseModel, Field
from datetime import datetime

class CategorySchema(BaseModel):
    id: int
    name: str
    description: str | None = None

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    company_id: int
    category_id: int
    sku: str = Field(..., max_length=50)
    name: str = Field(..., max_length=150)
    description: str | None = None
    unit_price: float = Field(..., ge=0)
    cost_price: float = Field(..., ge=0)

class ProductResponse(ProductCreate):
    id: int
    is_active: bool
    created_at: datetime
    category: CategorySchema | None = None

    class Config:
        from_attributes = True