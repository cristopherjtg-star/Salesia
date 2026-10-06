from app.core.database import Base
from app.models.company import Company
from app.models.role_permission import Role, Permission, role_permissions
from app.models.user import User
from app.models.customer import Customer
from app.models.product import Category, Product
from app.models.inventory import Inventory, InventoryMovement
from app.models.sale import Sale, SaleDetail
from app.models.insight import Insight  # <-- CAMBIAR AQUÍ (apunta a .insight en vez de .statistics)
from app.models.statistics import StatisticalAnalysis  # <-- Aquí queda solo StatisticalAnalysis
from app.models.analytics import DatasetAnalysis
from app.models.audit import AuditLog
from app.models.bayes import BayesAnalysis

__all__ = [
    "Base",
    "Company",
    "Role",
    "Permission",
    "role_permissions",
    "User",
    "Customer",
    "Category",
    "Product",
    "Inventory",
    "InventoryMovement",
    "Sale",
    "SaleDetail",
    "Insight",
    "StatisticalAnalysis",
    "DatasetAnalysis",
    "AuditLog",
    "BayesAnalysis"
]