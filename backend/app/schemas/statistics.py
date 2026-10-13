from pydantic import BaseModel, Field

class DatasetAnalysisRequest(BaseModel):
    values: list[float] = Field(..., description="Conjunto de datos numéricos para análisis estadístico")

class CentralTendencyResult(BaseModel):
    count: int
    mean: float
    median: float
    min: float
    max: float
    bias_analysis: str