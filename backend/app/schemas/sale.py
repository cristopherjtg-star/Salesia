from pydantic import BaseModel, Field
from datetime import datetime

class SaleItemSchema(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class SaleCreateSchema(BaseModel):
    company_id: int
    customer_id: int
    sale_code: str = Field(..., max_length=50)
    items: list[SaleItemSchema]
    payment_method: str = "EFECTIVO"

class SaleDetailResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    total_price: float

    class Config:
        from_attributes = True

class SaleResponse(BaseModel):
    id: int
    company_id: int
    customer_id: int
    seller_id: int
    sale_code: str
    subtotal: float
    tax: float
    total: float
    status: str
    created_at: datetime
    details: list[SaleDetailResponse] = []

    class Config:
        from_attributes = True