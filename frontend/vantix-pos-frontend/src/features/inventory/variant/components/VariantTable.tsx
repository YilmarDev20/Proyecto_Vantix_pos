import { Edit, Power, PowerOff, Trash2, Package, Tag } from 'lucide-react';
import type { Variant } from '../types/variant.types';

interface VariantTableProps {
  variants: Variant[];
  isAdmin: boolean;
  formatAtributos: (atributos: Record<string, any> | null) => string;
  onEdit: (variant: Variant) => void;
  onToggleStatus: (variant: Variant) => void;
  onDelete: (variant: Variant) => void;
  onImageZoom: (url: string, sku: string) => void;
}

export const VariantTable = ({
  variants,
  isAdmin,
  formatAtributos,
  onEdit,
  onToggleStatus,
  onDelete,
  onImageZoom
}: VariantTableProps) => {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase">SKU / Barras</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase">Atributos</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase">Empaque</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase">Precio (Venta)</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase text-center">Stock</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase text-center">Estado</th>
            {isAdmin && <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase text-center">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {variants.map((v) => (
            <tr key={v.id} className={`transition-colors ${v.estado ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-75'}`}>
              
              {/* Celda SKU con imagen interactiva */}
              <td className="py-3 px-6">
                <div className="flex items-center space-x-3">
                  {v.imagenUrl ? (
                    <img 
                      src={`${import.meta.env.VITE_BASE_URL}${v.imagenUrl}`} 
                      alt="Variante" 
                      onClick={() => onImageZoom(v.imagenUrl!, v.sku)}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 cursor-zoom-in hover:scale-110 transition-transform shadow-sm" 
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 text-xs font-bold shrink-0">
                      📦
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold font-mono text-slate-800">{v.sku}</p>
                    <p className="text-xs text-slate-500">{v.codigoBarras || 'Sin código barras'}</p>
                  </div>
                </div>
              </td>

              {/* Atributos */}
              <td className="py-3 px-6">
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium border border-blue-100 flex items-center w-max">
                  <Tag className="w-3 h-3 mr-1" /> {formatAtributos(v.atributos)}
                </span>
              </td>
              
              {/* Presentaciones (Empaques) */}
              <td className="py-3 px-6 text-sm text-slate-600">
                {v.presentaciones && v.presentaciones.length > 0 ? (
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-bold text-slate-500">Unidad Suelta</span>
                    {v.presentaciones.map(p => (
                      <span key={p.id} className="flex items-center text-[11px] text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded w-max border border-purple-100">
                        <Package className="w-3 h-3 mr-1" /> {p.nombre} (x{p.factorConversion})
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs font-medium text-slate-500">Solo Unidad Suelta</span>
                )}
              </td>

              {/* Precios */}
              <td className="py-3 px-6 text-sm font-medium text-slate-800">
                S/ {v.precioVenta}
                {v.precioOferta && <span className="ml-2 text-xs text-red-500 line-through">S/ {v.precioOferta}</span>}
              </td>

              {/* Stock */}
              <td className="py-3 px-6 text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${v.stockActual <= v.stockMinimo ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {v.stockActual}
                </span>
              </td>

              {/* Estado */}
              <td className="py-3 px-6 text-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${v.estado ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                  {v.estado ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              
              {/* Acciones de Administrador */}
              {isAdmin && (
                <td className="py-3 px-6 flex items-center justify-center space-x-2">
                  <button type="button" onClick={() => onEdit(v)} className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => onToggleStatus(v)} className={`p-2 rounded-lg transition-colors ${v.estado ? 'text-slate-400 hover:text-orange-500 hover:bg-orange-50' : 'text-slate-400 hover:text-green-500 hover:bg-green-50'}`}>
                    {v.estado ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button type="button" onClick={() => onDelete(v)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};