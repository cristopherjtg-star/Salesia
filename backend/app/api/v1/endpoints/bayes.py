from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_permission, get_current_user_payload
from app.statistics_engine import calculate_bayes
from app.models.statistics import StatisticalAnalysis
from app.models.bayes import BayesAnalysis
from app.models.insight import Insight  # <--- 1. Importar el modelo Insight

router = APIRouter()

class BayesPayload(BaseModel):
    prior: float = Field(..., ge=0, le=1, description="P(A) - Probabilidad a priori")
    likelihood: float = Field(..., ge=0, le=1, description="P(B|A) - Verosimilitud")
    marginal: float = Field(..., gt=0, le=1, description="P(B) - Probabilidad marginal")
    hypothesis_description: str | None = None
    evidence_description: str | None = None

@router.post("/calculate", dependencies=[Depends(require_permission("analytics:read"))])
def run_bayes_analysis(
    payload: BayesPayload,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload)
):
    try:
        # 2. Ejecutar el cálculo matemático del motor de Bayes
        results = calculate_bayes(
            prior=payload.prior,
            likelihood=payload.likelihood,
            marginal=payload.marginal
        )

        # 3. Crear automáticamente el registro padre en statistical_analyses
        parent_analysis = StatisticalAnalysis(
            user_id=current_user.get("user_id"),
            analysis_type="bayes_theorem",
            results=results
        )
        db.add(parent_analysis)
        db.flush()  # Genera el ID del padre sin cerrar la transacción todavía

        # 4. Crear el registro dependiente en bayes_analyses usando el ID del padre
        analysis_record = BayesAnalysis(
            statistical_analysis_id=parent_analysis.id,
            prior_probability=payload.prior,
            likelihood=payload.likelihood,
            marginal_probability=payload.marginal,
            posterior_probability=results["posterior"],
            hypothesis_description=payload.hypothesis_description,
            evidence_description=payload.evidence_description
        )
        db.add(analysis_record)

        # 5. GENERAR AUTOMÁTICAMENTE EL INSIGHT BASADO EN EL RESULTADO
        posterior = results["posterior"]
        impact = "CRITICAL" if posterior > 0.7 else "WARNING" if posterior > 0.4 else "INFO"
        
        auto_insight = Insight(
            statistical_analysis_id=parent_analysis.id,
            code=f"INS-BAYES-{parent_analysis.id}",
            title=f"Evaluación Bayesiana: {payload.hypothesis_description or 'Análisis de Probabilidad'}",
            description=f"La probabilidad posterior calculada es de {posterior:.4f}, fundamentada en la evidencia provista.",
            impact_level=impact,
            evidence_data={
                "prior": payload.prior,
                "likelihood": payload.likelihood,
                "marginal": payload.marginal,
                "posterior": posterior
            }
        )
        db.add(auto_insight)

        db.commit()  # Confirma toda la transacción (análisis, bayes_analyses e insights) en Supabase

        return results
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno al guardar en base de datos: {str(e)}")