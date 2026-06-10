import { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import type { CartItem } from '../hooks/useCart';
import type { Product } from '@/features/inventory/product/types/product.types';

interface CartItemListProps {
  items: CartItem[];
  productos: Product[];
  onUpdateQuantity: (varianteId: number, presentacionId: number | undefined, cantidad: number) => void;
  onRemoveItem: (varianteId: number, presentacionId?: number) => void;
  onClearCart: () => void;
}

export const CartItemList = ({ items, productos, onUpdateQuantity, onRemoveItem, onClearCart }: CartItemListProps) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const getAtributosString = (atributos: Record<string, any> | null) => {
    if (!atributos || Object.keys(atributos).length === 0) return '';
    return Object.values(atributos).join(' | ');
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 transition-colors">
        <ShoppingCart className="w-20 h-20 mb-4 text-slate-200 dark:text-slate-800" />
        <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400 mb-1">La canasta está vacía</h3>
        <p className="text-sm">Escanea un producto para comenzar la venta.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 relative transition-colors">
      
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm flex justify-between items-center px-4 py-2 transition-colors">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{items.length} Productos</p>
        <button onClick={() => setShowConfirmClear(true)} className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 rounded-lg flex items-center transition-colors">
          <Trash2 className="w-3 h-3 mr-1" /> VACIAR
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 transition-colors">
            <tr>
              <th className="py-2 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Producto</th>
              <th className="py-2 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-28">Precio</th>
              <th className="py-2 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-32">Cant.</th>
              <th className="py-2 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right w-24">Subtotal</th>
              <th className="py-2 px-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900 transition-colors">
            {items.map((item, index) => {
              const prod = productos.find(p => p.id === item.variante.productoId);
              
              let baseName = 'Desconocido';
              if (prod) {
                baseName = prod.marca ? `${prod.nombre} (${prod.marca})` : prod.nombre;
              }

              const attrName = getAtributosString(item.variante.atributos);
              const nombreCompleto = attrName ? `${baseName} - ${attrName}` : baseName;

              const factor = item.presentacion ? item.presentacion.factorConversion : 1;
              const hasError = (item.cantidad * factor) > item.variante.stockActual;
              const maxLlevables = Math.floor(item.variante.stockActual / factor);

              const rowKey = `${item.variante.id}-${item.presentacion?.id || 'base'}-${index}`;

              let upsellHint = null;
              if (prod && prod.packsSurtidos && prod.packsSurtidos.length > 0 && !item.presentacion) {
                const totalEnCanasta = items
                  .filter(i => !i.presentacion && i.variante.productoId === prod.id)
                  .reduce((sum, i) => sum + i.cantidad, 0);

                const nextPack = [...prod.packsSurtidos]
                  .sort((a,b) => a.cantidadRequerida - b.cantidadRequerida)
                  .find(p => p.cantidadRequerida > totalEnCanasta);

                if (nextPack) {
                  const faltan = nextPack.cantidadRequerida - totalEnCanasta;
                  upsellHint = `Faltan ${faltan} p/ ${nextPack.nombre}`;
                }
              }

              const getBadgeColor = (baseName?: string) => {
                if (!baseName || !prod || !prod.packsSurtidos) return 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50';
                
                const packConfig = prod.packsSurtidos.find(p => p.nombre === baseName);
                if (!packConfig) return 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50';
                
                if (packConfig.cantidadRequerida >= 24) return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'; 
                if (packConfig.cantidadRequerida >= 12) return 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50';
                
                return 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50'; 
              };

              return (
                <tr key={rowKey} className={`group transition-colors ${hasError ? 'bg-red-50 dark:bg-red-950/20 border-l-4 border-l-red-500' : 'hover:bg-blue-50/30 dark:hover:bg-blue-950/10'}`}>
                  <td className="py-2 px-3">
                    <p className={`font-bold text-sm leading-tight ${hasError ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {nombreCompleto}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {item.presentacion ? (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center whitespace-nowrap">
                          <Package className="w-3 h-3 mr-1 shrink-0" /> {item.presentacion.nombre} (x{item.presentacion.factorConversion})
                        </span>
                      ) : (
                        <span className={`text-[10px] font-medium whitespace-nowrap ${hasError ? 'text-red-400 dark:text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                          SKU: {item.variante.sku}
                        </span>
                      )}

                      {upsellHint && (
                        <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 flex items-center bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/50 whitespace-nowrap">
                          <TrendingUp className="w-3 h-3 mr-1 shrink-0" /> {upsellHint}
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="py-2 px-3 text-center">
                    {item.packAplicado ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through font-medium">S/ {item.precioOriginal?.toFixed(2)}</span>
                          <span className="text-primary dark:text-blue-400 font-black text-sm">S/ {(item.precioUnitario - item.descuentoUnitario).toFixed(2)}</span>
                        </div>
                        <span 
                          className={`text-[8.5px] border px-1.5 py-0.5 rounded font-black uppercase mt-0.5 max-w-[120px] truncate leading-tight ${getBadgeColor(item.packBaseName)}`}
                          title={item.packAplicado}
                        >
                          {item.packAplicado}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-slate-600 dark:text-slate-300 text-sm">S/ {item.precioUnitario.toFixed(2)}</span>
                    )}
                  </td>

                  <td className="py-2 px-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center rounded-lg p-0.5 border ${hasError ? 'bg-white dark:bg-slate-900 border-red-300 dark:border-red-900/50' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                        <button onClick={() => onUpdateQuantity(item.variante.id, item.presentacion?.id, item.cantidad - 1)} className="p-1 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all"><Minus className="w-3 h-3" /></button>
                        <input 
                          type="number" min="1" max={maxLlevables}
                          value={item.cantidad}
                          onChange={(e) => onUpdateQuantity(item.variante.id, item.presentacion?.id, parseInt(e.target.value) || 1)}
                          className={`w-8 text-center bg-transparent font-black text-sm outline-none ${hasError ? 'text-red-600' : 'text-slate-800 dark:text-slate-200'}`}
                        />
                        <button onClick={() => onUpdateQuantity(item.variante.id, item.presentacion?.id, item.cantidad + 1)} className="p-1 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all"><Plus className="w-3 h-3" /></button>
                      </div>
                      <span className={`text-[9px] font-medium mt-0.5 whitespace-nowrap ${hasError ? 'text-red-600 dark:text-red-400 font-bold' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        Max: {maxLlevables} {item.presentacion ? 'pcks' : 'u'}
                      </span>
                    </div>
                  </td>

                  <td className={`py-2 px-3 text-right font-black text-sm ${hasError ? 'text-red-600 dark:text-red-400' : 'text-primary dark:text-blue-400'}`}>
                    S/ {item.subtotal.toFixed(2)}
                  </td>
                  
                  <td className="py-2 px-2 text-center">
                    <button onClick={() => onRemoveItem(item.variante.id, item.presentacion?.id)} className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ SOLUCIÓN AL RECORTE: Modificado de 'absolute' a 'fixed' e incrementado el z-index a 50 con telón oscuro global */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in transition-colors duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6 text-center max-w-sm transition-colors">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">¿Vaciar toda la canasta?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Esta acción eliminará todos los productos y el cliente seleccionado de la venta actual.</p>
            <div className="flex space-x-3">
              <button onClick={() => setShowConfirmClear(false)} className="flex-1 py-2.5 font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
              <button onClick={() => { onClearCart(); setShowConfirmClear(false); }} className="flex-1 py-2.5 font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Sí, Vaciar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};