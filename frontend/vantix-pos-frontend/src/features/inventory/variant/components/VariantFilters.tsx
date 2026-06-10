import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface VariantFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusChange: (val: 'all' | 'active' | 'inactive') => void;
  packFilter: 'all' | 'units' | 'packs';
  onPackChange: (val: 'all' | 'units' | 'packs') => void;
  sortBy: 'none' | 'price-asc' | 'price-desc';
  onSortChange: (val: 'none' | 'price-asc' | 'price-desc') => void;
}

export const VariantFilters = ({ 
  searchTerm, onSearchChange, 
  statusFilter, onStatusChange,
  packFilter, onPackChange,
  sortBy, onSortChange 
}: VariantFiltersProps) => (
  <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4">
    
    {/* Buscador de texto */}
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input 
        type="text" 
        placeholder="Buscar por SKU, Color, Talla o Código..." 
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
      />
    </div>

    {/* Filtro de Empaque */}
    <div className="relative w-full lg:w-48">
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <select 
        value={packFilter}
        onChange={(e) => onPackChange(e.target.value as any)}
        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white appearance-none"
      >
        <option value="all">Todo el Empaque</option>
        <option value="units">Solo Unidades</option>
        <option value="packs">Solo Packs/Cajas</option>
      </select>
    </div>

    {/* Filtro de Estado */}
    <div className="relative w-full lg:w-48">
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <select 
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as any)}
        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white appearance-none"
      >
        <option value="all">Todos los Estados</option>
        <option value="active">Solo Activos</option>
        <option value="inactive">Solo Inactivos</option>
      </select>
    </div>

    {/* Ordenamiento */}
    <div className="relative w-full lg:w-48">
      <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <select 
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as any)}
        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white appearance-none"
      >
        <option value="none">Orden por Defecto</option>
        <option value="price-asc">Menor a Mayor Precio</option>
        <option value="price-desc">Mayor a Menor Precio</option>
      </select>
    </div>
  </div>
);