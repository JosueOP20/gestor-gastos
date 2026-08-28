import React, { useState } from 'react';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Edit2, 
  Trash2,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { CATEGORIAS_CONFIG } from '../services/api';

export default function BudgetManager({ 
  presupuestos = [], 
  onSavePresupuesto, 
  onDeletePresupuesto 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [categoria, setCategoria] = useState('Alimentación');
  const [montoLimite, setMontoLimite] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-PE', { 
      style: 'currency', 
      currency: 'PEN',
      minimumFractionDigits: 2 
    }).format(val || 0);
  };

  const totalPresupuestado = presupuestos.reduce((acc, p) => acc + p.monto_limite, 0);
  const totalGastado = presupuestos.reduce((acc, p) => acc + p.gastado, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!montoLimite || isNaN(parseFloat(montoLimite)) || parseFloat(montoLimite) <= 0) {
      alert('Introduce un límite mensual válido');
      return;
    }

    await onSavePresupuesto({
      categoria,
      monto_limite: parseFloat(montoLimite),
      color
    });

    setIsEditing(false);
    setMontoLimite('');
  };

  const startEdit = (p) => {
    setCategoria(p.categoria);
    setMontoLimite(p.monto_limite.toString());
    setColor(p.color || '#3B82F6');
    setIsEditing(true);
  };

  const categoriasDisponibles = Object.keys(CATEGORIAS_CONFIG).filter(c => c !== 'Salario' && c !== 'Freelance');

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Presupuestos */}
      <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Presupuestos por Categoría</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Define límites de gasto mensuales para mantener tus finanzas bajo control
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditing(true);
            setCategoria(categoriasDisponibles[0]);
            setMontoLimite('');
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Configurar Límite
        </button>
      </div>

      {/* Modal / Formulario de Configuración de Presupuesto */}
      {isEditing && (
        <div className="glass-card rounded-2xl p-5 border-2 border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
            Configurar Límite para una Categoría
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value);
                  if (CATEGORIAS_CONFIG[e.target.value]) {
                    setColor(CATEGORIAS_CONFIG[e.target.value].color);
                  }
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                {categoriasDisponibles.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Límite Mensual (S/)</label>
              <input
                type="number"
                step="10"
                min="1"
                placeholder="Ej: 350.00"
                value={montoLimite}
                onChange={(e) => setMontoLimite(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Color Identificador</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-8 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer bg-white"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">{color}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-sm transition-all"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de Presupuestos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presupuestos.map((p, idx) => {
          const isExcedido = p.excedido || p.porcentaje > 100;
          const isAlerta = p.porcentaje > 80 && !isExcedido;

          return (
            <div 
              key={idx}
              className={`glass-card rounded-2xl p-5 relative overflow-hidden transition-all duration-200 ${
                isExcedido ? 'border-rose-500/50 dark:border-rose-500/40 bg-rose-500/5' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{p.categoria}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(p)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {p.id && (
                    <button
                      onClick={() => onDeletePresupuesto(p.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Montos */}
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Gastado</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{formatMoney(p.gastado)}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Límite</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatMoney(p.monto_limite)}</span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">{p.porcentaje}% consumido</span>
                  <span className={`font-semibold ${isExcedido ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {isExcedido ? `Excedido por ${formatMoney(p.gastado - p.monto_limite)}` : `Quedan ${formatMoney(p.restante)}`}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      isExcedido ? 'bg-rose-500' : isAlerta ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, p.porcentaje)}%` }}
                  />
                </div>
              </div>

              {/* Badge de estado */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                {isExcedido ? (
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Límite sobrepasado
                  </span>
                ) : isAlerta ? (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Cerca del 100%
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Dentro del presupuesto
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
