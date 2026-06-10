import { Search, Filter, SortDesc, AlertOctagon } from 'lucide-react';

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  showOnlyLowStock: boolean;
  setShowOnlyLowStock: (v: boolean) => void;
}

export const PredictiveFilters = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, sortBy, setSortBy, showOnlyLowStock, setShowOnlyLowStock }: Props) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 mb-6 transition-colors">
      
      {/* Buscador */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
        <input 
          type="text" placeholder="Buscar por nombre o SKU..." 
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-blue-500 text-slate-800 dark:text-slate-100 transition-colors"
        />
      </div>

      {/* Filtros Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 transition-colors">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer dark:bg-slate-950">
            <option value="TODOS">Todos los Estados</option>
            <option value="CRÍTICO">Solo Críticos</option>
            <option value="PRECAUCIÓN">Solo Precaución</option>
            <option value="SANO">Solo Sanos</option>
            <option value="ESTANCADO">Solo Estancados</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 transition-colors">
          <SortDesc className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer dark:bg-slate-950">
            <option value="DIAS_ASC">Días de Vida (Menor a Mayor)</option>
            <option value="VENTAS_DESC">Más Vendidos</option>
            <option value="MARGEN_DESC">Mayor Margen de Ganancia</option>
            <option value="STOCK_ASC">Menor Stock Físico</option>
          </select>
        </div>

        {/* Switch de Stock Mínimo */}
        <button 
          type="button"
          onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            showOnlyLowStock 
              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50' 
              : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850'
          }`}
        >
          <AlertOctagon className="w-4 h-4 mr-2" />
          Bajo Stock Mínimo
        </button>
      </div>
    </div>
  );
};