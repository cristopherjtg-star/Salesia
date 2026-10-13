from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class StatisticalAnalysis(Base):
    __tablename__ = "statistical_analyses"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, nullable=True)  # Opcional según si envías dataset
    user_id = Column(Integer, nullable=True)     # ID del usuario autenticado
    analysis_type = Column(String(50), nullable=False)
    results = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())