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

# Configuración amplia para permitir cualquier despliegue de Vercel y local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite cualquier origen (resuelve el cambio de URLs en Vercel)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Manejador global de excepciones
app.add_exception_handler(BusinessLogicException, business_exception_handler)

# Registrar el router principal
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "docs": "/docs"
    }