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

# Configuración explícita y robusta de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://salesia-975boy15j-cristopherjtg-star.vercel.app",  # Tu URL actual de Vercel
    ],
    allow_origin_regex=r"https://.*salesia.*\.vercel\.app",  # Cualquier subdominio de SalesIA en Vercel
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
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