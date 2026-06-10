import { TrendingUp, TrendingDown, Wallet, DoorOpen } from 'lucide-react';
import type { ReporteFinanzas } from '../../types/finances.types';

interface Props {
  data: ReporteFinanzas;
}

export const FinancesSummaryCards = ({ data }: Props) => {
  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-150">
      
      {/* 1. Fondo Inicial */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fondo Apertura</p>
          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"><DoorOpen className="w-4 h-4" /></div>
        </div>
        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors">{formatCurrency(data.fondoInicial)}</h3>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase">Dinero base en caja</p>
      </div>

      {/* 2. Ingresos */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Ingresos (+)</p>
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400 transition-colors"><TrendingUp className="w-4 h-4" /></div>
        </div>
        <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 transition-colors">{formatCurrency(data.totalIngresos)}</h3>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase">Ventas y abonos</p>
      </div>

      {/* 3. Egresos */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Egresos (-)</p>
          <div className="p-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-rose-600 dark:text-rose-400 transition-colors"><TrendingDown className="w-4 h-4" /></div>
        </div>
        <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 transition-colors">{formatCurrency(data.totalEgresos)}</h3>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase">Pagos y anulaciones</p>
      </div>

      {/* 4. Saldo Neto (Dinero Físico) */}
      <div className="bg-indigo-600 dark:bg-indigo-700 p-5 rounded-2xl shadow-md border border-indigo-700 dark:border-indigo-800 text-white relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 p-3 opacity-20"><Wallet className="w-16 h-16" /></div>
        <p className="text-xs font-bold text-indigo-200 dark:text-indigo-100 uppercase tracking-wider mb-3">Caja Total</p>
        <h3 className="text-3xl font-black">{formatCurrency(data.saldoNeto)}</h3>
        <p className="text-[10px] font-bold text-indigo-200 dark:text-indigo-100 mt-1">Fondo + Ingresos - Egresos</p>
      </div>

    </div>
  );
};