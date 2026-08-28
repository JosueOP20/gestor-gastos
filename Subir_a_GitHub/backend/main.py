import io
import csv
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, model_validator
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from database import init_db, get_db, TransaccionDB, PresupuestoDB
from categorizer import predecir_categoria

app = FastAPI(
    title="Sistema de Control de Gastos API",
    description="API REST para registro de transacciones, presupuestos, estadísticas y categorización automática.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

import unicodedata

def quitar_tildes(texto: str) -> str:
    if not texto:
        return ""
    return "".join(c for c in unicodedata.normalize("NFD", str(texto).lower().strip()) if unicodedata.category(c) != "Mn")

class TransaccionCreate(BaseModel):
    tipo: Optional[str] = Field("gasto", description="Tipo de transacción: 'gasto' o 'ingreso'")
    monto: Optional[float] = Field(None, description="Monto en moneda local")
    categoria: Optional[str] = Field(None, description="Categoría asignada (si se omite, se auto-categoriza)")
    descripcion: Optional[str] = Field(None, description="Concepto o descripción del gasto/ingreso")
    fecha: Optional[str] = Field(None, description="Fecha en formato YYYY-MM-DD")
    metodo_pago: Optional[str] = Field("Yape", description="Método de pago utilizado")
    notas: Optional[str] = Field("", description="Notas adicionales o detalles")
    etiquetas: Optional[str] = Field("", description="Etiquetas separadas por comas")

    @model_validator(mode="before")
    @classmethod
    def normalizar_claves(cls, data):
        if isinstance(data, dict):
            norm = {}
            for k, v in data.items():
                k_clean = quitar_tildes(k)
                if "metodo" in k_clean or "pago" in k_clean:
                    norm["metodo_pago"] = str(v)
                elif "desc" in k_clean or "concepto" in k_clean or "nombre" in k_clean or "detalle" in k_clean or "que gastaste" in k_clean:
                    norm["descripcion"] = str(v) if v is not None else ""
                elif "monto" in k_clean or "costo" in k_clean or "precio" in k_clean or "cantidad" in k_clean or "total" in k_clean or "cuanto" in k_clean or "valor" in k_clean:
                    try:
                        # Extraer sólo números si viene con texto (ej: "S/ 15.00" o "15,00")
                        val_str = str(v).replace("S/", "").replace("s/", "").replace("$", "").replace(",", ".").strip()
                        norm["monto"] = float(val_str) if val_str else 0.0
                    except Exception:
                        norm["monto"] = 0.0
                elif "tipo" in k_clean:
                    norm["tipo"] = str(v).lower()
                elif "cat" in k_clean:
                    norm["categoria"] = str(v)
                else:
                    norm[k_clean] = v
            return norm
        return data

class TransaccionUpdate(BaseModel):
    tipo: Optional[str] = None
    monto: Optional[float] = None
    categoria: Optional[str] = None
    descripcion: Optional[str] = None
    fecha: Optional[str] = None
    metodo_pago: Optional[str] = None
    notas: Optional[str] = None
    etiquetas: Optional[str] = None

class TransaccionOut(BaseModel):
    id: int
    tipo: str
    monto: float
    categoria: str
    descripcion: str
    fecha: str
    metodo_pago: str
    notas: Optional[str]
    etiquetas: Optional[str]
    created_at: Optional[datetime.datetime]

    class Config:
        from_attributes = True

class PresupuestoCreate(BaseModel):
    categoria: str
    monto_limite: float
    color: Optional[str] = "#3B82F6"

class PresupuestoOut(BaseModel):
    id: int
    categoria: str
    monto_limite: float
    color: str

    class Config:
        from_attributes = True

class CategorizarReq(BaseModel):
    descripcion: str

# Endpoints
@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.datetime.utcnow().isoformat()}

@app.post("/api/categorizar")
def categorizar_endpoint(req: CategorizarReq):
    resultado = predecir_categoria(req.descripcion)
    return resultado

