from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import numpy as np

from app.core.database import get_db
from app.models.sale import Sale
from app.models.customer import Customer
from app.models.insight import Insight

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Calcula las métricas ejecutivas, media, mediana y recupera insights reales desde PostgreSQL."""
    
    # 1. Obtener todas las ventas completadas para cálculos precisos (Media y Mediana)
    sales = db.query(Sale).filter(Sale.status == 'COMPLETED').all()
    
    if not sales:
        return {
            "total_revenue": 0.0,
            "total_sales": 0,
            "active_customers": 0,
            "ticket_promedio": 0.0,
            "mean_sale": 0.0,
            "median_sale": 0.0,
            "recent_insights": []
        }

    amounts = [float(s.total) for s in sales]
    
    total_revenue = sum(amounts)
    total_sales = len(amounts)
    
    # 2. Cálculos estadísticos (Semana 07: Media vs Mediana)
    mean_sale = float(np.mean(amounts)) if amounts else 0.0
    median_sale = float(np.median(amounts)) if amounts else 0.0
    ticket_promedio = mean_sale  # Ingreso medio por transacción

    # 3. Conteo real de clientes activos en la tabla customers
    active_customers = db.query(func.count(Customer.id)).filter(Customer.is_active == True).scalar() or 0

    # 4. Recuperar los insights generados por el motor analítico
    recent_insights = db.query(Insight).order_by(Insight.created_at.desc()).limit(5).all()
    
    formatted_insights = [
        {
            "id": i.id,
            "title": i.title,
            "description": i.description,
            "created_at": i.created_at.strftime("%Y-%m-%d")
        }
        for i in recent_insights
    ]

    return {
        "total_revenue": total_revenue,
        "total_sales": total_sales,
        "active_customers": active_customers,
        "ticket_promedio": ticket_promedio,
        "mean_sale": mean_sale,
        "median_sale": median_sale,
        "recent_insights": formatted_insights
    }