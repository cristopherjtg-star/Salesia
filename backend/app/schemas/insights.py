from pydantic import BaseModel
from datetime import datetime

class InsightResponse(BaseModel):
    id: int
    code: str
    title: str
    description: str
    impact_level: str
    evidence_data: dict | None = None
    created_at: datetime

    class Config:
        from_attributes = True