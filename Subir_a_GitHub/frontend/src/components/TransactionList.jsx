import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit3, 
  Copy, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  CreditCard,
  Tag,
  CircleDot,
  Utensils,
  Home,
  Car,
  Gamepad2,
  Tv,
  HeartPulse,
  ShoppingBag,
  GraduationCap,
  Briefcase,
  Laptop
} from 'lucide-react';
import { CATEGORIAS_CONFIG, METODOS_PAGO } from '../services/api';

const ICONS_MAP = {
  Utensils,
  Home,
  Car,
  Gamepad2,
  Tv,
  HeartPulse,
  ShoppingBag,
  GraduationCap,
  Briefcase,
  Laptop,
  CircleDot
};

export default function TransactionList({ 
  transacciones = [], 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onOpenModal,
  onExport 
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroMetodo, setFiltroMetodo] = useState('Todos');

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-PE', { 
      style: 'currency', 
      currency: 'PEN',
      minimumFractionDigits: 2 
    }).format(val || 0);
  };

  const getCategoryIcon = (catName) => {
    const config = CATEGORIAS_CONFIG[catName] || CATEGORIAS_CONFIG["Otros"];
    const IconComponent = ICONS_MAP[config.icon] || CircleDot;
    return <IconComponent className="w-4 h-4" />;
  };

  // Filtrado local en tiempo real
  const transaccionesFiltradas = transacciones.filter((t) => {
    if (filtroTipo !== 'todos' && t.tipo !== filtroTipo) return false;
    if (filtroCategoria !== 'Todas' && t.categoria !== filtroCategoria) return false;
    if (filtroMetodo !== 'Todos' && t.metodo_pago !== filtroMetodo) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const matchDesc = t.descripcion.toLowerCase().includes(q);
      const matchCat = t.categoria.toLowerCase().includes(q);
      const matchNotas = t.notas && t.notas.toLowerCase().includes(q);
      const matchTags = t.etiquetas && t.etiquetas.toLowerCase().includes(q);
      if (!matchDesc && !matchCat && !matchNotas && !matchTags) return false;
    }
    return true;
  });

  const totalFiltrado = transaccionesFiltradas.reduce((acc, t) => {
    return t.tipo === 'gasto' ? acc - t.monto : acc + t.monto;
  }, 0);

  const categorias = ['Todas', ...Object.keys(CATEGORIAS_CONFIG)];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header & Acciones */}
      <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Historial de Transacciones</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mostrando {transaccionesFiltradas.length} de {transacciones.length} registros | Balance filtrado: <span className={`font-bold ${totalFiltrado >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{formatMoney(totalFiltrado)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={onOpenModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Añadir Registro
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="glass-card rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por concepto, notas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Tipo */}
        <div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todos">Todos los tipos</option>
            <option value="gasto">Solo Gastos (-)</option>
            <option value="ingreso">Solo Ingresos (+)</option>
          </select>
        </div>

        {/* Categoría */}
        <div>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {categorias.map(c => (
              <option key={c} value={c}>{c === 'Todas' ? 'Todas las categorías' : c}</option>
            ))}
          </select>
        </div>

        {/* Método de Pago */}
        <div>
          <select
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Todos">Todos los métodos de pago</option>
            {METODOS_PAGO.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista / Tabla de Transacciones */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
        {transaccionesFiltradas.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transaccionesFiltradas.map((t) => {
              const isGasto = t.tipo === 'gasto';
              const catConf = CATEGORIAS_CONFIG[t.categoria] || CATEGORIAS_CONFIG["Otros"];

              return (
                <div 
                  key={t.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Left: Icon, Desc, Date, Tags */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`p-3 rounded-2xl shrink-0 ${catConf.bg}`}>
                      {getCategoryIcon(t.categoria)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">{t.descripcion}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {t.categoria}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {t.fecha}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {t.metodo_pago}
                        </span>
                        {t.notas && (
                          <>
                            <span>•</span>
                            <span className="italic truncate max-w-xs text-slate-400">"{t.notas}"</span>
                          </>
                        )}
                        {t.etiquetas && (
                          <div className="flex items-center gap-1">
                            {t.etiquetas.split(',').map((tag, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded">
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                    <div className="text-right">
                      <span className={`font-bold text-base ${isGasto ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {isGasto ? '-' : '+'}{formatMoney(t.monto)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDuplicate(t)}
                        title="Duplicar"
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(t)}
                        title="Editar"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${t.descripcion}" de ${formatMoney(t.monto)}?`)) {
                            onDelete(t.id);
                          }
                        }}
                        title="Eliminar"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <p className="text-sm font-medium">No se encontraron transacciones con los filtros seleccionados.</p>
            <p className="text-xs">Prueba cambiando la búsqueda o restableciendo los filtros.</p>
          </div>
        )}
      </div>

    </div>
  );
}
