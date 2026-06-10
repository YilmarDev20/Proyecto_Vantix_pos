import { Eye, UserCircle, MapPin } from 'lucide-react';
import type { AuditoriaLog } from '../types/audit.types';

interface AuditMobileCardsProps {
  logs: AuditoriaLog[];
  isLoading: boolean;
  onViewDetails: (log: AuditoriaLog) => void;
}

export const AuditMobileCards = ({ logs, isLoading, onViewDetails }: AuditMobileCardsProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        Cargando registros de seguridad...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        No se encontraron registros bajo estos filtros.
      </div>
    );
  }

  return (
    <div className="block md:hidden space-y-3 p-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl transition-colors">
      {logs.map((log) => (
        <div key={log.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5 transition-colors">
          
          {/* Fila 1: Módulo y Fecha */}
          <div className="flex justify-between items-center">
            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-md text-[10px] uppercase font-black border border-indigo-100 dark:border-indigo-900/30 tracking-wider transition-colors">
              {log.modulo}
            </span>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              {formatDate(log.fechaRegistro)}
            </span>
          </div>

          {/* Fila 2: Acción e ID de Referencia */}
          <div className="flex justify-between items-baseline gap-2">
            <p className="font-black text-slate-700 dark:text-slate-300 text-sm">{log.accion}</p>
            {log.entidadId && (
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-transparent dark:border-slate-700 shrink-0">
                Ref ID: {log.entidadId}
              </span>
            )}
          </div>

          {/* Fila 3: Descripción del Evento */}
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 leading-relaxed transition-colors">
            {log.descripcion}
          </p>

          {/* Fila 4: Metadatos y Botón de Auditoría */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col text-[10px] font-semibold text-slate-400 dark:text-slate-500 space-y-0.5">
              <span className="flex items-center"><UserCircle className="w-3 h-3 mr-1" /> User ID: {log.usuarioId}</span>
              <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> IP: {log.direccionIp}</span>
            </div>
            
            <button 
              type="button"
              onClick={() => onViewDetails(log)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-lg transition-colors font-bold text-xs flex items-center shadow-sm border border-transparent dark:border-slate-700"
            >
              <Eye className="w-3.5 h-3.5 mr-1" /> Ver Cambios
            </button>
          </div>

        </div>
      ))}
    </div>
  );
};