import { useState, useEffect } from 'react';
import { Wallet, History, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '@/core/auth/context/AuthContext';

import { CashRegisterView } from './CashRegisterView';
import { TurnHistoryView } from './TurnHistoryView';
import { CashFlowView } from './CashFlowView';

type FinancesTabType = 'caja' | 'historial' | 'movimientos';

export const FinancesLayout = () => {
  const { user } = useAuth(); 
  const isAdmin = user?.rol === 'ROLE_ADMIN'; 
  const [activeTab, setActiveTab] = useState<FinancesTabType>('caja');

  useEffect(() => {
    if (!isAdmin && activeTab === 'historial') {
      setActiveTab('caja');
    }
  }, [isAdmin, activeTab]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Caja y Finanzas</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
          {isAdmin 
            ? 'Apertura de turnos, registro de gastos, ingresos manuales y cuadre ciego.' 
            : 'Gestiona la apertura, movimientos y cierre de tu turno actual.'}
        </p>
      </div>

      <div className="flex space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 w-full md:w-fit mb-6 overflow-x-auto transition-colors">
        <button 
          type="button"
          onClick={() => setActiveTab('caja')} 
          className={`flex items-center whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'caja' 
              ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4 mr-2" /> Caja Operativa
        </button>

        {isAdmin && (
          <button 
            type="button"
            onClick={() => setActiveTab('historial')} 
            className={`flex items-center whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'historial' 
                ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4 mr-2" /> Historial de Turnos
          </button>
        )}

        <button 
          type="button"
          onClick={() => setActiveTab('movimientos')} 
          className={`flex items-center whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'movimientos' 
              ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" /> 
          {isAdmin ? 'Flujo de Efectivo Global' : 'Mis Movimientos (Hoy)'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {activeTab === 'caja' && <CashRegisterView />}
        {activeTab === 'historial' && isAdmin && <TurnHistoryView />}
        {activeTab === 'movimientos' && <CashFlowView />}
      </div>
    </div>
  );
};