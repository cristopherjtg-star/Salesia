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

# Orígenes explícitos permitidos
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://salesia.vercel.app",
    "https://salesia-nine.vercel.app",
]

# Middleware de CORS con soporte para comodines y cualquier vista previa de Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Otorga acceso a CUALQUIER subdominio de vercel.app
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