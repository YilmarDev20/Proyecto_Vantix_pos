import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TurnoCajaResponse } from '../types/finances.types';

interface TurnHistoryMobileCardsProps {
  historial: TurnoCajaResponse[];
  isLoading: boolean;
  renderDiferencia: (diferencia: number | null) => React.ReactNode;
  onOpenDetails: (turnoId: number) => void;
}

export const TurnHistoryMobileCards = ({ historial, isLoading, renderDiferencia, onOpenDetails }: TurnHistoryMobileCardsProps) => {
  if (isLoading) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        Cargando historial...
      </div>
    );
  }

  if (historial.length === 0) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        No hay turnos registrados.
      </div>
    );
  }

  return (
    <div className="block md:hidden space-y-3 p-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl transition-colors">
      {historial.map((turno) => (
        <div key={turno.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3 transition-colors">
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Apertura</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {format(new Date(turno.fechaApertura), "dd MMM yyyy, HH:mm", { locale: es })}
              </span>
            </div>
            <span className={`px-2 py-1 text-[10px] font-black rounded ${turno.estadoTurno === 'ABIERTO' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {turno.estadoTurno}
            </span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-b border-slate-100 dark:border-slate-800 py-2 my-0.5 flex justify-between">
            <span><strong>Cierre:</strong> {turno.fechaCierre ? format(new Date(turno.fechaCierre), "dd MMM, HH:mm", { locale: es }) : 'Caja abierta'}</span>
            <span><strong>Inicial:</strong> S/ {turno.montoApertura.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0 scale-95 origin-left">
              {renderDiferencia(turno.diferencia)}
            </div>
            <button 
              type="button" 
              onClick={() => onOpenDetails(turno.id)}
              className="p-2 text-primary dark:text-blue-400 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 hover:bg-blue-100 rounded-lg transition-colors shrink-0 flex items-center gap-1 text-xs font-bold"
            >
              <Eye className="w-4 h-4" /> Auditoría
            </button>
          </div>

        </div>
      ))}
    </div>
  );
};