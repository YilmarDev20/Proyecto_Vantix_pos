import { Eye } from 'lucide-react';
import type { AuditoriaLog } from '../types/audit.types';

interface Props {
  logs: AuditoriaLog[];
  isLoading: boolean;
  onViewDetails: (log: AuditoriaLog) => void;
}

export const AuditTable = ({ logs, isLoading, onViewDetails }: Props) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', { 
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (isLoading) return null; // El loading o vacíos ya los maneja de forma limpia el componente de tarjetas móviles arriba

  return (
    // ✅ ADAPTACIÓN PC: Añadida la clase 'hidden md:block' para que no rompa el viewport celular
    <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 transition-colors custom-scrollbar">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 transition-colors">
          <tr>
            <th className="p-4">Fecha y Hora</th>
            <th className="p-4">Módulo</th>
            <th className="p-4">Acción</th>
            <th className="p-4">ID Ref.</th>
            <th className="p-4">Descripción</th>
            <th className="p-4 text-center">Auditar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
          {logs.map(log => (
            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td className="p-4 font-medium text-slate-600 dark:text-slate-400">{formatDate(log.fechaRegistro)}</td>
              <td className="p-4">
                <span className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-md text-[10px] uppercase font-black border border-indigo-100 dark:border-indigo-900/30 tracking-wider transition-colors">
                  {log.modulo}
                </span>
              </td>
              <td className="p-4 font-black text-slate-700 dark:text-slate-300">{log.accion}</td>
              <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-500">{log.entidadId || '-'}</td>
              <td className="p-4 text-slate-600 dark:text-slate-400 truncate max-w-xs" title={log.descripcion}>
                {log.descripcion}
              </td>
              <td className="p-4 text-center">
                <button 
                  type="button"
                  onClick={() => onViewDetails(log)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-lg transition-colors font-bold text-xs flex items-center justify-center mx-auto border border-transparent dark:border-slate-700"
                >
                  <Eye className="w-4 h-4 mr-1.5" /> Ver Cambios
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};