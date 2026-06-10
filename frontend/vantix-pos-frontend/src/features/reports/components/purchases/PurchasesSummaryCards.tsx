import { ShoppingCart, AlertTriangle } from 'lucide-react';
import type { ReporteCompras } from '../../types/purchases.types';

interface Props {
  data: ReporteCompras;
}

export const PurchasesSummaryCards = ({ data }: Props) => {
  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
      
      {/* Tarjeta de Total Invertido */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-5"><ShoppingCart className="w-24 h-24 text-blue-600 dark:text-blue-400" /></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Invertido en Mercadería</p>
          <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400 transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>
        <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100 relative z-10 transition-colors">{formatCurrency(data.totalComprado)}</h3>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-2 relative z-10 uppercase tracking-wider">En el rango de fechas seleccionado</p>
      </div>

      {/* Tarjeta de Deuda Viva */}
      <div className="bg-rose-50 dark:bg-rose-950/10 p-6 rounded-2xl shadow-sm border border-rose-200 dark:border-rose-900/40 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-5"><AlertTriangle className="w-24 h-24 text-rose-600 dark:text-rose-400" /></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <p className="text-sm font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider">Deuda Total a Proveedores</p>
          <div className="p-2 bg-rose-100 dark:bg-rose-950/40 rounded-lg text-rose-600 dark:text-rose-400 animate-pulse transition-colors">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <h3 className="text-4xl font-black text-rose-600 dark:text-rose-300 relative z-10 transition-colors">{formatCurrency(data.totalDeudaProveedores)}</h3>
        <p className="text-xs font-bold text-rose-400 dark:text-rose-500 mt-2 relative z-10 uppercase tracking-wider">Deuda viva actual (No depende de la fecha)</p>
      </div>

    </div>
  );
};