@app.get("/api/transacciones", response_model=List[TransaccionOut])
def listar_transacciones(
    tipo: Optional[str] = None,
    categoria: Optional[str] = None,
    metodo_pago: Optional[str] = None,
    busqueda: Optional[str] = None,
    fecha_inicio: Optional[str] = None,
    fecha_fin: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TransaccionDB)
    if tipo:
        query = query.filter(TransaccionDB.tipo == tipo)
    if categoria and categoria != "Todas":
        query = query.filter(TransaccionDB.categoria == categoria)
    if metodo_pago and metodo_pago != "Todos":
        query = query.filter(TransaccionDB.metodo_pago == metodo_pago)
    if busqueda:
        pattern = f"%{busqueda}%"
        query = query.filter(
            (TransaccionDB.descripcion.ilike(pattern)) |
            (TransaccionDB.notas.ilike(pattern)) |
            (TransaccionDB.etiquetas.ilike(pattern)) |
            (TransaccionDB.categoria.ilike(pattern))
        )
    if fecha_inicio:
        query = query.filter(TransaccionDB.fecha >= fecha_inicio)
    if fecha_fin:
        query = query.filter(TransaccionDB.fecha <= fecha_fin)

    return query.order_by(desc(TransaccionDB.fecha), desc(TransaccionDB.id)).all()

