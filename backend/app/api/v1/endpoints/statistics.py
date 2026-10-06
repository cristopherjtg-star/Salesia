from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_permission, get_current_user_payload
from app.statistics_engine import calculate_central_tendency, classify_variable_type, calculate_discrete_frequency
from app.models.statistics import StatisticalAnalysis

router = APIRouter()

class NumericDataPayload(BaseModel):
    values: list[float]

class GeneralDataPayload(BaseModel):
    data: list

@router.post("/central-tendency", dependencies=[Depends(require_permission("analytics:read"))])
def get_central_tendency(
    payload: NumericDataPayload, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user_payload)
):
    """Calcula Media, Mediana, Mínimo, Máximo y Análisis de Sesgo, registrando el historial en BD."""
    try:
        results = calculate_central_tendency(payload.values)
        
        # Registro automático en la tabla statistical_analyses
        analysis_record = StatisticalAnalysis(
            user_id=current_user.get("user_id"),
            analysis_type="central_tendency",
            results=results
        )
        db.add(analysis_record)
        db.commit()

        return results
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/classify-variable", dependencies=[Depends(require_permission("analytics:read"))])
def post_classify_variable(
    payload: GeneralDataPayload, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user_payload)
):
    """Infiere el tipo de variable estadística y registra el historial en BD."""
    try:
        results = classify_variable_type(payload.data)
        
        analysis_record = StatisticalAnalysis(
            user_id=current_user.get("user_id"),
            analysis_type="classify_variable",
            results={"classification": results}
        )
        db.add(analysis_record)
        db.commit()

        return results
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/frequency", dependencies=[Depends(require_permission("analytics:read"))])
def post_frequency(
    payload: GeneralDataPayload, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user_payload)
):
    """Calcula frecuencias absolutas y relativas, registrando el historial en BD."""
    try:
        results = calculate_discrete_frequency(payload.data)
        
        analysis_record = StatisticalAnalysis(
            user_id=current_user.get("user_id"),
            analysis_type="frequency",
            results=results
        )
        db.add(analysis_record)
        db.commit()

        return results
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))