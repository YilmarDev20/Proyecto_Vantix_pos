import { Edit, Power, PowerOff, Trash2, Layers, FolderTree, PackagePlus } from 'lucide-react';
import type { Product } from '../types/product.types';

interface ProductMobileCardsProps {
  products: Product[];
  isAdmin: boolean;
  getCategoryName: (categoryId: number | null) => string;
  onNavigateVariants: (id: number) => void;
  onEdit: (id: number) => void;
  onToggleStatus: (product: Product) => void;
  onDelete: (product: Product) => void;
  onImageZoom: (url: string, name: string) => void;
}

export const ProductMobileCards = ({
  products,
  isAdmin,
  getCategoryName,
  onNavigateVariants,
  onEdit,
  onToggleStatus,
  onDelete,
  onImageZoom
}: ProductMobileCardsProps) => {
  return (
    <div className="block md:hidden bg-slate-50/50 dark:bg-slate-950/20 p-4 space-y-4 transition-colors">
      {products.map((prod) => {
        const tienePacks = prod.packsSurtidos && prod.packsSurtidos.length > 0;

        return (
          <div key={prod.id} className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border transition-all ${prod.estado ? 'border-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800 opacity-80'}`}>
            
            {/* Cabecera: Miniatura, Nombre y Estado */}
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center space-x-3">
                {prod.imagenUrl ? (
                  <img 
                    src={`${import.meta.env.VITE_BASE_URL}${prod.imagenUrl}`} 
                    alt={prod.nombre} 
                    onClick={() => onImageZoom(prod.imagenUrl!, prod.nombre)}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0 cursor-zoom-in hover:scale-105 transition-transform" 
                  />
                ) : (
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-950 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 text-sm shrink-0">
                    📦
                  </div>
                )}
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{prod.nombre}</h4>
                  {tienePacks && (
                    <span className="mt-2 w-max flex items-center px-2 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-black uppercase tracking-wider border border-indigo-100 dark:border-indigo-900/50">
                      <PackagePlus className="w-3.5 h-3.5 mr-1.5" /> Mix & Match Activo
                    </span>
                  )}
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${prod.estado ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {prod.estado ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {/* Cuadrícula de Información (Categoría y Marca) */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 mt-1 transition-colors">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Categoría</p>
                <span className="flex items-center text-xs font-bold text-indigo-700 dark:text-indigo-400">
                  <FolderTree className="w-3 h-3 mr-1.5" /> {getCategoryName(prod.categoriaId)}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Marca / UoM</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">{prod.marca || 'Sin marca'} <span className="text-slate-400 dark:text-slate-500 font-medium">({prod.unidadMedida})</span></p>
              </div>
            </div>

            {/* Etiquetas */}
            {prod.etiquetas && prod.etiquetas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {prod.etiquetas.map((tag, idx) => (
                  <span key={idx} className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-1 rounded border border-blue-100 dark:border-blue-900/50 uppercase font-medium">{tag}</span>
                ))}
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex items-center justify-end space-x-2 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => onNavigateVariants(prod.id)} className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-900/50">
                <Layers className="w-4 h-4 mr-1.5" /> Ver Variantes
              </button>
              
              {isAdmin && (
                <div className="flex space-x-2 shrink-0">
                  <button type="button" onClick={() => onEdit(prod.id)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => onToggleStatus(prod)} className={`p-2 rounded-lg transition-colors border ${prod.estado ? 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:border-orange-200 dark:hover:border-orange-900/50' : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-200 dark:hover:border-green-900/50'}`}>
                    {prod.estado ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button type="button" onClick={() => onDelete(prod)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};