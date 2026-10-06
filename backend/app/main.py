# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.routers import api_router
from app.core.exceptions import BusinessLogicException, business_exception_handler

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    version="1.0.0"
)

# Configuración de orígenes permitidos para CORS
origins = [
    "http://localhost:5173",  # Vite local
    "http://localhost:3000",
    "https://salesia.vercel.app",  # Reemplaza con tu dominio exacto de Vercel si es diferente
    "*"  # Permite cualquier origen (util para evitar bloqueos durante pruebas)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Manejador global de excepciones de negocio
app.add_exception_handler(BusinessLogicException, business_exception_handler)

# Registrar el router principal de la versión 1 (Ej: /api/v1)
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "api_v1_prefix": settings.API_V1_STR,
        "docs": "/docs"
    }