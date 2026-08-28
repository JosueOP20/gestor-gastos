import re
import unicodedata

def normalizar_texto(texto: str) -> str:
    texto = texto.lower()
    return "".join(c for c in unicodedata.normalize("NFD", texto) if unicodedata.category(c) != "Mn")

REGLAS_CATEGORIAS = {
    "Alimentación": [
        "chifa", "chaufa", "menu", "almuerzo", "cena", "desayuno", "comida", "restaurante",
        "pollo", "polleria", "norkys", "rokys", "pardos", "ceviche", "cebiche", "cevicheria",
        "supermercado", "super", "mercado", "bodega", "tambo", "oxxo", "metro", "wong", "tottus",
        "plaza vea", "vivanda", "makro", "mass", "bembos", "kfc", "mcdonalds", "burger", "pizza",
        "pizzahut", "sushi", "sangucheria", "panaderia", "pan", "cafe", "starbucks", "postre",
        "helado", "heladeria", "rappi", "pedidosya", "frutas", "verduras", "chicharron", "antojos",
        "snack", "gaseosa", "jugo", "jugueria"
    ],
    "Transporte": [
        "uber", "didi", "cabify", "indrive", "taxi", "pasaje", "combi", "colectivo", "corredor",
        "metropolitano", "metro de lima", "tren", "gasolina", "grifo", "repsol", "primax",
        "petroperu", "glp", "gnv", "combustible", "peaje", "estacionamiento", "cochera",
        "parqueadero", "taller", "mecanico", "lavado auto", "vuelo", "avion", "boleto"
    ],
    "Vivienda y Servicios": [
        "alquiler", "renta", "depa", "departamento", "luz", "electricidad", "enel", "luz del sur",
        "agua", "sedapal", "calidda", "balon de gas", "internet", "wifi", "condominio",
        "mantenimiento", "telefonica", "claro", "movistar", "entel", "bitel", "limpieza", "recibo"
    ],
    "Suscripciones": [
        "netflix", "spotify", "youtube", "amazon prime", "prime video", "disney", "max", "hbomax",
        "apple", "icloud", "chatgpt", "openai", "midjourney", "github", "playstation", "ps plus",
        "xbox", "gamepass", "crunchyroll", "smartfit", "gimnasio", "gym"
    ],
    "Entretenimiento": [
        "cine", "cineplanet", "cinemark", "cinestar", "teatro", "concierto", "fiesta", "discoteca",
        "bar", "cerveza", "trago", "salida", "juego", "steam", "videojuego", "parque", "evento",
        "entradas", "boliche", "billar"
    ],
    "Salud y Cuidado": [
        "farmacia", "mifarma", "inkafarma", "botica", "medico", "doctor", "dentista", "odontologo",
        "hospital", "clinica", "medicamento", "medicina", "pastillas", "vitaminas", "analisis",
        "peluqueria", "barberia", "corte", "manicure", "pedicure", "spa", "terapia", "psicologo"
    ],
    "Compras personales": [
        "ropa", "zapatos", "zapatillas", "saga", "falabella", "ripley", "oechsle", "zara", "h&m",
        "marathon", "adidas", "nike", "amazon", "aliexpress", "mercadolibre", "shein", "perfume",
        "reloj", "lentes", "tecnologia", "gadget", "computadora", "laptop", "mouse", "teclado", "audifonos"
    ],
    "Educación": [
        "curso", "universidad", "colegio", "libro", "libreria", "udemy", "coursera", "platzi",
        "matricula", "pension", "taller", "certificacion", "instituto", "clases"
    ]
}

PALABRAS_GENERICAS = {"gasto", "gastos", "pago", "pagos", "compra", "compras", "salida", "consumo"}

def predecir_categoria(descripcion: str) -> dict:
    if not descripcion:
        return {"categoria": "Otros", "confianza": 0.0, "coincidencia": None}
    
    desc_norm = normalizar_texto(descripcion.strip())
    
    if desc_norm in PALABRAS_GENERICAS:
        return {"categoria": "Otros", "confianza": 0.20, "coincidencia": None}
    
    # 1. Coincidencia exacta de palabra completa ()
    for cat, palabras in REGLAS_CATEGORIAS.items():
        for p in palabras:
            p_norm = normalizar_texto(p)
            patron = rf"\b{re.escape(p_norm)}\b"
            if re.search(patron, desc_norm):
                return {"categoria": cat, "confianza": 0.95, "coincidencia": p}
                
    # 2. Coincidencia de subcadena para términos largos
    for cat, palabras in REGLAS_CATEGORIAS.items():
        for p in palabras:
            p_norm = normalizar_texto(p)
            if len(p_norm) >= 5 and p_norm in desc_norm:
                return {"categoria": cat, "confianza": 0.80, "coincidencia": p}
                
    return {"categoria": "Otros", "confianza": 0.20, "coincidencia": None}
