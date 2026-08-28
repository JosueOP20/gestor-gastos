import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionModal from './components/TransactionModal';
import BudgetManager from './components/BudgetManager';
import ReportsView from './components/ReportsView';
import MobileShortcutGuide from './components/MobileShortcutGuide';
import { 
  checkBackendStatus, 
  fetchTransacciones, 
  fetchEstadisticas, 
  fetchPresupuestos, 
  createTransaccion, 
  updateTransaccion, 
  deleteTransaccion,
  savePresupuesto,
  deletePresupuesto
} from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  
  // Data states
  const [transacciones, setTransacciones] = useState([]);
  const [stats, setStats] = useState({});
  const [presupuestos, setPresupuestos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Theme synchronization
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Initial load
  const loadData = async () => {
    setIsLoading(true);
    const connected = await checkBackendStatus();
    setIsBackendConnected(connected);

    const [txs, st, pr] = await Promise.all([
      fetchTransacciones(),
      fetchEstadisticas(),
      fetchPresupuestos()
    ]);

    setTransacciones(txs);
    setStats(st);
    setPresupuestos(pr);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      const connected = await checkBackendStatus();
      setIsBackendConnected(connected);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handlers for transactions
  const handleSaveTransaction = async (data) => {
    if (data.id) {
      await updateTransaccion(data.id, data);
    } else {
      await createTransaccion(data);
    }
    await loadData();
  };

  const handleDeleteTransaction = async (id) => {
    await deleteTransaccion(id);
    await loadData();
  };

  const handleDuplicateTransaction = async (tx) => {
    const { id, ...rest } = tx;
    await createTransaccion({
      ...rest,
      descripcion: `${tx.descripcion} (Copia)`,
      fecha: new Date().toISOString().split('T')[0]
    });
    await loadData();
  };

  const handleEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  // Handlers for Budgets
  const handleSavePresupuesto = async (data) => {
    await savePresupuesto(data);
    await loadData();
  };

  const handleDeletePresupuesto = async (id) => {
    await deletePresupuesto(id);
    await loadData();
  };

  const handleExportCSV = () => {
    window.open('http://localhost:8000/api/exportar/csv', '_blank');
  };

  const handleImportJSON = async (data) => {
    if (Array.isArray(data)) {
      for (const item of data) {
        await createTransaccion(item);
      }
      await loadData();
      alert(`Se importaron ${data.length} transacciones con éxito.`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenModal={() => {
          setEditingTransaction(null);
          setIsModalOpen(true);
        }}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-72">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard 
                stats={stats} 
                transacciones={transacciones} 
                onOpenModal={() => {
                  setEditingTransaction(null);
                  setIsModalOpen(true);
                }}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === 'transacciones' && (
              <TransactionList 
                transacciones={transacciones}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                onDuplicate={handleDuplicateTransaction}
                onOpenModal={() => {
                  setEditingTransaction(null);
                  setIsModalOpen(true);
                }}
                onExport={handleExportCSV}
              />
            )}

            {currentTab === 'presupuestos' && (
              <BudgetManager 
                presupuestos={stats.presupuestos || presupuestos}
                onSavePresupuesto={handleSavePresupuesto}
                onDeletePresupuesto={handleDeletePresupuesto}
              />
            )}

            {currentTab === 'reportes' && (
              <ReportsView 
                stats={stats}
                transacciones={transacciones}
                onExportCSV={handleExportCSV}
                onImportJSON={handleImportJSON}
              />
            )}

            {currentTab === 'atajo' && (
              <MobileShortcutGuide 
                onTransactionAdded={loadData}
              />
            )}
          </>
        )}
      </main>

      {/* Modal para Crear / Editar Transacciones */}
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FinanzasPro • Sistema de Control de Gastos Personales</span>
          <span className="text-[11px] text-slate-400">Desarrollado para gestión financiera inteligente</span>
        </div>
      </footer>

    </div>
  );
}
