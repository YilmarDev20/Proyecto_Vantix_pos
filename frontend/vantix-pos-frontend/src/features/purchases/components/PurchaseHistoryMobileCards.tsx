import { Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CompraResponse } from '../types/purchases.types';

interface PurchaseHistoryMobileCardsProps {
  compras: CompraResponse[];
  isLoading: boolean;
  onOpenDetails: (compra: CompraResponse) => void;
  onOpenCancel: (compra: CompraResponse) => void;
}

export const PurchaseHistoryMobileCards = ({ compras, isLoading, onOpenDetails, onOpenCancel }: PurchaseHistoryMobileCardsProps) => {
  if (isLoading) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        Cargando historial...
      </div>
    );
  }

  if (compras.length === 0) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        No se encontraron compras con los filtros actuales.
      </div>
    );
  }

  return (
    <div className="block md:hidden space-y-3 p-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl transition-colors">
      {compras.map((compra) => (
        <div 
          key={compra.id} 
          className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3 transition-colors ${
            compra.estadoCompra === 'ANULADO' ? 'opacity-60 bg-slate-50/50 dark:bg-slate-950/10' : ''
          }`}
        >
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="text-xs font-bold text-slate-400 block uppercase">N° Comprobante</p>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">{compra.numeroComprobante}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400">
                {format(new Date(compra.fechaCompra), "dd MMM yyyy", { locale: es })}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 flex items-center justify-between transition-colors">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Proveedor</span>
              <span className="text-xs font-bold text-primary dark:text-blue-400 truncate block">{compra.proveedorRazonSocial}</span>
            </div>
            <div className="flex flex-col gap-1 items-end shrink-0">
              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-black rounded uppercase border border-transparent dark:border-slate-700">
                {compra.metodoPago}
              </span>
              <span className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase ${
                compra.estadoCompra === 'PAGADO' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                compra.estadoCompra === 'POR_PAGAR' ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400' :
                'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
              }`}>
                {compra.estadoCompra}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Monto Total</span>
              <span className="font-black text-slate-800 dark:text-slate-200 text-base">S/ {compra.total.toFixed(2)}</span>
            </div>
            <div className="flex space-x-2">
              <button 
                type="button" 
                onClick={() => onOpenDetails(compra)} 
                className="p-2 text-primary dark:text-blue-400 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 hover:bg-blue-100 rounded-lg transition-colors"
                title="Ver Detalles"
              >
                <Eye className="w-4 h-4" />
              </button>
              {compra.estadoCompra !== 'ANULADO' && (
                <button 
                  type="button" 
                  onClick={() => onOpenCancel(compra)} 
                  className="p-2 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 hover:bg-red-100 rounded-lg transition-colors"
                  title="Anular Factura"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      ))}
    </div>
  );
};