from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_permission
from app.models.insight import Insight

router = APIRouter()

@router.get("/", dependencies=[Depends(require_permission("analytics:read"))])
def get_insights(db: Session = Depends(get_db)):
    """Obtiene el panel de hallazgos estadísticos y anomalías detectadas."""
    insights = db.query(Insight).order_by(Insight.created_at.desc()).all()
    return [
        {
            "id": i.id,
            "code": i.code,
            "title": i.title,
            "description": i.description,
            "impact_level": i.impact_level,
            "evidence_data": i.evidence_data,
            "created_at": i.created_at
        }
        for i in insights
    ]