@app.post("/api/transacciones", response_model=TransaccionOut, tags=["Transacciones"], summary="Registrar nueva transacción")
def crear_transaccion(item: Optional[TransaccionCreate] = None, db: Session = Depends(get_db)):
    """
    Registra un gasto o ingreso. Si la categoría se omite o es 'Otros', 
    el sistema la detecta automáticamente mediante el concepto ingresado.
    """
    if item is None:
        item = TransaccionCreate(descripcion="Gasto no especificado", monto=0.0, tipo="gasto", metodo_pago="Yape")
        
    cat = item.categoria
    desc = (item.descripcion or "Gasto").strip()
    if not cat or cat.strip() in ["", "Otros", "Sin categoría"]:
        prediccion = predecir_categoria(desc)
        cat = prediccion.get("categoria", "Otros")
    
    fecha = item.fecha if item.fecha else datetime.date.today().strftime("%Y-%m-%d")
    
    nueva = TransaccionDB(
        tipo=item.tipo or "gasto",
        monto=abs(item.monto or 0.0),
        categoria=cat,
        descripcion=desc,
        fecha=fecha,
        metodo_pago=item.metodo_pago or "Yape",
        notas=item.notas or "",
        etiquetas=item.etiquetas or ""
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@app.put("/api/transacciones/{id}", response_model=TransaccionOut)
def actualizar_transaccion(id: int, item: TransaccionUpdate, db: Session = Depends(get_db)):
    t = db.query(TransaccionDB).filter(TransaccionDB.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    if item.tipo is not None:
        t.tipo = item.tipo
    if item.monto is not None:
        t.monto = abs(item.monto)
    if item.categoria is not None:
        t.categoria = item.categoria
    if item.descripcion is not None:
        t.descripcion = item.descripcion.strip()
    if item.fecha is not None:
        t.fecha = item.fecha
    if item.metodo_pago is not None:
        t.metodo_pago = item.metodo_pago
    if item.notas is not None:
        t.notas = item.notas
    if item.etiquetas is not None:
        t.etiquetas = item.etiquetas
        
    db.commit()
    db.refresh(t)
    return t

@app.delete("/api/transacciones/{id}")
def eliminar_transaccion(id: int, db: Session = Depends(get_db)):
    t = db.query(TransaccionDB).filter(TransaccionDB.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    db.delete(t)
    db.commit()
    return {"message": "Transacción eliminada con éxito", "id": id}

@app.get("/api/presupuestos", response_model=List[PresupuestoOut])
def listar_presupuestos(db: Session = Depends(get_db)):
    return db.query(PresupuestoDB).all()

@app.post("/api/presupuestos", response_model=PresupuestoOut)
def guardar_presupuesto(item: PresupuestoCreate, db: Session = Depends(get_db)):
    existente = db.query(PresupuestoDB).filter(PresupuestoDB.categoria == item.categoria).first()
    if existente:
        existente.monto_limite = item.monto_limite
        if item.color:
            existente.color = item.color
        db.commit()
        db.refresh(existente)
        return existente
    else:
        nuevo = PresupuestoDB(
            categoria=item.categoria,
            monto_limite=item.monto_limite,
            color=item.color or "#3B82F6"
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        return nuevo

@app.delete("/api/presupuestos/{id}")
def eliminar_presupuesto(id: int, db: Session = Depends(get_db)):
    p = db.query(PresupuestoDB).filter(PresupuestoDB.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    db.delete(p)
    db.commit()
    return {"message": "Presupuesto eliminado con éxito", "id": id}

@app.get("/api/estadisticas")
def obtener_estadisticas(mes: Optional[str] = None, db: Session = Depends(get_db)):
    # mes format: YYYY-MM
    if not mes:
        mes = datetime.date.today().strftime("%Y-%m")
        
    inicio_mes = f"{mes}-01"
    # calcular fin de mes aprox
    fin_mes = f"{mes}-31"
    
    transacciones = db.query(TransaccionDB).filter(
        TransaccionDB.fecha >= inicio_mes,
        TransaccionDB.fecha <= fin_mes
    ).all()
    
    total_ingresos = sum(t.monto for t in transacciones if t.tipo == "ingreso")
    total_gastos = sum(t.monto for t in transacciones if t.tipo == "gasto")
    balance_neto = total_ingresos - total_gastos
    tasa_ahorro = round((balance_neto / total_ingresos * 100), 1) if total_ingresos > 0 else 0.0
    
    # Desglose por categoría
    gastos_por_categoria = {}
    for t in transacciones:
        if t.tipo == "gasto":
            gastos_por_categoria[t.categoria] = gastos_por_categoria.get(t.categoria, 0.0) + t.monto
            
    # Presupuestos y porcentaje consumido
    presupuestos = db.query(PresupuestoDB).all()
    presupuestos_resumen = []
    presupuesto_total = 0.0
    for p in presupuestos:
        gastado = gastos_por_categoria.get(p.categoria, 0.0)
        presupuesto_total += p.monto_limite
        porcentaje = round((gastado / p.monto_limite * 100), 1) if p.monto_limite > 0 else 0.0
        presupuestos_resumen.append({
            "categoria": p.categoria,
            "monto_limite": p.monto_limite,
            "gastado": round(gastado, 2),
            "restante": round(max(0.0, p.monto_limite - gastado), 2),
            "porcentaje": porcentaje,
            "color": p.color,
            "excedido": gastado > p.monto_limite
        })
        
    # Desglose por método de pago
    gastos_por_metodo = {}
    for t in transacciones:
        if t.tipo == "gasto":
            gastos_por_metodo[t.metodo_pago] = gastos_por_metodo.get(t.metodo_pago, 0.0) + t.monto

    # Evolución diaria de gastos e ingresos
    dias_dict = {}
    for t in transacciones:
        dia = t.fecha
        if dia not in dias_dict:
            dias_dict[dia] = {"fecha": dia, "gastos": 0.0, "ingresos": 0.0}
        if t.tipo == "gasto":
            dias_dict[dia]["gastos"] += t.monto
        else:
            dias_dict[dia]["ingresos"] += t.monto
            
    evolucion_diaria = sorted(list(dias_dict.values()), key=lambda x: x["fecha"])
    
    # Categorías para gráficos
    categorias_chart = [
        {"name": cat, "value": round(monto, 2)}
        for cat, monto in sorted(gastos_por_categoria.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return {
        "periodo": mes,
        "total_ingresos": round(total_ingresos, 2),
        "total_gastos": round(total_gastos, 2),
        "balance_neto": round(balance_neto, 2),
        "tasa_ahorro": tasa_ahorro,
        "presupuesto_total": round(presupuesto_total, 2),
        "porcentaje_presupuesto_total": round((total_gastos / presupuesto_total * 100), 1) if presupuesto_total > 0 else 0.0,
        "gastos_por_categoria": categorias_chart,
        "presupuestos": presupuestos_resumen,
        "gastos_por_metodo": [{"metodo": k, "total": round(v, 2)} for k, v in gastos_por_metodo.items()],
        "evolucion_diaria": evolucion_diaria,
        "conteo_transacciones": len(transacciones)
    }

@app.get("/api/exportar/csv")
def exportar_csv(db: Session = Depends(get_db)):
    transacciones = db.query(TransaccionDB).order_by(desc(TransaccionDB.fecha)).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Tipo", "Monto", "Categoría", "Descripción", "Fecha", "Método de Pago", "Notas", "Etiquetas"])
    for t in transacciones:
        writer.writerow([t.id, t.tipo, t.monto, t.categoria, t.descripcion, t.fecha, t.metodo_pago, t.notas or "", t.etiquetas or ""])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transacciones.csv"}
    )
