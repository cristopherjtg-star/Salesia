from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.core.database import supabase

router = APIRouter(tags=["Employees"])

class EmployeeCreate(BaseModel):
    company_id: int
    user_id: int
    position: Optional[str] = "Administrador"
    hire_date: Optional[date] = None
    is_active: Optional[bool] = True

class EmployeeUpdate(BaseModel):
    position: Optional[str] = None
    hire_date: Optional[date] = None
    is_active: Optional[bool] = None

@router.get("/")
def get_employees():
    try:
        # Traemos los datos del empleado junto con la info del usuario asociado (nombre, apellido, email)
        response = supabase.table("employees").select("*, users(first_name, last_name, email, dni)").execute()
        return {
            "success": True,
            "message": "Personal obtenido desde Supabase con datos de usuario",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
def create_employee(employee: EmployeeCreate):
    try:
        payload = employee.dict() if hasattr(employee, 'dict') else employee.model_dump()
        if payload.get("hire_date"):
            payload["hire_date"] = str(payload["hire_date"])
        
        response = supabase.table("employees").insert(payload).execute()
        
        return {
            "success": True,
            "message": "Personal guardado en Supabase exitosamente",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{employee_id}")
def update_employee(employee_id: int, employee: EmployeeUpdate):
    try:
        payload = {k: v for k, v in (employee.dict() if hasattr(employee, 'dict') else employee.model_dump()).items() if v is not None}
        if payload.get("hire_date"):
            payload["hire_date"] = str(payload["hire_date"])

        response = supabase.table("employees").update(payload).eq("id", employee_id).execute()
        return {
            "success": True,
            "message": "Personal actualizado exitosamente",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{employee_id}/deactivate")
def deactivate_employee(employee_id: int):
    try:
        response = supabase.table("employees").update({"is_active": False}).eq("id", employee_id).execute()
        return {
            "success": True,
            "message": "Personal desactivado correctamente (baja lógica)",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))