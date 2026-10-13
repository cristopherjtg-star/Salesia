from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class BayesAnalysis(Base):
    __tablename__ = "bayes_analyses"

    id = Column(Integer, primary_key=True, index=True)
    statistical_analysis_id = Column(Integer, ForeignKey("statistical_analyses.id"), nullable=True)
    prior_probability = Column(Float, nullable=False)
    likelihood = Column(Float, nullable=False)
    marginal_probability = Column(Float, nullable=False)
    posterior_probability = Column(Float, nullable=False)
    hypothesis_description = Column(String, nullable=True)
    evidence_description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())