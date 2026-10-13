import os
from sqlalchemy import create_engine

from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from supabase import create_client, Client

from supabase import create_client, Client



engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



Base = declarative_base()



def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()



# --- Cliente de Supabase independiente ---

SUPABASE_URL = "https://fsqgvlcmhjysshhbkidn.supabase.co"

SUPABASE_KEY = os.getenv("SECRET_KEY")  # <--- Usamos os.getenv para leerlo directamente del sistema/Render



supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)