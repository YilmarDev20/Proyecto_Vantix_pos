import { Edit, Power, PowerOff, Trash2, Layers, FolderTree, PackagePlus } from 'lucide-react';
import type { Product } from '../types/product.types';

interface ProductTableProps {
  products: Product[];
  isAdmin: boolean;
  getCategoryName: (categoryId: number | null) => string;
  onNavigateVariants: (id: number) => void;
  onEdit: (id: number) => void;
  onToggleStatus: (product: Product) => void;
  onDelete: (product: Product) => void;
  onImageZoom: (url: string, name: string) => void;
}

export const ProductTable = ({
  products,
  isAdmin,
  getCategoryName,
  onNavigateVariants,
  onEdit,
  onToggleStatus,
  onDelete,
  onImageZoom
}: ProductTableProps) => {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <tr>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Producto</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Categoría</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Marca / Unidad</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Estado</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
          {products.map((prod) => {
            const tienePacks = prod.packsSurtidos && prod.packsSurtidos.length > 0;

            return (
              <tr key={prod.id} className={`transition-colors ${prod.estado ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-slate-50 dark:bg-slate-950/40 opacity-75'}`}>
                
                {/* Nombre de producto con miniatura interactiva */}
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    {prod.imagenUrl ? (
                      <img 
                        src={`${import.meta.env.VITE_BASE_URL}${prod.imagenUrl}`} 
                        alt={prod.nombre} 
                        onClick={() => onImageZoom(prod.imagenUrl!, prod.nombre)}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0 cursor-zoom-in hover:scale-110 transition-transform shadow-sm" 
                      />
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-950 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 text-xs font-bold shrink-0">
                        📦
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{prod.nombre}</span>
                      {tienePacks && (
                        <span 
                          className="mt-1 flex items-center px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-black uppercase tracking-wider border border-indigo-100 dark:border-indigo-900/50"
                          title={`${prod.packsSurtidos?.length} Pack(s) configurado(s)`}
                        >
                          <PackagePlus className="w-3 h-3 mr-1" />
                          Mix & Match Activo
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Categoría */}
                <td className="py-4 px-6">
                  <span className="flex items-center text-sm font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-md w-max border border-transparent dark:border-indigo-900/30">
                    <FolderTree className="w-3 h-3 mr-1" /> {getCategoryName(prod.categoriaId)}
                  </span>
                </td>

                {/* Marca / UoM */}
                <td className="py-4 px-6">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{prod.marca || 'Sin marca'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">UoM: {prod.unidadMedida}</p>
                </td>

                {/* Estado */}
                <td className="py-4 px-6 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${prod.estado ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {prod.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                {/* Acciones */}
                <td className="py-4 px-6 text-sm flex items-center justify-center space-x-2">
                  <button type="button" onClick={() => onNavigateVariants(prod.id)} className="p-2 text-indigo-400 hover:text-indigo-600 dark:hover:text-blue-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Ver Variantes e Inventario">
                    <Layers className="w-4 h-4" />
                  </button>
                  
                  {isAdmin && (
                    <>
                      <button type="button" onClick={() => onEdit(prod.id)} className="p-2 text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Editar Producto Padre">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => onToggleStatus(prod)} className={`p-2 rounded-lg transition-colors ${prod.estado ? 'text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-800' : 'text-slate-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-slate-800'}`}>
                        {prod.estado ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <button type="button" onClick={() => onDelete(prod)} className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};