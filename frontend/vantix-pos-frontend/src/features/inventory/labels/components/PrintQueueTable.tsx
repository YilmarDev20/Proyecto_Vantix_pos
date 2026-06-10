import { Trash2, Zap } from 'lucide-react';
import type { Variant } from '../../variant/types/variant.types';

interface PrintItem extends Variant {
  cantidadImprimir: number;
}

interface Props {
  cola: PrintItem[];
  onActualizarCantidad: (id: number, cant: number) => void;
  onIgualarStock: (id: number, stock: number) => void;
  onEliminar: (id: number) => void;
}

export const PrintQueueTable = ({ cola, onActualizarCantidad, onIgualarStock, onEliminar }: Props) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <tr>
          <th className="p-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">Producto</th>
          <th className="p-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase text-center">Stock</th>
          <th className="p-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase text-center">Cant. Etiquetas</th>
          <th className="p-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase text-right">Precio</th>
          <th className="p-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase text-center">Acción</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
        {cola.map(item => (
          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="p-4">
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.productoNombre}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{item.sku}</p>
            </td>
            <td className="p-4 text-center">
              <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-black text-slate-600 dark:text-slate-400">{item.stockActual}</span>
            </td>
            <td className="p-4">
              <div className="flex justify-center items-center space-x-2">
                <input 
                  type="number" 
                  value={item.cantidadImprimir}
                  onChange={(e) => onActualizarCantidad(item.id, parseInt(e.target.value) || 1)}
                  className="w-16 p-2 text-center border-2 border-slate-200 dark:border-slate-700 rounded-lg font-black text-primary dark:text-blue-400 outline-none bg-white dark:bg-slate-950"
                />
                <button onClick={() => onIgualarStock(item.id, item.stockActual)} className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-lg transition-colors" title="Copiar stock">
                  <Zap className="w-4 h-4" />
                </button>
              </div>
            </td>
            <td className="p-4 text-right"><p className="font-black text-slate-700 dark:text-slate-300 text-sm italic">S/ {item.precioVenta.toFixed(2)}</p></td>
            <td className="p-4 text-center">
              <button onClick={() => onEliminar(item.id)} className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);