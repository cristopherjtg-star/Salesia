from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import numpy as np

from app.core.database import get_db
from app.models.sale import Sale
from app.models.customer import Customer
from app.models.insight import Insight
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.category import Category  # <-- IMPORTACIÓN AÑADIDA

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Calcula las métricas ejecutivas, media, mediana, distribución de inventario por categoría y recupera insights reales desde PostgreSQL."""
    
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
            "inventory_distribution": [],
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

    # 4. Distribución de Inventario: Relacionando Inventory -> Products -> Categories
    inv_query = db.query(
        Category.name.label("category_name"),
        func.sum(Inventory.current_stock).label("total_stock")
    ).join(Product, Product.category_id == Category.id)\
     .join(Inventory, Inventory.product_id == Product.id)\
     .group_by(Category.name).all()

    total_overall_stock = sum([row.total_stock for row in inv_query]) or 1

    colors = ["#3b82f6", "#06b6d4", "#f59e0b", "#10b981", "#8b5cf6"]
    inventory_distribution = [
        {
            "name": row.category_name,
            "percentage": round(float((row.total_stock / total_overall_stock) * 100), 1),
            "color": colors[idx % len(colors)]
        }
        for idx, row in enumerate(inv_query)
    ]

    # 5. Recuperar los insights generados por el motor analítico
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
        "inventory_distribution": inventory_distribution,
        "recent_insights": formatted_insights
    }