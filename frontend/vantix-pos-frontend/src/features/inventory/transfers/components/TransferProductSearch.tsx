import { Search } from 'lucide-react';
import type { Variant } from '@/features/inventory/variant/types/variant.types';

interface Props {
  activeStoreName: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoadingCatalog: boolean;
  filteredCatalog: Variant[];
  addToCart: (variante: Variant) => void;
  formatearNombreVariante: (variante: Variant) => string;
}

export const TransferProductSearch = ({ 
  activeStoreName, searchTerm, setSearchTerm, isLoadingCatalog, 
  filteredCatalog, addToCart, formatearNombreVariante 
}: Props) => {
  
  return (
    <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-[500px] transition-colors">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
        <Search className="w-5 h-5 mr-2 text-primary dark:text-blue-400" />
        Buscar Mercadería (Origen: {activeStoreName})
      </h3>

      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="Buscar por SKU o Nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-100 transition-colors"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {isLoadingCatalog ? (
           <div className="text-center text-slate-500 dark:text-slate-400 py-4">Cargando inventario...</div>
        ) : filteredCatalog.length === 0 ? (
           <div className="text-center text-slate-500 dark:text-slate-400 py-4">No se encontraron productos.</div>
        ) : (
          filteredCatalog.map(variante => (
            <div key={variante.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all">
              <div className="flex-1 pr-4">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{formatearNombreVariante(variante)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 font-mono mt-0.5">SKU: {variante.sku} {variante.codigoBarras ? `| EAN: ${variante.codigoBarras}` : ''}</p>
              </div>
              <div className="flex items-center space-x-3 whitespace-nowrap">
                <span className={`text-xs font-bold px-2 py-1 rounded transition-colors ${variante.stockActual > 0 ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'}`}>
                  Stock: {variante.stockActual}
                </span>
                <button 
                  type="button"
                  onClick={() => addToCart(variante)}
                  disabled={variante.stockActual <= 0}
                  className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors shadow-sm"
                >
                  + Agregar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};