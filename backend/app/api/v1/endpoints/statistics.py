from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np

from app.core.database import get_db
from app.core.dependencies import require_permission, get_current_user_payload
from app.statistics_engine import calculate_central_tendency, classify_variable_type, calculate_discrete_frequency
from app.models.statistics import StatisticalAnalysis
from app.models.sale import Sale  # Asegúrate de importar tu modelo de ventas real
from app.models.inventory import Inventory # Asegúrate de importar el modelo Inventory


router = APIRouter()

class NumericDataPayload(BaseModel):
    values: list[float]

class GeneralDataPayload(BaseModel):
    data: list

# ==========================================
# 1. RUTAS MANUALES (Simulación / Datasets externos)
# ==========================================

@router.post("/central-tendency", dependencies=[Depends(require_permission("analytics:read"))])
def get_central_tendency(
    payload: NumericDataPayload, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user_payload)
):
    """Calcula Media, Mediana, Mínimo, Máximo y Análisis de Sesgo, registrando el historial en BD."""
    if not payload.values:
        raise HTTPException(status_code=400, detail="La lista de valores no puede estar vacía.")
    try:
        results = calculate_central_tendency(payload.values)
        
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
    if not payload.data:
        raise HTTPException(status_code=400, detail="El conjunto de datos no puede estar vacío.")
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
    if not payload.data:
        raise HTTPException(status_code=400, detail="El conjunto de datos no puede estar vacío.")
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


# ==========================================
# 2. NUEVOS ENDPOINTS AUTOMÁTICOS (Enterprise NumOps)
# ==========================================

# Modifica el decorador para que responda a la ruta que busca el frontend:

@router.get("/enterprise-metrics", dependencies=[Depends(require_permission("analytics:read"))])
@router.get("/enterprise/sales-analysis", dependencies=[Depends(require_permission("analytics:read"))])
def get_enterprise_statistics(
    source: str = Query(..., description="sales o inventory"),
    warehouse_id: int = Query(1, description="ID de la sede a filtrar"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload)
):
    """Extrae datos reales de Supabase (Ventas o Inventario) y calcula métricas con NumPy/Pandas."""
    
    data_series = []

    if source == "sales":
        sales_records = db.query(Sale).all()
        data_series = [float(s.total) for s in sales_records if s.total is not None]
    elif source == "inventory":
        inv_records = db.query(Inventory).filter(Inventory.warehouse_id == warehouse_id).all()
        data_series = [float(i.current_stock) for i in inv_records if i.current_stock is not None]

    if not data_series:
        raise HTTPException(
            status_code=404, 
            detail=f"No se encontraron registros de {source} para procesar en la base de datos."
        )

    # Procesamiento con Pandas y NumPy
    df = pd.Series(data_series)
    mean_val = float(df.mean())
    std_val = float(df.std()) if len(df) > 1 else 0.0
    cv_val = float((std_val / mean_val) * 100) if mean_val != 0 else 0.0

    results = {
        "source": source,
        "count": int(df.count()),
        "sum": round(float(df.sum()), 2),
        "mean": round(mean_val, 2),
        "median": round(float(df.median()), 2),
        "std_dev": round(std_val, 2),
        "min": round(float(df.min()), 2),
        "max": round(float(df.max()), 2),
        "q25": round(float(df.quantile(0.25)), 2),
        "q75": round(float(df.quantile(0.75)), 2),
        "coef_variation": round(cv_val, 2),
        "volatility_status": "Alta Volatilidad (Riesgo)" if cv_val > 30 else "Estable / Controlado"
    }

    # Registro de auditoría
    analysis_record = StatisticalAnalysis(
        user_id=current_user.get("user_id"),
        analysis_type=f"enterprise_{source}_analytics",
        results=results
    )
    db.add(analysis_record)
    db.commit()

    return results