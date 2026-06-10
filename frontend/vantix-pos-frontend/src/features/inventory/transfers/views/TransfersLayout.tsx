import { useState, useEffect } from 'react';
import { Truck, History } from 'lucide-react';
import { useAuth } from '@/core/auth/context/AuthContext';

import { NewTransferView } from './NewTransferView';
import { TransferHistoryView } from './TransferHistoryView';

type TransferTabType = 'historial' | 'nuevo';

export const TransfersLayout = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ROLE_ADMIN';
  
  const [activeTab, setActiveTab] = useState<TransferTabType>('historial');

  useEffect(() => {
    if (!isAdmin && activeTab === 'nuevo') {
      setActiveTab('historial');
    }
  }, [isAdmin, activeTab]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      
      {/* HEADER COMPACTO CON EL TOGGLE INTEGRADO A LA DERECHA */}
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="pl-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 transition-colors">Gestión de Traslados</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
            {isAdmin ? 'Administra el flujo de mercadería entre sucursales' : 'Recepciona la mercadería enviada a tu sucursal'}
          </p>
        </div>

        {/* TOGGLE COMPACTO (Adaptativo) */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
          <button
            type="button"
            onClick={() => setActiveTab('historial')}
            className={`flex items-center px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
              activeTab === 'historial' 
                ? 'bg-white dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4 mr-2" />
            {isAdmin ? 'Historial y Recepción' : 'Envíos en Tránsito'}
          </button>
          
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('nuevo')}
              className={`flex items-center px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                activeTab === 'nuevo' 
                  ? 'bg-white dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Truck className="w-4 h-4 mr-2" />
              Nuevo Envío
            </button>
          )}
        </div>
      </div>

      {/* CONTENEDOR FLEXIBLE */}
      <div className="flex-1 min-h-0">
         {activeTab === 'historial' && <TransferHistoryView />}
         {activeTab === 'nuevo' && isAdmin && <NewTransferView />} 
      </div>
      
    </div>
  );
};