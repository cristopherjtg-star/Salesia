# backend/app/api/v1/routers.py
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    customers,
    products,
    inventory,
    sales,
    statistics,
    bayes,
    insights,
    reports,
    dashboard,
    datasets,
    audit  # 1. Importar el módulo de auditoría
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
api_router.include_router(sales.router, prefix="/sales", tags=["Sales"])
api_router.include_router(statistics.router, prefix="/statistics", tags=["Statistics"])
api_router.include_router(bayes.router, prefix="/bayes", tags=["Bayes Engine"])
api_router.include_router(insights.router, prefix="/insights", tags=["Insights"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["Datasets & IA"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit"])  # 2. Registrar la ruta de auditoría