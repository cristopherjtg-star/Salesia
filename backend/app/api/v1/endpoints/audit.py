from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_permission
from app.models.audit import AuditLog
from app.schemas.audit import AuditLogResponse

router = APIRouter()

@router.get("/", response_model=List[AuditLogResponse], dependencies=[Depends(require_permission("users:manage"))])
def get_audit_logs(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    table_name: Optional[str] = Query(None, description="Filtrar por tabla afectada")
):
    """Obtiene el historial de auditoría del sistema."""
    query = db.query(AuditLog)
    if table_name:
        query = query.filter(AuditLog.table_name == table_name)
    
    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs