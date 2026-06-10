import { Modal } from '@/components/ui/Modal';
import { AlertTriangle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import type { ValidacionCotizacion } from '../services/quotes.api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  validacion: ValidacionCotizacion | null;
  onConfirm: () => void;
}

export const StockValidationModal = ({ isOpen, onClose, validacion, onConfirm }: Props) => {
  if (!validacion) return null;

  const getAtributosString = (atributos: Record<string, any> | null | undefined) => {
    if (!atributos || Object.keys(atributos).length === 0) return '';
    return Object.values(atributos).join(' | ');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Validación de Stock Actual" maxWidth="lg">
      <div className="space-y-4">
        
        <div className={`p-4 rounded-xl flex items-start space-x-3 transition-colors ${validacion.todoDisponible ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30' : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30'}`}>
          {validacion.todoDisponible ? <CheckCircle2 className="text-emerald-500 dark:text-emerald-400 w-6 h-6 shrink-0" /> : <AlertTriangle className="text-amber-500 dark:text-amber-400 w-6 h-6 shrink-0" />}
          <div>
            <p className={`font-bold ${validacion.todoDisponible ? 'text-emerald-800 dark:text-emerald-200' : 'text-amber-800 dark:text-amber-200'}`}>
              {validacion.todoDisponible ? '¡Todo listo para cobrar!' : 'Atención: Stock insuficiente'}
            </p>
            <p className="text-sm opacity-80 text-slate-700 dark:text-slate-300">
              Se ha verificado la disponibilidad de los productos en esta tienda.
            </p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-sm shadow-sm transition-colors">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase transition-colors">
              <tr>
                <th className="p-3 text-left">Producto</th>
                <th className="p-3 text-center">Pedido</th>
                <th className="p-3 text-center">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
              {validacion.items.map((item) => {
                const cleanName = item.nombreProducto.replace(/\s*\(.*?\)\s*$/, '');
                const attrName = getAtributosString(item.atributos);
                const nombreCompleto = attrName ? `${cleanName} - ${attrName}` : cleanName;

                return (
                  <tr key={item.varianteId} className={`transition-colors ${!item.hayStockSuficiente ? 'bg-red-50 dark:bg-red-950/10' : 'bg-white dark:bg-slate-900'}`}>
                    
                    <td className="p-3">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight">{nombreCompleto}</p>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">SKU: {item.sku}</p>
                    </td>
                    
                    <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                      {item.cantidadSolicitada}
                    </td>
                    
                    <td className={`p-3 text-center font-bold ${item.hayStockSuficiente ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {item.stockActual} {!item.hayStockSuficiente && <XCircle className="inline w-4 h-4 ml-1" />}
                    </td>
                    
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex space-x-3 pt-2">
          <button 
            type="button"
            onClick={onClose} 
            className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={onConfirm} 
            className="flex-1 px-4 py-2 bg-primary dark:bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors shadow-sm text-sm border border-transparent"
          >
            Cargar al POS <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};