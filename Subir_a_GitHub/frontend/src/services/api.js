// Servicio de API con sincronización en backend y almacenamiento local de respaldo
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const CATEGORIAS_CONFIG = {
  "Alimentación": { icon: "Utensils", color: "#EF4444", bg: "bg-red-500/10 text-red-600 dark:text-red-400" },
  "Vivienda y Servicios": { icon: "Home", color: "#3B82F6", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  "Transporte": { icon: "Car", color: "#F59E0B", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  "Entretenimiento": { icon: "Gamepad2", color: "#8B5CF6", bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  "Suscripciones": { icon: "Tv", color: "#EC4899", bg: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
  "Salud y Cuidado": { icon: "HeartPulse", color: "#10B981", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  "Compras personales": { icon: "ShoppingBag", color: "#6366F1", bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  "Educación": { icon: "GraduationCap", color: "#14B8A6", bg: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
  "Salario": { icon: "Briefcase", color: "#10B981", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  "Freelance": { icon: "Laptop", color: "#06B6D4", bg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
  "Otros": { icon: "CircleDot", color: "#6B7280", bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400" }
};

export const METODOS_PAGO = [
  "Yape",
  "Tarjeta",
  "Efectivo"
];

// Comprobación de estado del backend
export async function checkBackendStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// Obtener todas las transacciones
export async function fetchTransacciones(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.tipo && filtros.tipo !== 'todos') params.append('tipo', filtros.tipo);
  if (filtros.categoria && filtros.categoria !== 'Todas') params.append('categoria', filtros.categoria);
  if (filtros.metodo_pago && filtros.metodo_pago !== 'Todos') params.append('metodo_pago', filtros.metodo_pago);
  if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
  if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
  if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);

  try {
    const res = await fetch(`${API_BASE}/transacciones?${params.toString()}`);
    if (!res.ok) throw new Error('Error al obtener transacciones');
    return await res.json();
  } catch (e) {
    console.warn('Usando almacenamiento local de respaldo:', e);
    return getLocalTransacciones(filtros);
  }
}

// Crear una nueva transacción
export async function createTransaccion(data) {
  try {
    const res = await fetch(`${API_BASE}/transacciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear transacción');
    const created = await res.json();
    saveLocalTransaccion(created);
    return created;
  } catch (e) {
    console.warn('Guardando en almacenamiento local:', e);
    return saveLocalTransaccion(data);
  }
}

// Actualizar transacción
export async function updateTransaccion(id, data) {
  try {
    const res = await fetch(`${API_BASE}/transacciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar transacción');
    return await res.json();
  } catch (e) {
    return updateLocalTransaccion(id, data);
  }
}

// Eliminar transacción
export async function deleteTransaccion(id) {
  try {
    const res = await fetch(`${API_BASE}/transacciones/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar transacción');
  } catch (e) {
    console.warn('Eliminando de local:', e);
  }
  deleteLocalTransaccion(id);
  return { id };
}

// Obtener estadísticas
export async function fetchEstadisticas(mes) {
  try {
    const url = mes ? `${API_BASE}/estadisticas?mes=${mes}` : `${API_BASE}/estadisticas`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener estadísticas');
    return await res.json();
  } catch (e) {
    return calculateLocalEstadisticas(mes);
  }
}

// Obtener presupuestos
export async function fetchPresupuestos() {
  try {
    const res = await fetch(`${API_BASE}/presupuestos`);
    if (!res.ok) throw new Error('Error al obtener presupuestos');
    return await res.json();
  } catch (e) {
    return getLocalPresupuestos();
  }
}

// Guardar presupuesto
export async function savePresupuesto(data) {
  try {
    const res = await fetch(`${API_BASE}/presupuestos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al guardar presupuesto');
    return await res.json();
  } catch (e) {
    return saveLocalPresupuesto(data);
  }
}

// Eliminar presupuesto
export async function deletePresupuesto(id) {
  try {
    const res = await fetch(`${API_BASE}/presupuestos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar presupuesto');
  } catch (e) {
    deleteLocalPresupuesto(id);
  }
  return { id };
}

// Predecir categoría basada en texto
export async function predictCategoria(descripcion) {
  try {
    const res = await fetch(`${API_BASE}/categorizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descripcion })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}

  // Fallback local categorizer
  const desc = descripcion.toLowerCase();
  if (desc.includes('uber') || desc.includes('taxi') || desc.includes('gasolina') || desc.includes('metro') || desc.includes('bus')) {
    return { categoria: 'Transporte', confianza: 0.9 };
  }
  if (desc.includes('super') || desc.includes('restaurante') || desc.includes('cafe') || desc.includes('almuerzo') || desc.includes('cena') || desc.includes('starbucks') || desc.includes('comida')) {
    return { categoria: 'Alimentación', confianza: 0.9 };
  }
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('youtube') || desc.includes('disney') || desc.includes('prime') || desc.includes('chatgpt')) {
    return { categoria: 'Suscripciones', confianza: 0.9 };
  }
  if (desc.includes('luz') || desc.includes('agua') || desc.includes('gas') || desc.includes('internet') || desc.includes('alquiler') || desc.includes('renta')) {
    return { categoria: 'Vivienda y Servicios', confianza: 0.9 };
  }
  if (desc.includes('farmacia') || desc.includes('medico') || desc.includes('gym') || desc.includes('gimnasio') || desc.includes('doctor')) {
    return { categoria: 'Salud y Cuidado', confianza: 0.9 };
  }
  if (desc.includes('cine') || desc.includes('bar') || desc.includes('cerveza') || desc.includes('juego') || desc.includes('fiesta')) {
    return { categoria: 'Entretenimiento', confianza: 0.9 };
  }
  if (desc.includes('ropa') || desc.includes('zapatos') || desc.includes('amazon') || desc.includes('zapatillas')) {
    return { categoria: 'Compras personales', confianza: 0.9 };
  }
  return { categoria: 'Otros', confianza: 0.2 };
}

// Helpers de LocalStorage
const LOCAL_STORAGE_KEY = 'gestor_gastos_transacciones_v1';
const LOCAL_BUDGET_KEY = 'gestor_gastos_presupuestos_v1';

function getInitialLocalData() {
  const hoy = new Date();
  const getFecha = (diasAtras) => {
    const d = new Date();
    d.setDate(hoy.getDate() - diasAtras);
    return d.toISOString().split('T')[0];
  };

  return [
    { id: 1, tipo: 'ingreso', monto: 2200, categoria: 'Salario', descripcion: 'Sueldo quincenal', fecha: getFecha(14), metodo_pago: 'Yape', notas: '', etiquetas: '' },
    { id: 2, tipo: 'ingreso', monto: 450, categoria: 'Freelance', descripcion: 'Consultoría y desarrollo', fecha: getFecha(4), metodo_pago: 'Yape', notas: '', etiquetas: '' },
    { id: 3, tipo: 'gasto', monto: 92.5, categoria: 'Alimentación', descripcion: 'Supermercado semanal', fecha: getFecha(1), metodo_pago: 'Tarjeta', notas: 'Frutas, verduras y despensa', etiquetas: 'hogar,comida' },
    { id: 4, tipo: 'gasto', monto: 14.0, categoria: 'Alimentación', descripcion: 'Cafetería Starbucks', fecha: getFecha(0), metodo_pago: 'Efectivo', notas: 'Café con colega', etiquetas: 'cafe' },
    { id: 5, tipo: 'gasto', monto: 28.5, categoria: 'Transporte', descripcion: 'Uber hacia oficina', fecha: getFecha(2), metodo_pago: 'Tarjeta', notas: '', etiquetas: 'transporte' },
    { id: 6, tipo: 'gasto', monto: 15.99, categoria: 'Suscripciones', descripcion: 'Netflix mensual', fecha: getFecha(8), metodo_pago: 'Tarjeta', notas: '', etiquetas: 'streaming' },
    { id: 7, tipo: 'gasto', monto: 10.99, categoria: 'Suscripciones', descripcion: 'Spotify Premium', fecha: getFecha(9), metodo_pago: 'Tarjeta', notas: '', etiquetas: 'musica' },
    { id: 8, tipo: 'gasto', monto: 65.0, categoria: 'Entretenimiento', descripcion: 'Cine y cena fin de semana', fecha: getFecha(5), metodo_pago: 'Tarjeta', notas: '', etiquetas: 'salida' },
    { id: 9, tipo: 'gasto', monto: 140.0, categoria: 'Vivienda y Servicios', descripcion: 'Internet, luz y agua', fecha: getFecha(10), metodo_pago: 'Yape', notas: '', etiquetas: 'servicios' },
    { id: 10, tipo: 'gasto', monto: 35.0, categoria: 'Salud y Cuidado', descripcion: 'Farmacia y vitaminas', fecha: getFecha(6), metodo_pago: 'Tarjeta', notas: '', etiquetas: 'salud' },
    { id: 11, tipo: 'gasto', monto: 55.0, categoria: 'Compras personales', descripcion: 'Ropa deportiva', fecha: getFecha(3), metodo_pago: 'Tarjeta', notas: '', etiquetas: 'ropa' },
    { id: 12, tipo: 'gasto', monto: 25.0, categoria: 'Alimentación', descripcion: 'Almuerzo menú ejecutivo', fecha: getFecha(7), metodo_pago: 'Tarjeta', notas: '', etiquetas: 'almuerzo' }
  ];
}

function getLocalTransacciones(filtros = {}) {
  const dataStr = localStorage.getItem(LOCAL_STORAGE_KEY);
  let list = dataStr ? JSON.parse(dataStr) : getInitialLocalData();
  if (!dataStr) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));

  if (filtros.tipo && filtros.tipo !== 'todos') {
    list = list.filter(t => t.tipo === filtros.tipo);
  }
  if (filtros.categoria && filtros.categoria !== 'Todas') {
    list = list.filter(t => t.categoria === filtros.categoria);
  }
  if (filtros.metodo_pago && filtros.metodo_pago !== 'Todos') {
    list = list.filter(t => t.metodo_pago === filtros.metodo_pago);
  }
  if (filtros.busqueda) {
    const q = filtros.busqueda.toLowerCase();
    list = list.filter(t => 
      t.descripcion.toLowerCase().includes(q) ||
      (t.notas && t.notas.toLowerCase().includes(q)) ||
      (t.etiquetas && t.etiquetas.toLowerCase().includes(q)) ||
      t.categoria.toLowerCase().includes(q)
    );
  }
  return list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || b.id - a.id);
}

function saveLocalTransaccion(data) {
  const list = getLocalTransacciones();
  const nueva = {
    id: data.id || Date.now(),
    tipo: data.tipo || 'gasto',
    monto: Math.abs(parseFloat(data.monto) || 0),
    categoria: data.categoria || 'Otros',
    descripcion: data.descripcion || '',
    fecha: data.fecha || new Date().toISOString().split('T')[0],
    metodo_pago: data.metodo_pago || 'Yape',
    notas: data.notas || '',
    etiquetas: data.etiquetas || ''
  };
  list.unshift(nueva);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  return nueva;
}

function updateLocalTransaccion(id, data) {
  const list = getLocalTransacciones();
  const idx = list.findIndex(t => t.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...data, monto: Math.abs(parseFloat(data.monto ?? list[idx].monto)) };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    return list[idx];
  }
  return data;
}

function deleteLocalTransaccion(id) {
  let list = getLocalTransacciones();
  list = list.filter(t => t.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
}

function getLocalPresupuestos() {
  const str = localStorage.getItem(LOCAL_BUDGET_KEY);
  if (str) return JSON.parse(str);
  const def = [
    { id: 1, categoria: "Alimentación", monto_limite: 400.0, color: "#EF4444" },
    { id: 2, categoria: "Vivienda y Servicios", monto_limite: 600.0, color: "#3B82F6" },
    { id: 3, categoria: "Transporte", monto_limite: 150.0, color: "#F59E0B" },
    { id: 4, categoria: "Entretenimiento", monto_limite: 120.0, color: "#8B5CF6" },
    { id: 5, categoria: "Suscripciones", monto_limite: 50.0, color: "#EC4899" },
    { id: 6, categoria: "Salud y Cuidado", monto_limite: 100.0, color: "#10B981" },
    { id: 7, categoria: "Compras personales", monto_limite: 150.0, color: "#6366F1" },
    { id: 8, categoria: "Educación", monto_limite: 80.0, color: "#14B8A6" },
    { id: 9, categoria: "Otros", monto_limite: 100.0, color: "#6B7280" }
  ];
  localStorage.setItem(LOCAL_BUDGET_KEY, JSON.stringify(def));
  return def;
}

function saveLocalPresupuesto(data) {
  const list = getLocalPresupuestos();
  const idx = list.findIndex(p => p.categoria === data.categoria);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...data };
  } else {
    list.push({ id: Date.now(), ...data });
  }
  localStorage.setItem(LOCAL_BUDGET_KEY, JSON.stringify(list));
  return data;
}

function deleteLocalPresupuesto(id) {
  let list = getLocalPresupuestos();
  list = list.filter(p => p.id !== id);
  localStorage.setItem(LOCAL_BUDGET_KEY, JSON.stringify(list));
}

function calculateLocalEstadisticas(mes) {
  const transacciones = getLocalTransacciones();
  const total_ingresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + t.monto, 0);
  const total_gastos = transacciones.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + t.monto, 0);
  const balance_neto = total_ingresos - total_gastos;
  const tasa_ahorro = total_ingresos > 0 ? Number(((balance_neto / total_ingresos) * 100).toFixed(1)) : 0;

  const gastos_por_categoria = {};
  transacciones.filter(t => t.tipo === 'gasto').forEach(t => {
    gastos_por_categoria[t.categoria] = (gastos_por_categoria[t.categoria] || 0) + t.monto;
  });

  const presupuestos = getLocalPresupuestos();
  let presupuesto_total = 0;
  const presupuestos_resumen = presupuestos.map(p => {
    const gastado = gastos_por_categoria[p.categoria] || 0;
    presupuesto_total += p.monto_limite;
    const porcentaje = p.monto_limite > 0 ? Number(((gastado / p.monto_limite) * 100).toFixed(1)) : 0;
    return {
      categoria: p.categoria,
      monto_limite: p.monto_limite,
      gastado: Number(gastado.toFixed(2)),
      restante: Number(Math.max(0, p.monto_limite - gastado).toFixed(2)),
      porcentaje,
      color: p.color,
      excedido: gastado > p.monto_limite
    };
  });

  const categorias_chart = Object.entries(gastos_por_categoria)
    .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);

  const gastos_por_metodo = {};
  transacciones.filter(t => t.tipo === 'gasto').forEach(t => {
    gastos_por_metodo[t.metodo_pago] = (gastos_por_metodo[t.metodo_pago] || 0) + t.monto;
  });

  const dias_dict = {};
  transacciones.forEach(t => {
    if (!dias_dict[t.fecha]) dias_dict[t.fecha] = { fecha: t.fecha, gastos: 0, ingresos: 0 };
    if (t.tipo === 'gasto') dias_dict[t.fecha].gastos += t.monto;
    else dias_dict[t.fecha].ingresos += t.monto;
  });
  const evolucion_diaria = Object.values(dias_dict).sort((a, b) => a.fecha.localeCompare(b.fecha));

  return {
    periodo: mes || new Date().toISOString().substring(0, 7),
    total_ingresos: Number(total_ingresos.toFixed(2)),
    total_gastos: Number(total_gastos.toFixed(2)),
    balance_neto: Number(balance_neto.toFixed(2)),
    tasa_ahorro,
    presupuesto_total: Number(presupuesto_total.toFixed(2)),
    porcentaje_presupuesto_total: presupuesto_total > 0 ? Number(((total_gastos / presupuesto_total) * 100).toFixed(1)) : 0,
    gastos_por_categoria: categorias_chart,
    presupuestos: presupuestos_resumen,
    gastos_por_metodo: Object.entries(gastos_por_metodo).map(([metodo, total]) => ({ metodo, total: Number(total.toFixed(2)) })),
    evolucion_diaria,
    conteo_transacciones: transacciones.length
  };
}
