import { Edit, Power, PowerOff, Trash2, Package, Tag } from 'lucide-react';
import type { Variant } from '../types/variant.types';

interface VariantMobileCardsProps {
  variants: Variant[];
  isAdmin: boolean;
  formatAtributos: (atributos: Record<string, any> | null) => string;
  onEdit: (variant: Variant) => void;
  onToggleStatus: (variant: Variant) => void;
  onDelete: (variant: Variant) => void;
  onImageZoom: (url: string, sku: string) => void;
}

export const VariantMobileCards = ({
  variants,
  isAdmin,
  formatAtributos,
  onEdit,
  onToggleStatus,
  onDelete,
  onImageZoom
}: VariantMobileCardsProps) => {
  if (variants.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        No se encontraron variantes con estos filtros.
      </div>
    );
  }

  return (
    <div className="block md:hidden bg-slate-50/50 p-4 space-y-4">
      {variants.map((v) => (
        <div 
          key={v.id} 
          className={`bg-white p-4 rounded-xl shadow-sm border ${v.estado ? 'border-slate-200' : 'border-slate-200 opacity-80'} flex flex-col gap-3 transition-opacity`}
        >
          {/* Cabecera: SKU, Imagen y Estado */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center space-x-3">
              {v.imagenUrl ? (
                <img 
                  src={`${import.meta.env.VITE_BASE_URL}${v.imagenUrl}`} 
                  alt="Variant" 
                  onClick={() => onImageZoom(v.imagenUrl!, v.sku)}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 cursor-zoom-in hover:scale-105 transition-transform" 
                />
              ) : (
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 text-sm shrink-0">
                  📦
                </div>
              )}
              <div>
                <p className="text-sm font-bold font-mono text-slate-800 leading-tight">{v.sku}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{v.codigoBarras || 'Sin código barras'}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${v.estado ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
              {v.estado ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {/* Atributos */}
          <div>
            <span className="bg-blue-50 text-blue-700 text-[11px] px-2 py-1 rounded font-bold border border-blue-100 flex items-center w-max">
              <Tag className="w-3 h-3 mr-1.5" /> {formatAtributos(v.atributos)}
            </span>
          </div>

          {/* Cuadrícula: Stock y Precio */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Precio Unit.</p>
              <p className="text-sm font-black text-emerald-600">S/ {v.precioVenta}</p>
              {v.precioOferta && <p className="text-[10px] text-red-500 line-through">S/ {v.precioOferta}</p>}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stock Actual</p>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-black border ${v.stockActual <= v.stockMinimo ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-800 border-slate-200'}`}>
                {v.stockActual}
              </span>
            </div>
          </div>

          {/* Empaques / Presentaciones */}
          {v.presentaciones && v.presentaciones.length > 0 && (
            <div className="mt-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Presentaciones / Empaques</p>
              <div className="flex flex-wrap gap-1.5">
                {v.presentaciones.map(p => (
                  <span key={p.id} className="flex items-center text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                    <Package className="w-3 h-3 mr-1" /> {p.nombre} (x{p.factorConversion})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botones de Acción Móvil */}
          {isAdmin && (
            <div className="flex items-center justify-end space-x-2 pt-3 mt-1 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => onEdit(v)} 
                className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
              >
                <Edit className="w-4 h-4 mr-1.5" /> Editar
              </button>
              
              <div className="flex space-x-2 shrink-0">
                <button 
                  type="button" 
                  onClick={() => onToggleStatus(v)} 
                  className={`p-2 rounded-lg transition-colors border ${v.estado ? 'text-slate-500 border-slate-200 bg-slate-50 hover:text-orange-500 hover:bg-orange-50 hover:border-orange-200' : 'text-slate-500 border-slate-200 bg-slate-50 hover:text-green-500 hover:bg-green-50 hover:border-green-200'}`}
                >
                  {v.estado ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                </button>
                <button 
                  type="button" 
                  onClick={() => onDelete(v)} 
                  className="p-2 text-slate-500 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};