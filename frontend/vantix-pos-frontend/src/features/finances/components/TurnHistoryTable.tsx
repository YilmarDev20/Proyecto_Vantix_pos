import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TurnoCajaResponse } from '../types/finances.types';

interface TurnHistoryTableProps {
  historial: TurnoCajaResponse[];
  isLoading: boolean;
  renderDiferencia: (diferencia: number | null) => React.ReactNode;
  onOpenDetails: (turnoId: number) => void;
}

export const TurnHistoryTable = ({ historial, isLoading, renderDiferencia, onOpenDetails }: TurnHistoryTableProps) => {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <tr>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Apertura</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Cierre</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Estado</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Monto Inicial</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Diferencia</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Detalle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
          {isLoading ? (
            <tr><td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">Cargando historial...</td></tr>
          ) : historial.length === 0 ? (
            <tr><td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">No hay turnos registrados.</td></tr>
          ) : (
            historial.map((turno) => (
              <tr key={turno.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-6 text-sm text-slate-700 dark:text-slate-200 font-medium">
                  {format(new Date(turno.fechaApertura), "dd MMM yyyy, HH:mm", { locale: es })}
                </td>
                <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">
                  {turno.fechaCierre ? format(new Date(turno.fechaCierre), "dd MMM yyyy, HH:mm", { locale: es }) : '-'}
                </td>
                <td className="py-3 px-6">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${turno.estadoTurno === 'ABIERTO' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {turno.estadoTurno}
                  </span>
                </td>
                <td className="py-3 px-6 text-sm font-bold text-slate-700 dark:text-slate-300">S/ {turno.montoApertura.toFixed(2)}</td>
                <td className="py-3 px-6 text-sm">
                  {renderDiferencia(turno.diferencia)}
                </td>
                <td className="py-3 px-6 text-center">
                  <button 
                    type="button"
                    onClick={() => onOpenDetails(turno.id)}
                    title="Ver movimientos del turno"
                    className="p-2 text-primary dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center justify-center"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};