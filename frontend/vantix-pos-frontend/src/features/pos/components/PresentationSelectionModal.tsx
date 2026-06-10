import { X, Package, Tag } from 'lucide-react';
import type { Variant, Presentacion } from '@/features/inventory/variant/types/variant.types';
import type { Product } from '@/features/inventory/product/types/product.types';

interface PresentationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  variante: Variant | null;
  producto: Product | null;
  onSelect: (variante: Variant, presentacion?: Presentacion) => void;
}

export const PresentationSelectionModal = ({ isOpen, onClose, variante, producto, onSelect }: PresentationSelectionModalProps) => {
  if (!isOpen || !variante || !producto) return null;

  const baseName = producto.marca ? `${producto.nombre} (${producto.marca})` : producto.nombre;
  
  const attrString = variante.atributos 
    ? Object.entries(variante.atributos).map(([k, v]) => `${k}: ${v}`).join(' | ') 
    : '';

  const urlImagenFinal = variante.imagenUrl || producto.imagenUrl || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* ✅ ADAPTACIÓN: Marco del modal con borde oscuro integrado */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-transparent dark:border-slate-800">
        
        <div className="bg-purple-900 p-5 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-purple-300 hover:text-white hover:bg-purple-800 rounded-full transition-colors border border-purple-500">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-black text-white">{baseName}</h2>
          <p className="text-purple-200 text-sm mt-1">Selecciona una presentación para cobrar</p>
        </div>

        {/* ✅ ADAPTACIÓN: El fondo del cuerpo interno muta a slate-950 de noche */}
        <div className="p-5 space-y-3 bg-slate-50 dark:bg-slate-950 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* OPCIÓN 1: UNIDAD SUELTA */}
          <div 
            onClick={() => onSelect(variante)}
            className="group bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between shadow-sm hover:shadow-md"
          >
            <div className="flex items-center space-x-4">
              {/* MINIATURA DE UNIDAD SUELTA */}
              {urlImagenFinal ? (
                <img 
                  src={`${import.meta.env.VITE_BASE_URL}${urlImagenFinal}`} 
                  alt="Unidad Suelta" 
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-purple-50 dark:group-hover:bg-purple-950/30 transition-colors shrink-0">
                  <Tag className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-purple-500" />
                </div>
              )}
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">Unidad Suelta</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">SKU: {variante.sku}</span>
                  {attrString && <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded font-bold">{attrString}</span>}
                </div>
                <div className="mt-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    variante.stockActual > 0 
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                  }`}>
                    {variante.stockActual} disponibles físicamente
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Precio Unitario</p>
              <p className="text-2xl font-black text-purple-700 dark:text-purple-400">S/ {variante.precioVenta.toFixed(2)}</p>
            </div>
          </div>

          {/* LISTADO DE PRESENTACIONES / EMPAQUES */}
          {variante.presentaciones?.map(pres => {
            const stockVirtual = Math.floor(variante.stockActual / pres.factorConversion);
            const isOutOfStock = stockVirtual <= 0;

            return (
              <div 
                key={pres.id}
                onClick={() => !isOutOfStock && onSelect(variante, pres)}
                className={`group border-2 rounded-2xl p-4 transition-all flex items-center justify-between shadow-sm ${
                  isOutOfStock 
                    ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed' 
                    : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* MINIATURA DEL PACK */}
                  {urlImagenFinal ? (
                    <img 
                      src={`${import.meta.env.VITE_BASE_URL}${urlImagenFinal}`} 
                      alt={pres.nombre} 
                      className={`w-12 h-12 rounded-xl object-cover border shrink-0 transition-transform ${
                        isOutOfStock 
                          ? 'border-slate-200 dark:border-slate-800 opacity-40 grayscale' 
                          : 'border-amber-200 dark:border-amber-900/50 group-hover:scale-105'
                      }`}
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                      isOutOfStock 
                        ? 'bg-slate-200 dark:bg-slate-800' 
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/60'
                    }`}>
                      <Package className={`w-6 h-6 ${isOutOfStock ? 'text-slate-400 dark:text-slate-600' : 'text-amber-600 dark:text-amber-400'}`} />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center">
                      {pres.nombre}
                      <span className="ml-2 text-[10px] font-black bg-slate-800 dark:bg-slate-700 text-white px-1.5 py-0.5 rounded">x{pres.factorConversion}</span>
                    </p>
                    {pres.codigoBarras && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">Barras: {pres.codigoBarras}</p>}
                    
                    <div className="mt-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        isOutOfStock 
                          ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400' 
                          : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {isOutOfStock ? 'Agotado para armar pack' : `${stockVirtual} packs disponibles`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Precio Pack</p>
                  <p className={`text-2xl font-black ${isOutOfStock ? 'text-slate-500 dark:text-slate-600' : 'text-amber-600 dark:text-amber-400'}`}>S/ {pres.precioVenta.toFixed(2)}</p>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};