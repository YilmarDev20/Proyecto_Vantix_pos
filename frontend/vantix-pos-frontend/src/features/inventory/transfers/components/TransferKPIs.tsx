import { PackageCheck, PackageOpen, Clock } from 'lucide-react';
import type { TrasladoResponse } from '../types/transfers.types';

interface TransferKPIsProps {
  traslados: TrasladoResponse[];
  activeStoreId: number;
}

export const TransferKPIs = ({ traslados, activeStoreId }: TransferKPIsProps) => {
  const recibidos = traslados.filter(t => t.tiendaDestinoId === activeStoreId && t.estadoTraslado === 'COMPLETADO').length;
  const enviados = traslados.filter(t => t.tiendaOrigenId === activeStoreId).length;
  const pendientes = traslados.filter(t => t.tiendaDestinoId === activeStoreId && t.estadoTraslado === 'PENDIENTE').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center transition-colors">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-primary dark:text-blue-400 rounded-lg mr-4 transition-colors">
          <PackageOpen className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Enviados por nosotros</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{enviados}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center transition-colors">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg mr-4 transition-colors">
          <PackageCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Recibidos con éxito</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{recibidos}</p>
        </div>
      </div>

      <div className="bg-amber-50/30 dark:bg-amber-950/10 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-sm flex items-center transition-colors">
        <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg mr-4 transition-colors">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Pendientes de Recepción</p>
          <p className="text-2xl font-black text-amber-800 dark:text-amber-200">{pendientes}</p>
        </div>
      </div>
    </div>
  );
};