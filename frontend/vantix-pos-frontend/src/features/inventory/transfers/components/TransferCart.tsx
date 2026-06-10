import { ShoppingCart, Send, Trash2, ArrowRight, Package } from 'lucide-react';

interface CartItem {
  varianteId: number;
  sku: string;
  nombreVisible: string; 
  stockDisponible: number;
  cantidadTraslado: number;
}

interface Props {
  cart: CartItem[];
  updateQuantity: (id: number, qty: number, max: number) => void;
  removeFromCart: (id: number) => void;
  destinoId: number | '';
  setDestinoId: (id: number | '') => void;
  stores: any[];
  activeStoreId: number | null;
  notas: string;
  setNotas: (notas: string) => void;
  handlePreSubmit: () => void;
  isSubmitting: boolean;
}

export const TransferCart = ({
  cart, updateQuantity, removeFromCart, destinoId, setDestinoId,
  stores, activeStoreId, notas, setNotas, handlePreSubmit, isSubmitting
}: Props) => {

  return (
    <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-[500px] transition-colors">
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
          className="w-full p-2 border border-indigo-200 dark:border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 appearance-none transition-colors"
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
            <p className="text-sm">No hay productos en el traslado</p>
          </div>
        ) : (
          <div className="space-y-3 pr-1">
            {cart.map(item => (
              <div key={item.varianteId} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
                <div className="flex-1 truncate pr-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate" title={item.nombreVisible}>{item.nombreVisible}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 font-mono">SKU: {item.sku}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" min="1" max={item.stockDisponible} value={item.cantidadTraslado}
                    onChange={(e) => updateQuantity(item.varianteId, parseInt(e.target.value) || 1, item.stockDisponible)}
                    className="w-16 p-1 text-center border border-slate-300 dark:border-slate-700 rounded focus:ring-1 focus:ring-primary dark:focus:ring-blue-500 outline-none font-bold text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors"
                  />
                  <button type="button" onClick={() => removeFromCart(item.varianteId)} className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <textarea 
          placeholder="Notas u observaciones del traslado (Opcional)..."
          value={notas} onChange={(e) => setNotas(e.target.value)} rows={2}
          className="w-full p-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary dark:focus:ring-blue-500 outline-none resize-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
        />
        <button 
          type="button"
          onClick={handlePreSubmit} disabled={isSubmitting || cart.length === 0 || !destinoId}
          className="w-full flex items-center justify-center py-3 bg-primary dark:bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Send className="w-5 h-5 mr-2" />
          Preparar Envío
        </button>
      </div>
    </div>
  );
};