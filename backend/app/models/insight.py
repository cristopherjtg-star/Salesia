from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Insight(Base):
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, index=True)
    statistical_analysis_id = Column(Integer, ForeignKey("statistical_analyses.id"), nullable=False)
    code = Column(String(50), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(String, nullable=False)
    impact_level = Column(String(20), default="INFO")
    evidence_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())