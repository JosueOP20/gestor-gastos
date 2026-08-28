import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  PiggyBank, 
  AlertTriangle, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  CreditCard,
  Car,
  Home,
  Utensils,
  Gamepad2,
  Tv,
  HeartPulse,
  ShoppingBag,
  GraduationCap,
  Briefcase,
  Laptop,
  CircleDot
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from 'recharts';
import { CATEGORIAS_CONFIG } from '../services/api';

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

export default function Dashboard({ 
  stats, 
  transacciones, 
  onOpenModal, 
  onNavigateToTab 
}) {
  const {
    total_ingresos = 0,
    total_gastos = 0,
    balance_neto = 0,
    tasa_ahorro = 0,
    presupuesto_total = 0,
    porcentaje_presupuesto_total = 0,
    gastos_por_categoria = [],
    presupuestos = [],
    evolucion_diaria = []
  } = stats || {};

  // Formato de moneda
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

  const getCategoryColor = (catName, index) => {
    if (CATEGORIAS_CONFIG[catName]) return CATEGORIAS_CONFIG[catName].color;
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'];
    return colors[index % colors.length];
  };

  const recentTransactions = (transacciones || []).slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Ingresos */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Ingresos</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{formatMoney(total_ingresos)}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Mes actual</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Gastos */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Gastos</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{formatMoney(total_gastos)}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>{gastos_por_categoria.length} categorías activas</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Balance Neto */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Balance Neto</span>
            <div className={`p-2 rounded-xl ${balance_neto >= 0 ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-bold tracking-tight ${balance_neto >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatMoney(balance_neto)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{balance_neto >= 0 ? 'Superávit disponible' : 'Déficit este mes'}</span>
          </div>
        </div>

        {/* Tasa de Ahorro */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tasa de Ahorro</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{tasa_ahorro}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">de ingresos</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(0, tasa_ahorro))}%` }}
            />
          </div>
        </div>

      </div>

      {/* Alerta de Presupuesto Global */}
      <div className="glass-card rounded-2xl p-5 border-l-4 border-l-emerald-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-white">Estado del Presupuesto Mensual</h3>
              {porcentaje_presupuesto_total > 90 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Cerca del límite
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Has gastado <strong className="text-slate-900 dark:text-white">{formatMoney(total_gastos)}</strong> de tu presupuesto de <strong className="text-slate-900 dark:text-white">{formatMoney(presupuesto_total)}</strong> ({porcentaje_presupuesto_total}% consumido).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigateToTab('presupuestos')}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Configurar límites <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-4 w-full bg-slate-200/70 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              porcentaje_presupuesto_total > 100 
                ? 'bg-rose-500' 
                : porcentaje_presupuesto_total > 80 
                ? 'bg-amber-500' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}
            style={{ width: `${Math.min(100, porcentaje_presupuesto_total)}%` }}
          />
        </div>
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gráfico de Dona: Desglose por Categoría (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <PieIcon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Distribución de Gastos</h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Por categoría</span>
            </div>

            {gastos_por_categoria.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gastos_por_categoria}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {gastos_por_categoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, index)} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => [formatMoney(val), 'Gasto']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '12px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <PieIcon className="w-10 h-10 mb-2 stroke-[1.5] text-slate-300 dark:text-slate-700" />
                <span>No hay gastos registrados en este periodo</span>
              </div>
            )}
          </div>

          {/* Leyenda de Categorías */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800/80 pt-4">
            {gastos_por_categoria.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getCategoryColor(item.name, idx) }} />
                  <span className="truncate text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white shrink-0 ml-1">{formatMoney(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Evolución Temporal (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Flujo de Ingresos vs Gastos</h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Evolución diaria</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolucion_diaria} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis 
                  dataKey="fecha" 
                  tickFormatter={(str) => str.slice(8)} 
                  tick={{ fontSize: 11, fill: '#94a3b8' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#94a3b8' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(val, name) => [formatMoney(val), name === 'ingresos' ? 'Ingresos' : 'Gastos']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorIngresos)" 
                  name="Ingresos"
                />
                <Area 
                  type="monotone" 
                  dataKey="gastos" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorGastos)" 
                  name="Gastos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Row: Últimas Transacciones & Presupuestos Clave */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Últimas Transacciones (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Transacciones Recientes</h3>
            <button 
              onClick={() => onNavigateToTab('transacciones')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Ver todas ({transacciones.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((t) => {
                const isGasto = t.tipo === 'gasto';
                const catConf = CATEGORIAS_CONFIG[t.categoria] || CATEGORIAS_CONFIG["Otros"];
                return (
                  <div 
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${catConf.bg}`}>
                        {getCategoryIcon(t.categoria)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-white leading-tight">{t.descripcion}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          <span>{t.categoria}</span>
                          <span>•</span>
                          <span>{t.fecha}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${isGasto ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {isGasto ? '-' : '+'}{formatMoney(t.monto)}
                      </p>
                      <span className="text-[11px] text-slate-400">{t.metodo_pago}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay transacciones aún. Haz clic en "Nuevo Registro" para añadir una.
              </div>
            )}
          </div>
        </div>

        {/* Presupuestos por Categoría (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Presupuestos por Categoría</h3>
            <button 
              onClick={() => onNavigateToTab('presupuestos')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Administrar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {presupuestos.slice(0, 4).map((p, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{p.categoria}</span>
                  </div>
                  <div className="font-medium text-slate-500 dark:text-slate-400">
                    <span className="text-slate-900 dark:text-white font-semibold">{formatMoney(p.gastado)}</span> / {formatMoney(p.monto_limite)}
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      p.porcentaje > 100 
                        ? 'bg-rose-500' 
                        : p.porcentaje > 80 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, p.porcentaje)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
