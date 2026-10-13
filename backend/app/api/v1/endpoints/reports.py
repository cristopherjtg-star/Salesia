from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.core.database import supabase

router = APIRouter(tags=["Reports"])

class ReportCreate(BaseModel):
    company_id: int = 1
    user_id: int = 1
    report_type: str # Ej: "SALES", "PERSONAL", "INVENTORY"
    parameters: Optional[Dict[str, Any]] = {}

@router.get("")
@router.get("/")
def get_reports():
    try:
        response = supabase.table("reports").select("*").execute()
        return {
            "success": True,
            "message": "Historial de reportes obtenido correctamente",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
@router.post("/")
def create_report(report: ReportCreate):
    try:
        report_type = report.report_type.upper()
        compiled_data = []
        title = f"Reporte {report_type}"

        # 1. Consulta dinámica basada en tus tablas reales de Supabase
        if report_type == "SALES":
            sales_res = supabase.table("sales").select("sale_code, total, status, created_at").eq("company_id", report.company_id).execute()
            compiled_data = sales_res.data
            title = "Reporte General de Ventas"

        elif report_type == "PERSONAL":
            emp_res = supabase.table("employees").select("position, hire_date, is_active, users(first_name, last_name, email)").eq("company_id", report.company_id).execute()
            compiled_data = emp_res.data
            title = "Reporte de Personal y Colaboradores"

        elif report_type == "INVENTORY":
            inv_res = supabase.table("inventory").select("current_stock, min_stock, products(sku, name, unit_price), warehouses(name)").execute()
            compiled_data = inv_res.data
            title = "Reporte de Inventario y Stock"
        
        else:
            raise HTTPException(status_code=400, detail="Tipo de reporte no válido")

        # 2. Generar ruta del archivo PDF simulada/registrada
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_url = f"/storage/reports/{report_type.lower()}_{timestamp_str}.pdf"

        # 3. Preparar el payload guardando TODOS los registros completos (sin truncar a 10)
        payload = {
            "company_id": report.company_id,
            "user_id": report.user_id,
            "title": title,
            "report_type": report_type,
            "parameters": {
                "filters": report.parameters,
                "generated_at": datetime.now().isoformat(),
                "total_records": len(compiled_data),
                "data_preview": compiled_data  # <--- Guardamos TODOS los registros obtenidos
            },
            "file_url": file_url
        }

        # 4. Insertar el registro de auditoría en la tabla reports
        response = supabase.table("reports").insert(payload).execute()

        return {
            "success": True,
            "message": f"{title} generado exitosamente desde las tablas del ERP",
            "data": response.data,
            "compiled_records": len(compiled_data)
        }

    except Exception as e:
        print("Error al generar reporte:", str(e))
        raise HTTPException(status_code=400, detail=str(e))