import { Search, Filter, AlertTriangle } from 'lucide-react';

interface Props {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  moduloFiltro: string;
  setModuloFiltro: (val: string) => void;
  modulosDisponibles: string[];
}

export const AuditFilters = ({ searchTerm, setSearchTerm, moduloFiltro, setModuloFiltro, modulosDisponibles }: Props) => {
  return (
    <div className="p-6 border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center transition-colors">
          <AlertTriangle className="w-8 h-8 mr-3 text-indigo-600 dark:text-indigo-400" />
          Auditoría del Sistema
        </h2>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-400 px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-sm w-fit transition-colors">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Registro Inmodificable
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar descripción o ID (Ej: 4)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-blue-500 outline-none text-sm font-medium text-slate-800 dark:text-slate-100 transition-colors"
          />
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
        </div>
        <div className="relative">
          <select
            value={moduloFiltro}
            onChange={(e) => setModuloFiltro(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-blue-500 outline-none text-sm font-medium appearance-none cursor-pointer text-slate-800 dark:text-slate-100 transition-colors"
          >
            <option value="">Todos los Módulos</option>
            {modulosDisponibles.map(mod => (
              <option key={mod} value={mod}>{mod}</option>
            ))}
          </select>
          <Filter className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};