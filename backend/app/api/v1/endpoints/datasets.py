from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
import pandas as pd
import io
from app.core.database import get_db
from app.core.dependencies import require_permission
from app.models.analytics import DatasetAnalysis, Dataset, DatasetVariable
# Asegúrate de importar también los modelos de datasets y variables (ajusta la ruta según tu proyecto)

router = APIRouter()

@router.post("/upload-csv", dependencies=[Depends(require_permission("analytics:read"))])
async def upload_and_analyze_csv(
    company_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Procesa un archivo CSV y guarda el análisis estadístico estructurado
    en dataset_analyses, datasets y dataset_variables.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="El archivo debe tener formato CSV"
        )

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        if df.empty:
            raise HTTPException(status_code=400, detail="El archivo CSV está vacío")

        total_rows = len(df)
        total_columns = len(df.columns)

        # 1. Guardar primero en la tabla principal 'datasets'
        dataset_record = Dataset(
            company_id=company_id,
            name=file.filename,
            description=f"Dataset importado con {total_rows} filas y {total_columns} columnas."
        )
        db.add(dataset_record)
        db.flush() # Hace un flush para obtener el ID generado sin comprometer toda la transacción aún

        # 2. Guardar las columnas individuales en 'dataset_variables'
        for column in df.columns:
            col_type = str(df[column].dtype)
            variable_record = DatasetVariable(
                dataset_id=dataset_record.id,
                variable_name=column,
                variable_type=col_type,
                description=f"Columna detectada con tipo {col_type}"
            )
            db.add(variable_record)

        # Filtrar columnas numéricas para cálculos estadísticos seguros
        numeric_df = df.select_dtypes(include=['number'])

        metrics_summary = {
            "total_rows": total_rows,
            "total_columns": total_columns,
            "columns": list(df.columns),
            "descriptive_stats": numeric_df.describe().to_dict() if not numeric_df.empty else {},
            "missing_values": df.isnull().sum().to_dict()
        }

        # 3. Guardar el resumen en 'dataset_analyses'
        analysis_record = DatasetAnalysis(
            company_id=company_id,
            dataset_name=file.filename,
            metrics_summary=metrics_summary
        )

        db.add(analysis_record)
        db.commit()
        db.refresh(analysis_record)

        return {
            "message": "Dataset analizado y guardado con éxito en todas las tablas",
            "id": analysis_record.id,
            "dataset_id": dataset_record.id,
            "company_id": analysis_record.company_id,
            "dataset_name": analysis_record.dataset_name,
            "metrics_summary": analysis_record.metrics_summary,
            "created_at": analysis_record.created_at
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error procesando el archivo: {str(e)}"
        )


@router.get("/", dependencies=[Depends(require_permission("analytics:read"))])
def list_dataset_analyses(db: Session = Depends(get_db)):
    """Retorna el historial completo de análisis almacenados en dataset_analyses."""
    analyses = db.query(DatasetAnalysis).order_by(DatasetAnalysis.created_at.desc()).all()
    return analyses