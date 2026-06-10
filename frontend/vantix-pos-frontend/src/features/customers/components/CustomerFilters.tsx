import { Search } from 'lucide-react';

interface CustomerFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  setStatusFilter: (value: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  hasDebtFilter: boolean;
  setHasDebtFilter: (value: boolean) => void;
}

export const CustomerFilters = ({
  searchTerm, setSearchTerm, statusFilter, setStatusFilter, hasDebtFilter, setHasDebtFilter
}: CustomerFiltersProps) => {
  return (
    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
      {/* Buscador de texto */}
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar por nombre o documento..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors"
        />
      </div>

      {/* Filtros avanzados */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full md:w-auto">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm transition-colors"
        >
          <option value="ALL">Todos los estados</option>
          <option value="ACTIVE">Solo Activos</option>
          <option value="INACTIVE">Solo Inactivos</option>
        </select>

        <label className="flex items-center space-x-2 cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={hasDebtFilter}
            onChange={(e) => setHasDebtFilter(e.target.checked)}
            className="w-4 h-4 text-primary dark:text-blue-500 rounded border-slate-300 dark:border-slate-700 focus:ring-primary dark:focus:ring-blue-500 dark:bg-slate-950 transition-colors"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium transition-colors">Con deuda pendiente</span>
        </label>
      </div>
    </div>
  );
};