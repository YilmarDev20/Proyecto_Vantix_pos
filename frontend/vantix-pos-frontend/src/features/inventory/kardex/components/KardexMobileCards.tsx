import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Store } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { KardexResponse } from '../types/kardex.types';

interface KardexMobileCardsProps {
  historial: KardexResponse[];
  isLoading: boolean;
  isGlobalMode: boolean;
  getOrigenBadge: (origen: string) => ReactNode;
}

export const KardexMobileCards = ({ historial, isLoading, isGlobalMode, getOrigenBadge }: KardexMobileCardsProps) => {
  if (isLoading) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
        Consultando al servidor...
      </div>
    );
  }

  if (historial.length === 0) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
        Sin movimientos registrados.
      </div>
    );
  }

  return (
    <div className="block md:hidden space-y-3">
      {historial.map((mov) => (
        <div key={mov.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3 transition-colors">
          
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 pr-2">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{mov.varianteNombre || 'Producto sin nombre'}</p>
              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">SKU: {mov.varianteSku}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{format(new Date(mov.fechaMovimiento), "dd MMM yy", { locale: es })}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{format(new Date(mov.fechaMovimiento), "HH:mm")}</p>
            </div>
          </div>

          {isGlobalMode && (
            <div>
              <span className="inline-flex items-center text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-900/30 uppercase tracking-wide">
                <Store className="w-3 h-3 mr-1"/>
                {mov.tiendaNombre || 'Matriz'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 transition-colors">
            <div className="flex flex-col gap-1.5">
              <div>{getOrigenBadge(mov.origenMovimiento)}</div>
              <div>
                {mov.tipoMovimiento === 'ENTRADA' ? (
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-black text-[10px]"><ArrowDownRight className="w-3 h-3 mr-0.5" /> ENTRADA</span>
                ) : (
                  <span className="flex items-center text-red-600 dark:text-red-400 font-black text-[10px]"><ArrowUpRight className="w-3 h-3 mr-0.5" /> SALIDA</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Cant</p>
                <p className={`text-base font-black ${mov.tipoMovimiento === 'ENTRADA' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {mov.tipoMovimiento === 'ENTRADA' ? '+' : '-'}{mov.cantidad}
                </p>
              </div>
              <div className="text-right pl-4 border-l border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Saldo</p>
                <p className="text-base font-black text-slate-800 dark:text-slate-200">{mov.stockResultante}</p>
              </div>
            </div>
          </div>

          {mov.notasInternas && (
            <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-md border border-amber-100/50 dark:border-amber-900/30 transition-colors">
              <span className="font-bold not-italic text-amber-700 dark:text-amber-400 mr-1">Nota:</span>
              {mov.notasInternas}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};