import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { KardexResponse } from '../types/kardex.types';

interface KardexTableProps {
  historial: KardexResponse[];
  isLoading: boolean;
  isGlobalMode: boolean;
  getOrigenBadge: (origen: string) => ReactNode;
  formatStoreName: (name: string) => string;
}

export const KardexTable = ({ historial, isLoading, isGlobalMode, getOrigenBadge, formatStoreName }: KardexTableProps) => {
  return (
    <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
            <tr>
              <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha y Hora</th>
              {isGlobalMode && <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tienda</th>}
              <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Producto (SKU)</th>
              <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Origen</th>
              <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Tipo</th>
              <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Cant.</th>
              <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Saldo</th>
              <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
            {isLoading ? (
              <tr>
                <td colSpan={isGlobalMode ? 8 : 7} className="py-12 text-center text-slate-400 dark:text-slate-500 italic">
                  Consultando al servidor...
                </td>
              </tr>
            ) : historial.length === 0 ? (
              <tr>
                <td colSpan={isGlobalMode ? 8 : 7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  Sin movimientos registrados.
                </td>
              </tr>
            ) : (
              historial.map((mov) => (
                <tr key={mov.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {format(new Date(mov.fechaMovimiento), "dd/MM/yy, HH:mm", { locale: es })}
                  </td>
                  
                  {isGlobalMode && (
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-900/30 uppercase tracking-wide" title={mov.tiendaNombre || 'Sin nombre'}>
                        {formatStoreName(mov.tiendaNombre || 'Matriz')}
                      </span>
                    </td>
                  )}

                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight mb-0.5">
                        {mov.varianteNombre || 'Producto sin nombre'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        SKU: {mov.varianteSku}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-center">
                    {getOrigenBadge(mov.origenMovimiento)}
                  </td>
                  
                  <td className="py-4 px-6 text-center">
                    {mov.tipoMovimiento === 'ENTRADA' ? (
                      <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-black text-[10px]"><ArrowDownRight className="w-3 h-3 mr-1" /> ENTRADA</span>
                    ) : (
                      <span className="inline-flex items-center text-red-600 dark:text-red-400 font-black text-[10px]"><ArrowUpRight className="w-3 h-3 mr-1" /> SALIDA</span>
                    )}
                  </td>
                  
                  <td className="py-4 px-6 text-center">
                    <span className={`text-sm font-black ${mov.tipoMovimiento === 'ENTRADA' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {mov.tipoMovimiento === 'ENTRADA' ? '+' : '-'}{mov.cantidad}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6 text-center">
                    <span className="text-sm font-black text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                      {mov.stockResultante}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 max-w-[150px] truncate font-medium" title={mov.notasInternas || ''}>
                    {mov.notasInternas || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};