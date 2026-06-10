import { Trash2 } from 'lucide-react';
import type { AjusteInventario } from '../types/kardex.types';
import type { Variant } from '../../variant/types/variant.types';

interface AdjustmentTableProps {
  items: (AjusteInventario & { variant: Variant })[];
  onUpdateItem: (index: number, field: keyof AjusteInventario, value: any) => void;
  onRemoveItem: (index: number) => void;
  formatName: (v: Variant) => string;
}

export const AdjustmentTable = ({ items, onUpdateItem, onRemoveItem, formatName }: AdjustmentTableProps) => {
  if (items.length === 0) return null;

  return (
    <div className="mt-4">
      {/* VISTA MÓVIL */}
      <div className="block md:hidden space-y-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl transition-colors">
        {items.map((item, index) => (
          <div key={`${item.varianteId}-${index}`} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative transition-colors">
            <button 
              onClick={() => onRemoveItem(index)} 
              className="absolute top-3 right-3 p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="mb-4 pr-8">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{formatName(item.variant)}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">SKU: <span className="font-mono">{item.variant.sku}</span></p>
              <div className="inline-block mt-2 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded transition-colors">
                Stock actual: {item.variant.stockActual}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Acción</label>
                <select 
                  value={item.tipoMovimiento} 
                  onChange={(e) => onUpdateItem(index, 'tipoMovimiento', e.target.value)}
                  className={`w-full p-2 text-xs font-bold border rounded-lg outline-none transition-colors ${item.tipoMovimiento === 'ENTRADA' ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'}`}
                >
                  <option value="ENTRADA">+ ENTRADA</option>
                  <option value="SALIDA">- SALIDA</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Cantidad</label>
                <input 
                  type="number" min="1" required
                  value={item.cantidad || ''} 
                  onChange={(e) => onUpdateItem(index, 'cantidad', parseInt(e.target.value) || 1)}
                  className="w-full p-2 text-sm font-black text-center border border-slate-300 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <input 
                type="text" placeholder="Ej: Merma, Ajuste de fin de mes..."
                value={item.notas || ''} 
                onChange={(e) => onUpdateItem(index, 'notas', e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
        ))}
      </div>

      {/* VISTA ESCRITORIO */}
      <div className="hidden md:block border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
            <tr>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Producto (SKU)</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase w-32">Acción</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase w-24">Cant.</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Motivo / Nota</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center w-16">Quitar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
            {items.map((item, index) => (
              <tr key={`${item.varianteId}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight mb-0.5">{formatName(item.variant)}</p>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-1">SKU: {item.variant.sku}</p>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 inline-block px-1.5 py-0.5 rounded">Stock actual: {item.variant.stockActual}</p>
                </td>
                <td className="py-3 px-4">
                  <select 
                    value={item.tipoMovimiento}
                    onChange={(e) => onUpdateItem(index, 'tipoMovimiento', e.target.value)}
                    className={`w-full p-2.5 border rounded-lg text-sm font-bold outline-none cursor-pointer ${item.tipoMovimiento === 'ENTRADA' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}
                  >
                    <option value="ENTRADA">+ ENTRADA</option>
                    <option value="SALIDA">- SALIDA</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <input type="number" min="1" value={item.cantidad} onChange={(e) => onUpdateItem(index, 'cantidad', parseInt(e.target.value) || 1)} className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-center outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-white" />
                </td>
                <td className="py-3 px-4">
                  <input type="text" placeholder="..." value={item.notas || ''} onChange={(e) => onUpdateItem(index, 'notas', e.target.value)} className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-white" />
                </td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => onRemoveItem(index)} className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};