import React from 'react';
import { 
  BarChart2, 
  Download, 
  Upload, 
  CreditCard, 
  FileSpreadsheet, 
  ShieldCheck, 
  PieChart as PieIcon,
  TrendingDown
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export default function ReportsView({ 
  stats, 
  transacciones = [], 
  onExportCSV,
  onImportJSON 
}) {
  const {
    gastos_por_metodo = [],
    gastos_por_categoria = [],
    total_gastos = 0,
    total_ingresos = 0
  } = stats || {};

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-PE', { 
      style: 'currency', 
      currency: 'PEN',
      minimumFractionDigits: 2 
    }).format(val || 0);
  };

  // Top 5 mayores gastos
  const mayoresGastos = transacciones
    .filter(t => t.tipo === 'gasto')
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 5);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        onImportJSON(parsed);
      } catch (err) {
        alert('Archivo JSON no válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transacciones, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `respaldo_finanzas_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Informes y Respaldo de Datos</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Analítica de tus métodos de pago y herramientas de exportación / importación
          </p>
        </div>
      </div>

      {/* Grid: Gráfico Métodos de Pago & Mayores Gastos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Métodos de Pago */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Gastos por Método de Pago</h3>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gastos_por_metodo} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="metodo" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip 
                  formatter={(val) => [formatMoney(val), 'Total']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="total" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                  {gastos_por_metodo.map((_, i) => (
                    <Cell key={i} fill={['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mayores Gastos del Periodo */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Mayores Egresos Registrados</h3>
            </div>
            <span className="text-xs text-slate-500">Top 5</span>
          </div>

          <div className="space-y-2.5">
            {mayoresGastos.length > 0 ? (
              mayoresGastos.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">{g.descripcion}</p>
                      <span className="text-[10px] text-slate-500">{g.categoria} • {g.fecha}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{formatMoney(g.monto)}</span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">Sin datos registrados</div>
            )}
          </div>
        </div>

      </div>

      {/* Herramientas de Respaldo y Migración */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Respaldo y Portabilidad de Datos</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
            <div>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 w-fit mb-2">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Exportar a Excel / CSV</h4>
              <p className="text-[11px] text-slate-500 mt-1">Descarga todas tus transacciones en formato de tabla para abrir en Google Sheets o Excel.</p>
            </div>
            <button
              onClick={onExportCSV}
              className="mt-4 w-full py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Descargar CSV
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
            <div>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 w-fit mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Copia de Seguridad JSON</h4>
              <p className="text-[11px] text-slate-500 mt-1">Guarda una copia íntegra con todos los campos, notas y etiquetas para restaurar en el futuro.</p>
            </div>
            <button
              onClick={handleExportJSON}
              className="mt-4 w-full py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Guardar Copia JSON
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
            <div>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 w-fit mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Restaurar Copia</h4>
              <p className="text-[11px] text-slate-500 mt-1">Sube un archivo de respaldo JSON generado previamente para sincronizar tus transacciones.</p>
            </div>
            <label className="mt-4 w-full py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold text-center cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors block">
              Seleccionar Archivo
              <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

        </div>
      </div>

    </div>
  );
}
