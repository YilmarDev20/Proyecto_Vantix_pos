import { ShoppingCart, Send, Trash2, ArrowRight, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Presentacion } from '@/features/inventory/variant/types/variant.types';

interface CartItem {
  varianteId: number;
  sku: string;
  nombreVisible: string; 
  stockDisponible: number;
  cantidadTraslado: number;
  presentacionesDisponibles: Presentacion[];
}

interface Props {
  cart: CartItem[];
  updateQuantity: (id: number, qtyUnidadesFinales: number, maxStock: number) => void;
  removeFromCart: (id: number) => void;
  destinoId: number | '';
  setDestinoId: (id: number | '') => void;
  stores: any[];
  activeStoreId: number | null;
  notas: string;
  setNotas: (notas: string) => void;
  // 🚀 Recibe el submit definitivo estructurado con los datos del empaque
  onSubmitTransfer: (detallesMapeados: any[]) => void;
  isSubmitting: boolean;
}

export const TransferCart = ({
  cart, updateQuantity, removeFromCart, destinoId, setDestinoId,
  stores, activeStoreId, notas, setNotas, onSubmitTransfer, isSubmitting
}: Props) => {

  const [selectedFactors, setSelectedFactors] = useState<Record<number, number>>({});
  const [visualQuantities, setVisualQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    const newFactors = { ...selectedFactors };
    const newVisuals = { ...visualQuantities };

    cart.forEach(item => {
      if (newFactors[item.varianteId] === undefined) {
        newFactors[item.varianteId] = 1; 
      }
      const factor = newFactors[item.varianteId];
      newVisuals[item.varianteId] = Math.floor(item.cantidadTraslado / factor) || 1;
    });

    setSelectedFactors(newFactors);
    setVisualQuantities(newVisuals);
  }, [cart]);

  const handlePresentationChange = (varianteId: number, factor: number, stockMaximo: number) => {
    setSelectedFactors(prev => ({ ...prev, [varianteId]: factor }));
    const currentTotalUnidades = cart.find(i => i.varianteId === varianteId)?.cantidadTraslado || 1;
    let nuevaCantidadVisual = Math.floor(currentTotalUnidades / factor);
    
    if (nuevaCantidadVisual < 1) nuevaCantidadVisual = 1;
    
    const unidadesFinales = nuevaCantidadVisual * factor;
    setVisualQuantities(prev => ({ ...prev, [varianteId]: nuevaCantidadVisual }));
    updateQuantity(varianteId, unidadesFinales, stockMaximo);
  };

  const handleVisualQuantityChange = (varianteId: number, valorInput: string, stockMaximo: number) => {
    const cantidadDigitada = parseInt(valorInput) || 0;
    const factor = selectedFactors[varianteId] || 1;
    
    setVisualQuantities(prev => ({ ...prev, [varianteId]: cantidadDigitada }));
    if (cantidadDigitada < 1) return;

    const unidadesFinales = cantidadDigitada * factor;
    updateQuantity(varianteId, unidadesFinales, stockMaximo);
  };

  // 🚀 Recopila los factores y nombres congelados antes de abrir el modal de confirmación
  const handlePreSubmitValidation = () => {
    const detallesFinales = cart.map(item => {
      const factor = selectedFactors[item.varianteId] || 1;
      const pres = item.presentacionesDisponibles.find(p => p.factorConversion === factor);
      
      return {
        varianteId: item.varianteId,
        cantidad: item.cantidadTraslado, 
        presentacionNombre: factor > 1 ? (pres?.nombre || 'Paquete') : 'Unidades',
        factorConversion: factor
      };
    });
    
    onSubmitTransfer(detallesFinales);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-[520px] transition-colors">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
        <ShoppingCart className="w-5 h-5 mr-2 text-primary dark:text-blue-400" />
        Detalle del Traslado
      </h3>

      <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-lg transition-colors">
        <label className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase mb-2 flex items-center">
          Destino del Envío <ArrowRight className="w-3 h-3 ml-1" />
        </label>
        <select 
          value={destinoId}
          onChange={(e) => setDestinoId(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full p-2.5 border border-indigo-200 dark:border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 appearance-none cursor-pointer transition-colors"
        >
          <option value="">-- Selecciona la sucursal destino --</option>
          {stores.filter(s => s.id !== activeStoreId && s.estado).map(store => (
            <option key={store.id} value={store.id}>{store.nombre}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 border-t border-b border-slate-100 dark:border-slate-800 py-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <Package className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm font-medium">No hay productos añadidos al traslado</p>
          </div>
        ) : (
          <div className="space-y-2.5 pr-1">
            {cart.map(item => {
              const currentFactor = selectedFactors[item.varianteId] || 1;
              const currentVisualQty = visualQuantities[item.varianteId] || 1;
              const stockMaximoEnEmpaque = Math.floor(item.stockDisponible / currentFactor);

              return (
                <div key={item.varianteId} className="flex flex-col md:flex-row md:items-center justify-between bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors gap-3">
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate" title={item.nombreVisible}>
                      {item.nombreVisible}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        SKU: {item.sku}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 rounded">
                        Stock Disp: {item.stockDisponible} unds
                      </span>
                      {currentFactor > 1 && (
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          (Equivale a {item.cantidadTraslado} unidades)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <select
                      value={currentFactor}
                      onChange={(e) => handlePresentationChange(item.varianteId, Number(e.target.value), item.stockDisponible)}
                      className="text-xs p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-300 font-bold focus:ring-1 focus:ring-primary"
                    >
                      <option value={1}>Unidades (x1)</option>
                      {(item.presentacionesDisponibles || []).filter(p => p.estado !== false).map((pres, index) => (
                        <option key={pres.id || index} value={pres.factorConversion}>
                          {pres.nombre} (x{pres.factorConversion})
                        </option>
                      ))}
                    </select>

                    <input 
                      type="number" 
                      min="1" 
                      max={stockMaximoEnEmpaque > 0 ? stockMaximoEnEmpaque : 1}
                      value={currentVisualQty}
                      onChange={(e) => handleVisualQuantityChange(item.varianteId, e.target.value, item.stockDisponible)}
                      className="w-16 p-1.5 text-center border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none font-black text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors"
                    />
                    
                    <button 
                      type="button" 
                      onClick={() => removeFromCart(item.varianteId)} 
                      className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                      title="Quitar de la lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <textarea 
          placeholder="Notas u observaciones del traslado (Opcional)..."
          value={notas} 
          onChange={(e) => setNotas(e.target.value)} 
          rows={2}
          className="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none resize-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
        />
        <button 
          type="button"
          onClick={handlePreSubmitValidation} 
          disabled={isSubmitting || cart.length === 0 || !destinoId}
          className="w-full flex items-center justify-center py-3.5 bg-primary dark:bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-md shadow-blue-500/10"
        >
          <Send className="w-5 h-5 mr-2" />
          Preparar Envío
        </button>
      </div>
    </div>
  );
};