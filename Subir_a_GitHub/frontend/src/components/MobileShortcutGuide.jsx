import React, { useState } from 'react';
import { 
  Smartphone, 
  Zap, 
  Copy, 
  Check, 
  Send, 
  Code2, 
  HelpCircle,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { createTransaccion } from '../services/api';

export default function MobileShortcutGuide({ onTransactionAdded }) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  
  // Tester state
  const [testDesc, setTestDesc] = useState('Almuerzo con café');
  const [testMonto, setTestMonto] = useState('18.50');
  const [testMetodo, setTestMetodo] = useState('Yape');
  const [isSending, setIsSending] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const endpointUrl = `http://${window.location.hostname === 'localhost' ? '192.168.100.31' : window.location.hostname}:8000/api/transacciones`;
  
  const samplePayload = `{
  "descripcion": "Supermercado semanal",
  "monto": 45.00,
  "metodo_pago": "Yape",
  "tipo": "gasto"
}`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const handleTestSend = async (e) => {
    e.preventDefault();
    if (!testMonto || !testDesc) return;
    setIsSending(true);
    try {
      await createTransaccion({
        descripcion: testDesc,
        monto: parseFloat(testMonto),
        metodo_pago: testMetodo,
        tipo: 'gasto'
      });
      setTestSuccess(true);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      if (onTransactionAdded) onTransactionAdded();
      setTimeout(() => setTestSuccess(false), 3000);
    } catch (err) {
      alert('Error al probar el envío.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Conexión con Atajo de Celular (Opción 3)</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Registra tus gastos en 2 segundos desde la pantalla de inicio de tu iPhone o Android
            </p>
          </div>
        </div>
      </div>

      {/* Pasos de Configuración */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Guía Paso a Paso (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 space-y-5">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Configuración en Atajos de iPhone (Apple Shortcuts)
          </h3>

          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">1</span>
                Crea una nueva acción "Obtener contenido de URL"
              </span>
              <p>En la app Atajos de tu iPhone, añade la acción <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">Obtener contenido de URL</code> y configura el método en <strong>POST</strong>.</p>
              
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="text" 
                  readOnly 
                  value={endpointUrl} 
                  className="flex-1 font-mono text-[11px] px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
                <button
                  onClick={() => copyToClipboard(endpointUrl, 'url')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">2</span>
                Define el cuerpo JSON de la petición
              </span>
              <p>Configura las claves <code className="text-emerald-600 dark:text-emerald-400">monto</code> y <code className="text-emerald-600 dark:text-emerald-400">descripcion</code> pidiendo entrada al usuario con "Solicitar entrada".</p>
              
              <div className="relative mt-2">
                <pre className="font-mono text-[11px] p-3 rounded-lg bg-slate-900 text-slate-200 overflow-x-auto">
                  {samplePayload}
                </pre>
                <button
                  onClick={() => copyToClipboard(samplePayload, 'json')}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-[10px] flex items-center gap-1"
                >
                  {copiedJson ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedJson ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">3</span>
                Auto-categorización Inteligente
              </span>
              <p>No necesitas seleccionar categoría en el celular: el motor de la API detectará automáticamente si es <em>"Comida"</em>, <em>"Uber"</em>, <em>"Farmacia"</em>, etc. según las palabras clave de la descripción.</p>
            </div>

          </div>
        </div>

        {/* Probador en Vivo de la API (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Simulador de Envío Móvil</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Envía una transacción de prueba para verificar cómo la API procesa y auto-categoriza el registro instantáneamente.
            </p>

            <form onSubmit={handleTestSend} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Descripción</label>
                <input
                  type="text"
                  value={testDesc}
                  onChange={(e) => setTestDesc(e.target.value)}
                  placeholder="Ej: Starbucks café"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Monto (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={testMonto}
                    onChange={(e) => setTestMonto(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Método</label>
                  <select
                    value={testMetodo}
                    onChange={(e) => setTestMetodo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Yape">Yape</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Efectivo">Efectivo</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSending ? 'Enviando...' : 'Enviar Prueba a la API'}
              </button>
            </form>

            {testSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4" />
                ¡Transacción registrada y categorizada con éxito!
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            💡 <strong>Tip para Android:</strong> Puedes usar la app gratuita <em>HTTP Request Shortcuts</em> de Google Play Store para crear botones en el escritorio que ejecuten esta misma llamada.
          </div>
        </div>

      </div>

    </div>
  );
}
