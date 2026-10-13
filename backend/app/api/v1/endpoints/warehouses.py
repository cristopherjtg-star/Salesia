from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db

# Definimos el router con la etiqueta y prefijo adecuados
router = APIRouter(tags=["Branches & Warehouses"])

class BranchCreate(BaseModel):
    company_id: int
    code: str
    name: str
    address: Optional[str] = None
    is_active: Optional[bool] = True

@router.get("")
@router.get("/")
def get_branches():
    try:
        # Consulta real a la tabla 'warehouses' o 'branches' en Supabase 
        # (asegúrate de que el nombre de la tabla en Supabase sea 'warehouses' o cámbialo si creaste una tabla llamada 'branches')
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
        response = supabase.table("warehouses").insert(branch.dict()).execute()
        return {
            "success": True,
            "message": "Sede registrada en Supabase exitosamente",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))