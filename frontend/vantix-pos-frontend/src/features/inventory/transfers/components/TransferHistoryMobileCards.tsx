import { Eye, PackageCheck, XCircle, ArrowRightLeft } from 'lucide-react';
import type { TrasladoResponse } from '../types/transfers.types';

interface TransferHistoryMobileCardsProps {
  traslados: TrasladoResponse[];
  isLoading: boolean;
  activeStoreId: number;
  getStoreName: (id: number) => string;
  onOpenDetails: (t: TrasladoResponse) => void;
  onAction: (type: 'accept' | 'reject', id: number) => void;
}

export const TransferHistoryMobileCards = ({
  traslados,
  isLoading,
  activeStoreId,
  getStoreName,
  onOpenDetails,
  onAction
}: TransferHistoryMobileCardsProps) => {
  if (isLoading) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        Cargando traslados...
      </div>
    );
  }

  if (traslados.length === 0) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        No hay traslados que coincidan con los filtros.
      </div>
    );
  }

  return (
    <div className="block md:hidden space-y-3 p-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl transition-colors">
      {traslados.map((t) => {
        const isIncoming = t.tiendaDestinoId === activeStoreId;
        const isOutgoing = t.tiendaOrigenId === activeStoreId;

        return (
          <div key={t.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3 transition-colors">
            
            {/* Cabecera: Correlativo y Fecha */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">{t.correlativo}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(t.fechaCreacion).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
              </span>
            </div>

            {/* Ruta Envolvente */}
            <div className="bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 flex items-center justify-between transition-colors">
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ruta de Envío</span>
                <div className="flex items-center text-xs truncate">
                  <span className={`font-bold truncate ${isOutgoing ? 'text-primary dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {getStoreName(t.tiendaOrigenId)}
                  </span>
                  <ArrowRightLeft className="w-3.5 h-3.5 mx-2 text-slate-400 shrink-0" />
                  <span className={`font-bold truncate ${isIncoming ? 'text-primary dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {getStoreName(t.tiendaDestinoId)}
                  </span>
                </div>
              </div>
              
              {/* Estado Badge */}
              <div className="ml-2 shrink-0">
                <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-full ${
                  t.estadoTraslado === 'COMPLETADO' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                  t.estadoTraslado === 'PENDIENTE' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' :
                  'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                }`}>
                  {t.estadoTraslado}
                </span>
              </div>
            </div>

            {/* Fila de Acciones inferior */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="button" 
                onClick={() => onOpenDetails(t)} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" /> Ver Detalles
              </button>

              {t.estadoTraslado === 'PENDIENTE' && isIncoming && (
                <button 
                  type="button" 
                  onClick={() => onAction('accept', t.id)} 
                  className="p-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 rounded-lg transition-colors"
                  title="Recibir Mercadería"
                >
                  <PackageCheck className="w-4 h-4" />
                </button>
              )}

              {t.estadoTraslado === 'PENDIENTE' && (
                <button 
                  type="button" 
                  onClick={() => onAction('reject', t.id)} 
                  className="p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 hover:bg-red-100 rounded-lg transition-colors"
                  title="Anular Traslado"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};