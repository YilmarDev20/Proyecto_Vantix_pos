import { Search, FilterX } from 'lucide-react';

export interface PurchaseFiltersConfig {
  proveedor: string;
  metodoPago: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
}

interface PurchaseHistoryFiltersProps {
  filters: PurchaseFiltersConfig;
  setFilters: React.Dispatch<React.SetStateAction<PurchaseFiltersConfig>>;
  proveedoresDisponibles: string[];
}

export const PurchaseHistoryFilters = ({ filters, setFilters, proveedoresDisponibles }: PurchaseHistoryFiltersProps) => {
  
  const handleReset = () => {
    setFilters({ proveedor: '', metodoPago: '', estado: '', fechaInicio: '', fechaFin: '' });
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center">
          <Search className="w-4 h-4 mr-2" /> Filtros de Búsqueda
        </h4>
        <button type="button" onClick={handleReset} className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 flex items-center font-medium transition-colors">
          <FilterX className="w-3 h-3 mr-1" /> Limpiar Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Filtro Proveedor */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Proveedor</label>
          <select 
            value={filters.proveedor} onChange={(e) => setFilters({...filters, proveedor: e.target.value})}
            className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-primary dark:focus:border-blue-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors"
          >
            <option value="">Todos</option>
            {proveedoresDisponibles.map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
        </div>

        {/* Filtro Método de Pago */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Método de Pago</label>
          <select 
            value={filters.metodoPago} onChange={(e) => setFilters({...filters, metodoPago: e.target.value})}
            className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-primary dark:focus:border-blue-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors"
          >
            <option value="">Todos</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="YAPE">Yape</option>
            <option value="PLIN">Plin</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="CREDITO">Al Crédito</option>
          </select>
        </div>

        {/* Filtro Estado */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Estado</label>
          <select 
            value={filters.estado} onChange={(e) => setFilters({...filters, estado: e.target.value})}
            className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-primary dark:focus:border-blue-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors"
          >
            <option value="">Todos</option>
            <option value="PAGADO">Pagado</option>
            <option value="POR_PAGAR">Por Pagar</option>
            <option value="ANULADO">Anulado</option>
          </select>
        </div>

        {/* Fechas */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Desde</label>
          <input 
            type="date" 
            value={filters.fechaInicio} onChange={(e) => setFilters({...filters, fechaInicio: e.target.value})}
            className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-primary dark:focus:border-blue-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Hasta</label>
          <input 
            type="date" 
            value={filters.fechaFin} onChange={(e) => setFilters({...filters, fechaFin: e.target.value})}
            className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-primary dark:focus:border-blue-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};