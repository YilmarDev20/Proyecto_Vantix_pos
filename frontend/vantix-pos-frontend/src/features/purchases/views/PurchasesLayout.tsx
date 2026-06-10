import { useState } from 'react';
import { ShoppingCart, Truck, CreditCard } from 'lucide-react';

import { SuppliersView } from './SuppliersView';
import { PurchaseHistoryView } from './PurchaseHistoryView';
import { AccountsPayableView } from './AccountsPayableView';

type PurchasesTabType = 'proveedores' | 'historial' | 'cuentas-por-pagar';

export const PurchasesLayout = () => {
  const [activeTab, setActiveTab] = useState<PurchasesTabType>('proveedores');

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Compras y Abastecimiento</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
          Ingreso de facturas, gestión de proveedores y cuentas por pagar.
        </p>
      </div>

      <div className="flex space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 w-full md:w-fit mb-6 overflow-x-auto transition-colors">
        <button
          type="button"
          onClick={() => setActiveTab('proveedores')}
          className={`flex items-center whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'proveedores' 
              ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4 mr-2" />
          Proveedores
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('historial')}
          className={`flex items-center whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'historial' 
              ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Registro de Compras
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cuentas-por-pagar')}
          className={`flex items-center whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'cuentas-por-pagar' 
              ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Cuentas por Pagar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {activeTab === 'proveedores' && <SuppliersView />}
        {activeTab === 'historial' && <PurchaseHistoryView />}
        {activeTab === 'cuentas-por-pagar' && <AccountsPayableView />}
      </div>
    </div>
  );
};