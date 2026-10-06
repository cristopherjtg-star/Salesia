from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import require_permission
from app.models.sale import Sale

router = APIRouter()

@router.get("/summary", dependencies=[Depends(require_permission("analytics:read"))])
def get_sales_summary(db: Session = Depends(get_db)):
    """Obtiene un resumen ejecutivo de ventas totales, ticket medio y volumen."""
    total_sales = db.query(func.sum(Sale.total)).scalar() or 0.0
    count_sales = db.query(func.count(Sale.id)).scalar() or 0
    avg_ticket = total_sales / count_sales if count_sales > 0 else 0.0

    return {
        "total_revenue": round(float(total_sales), 2),
        "total_transactions": count_sales,
        "average_ticket": round(float(avg_ticket), 2)
    }