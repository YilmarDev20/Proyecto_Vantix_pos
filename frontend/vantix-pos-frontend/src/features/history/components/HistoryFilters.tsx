import { Search, Calendar, Filter, Wallet, Activity } from 'lucide-react';

interface HistoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fechaDesde: string;
  setFechaDesde: (term: string) => void;
  fechaHasta: string;
  setFechaHasta: (term: string) => void;
  tipoFiltro: string;
  setTipoFiltro: (term: string) => void;
  metodoPagoFiltro: string;
  setMetodoPagoFiltro: (term: string) => void;
  estadoFiltro: string; 
  setEstadoFiltro: (term: string) => void;
  activeTab: 'VENTAS' | 'COTIZACIONES';
}

export const HistoryFilters = ({ 
  searchTerm, setSearchTerm, 
  fechaDesde, setFechaDesde, 
  fechaHasta, setFechaHasta, 
  tipoFiltro, setTipoFiltro,
  metodoPagoFiltro, setMetodoPagoFiltro,
  estadoFiltro, setEstadoFiltro,
  activeTab
}: HistoryFiltersProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-x border-t border-slate-200 dark:border-slate-800 p-3 flex flex-wrap gap-3 items-center transition-colors">
      
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input 
          type="text" 
          placeholder="Buscar Correlativo o Cliente..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-9 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
        />
      </div>

      <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1 transition-colors">
        <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 ml-2" />
        <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none cursor-pointer" />
        <span className="text-slate-400 dark:text-slate-500 text-xs">al</span>
        <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none cursor-pointer pr-2" />
      </div>

      {/* FILTRO: Estado Dinámico */}
      <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 transition-colors">
        <Activity className="w-4 h-4 text-slate-400 dark:text-slate-500 ml-1" />
        <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} className="bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none font-medium cursor-pointer pr-2 dark:bg-slate-950">
          <option value="TODOS">Todos los Estados</option>
          {activeTab === 'COTIZACIONES' ? (
            <>
              <option value="PENDIENTE">Pendientes</option>
              <option value="COBRADA">Cobradas</option>
              <option value="ANULADA">Anuladas</option>
            </>
          ) : (
            <>
              <option value="COMPLETADA">Completadas</option>
              <option value="ANULADA">Anuladas</option>
            </>
          )}
        </select>
      </div>

      {/* FILTROS EXCLUSIVOS DE VENTAS */}
      {activeTab === 'VENTAS' && (
        <>
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 transition-colors">
            <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 ml-1" />
            <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)} className="bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none font-medium cursor-pointer pr-2 dark:bg-slate-950">
              <option value="TODOS">Todos (Tickets/Boletas/Facturas)</option>
              <option value="TICKET">Solo Tickets</option>
              <option value="BOLETA">Solo Boletas</option>
              <option value="FACTURA">Solo Facturas</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 transition-colors">
            <Wallet className="w-4 h-4 text-slate-400 dark:text-slate-500 ml-1" />
            <select value={metodoPagoFiltro} onChange={(e) => setMetodoPagoFiltro(e.target.value)} className="bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none font-medium cursor-pointer pr-2 dark:bg-slate-950">
              <option value="TODOS">Todos los Pagos</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="YAPE">Yape</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="CREDITO">Crédito (Fiado)</option>
              <option value="MIXTO">Pagos Mixtos</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};