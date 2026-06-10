import { Eye, PackageCheck, XCircle, ArrowRightLeft } from 'lucide-react';
import type { TrasladoResponse } from '../types/transfers.types';

interface TransferHistoryTableProps {
  traslados: TrasladoResponse[];
  isLoading: boolean;
  activeStoreId: number;
  getStoreName: (id: number) => string;
  onOpenDetails: (t: TrasladoResponse) => void;
  onAction: (type: 'accept' | 'reject', id: number) => void;
}

export const TransferHistoryTable = ({
  traslados,
  isLoading,
  activeStoreId,
  getStoreName,
  onOpenDetails,
  onAction
}: TransferHistoryTableProps) => {
  return (
    <div className="hidden md:block overflow-y-auto flex-1 custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors">
          <tr>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Correlativo</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Ruta (Origen → Destino)</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Fecha</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Estado</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 transition-colors">
          {isLoading ? (
            <tr><td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">Cargando traslados...</td></tr>
          ) : traslados.length === 0 ? (
            <tr><td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">No hay traslados que coincidan con los filtros.</td></tr>
          ) : (
            traslados.map((t) => {
              const isIncoming = t.tiendaDestinoId === activeStoreId; 
              const isOutgoing = t.tiendaOrigenId === activeStoreId;

              return (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-6 text-sm font-bold text-slate-800 dark:text-slate-200">{t.correlativo}</td>
                  <td className="py-3 px-6">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <span className={`font-semibold ${isOutgoing ? 'text-primary dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{getStoreName(t.tiendaOrigenId)}</span>
                      <ArrowRightLeft className="w-4 h-4 mx-2 text-slate-400 dark:text-slate-600" />
                      <span className={`font-semibold ${isIncoming ? 'text-primary dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{getStoreName(t.tiendaDestinoId)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(t.fechaCreacion).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      t.estadoTraslado === 'COMPLETADO' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                      t.estadoTraslado === 'PENDIENTE' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' :
                      'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                    }`}>
                      {t.estadoTraslado}
                    </span>
                  </td>
                  <td className="py-3 px-6 flex items-center justify-center space-x-2">
                    <button type="button" onClick={() => onOpenDetails(t)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    {t.estadoTraslado === 'PENDIENTE' && isIncoming && (
                      <button type="button" onClick={() => onAction('accept', t.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <PackageCheck className="w-5 h-5" />
                      </button>
                    )}
                    {t.estadoTraslado === 'PENDIENTE' && (
                      <button type="button" onClick={() => onAction('reject', t.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};