import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { MovimientoCajaResponse } from '../types/finances.types';

interface CashFlowTableProps {
  movimientos: MovimientoCajaResponse[];
  isLoading: boolean;
}

export const CashFlowTable = ({ movimientos, isLoading }: CashFlowTableProps) => {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <tr>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Hora</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tipo</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Método de Pago</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Concepto</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Monto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
          {isLoading ? (
            <tr><td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">Cargando movimientos...</td></tr>
          ) : movimientos.length === 0 ? (
            <tr><td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">No hay movimientos registrados en el turno actual o la caja está cerrada.</td></tr>
          ) : (
            movimientos.map((mov) => (
              <tr key={mov.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {format(new Date(mov.fechaMovimiento), "HH:mm", { locale: es })}
                </td>
                <td className="py-3 px-6">
                  {mov.tipoMovimiento === 'INGRESO' ? (
                    <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-xs"><ArrowDownRight className="w-4 h-4 mr-1" /> INGRESO</span>
                  ) : (
                    <span className="flex items-center text-red-600 dark:text-red-400 font-bold text-xs"><ArrowUpRight className="w-4 h-4 mr-1" /> EGRESO (GASTO)</span>
                  )}
                </td>
                <td className="py-3 px-6">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded border border-transparent dark:border-slate-700">{mov.metodoPago}</span>
                </td>
                <td className="py-3 px-6 text-sm text-slate-700 dark:text-slate-300">{mov.concepto}</td>
                <td className={`py-3 px-6 text-right font-black text-base ${mov.tipoMovimiento === 'INGRESO' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {mov.tipoMovimiento === 'INGRESO' ? '+' : '-'} S/ {mov.monto.toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};