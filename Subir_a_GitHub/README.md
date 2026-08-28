# 💰 Gestor de Finanzas y Control de Gastos Personales

Aplicación web interactiva y moderna para el control inteligente de finanzas personales, presupuestos y gastos diarios. Incluye categorización automática y API REST lista para integrarse con **Atajos de iPhone (Apple Shortcuts)** o widgets de Android.

---

## 🚀 Inicio Rápido

### Opción 1: Ejecución en un solo clic (Windows)
Haz doble clic en el archivo `start.bat` en la raíz del proyecto. Esto abrirá automáticamente:
* **Frontend Web (React + Vite):** [http://localhost:5173](http://localhost:5173)
* **Backend API (FastAPI + Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

### Opción 2: Ejecución manual por terminales

#### 1. Iniciar Backend (Terminal 1)
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

#### 2. Iniciar Frontend (Terminal 2)
```bash
cd frontend
npm.cmd run dev
```

---

## 🌟 Características Principales

1. **Dashboard en Tiempo Real:**
   * KPIs de Ingresos Totales, Gastos, Balance Neto y Tasa de Ahorro.
   * Barra de presupuesto mensual con alerta de consumo.
   * Gráfico de Dona interactivo de gastos por categoría.
   * Gráfico de área con evolución temporal diaria de ingresos vs. gastos.

2. **Registro Rápido Inteligente:**
   * Sugerencia y auto-categorización en tiempo real conforme escribes el concepto (ej: *"Uber"* → Transporte, *"Starbucks"* → Alimentación, *"Netflix"* → Suscripciones).
   * Soporte para gastos e ingresos, métodos de pago (Efectivo, Débito, Crédito, Transferencia), notas y etiquetas.

3. **Control de Presupuestos por Categoría:**
   * Configura límites mensuales por categoría y visualiza el porcentaje consumido con alertas de sobregasto.

4. **Historial y Filtros Avanzados:**
   * Búsqueda en tiempo real por descripción, notas o etiquetas.
   * Filtrado por tipo, categoría y método de pago.
   * Acciones rápidas: Editar, Duplicar y Eliminar.

5. **Informes y Respaldo:**
   * Análisis de gastos por método de pago.
   * Exportación instantánea a Excel/CSV y copia de seguridad JSON.
   * Restauración de respaldos.

6. **Integración con Atajos de Celular (Apple Shortcuts / Android):**
   * Endpoint `POST /api/transacciones` documentado para registrar gastos desde la pantalla de inicio del móvil con 1 solo toque.
