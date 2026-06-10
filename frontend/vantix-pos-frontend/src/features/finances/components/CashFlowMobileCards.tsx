import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { MovimientoCajaResponse } from '../types/finances.types';

interface CashFlowMobileCardsProps {
  movimientos: MovimientoCajaResponse[];
  isLoading: boolean;
}

export const CashFlowMobileCards = ({ movimientos, isLoading }: CashFlowMobileCardsProps) => {
  if (isLoading) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        Cargando movimientos...
      </div>
    );
  }

  if (movimientos.length === 0) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        No hay movimientos registrados en el turno actual o la caja está cerrada.
      </div>
    );
  }

  return (
    <div className="block md:hidden space-y-3 p-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl transition-colors">
      {movimientos.map((mov) => (
        <div key={mov.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5 transition-colors">
          
          <div className="flex justify-between items-center">
            {mov.tipoMovimiento === 'INGRESO' ? (
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-xs"><ArrowDownRight className="w-3 h-3 mr-1" /> INGRESO</span>
            ) : (
              <span className="flex items-center text-red-600 dark:text-red-400 font-bold text-xs"><ArrowUpRight className="w-3 h-3 mr-1" /> EGRESO (GASTO)</span>
            )}
            <span className="text-xs font-bold text-slate-400">
              {format(new Date(mov.fechaMovimiento), "HH:mm", { locale: es })}
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-tight bg-slate-50/50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
            {mov.concepto}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black rounded uppercase border border-transparent dark:border-slate-700">
              {mov.metodoPago}
            </span>
            <span className={`font-black text-base ${mov.tipoMovimiento === 'INGRESO' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {mov.tipoMovimiento === 'INGRESO' ? '+' : '-'} S/ {mov.monto.toFixed(2)}
            </span>
          </div>

        </div>
      ))}
    </div>
  );
};