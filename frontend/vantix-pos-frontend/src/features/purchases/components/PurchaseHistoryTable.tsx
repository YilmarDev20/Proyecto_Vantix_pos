import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, Trash2 } from 'lucide-react';
import type { CompraResponse } from '../types/purchases.types';

interface PurchaseHistoryTableProps {
  compras: CompraResponse[];
  isLoading: boolean;
  onOpenDetails: (compra: CompraResponse) => void;
  onOpenCancel: (compra: CompraResponse) => void;
}

export const PurchaseHistoryTable = ({ compras, isLoading, onOpenDetails, onOpenCancel }: PurchaseHistoryTableProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
            <tr>
              <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Fecha</th>
              <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">N° Comprobante</th>
              <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Proveedor</th>
              <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Método Pago</th>
              <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Estado</th>
              <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Total</th>
              <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
            {isLoading ? (
              <tr><td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">Cargando historial...</td></tr>
            ) : compras.length === 0 ? (
              <tr><td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">No se encontraron compras con los filtros actuales.</td></tr>
            ) : (
              compras.map((compra) => (
                <tr key={compra.id} className={`transition-colors ${compra.estadoCompra === 'ANULADO' ? 'opacity-70 bg-slate-50/50 dark:bg-slate-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                  <td className="py-3 px-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                    {format(new Date(compra.fechaCompra), "dd MMM yyyy", { locale: es })}
                  </td>
                  <td className="py-3 px-6 text-sm font-bold text-slate-800 dark:text-slate-200">{compra.numeroComprobante}</td>
                  <td className="py-3 px-6 text-sm font-medium text-primary dark:text-blue-400">{compra.proveedorRazonSocial}</td>
                  <td className="py-3 px-6">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded uppercase border border-transparent dark:border-slate-700">
                      {compra.metodoPago}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    {compra.estadoCompra === 'PAGADO' && <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded uppercase">PAGADO</span>}
                    {compra.estadoCompra === 'POR_PAGAR' && <span className="px-2 py-1 bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 text-[10px] font-bold rounded uppercase">POR PAGAR</span>}
                    {compra.estadoCompra === 'ANULADO' && <span className="px-2 py-1 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-[10px] font-bold rounded uppercase">ANULADO</span>}
                  </td>
                  <td className="py-3 px-6 text-right font-black text-slate-800 dark:text-slate-200">
                    S/ {compra.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-6 text-center space-x-2">
                    <button 
                      type="button"
                      onClick={() => onOpenDetails(compra)}
                      className="p-2 text-primary dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors inline-flex" title="Ver Detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {compra.estadoCompra !== 'ANULADO' && (
                      <button 
                        type="button"
                        onClick={() => onOpenCancel(compra)}
                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors inline-flex" title="Anular Compra"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};