import { Search, Filter } from "lucide-react";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  methodFilter: string;
  onMethodChange: (value: string) => void;
}

export const OrdersFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  methodFilter,
  onMethodChange,
}: Props) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
      {/* BUSCADOR */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por código, cliente o telf..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-fuchsia-500/50 transition-all"
        />
      </div>

      {/* SELECTORES DE FILTRO */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-bold">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtros:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 font-bold focus:outline-hidden cursor-pointer"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="PENDIENTE">Pendientes Pago</option>
          <option value="CONFIRMADO">Aprobados</option>
          <option value="CANCELADO">Anulados</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => onMethodChange(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 font-bold focus:outline-hidden cursor-pointer"
        >
          <option value="TODOS">Todos los métodos</option>
          <option value="YAPE">Yape</option>
          <option value="PLIN">Plin</option>
          <option value="EFECTIVO">Efectivo</option>
        </select>
      </div>
    </div>
  );
};