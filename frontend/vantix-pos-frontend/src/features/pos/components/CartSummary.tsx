import { ShoppingCart, Tag, CreditCard, Save, X, AlertTriangle } from 'lucide-react';

interface CartSummaryProps {
  subtotal: number;
  descuentoGlobal: number;
  totalFinal: number;
  itemsCount: number;
  cotizacionActiva?: number | null;
  hasStockErrors: boolean;
  onOpenCheckout: () => void;
  onRequestExitEditMode?: () => void;
  onUpdateQuote?: () => void;
  isCompactMode?: boolean; 
}

export const CartSummary = ({ 
  subtotal, descuentoGlobal, totalFinal, itemsCount, 
  cotizacionActiva, hasStockErrors, onOpenCheckout, onRequestExitEditMode, onUpdateQuote,
  isCompactMode = false
}: CartSummaryProps) => {

  return (
    <div className={`flex flex-col justify-between bg-slate-900 text-white relative overflow-y-auto custom-scrollbar ${isCompactMode ? 'p-3 sm:p-4' : 'flex-1 p-5 lg:p-6'}`}>
      
      {/* Fondo de Carrito solo en Modo Escáner */}
      {!isCompactMode && (
        <ShoppingCart className="absolute -right-16 -top-16 w-80 h-80 text-slate-800/60 opacity-40 pointer-events-none rotate-12" />
      )}

      <div className="relative z-10">

        {/* BANNER DE MODO EDICIÓN */}
        {cotizacionActiva && (
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-2.5 mb-2 flex justify-between items-center backdrop-blur-sm">
            <div>
              <p className="text-amber-400 font-bold text-[10px] uppercase flex items-center mb-0.5"><Save className="w-3 h-3 mr-1.5"/> Modo Edición</p>
              <p className="text-white text-sm font-black">Cotización #{cotizacionActiva}</p>
            </div>
            <button onClick={onRequestExitEditMode} className="p-1.5 bg-slate-800/80 hover:bg-red-500 text-white rounded-xl transition-all shadow-lg" title="Cancelar edición">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* DISEÑO ULTRA-COMPACTO (MODO CATÁLOGO: 2 Columnas)            */}
        {/* ============================================================ */}
        {isCompactMode ? (
          <div className="flex justify-between items-end mb-2 pb-2">
            
            {/* Columna Izquierda: Subtotal y Descuento */}
            <div className="space-y-1.5 pr-2">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Subtotal ({itemsCount})</span>
                <span className="text-sm font-bold text-slate-200">S/ {subtotal.toFixed(2)}</span>
              </div>
              {descuentoGlobal > 0 && (
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-red-400/80 tracking-wider flex items-center">
                    <Tag className="w-2.5 h-2.5 mr-1" /> Descto.
                  </span>
                  <span className="text-sm font-bold text-red-400">- S/ {descuentoGlobal.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Columna Derecha: Total Gigante */}
            <div className="text-right pl-3 border-l border-slate-700/50">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total a cobrar</p>
              <div className="text-3xl lg:text-4xl font-black text-emerald-400 tracking-tighter leading-none">
                <span className="text-lg mr-1 font-bold">S/</span>{totalFinal.toFixed(2)}
              </div>
            </div>

          </div>
        ) : (
          
        /* ============================================================ */
        /* DISEÑO AMPLIO (MODO ESCÁNER: Filas apiladas)                 */
        /* ============================================================ */
          <>
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs lg:text-sm font-medium uppercase tracking-wider">Subtotal ({itemsCount} prod.)</span>
                <span className="text-base lg:text-lg font-bold text-white">S/ {subtotal.toFixed(2)}</span>
              </div>
              
              {descuentoGlobal > 0 && (
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center text-xs lg:text-sm font-medium uppercase tracking-wider"><Tag className="w-3 h-3 mr-1.5 text-red-400" /> Descuento Total</span>
                  <span className="text-base lg:text-lg font-bold text-red-400">- S/ {descuentoGlobal.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="pt-4 mt-3 border-t border-slate-700/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total a cobrar en caja</p>
              <div className="text-5xl lg:text-6xl font-black text-emerald-400 tracking-tighter leading-none">
                <span className="text-2xl mr-1 font-bold">S/</span>{totalFinal.toFixed(2)}
              </div>
            </div>
          </>
        )}

      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className={`relative z-10 w-full mt-auto ${isCompactMode ? 'space-y-1.5' : 'space-y-2 pt-6'}`}>
        
        {hasStockErrors && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-100 text-[9px] font-bold p-2 rounded-lg flex items-center animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1.5 flex-shrink-0 text-red-400" />
            Corrige los productos en rojo.
          </div>
        )}

        {cotizacionActiva && (
          <button 
            type="button"
            onClick={onUpdateQuote}
            disabled={itemsCount === 0 || hasStockErrors}
            className="w-full py-2.5 text-xs bg-amber-500 text-slate-900 font-black rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-all flex items-center justify-center shadow-xl transform active:scale-[0.98]"
          >
            <Save className="w-4 h-4 mr-2" />
            ACTUALIZAR PROFORMA
          </button>
        )}

        <button 
          type="button"
          onClick={onOpenCheckout}
          disabled={itemsCount === 0 || hasStockErrors}
          className={`w-full ${isCompactMode ? 'py-3 text-sm' : 'py-4 text-lg lg:text-xl'} text-white font-black rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center justify-center group transform active:scale-[0.97] ${cotizacionActiva ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-600 hover:bg-blue-500'}`}
        >
          <CreditCard className={`w-4 h-4 mr-2 group-hover:rotate-12 transition-transform ${isCompactMode ? '' : 'lg:w-7 lg:h-7 lg:mr-3'}`} />
          {cotizacionActiva ? 'PAGAR PROFORMA' : 'COBRAR AHORA'}
        </button>
      </div>

    </div>
  );
};