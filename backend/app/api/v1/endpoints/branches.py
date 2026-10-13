from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.database import supabase

router = APIRouter(tags=["Branches & Warehouses"])

class BranchCreate(BaseModel):
    company_id: int
    code: str
    name: str
    address: Optional[str] = None
    is_active: Optional[bool] = True

class BranchUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

@router.get("")
@router.get("/")
def get_branches():
    try:
        # Traemos todos los almacenes ordenados o filtrados según necesites
        response = supabase.table("warehouses").select("*").execute()
        return {
            "success": True,
            "message": "Sedes y almacenes obtenidos desde Supabase",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
@router.post("/")
def create_branch(branch: BranchCreate):
    try:
        payload = branch.dict() if hasattr(branch, 'dict') else branch.model_dump()
        response = supabase.table("warehouses").insert(payload).execute()
        return {
            "success": True,
            "message": "Sede registrada en Supabase exitosamente",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{branch_id}")
def update_branch(branch_id: int, branch: BranchUpdate):
    try:
        # Filtramos solo los campos que se envían para actualizar
        payload = {k: v for k, v in (branch.dict() if hasattr(branch, 'dict') else branch.model_dump()).items() if v is not None}
        
        response = supabase.table("warehouses").update(payload).eq("id", branch_id).execute()
        return {
            "success": True,
            "message": "Sede actualizada exitosamente",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{branch_id}/deactivate")
def deactivate_branch(branch_id: int):
    try:
        # Baja lógica en lugar de borrado físico (mantiene la integridad con inventarios)
        response = supabase.table("warehouses").update({"is_active": False}).eq("id", branch_id).execute()
        return {
            "success": True,
            "message": "Sede desactivada correctamente (baja lógica)",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))