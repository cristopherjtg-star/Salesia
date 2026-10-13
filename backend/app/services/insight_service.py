from sqlalchemy.orm import Session
from app.models.statistics import Insight

def create_insight_record(db: Session, company_id: int, code: str, title: str, description: str, impact_level: str = "INFO", evidence_data: dict = None) -> Insight:
    insight = Insight(
        company_id=company_id,
        code=code,
        title=title,
        description=description,
        impact_level=impact_level,
        evidence_data=evidence_data
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)
    return insight