import { Trash2, AlertCircle } from 'lucide-react';
import type { AjusteInventario } from '../types/kardex.types';
import type { Variant } from '../../variant/types/variant.types';

interface ItemAjusteExtendida extends AjusteInventario {
  variant: Variant;
  factorConversion: number;
  presentacionNombre: string;
}

interface AdjustmentTableProps {
  items: ItemAjusteExtendida[];
  onUpdateItem: (index: number, field: string, value: any) => void;
  onRemoveItem: (index: number) => void;
  formatName: (v: Variant) => string;
}

export const AdjustmentTable = ({ items, onUpdateItem, onRemoveItem, formatName }: AdjustmentTableProps) => {
  if (items.length === 0) return null;

  return (
    <div className="mt-2">
      {/* VISTA MÓVIL */}
      <div className="block md:hidden space-y-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl transition-colors">
        {items.map((item, index) => {
          const cantidadFisicaTotal = (item.cantidad || 0) * (item.factorConversion || 1);
          const esSalidaInvalida = item.tipoMovimiento === 'SALIDA' && cantidadFisicaTotal > item.variant.stockActual;

          return (
            <div key={`${item.varianteId}-${index}`} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm relative transition-colors">
              <button 
                onClick={() => onRemoveItem(index)} 
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 rounded-md"
                type="button"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="mb-2 pr-6">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{formatName(item.variant)}</p>
                <div className="flex flex-wrap gap-x-2 text-[10px] text-slate-400 mt-0.5">
                  <span>SKU: {item.variant.sku}</span>
                  <span className="font-bold text-amber-600">Stock: {item.variant.stockActual} u.</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <select 
                  value={item.tipoMovimiento} 
                  onChange={(e) => onUpdateItem(index, 'tipoMovimiento', e.target.value)}
                  className={`p-1.5 text-[11px] font-bold border rounded-md outline-none ${item.tipoMovimiento === 'ENTRADA' ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700' : 'border-red-200 bg-red-50 dark:bg-red-950/30 text-red-700'}`}
                >
                  <option value="ENTRADA">+ ENTRADA</option>
                  <option value="SALIDA">- SALIDA</option>
                </select>

                <select
                  value={item.factorConversion}
                  onChange={(e) => onUpdateItem(index, 'factorConversion', Number(e.target.value))}
                  className="p-1.5 text-[11px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 rounded-md outline-none font-medium"
                >
                  <option value={1}>Unidades (x1)</option>
                  {(item.variant.presentaciones || []).filter(p => p.estado !== false).map((pres, pIdx) => (
                    <option key={pres.id || pIdx} value={pres.factorConversion}>
                      {pres.nombre} (x{pres.factorConversion})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-2">
                <input 
                  type="number" min="1" required
                  value={item.cantidad || ''} 
                  onChange={(e) => onUpdateItem(index, 'cantidad', parseInt(e.target.value) || 0)}
                  className={`w-full p-1.5 text-xs font-black text-center border rounded-md outline-none ${esSalidaInvalida ? 'border-rose-500 bg-rose-50' : 'border-slate-300 dark:border-slate-700'}`}
                />
              </div>

              {esSalidaInvalida && (
                <div className="flex items-center gap-1 text-rose-600 text-[10px] font-bold mb-2">
                  <AlertCircle className="w-3 h-3 shrink-0" /> Excede stock ({cantidadFisicaTotal} u.)
                </div>
              )}

              <input 
                type="text" placeholder="Nota..."
                value={item.notas || ''} 
                onChange={(e) => onUpdateItem(index, 'notas', e.target.value)}
                className="w-full p-1.5 text-[11px] border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-950"
              />
            </div>
          );
        })}
      </div>

      {/* VISTA ESCRITORIO (ULTRA COMPACTA) */}
      <div className="hidden md:block border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden transition-colors">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2 px-3 text-[11px] font-bold text-slate-500 uppercase">Producto (SKU)</th>
              <th className="py-2 px-3 text-[11px] font-bold text-slate-500 uppercase w-28">Acción</th>
              <th className="py-2 px-3 text-[11px] font-bold text-slate-500 uppercase w-52">Empaque / Cantidad</th>
              <th className="py-2 px-3 text-[11px] font-bold text-slate-500 uppercase">Motivo / Nota</th>
              <th className="py-2 px-2 text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {items.map((item, index) => {
              const cantidadFisicaTotal = (item.cantidad || 0) * (item.factorConversion || 1);
              const esSalidaInvalida = item.tipoMovimiento === 'SALIDA' && cantidadFisicaTotal > item.variant.stockActual;

              return (
                <tr key={`${item.varianteId}-${index}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                  {/* Celda Producto */}
                  <td className="py-1.5 px-3">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[240px]" title={formatName(item.variant)}>
                      {formatName(item.variant)}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                      <span>SKU: {item.variant.sku}</span>
                      <span className="text-amber-600 dark:text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/30 px-1 rounded">
                        Stock: {item.variant.stockActual} u.
                      </span>
                      {item.factorConversion > 1 && (
                        <span className="text-slate-500 font-sans font-semibold">
                          (Total: {cantidadFisicaTotal} u.)
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Celda Acción */}
                  <td className="py-1.5 px-3">
                    <select 
                      value={item.tipoMovimiento}
                      onChange={(e) => onUpdateItem(index, 'tipoMovimiento', e.target.value)}
                      className={`w-full p-1.5 border rounded-md text-xs font-bold outline-none cursor-pointer h-8 transition-colors ${item.tipoMovimiento === 'ENTRADA' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 border-emerald-200' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 border-rose-200'}`}
                    >
                      <option value="ENTRADA">+ ENTRADA</option>
                      <option value="SALIDA">- SALIDA</option>
                    </select>
                  </td>
                  
                  {/* Celda Empaque / Cantidad (🚀 FUSIONADOS EN UNA SOLA LÍNEA HORIZONTAL) */}
                  <td className="py-1.5 px-3">
                    <div className="flex items-center gap-1.5 relative">
                      <select
                        value={item.factorConversion}
                        onChange={(e) => onUpdateItem(index, 'factorConversion', Number(e.target.value))}
                        className="w-28 p-1 text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300 h-8 outline-none cursor-pointer shrink-0"
                      >
                        <option value={1}>Unidades (x1)</option>
                        {(item.variant.presentaciones || []).filter(p => p.estado !== false).map((pres, pIdx) => (
                          <option key={pres.id || pIdx} value={pres.factorConversion}>
                            {pres.nombre} (x{pres.factorConversion})
                          </option>
                        ))}
                      </select>

                      <div className="flex-1 min-w-[50px]">
                        <input 
                          type="number" 
                          min="1" 
                          value={item.cantidad || ''} 
                          onChange={(e) => onUpdateItem(index, 'cantidad', parseInt(e.target.value) || 0)} 
                          onBlur={(e) => { if (!parseInt(e.target.value)) onUpdateItem(index, 'cantidad', 1); }}
                          className={`w-full p-1 border rounded-md text-xs font-black text-center h-8 outline-none bg-white dark:bg-slate-950 ${esSalidaInvalida ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white'}`} 
                        />
                      </div>

                      {esSalidaInvalida && (
                        <span className="absolute -bottom-3.5 right-0 text-[8.5px] font-bold text-rose-500 whitespace-nowrap bg-white dark:bg-slate-900 px-1 rounded shadow-sm z-10">
                          Excede stock
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Celda Nota */}
                  <td className="py-1.5 px-3">
                    <input 
                      type="text" 
                      placeholder="Observación rápida..." 
                      value={item.notas || ''} 
                      onChange={(e) => onUpdateItem(index, 'notas', e.target.value)} 
                      className="w-full p-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs h-8 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-white" 
                    />
                  </td>
                  
                  {/* Celda Quitar */}
                  <td className="py-1.5 px-2 text-center">
                    <button 
                      onClick={() => onRemoveItem(index)} 
                      className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                      type="button"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};