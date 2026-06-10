import { TrendingUp, TrendingDown, DollarSign, Receipt, Wallet, Banknote } from 'lucide-react';
import type { DashboardResumen } from '../types/dashboard.types';

interface Props {
  data: DashboardResumen;
}

export const DashboardKpiCards = ({ data }: Props) => {
  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;
  const isPositiveGrowth = data.porcentajeCrecimiento >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* 1. Ventas de Hoy */}
      {/* ✅ ADAPTACIÓN: Fondo oscuro slate-900 y bordes sutiles slate-800 */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10">
          <DollarSign className="w-20 h-20 text-indigo-600 dark:text-indigo-400" />
        </div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 relative z-10">Ventas de Hoy</p>
        <h3 className="text-3xl font-black text-slate-800 dark:text-white relative z-10">{formatCurrency(data.ventasHoy)}</h3>
        <div className={`flex items-center mt-4 text-sm font-bold relative z-10 ${isPositiveGrowth ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
          {isPositiveGrowth ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          <span>{Math.abs(data.porcentajeCrecimiento).toFixed(1)}% vs. Ayer</span>
        </div>
      </div>

      {/* 2. Caja en Vivo */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10">
          <Wallet className="w-20 h-20 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 relative z-10">Efectivo en Gaveta</p>
        <h3 className="text-3xl font-black text-slate-800 dark:text-white relative z-10">{formatCurrency(data.cajaFisicaActual)}</h3>
        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-4 border-t border-slate-50 dark:border-slate-800 pt-3 flex items-center relative z-10">
          <Banknote className="w-4 h-4 mr-1" /> Liquidez actual en tienda
        </p>
      </div>

      {/* 3. Tickets Emitidos */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10">
          <Receipt className="w-20 h-20 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 relative z-10">Tickets Emitidos</p>
        <h3 className="text-3xl font-black text-slate-800 dark:text-white relative z-10">{data.ticketsHoy}</h3>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-4 border-t border-slate-50 dark:border-slate-800 pt-3 relative z-10">Operaciones completadas hoy</p>
      </div>

      {/* 4. Ticket Promedio */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Ticket Promedio</p>
        <h3 className="text-3xl font-black text-slate-800 dark:text-white">{formatCurrency(data.ticketPromedio)}</h3>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-4 border-t border-slate-50 dark:border-slate-800 pt-3">Gasto promedio por cliente</p>
      </div>

    </div>
  );
};