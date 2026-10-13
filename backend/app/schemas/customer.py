from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class CustomerBase(BaseModel):
    company_id: int
    document_type: str = Field(..., max_length=20)
    document_number: str = Field(..., max_length=20)
    name: str = Field(..., max_length=150)
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True