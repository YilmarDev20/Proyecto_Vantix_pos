import { Filter } from 'lucide-react';
import type { EstadoTraslado } from '../types/transfers.types';

interface TransferFiltersProps {
  filterStatus: EstadoTraslado | 'TODOS';
  setFilterStatus: (status: EstadoTraslado | 'TODOS') => void;
  filterType: 'TODOS' | 'ENTRANTES' | 'SALIENTES';
  setFilterType: (type: 'TODOS' | 'ENTRANTES' | 'SALIENTES') => void;
}

export const TransferFilters = ({ filterStatus, setFilterStatus, filterType, setFilterType }: TransferFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center text-sm font-bold text-slate-600 dark:text-slate-400">
        <Filter className="w-4 h-4 mr-2" /> Filtros:
      </div>
      
      <select 
        value={filterType} 
        onChange={(e) => setFilterType(e.target.value as any)}
        className="p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors"
      >
        <option value="TODOS">Cualquier Dirección</option>
        <option value="ENTRANTES">Solo Entrantes (Hacia mí)</option>
        <option value="SALIENTES">Solo Salientes (Desde mí)</option>
      </select>

      <select 
        value={filterStatus} 
        onChange={(e) => setFilterStatus(e.target.value as any)}
        className="p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors"
      >
        <option value="TODOS">Todos los Estados</option>
        <option value="PENDIENTE">Pendientes</option>
        <option value="COMPLETADO">Completados</option>
        <option value="RECHAZADO">Rechazados</option>
      </select>
    </div>
  );
};