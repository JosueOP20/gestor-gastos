import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Calendar, 
  Tag, 
  FileText, 
  CreditCard, 
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATEGORIAS_CONFIG, METODOS_PAGO, predictCategoria } from '../services/api';

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null 
}) {
  const [tipo, setTipo] = useState('gasto');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Alimentación');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [metodoPago, setMetodoPago] = useState('Yape');
  const [notas, setNotas] = useState('');
  const [etiquetas, setEtiquetas] = useState('');
  const [sugerencia, setSugerencia] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTipo(initialData.tipo || 'gasto');
      setMonto(initialData.monto ? initialData.monto.toString() : '');
      setDescripcion(initialData.descripcion || '');
      setCategoria(initialData.categoria || 'Alimentación');
      setFecha(initialData.fecha || new Date().toISOString().split('T')[0]);
      setMetodoPago(initialData.metodo_pago || 'Efectivo');
      setNotas(initialData.notas || '');
      setEtiquetas(initialData.etiquetas || '');
      setSugerencia(null);
    } else {
      setTipo('gasto');
      setMonto('');
      setDescripcion('');
      setCategoria('Alimentación');
      setFecha(new Date().toISOString().split('T')[0]);
      setMetodoPago('Yape');
      setNotas('');
      setEtiquetas('');
      setSugerencia(null);
    }
  }, [initialData, isOpen]);

  // Detección automática en tiempo real de categoría
  useEffect(() => {
    if (!initialData && descripcion.length > 2 && tipo === 'gasto') {
      const timer = setTimeout(async () => {
        const res = await predictCategoria(descripcion);
        if (res && res.categoria && res.categoria !== 'Otros' && res.confianza > 0.6) {
          setSugerencia(res);
        } else {
          setSugerencia(null);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSugerencia(null);
    }
  }, [descripcion, tipo, initialData]);

  if (!isOpen) return null;

  const aplicarSugerencia = () => {
    if (sugerencia) {
      setCategoria(sugerencia.categoria);
      setSugerencia(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
      alert('Por favor introduce un monto válido.');
      return;
    }
    if (!descripcion.trim()) {
      alert('Por favor introduce una descripción.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        tipo,
        monto: parseFloat(monto),
        descripcion: descripcion.trim(),
        categoria: tipo === 'ingreso' ? (categoria === 'Salario' || categoria === 'Freelance' ? categoria : 'Salario') : categoria,
        fecha,
        metodo_pago: metodoPago,
        notas: notas.trim(),
        etiquetas: etiquetas.trim()
      };

      if (initialData && initialData.id) {
        payload.id = initialData.id;
      }

      await onSave(payload);

      // Lanzar confeti si es un ingreso
      if (tipo === 'ingreso') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      }

      onClose();
    } catch (err) {
      console.error(err);
      alert('Hubo un problema al guardar la transacción.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoriasGasto = Object.keys(CATEGORIAS_CONFIG).filter(c => c !== 'Salario' && c !== 'Freelance');
  const categoriasIngreso = ['Salario', 'Freelance', 'Inversiones', 'Regalo', 'Otros'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 relative max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${tipo === 'gasto' ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
              {tipo === 'gasto' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {initialData ? 'Editar Registro' : 'Nuevo Registro'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Completa los detalles de la transacción</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Selector Gasto / Ingreso */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => { setTipo('gasto'); setCategoria('Alimentación'); }}
              className={`py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                tipo === 'gasto' 
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Gasto
            </button>
            <button
              type="button"
              onClick={() => { setTipo('ingreso'); setCategoria('Salario'); }}
              className={`py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                tipo === 'ingreso' 
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Ingreso
            </button>
          </div>

          {/* Campo Monto */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Monto (S/)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">S/</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                autoFocus
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold text-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Campo Descripción */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Descripción
              </label>
              {sugerencia && (
                <button
                  type="button"
                  onClick={aplicarSugerencia}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md hover:bg-emerald-500/20 transition-colors animate-pulse"
                >
                  <Sparkles className="w-3 h-3" />
                  Sugerir: {sugerencia.categoria}
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Ej: Supermercado, Uber, Café Starbucks, Factura Luz..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Categoría & Método de Pago (Grid 2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Categoría
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                {(tipo === 'gasto' ? categoriasGasto : categoriasIngreso).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Método de Pago
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                {METODOS_PAGO.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha & Etiquetas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Etiquetas (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: despensa, viaje, trabajo"
                value={etiquetas}
                onChange={(e) => setEtiquetas(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Notas Adicionales */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Notas Adicionales (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Detalles sobre la compra o ticket..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-md shadow-emerald-500/25 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {initialData ? 'Guardar Cambios' : 'Registrar'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
