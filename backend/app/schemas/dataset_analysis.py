from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class DatasetAnalysisBase(BaseModel):
    dataset_name: str
    company_id: int
    metrics_summary: Optional[Dict[str, Any]] = None

class DatasetAnalysisCreate(DatasetAnalysisBase):
    pass

class DatasetAnalysisResponse(DatasetAnalysisBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True