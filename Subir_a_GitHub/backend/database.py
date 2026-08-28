import os
import datetime
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Si existe variable de entorno DATABASE_URL (Render/Postgres), úsala; si no, SQLite local
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gastos.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if "sqlite" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TransaccionDB(Base):
    __tablename__ = "transacciones"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(20), default="gasto")
    monto = Column(Float, nullable=False)
    categoria = Column(String(50), nullable=False)
    descripcion = Column(String(200), nullable=False)
    fecha = Column(String(10), nullable=False)
    metodo_pago = Column(String(50), default="Yape")
    notas = Column(Text, nullable=True)
    etiquetas = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PresupuestoDB(Base):
    __tablename__ = "presupuestos"

    id = Column(Integer, primary_key=True, index=True)
    categoria = Column(String(50), unique=True, nullable=False)
    monto_limite = Column(Float, nullable=False)
    color = Column(String(20), default="#3B82F6")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Presupuestos iniciales
    if db.query(PresupuestoDB).count() == 0:
        presupuestos_default = [
            PresupuestoDB(categoria="Alimentación", monto_limite=400.0, color="#EF4444"),
            PresupuestoDB(categoria="Vivienda y Servicios", monto_limite=600.0, color="#3B82F6"),
            PresupuestoDB(categoria="Transporte", monto_limite=150.0, color="#F59E0B"),
            PresupuestoDB(categoria="Entretenimiento", monto_limite=120.0, color="#8B5CF6"),
            PresupuestoDB(categoria="Suscripciones", monto_limite=50.0, color="#EC4899"),
            PresupuestoDB(categoria="Salud y Cuidado", monto_limite=100.0, color="#10B981"),
            PresupuestoDB(categoria="Compras personales", monto_limite=150.0, color="#6366F1"),
            PresupuestoDB(categoria="Educación", monto_limite=80.0, color="#14B8A6"),
            PresupuestoDB(categoria="Otros", monto_limite=100.0, color="#6B7280"),
        ]
        db.add_all(presupuestos_default)
        db.commit()

    db.close()
