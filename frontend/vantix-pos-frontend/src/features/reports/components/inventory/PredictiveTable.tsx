import { PackageOpen, AlertTriangle, CheckCircle, Clock, ArrowDown } from 'lucide-react';
import type { InventarioPredictivo } from '../../types/inventory.types';

interface Props {
  data: InventarioPredictivo[];
  isLoading: boolean;
  diasAnalisis: number;
  onRowClick: (product: InventarioPredictivo) => void;
}

export const PredictiveTable = ({ data, isLoading, onRowClick }: Props) => {
  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

  const getAlertBadge = (alerta: string) => {
    if (alerta.includes('CRÍTICO')) return <span className="px-3 py-1 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-black text-xs rounded-full flex items-center w-max border border-transparent dark:border-rose-900/30"><AlertTriangle className="w-3 h-3 mr-1" /> Crítico</span>;
    if (alerta.includes('PRECAUCIÓN')) return <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-black text-xs rounded-full flex items-center w-max border border-transparent dark:border-amber-900/30"><Clock className="w-3 h-3 mr-1" /> Precaución</span>;
    if (alerta.includes('SANO')) return <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-black text-xs rounded-full flex items-center w-max border border-transparent dark:border-emerald-900/30"><CheckCircle className="w-3 h-3 mr-1" /> Sano</span>;
    return <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-xs rounded-full flex items-center w-max border border-transparent dark:border-slate-700"><PackageOpen className="w-3 h-3 mr-1" /> Estancado</span>;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-black transition-colors">
              <th className="px-6 py-4">Producto Formateado</th>
              <th className="px-4 py-4 text-right">Costo</th>
              <th className="px-4 py-4 text-right">Precio</th>
              <th className="px-4 py-4 text-right">Margen</th>
              <th className="px-6 py-4 text-center">Stock Físico</th>
              <th className="px-4 py-4 text-center">Ventas</th>
              <th className="px-4 py-4 text-center">Prom. Diario</th>
              <th className="px-4 py-4 text-center">Días de Vida</th>
              <th className="px-6 py-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
            {isLoading ? (
              <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-bold">Procesando catálogo...</td></tr>
            ) : data.length > 0 ? (
              data.map((item, idx) => (
                <tr key={idx} onClick={() => onRowClick(item)} className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{item.nombreFormateado}</p>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">SKU: {item.sku}</p>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-slate-500 dark:text-slate-400">{formatCurrency(item.costo)}</td>
                  <td className="px-4 py-4 text-right font-bold text-slate-700 dark:text-slate-200">{formatCurrency(item.precio)}</td>
                  <td className="px-4 py-4 text-right">
                    <span className={`px-2 py-1 rounded-md text-xs font-black border border-transparent ${
                      item.margenGanancia >= 30 
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 dark:border-emerald-900/20' 
                        : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 dark:border-amber-900/20'
                    }`}>
                      {item.margenGanancia}%
                    </span>
                  </td>
                  
                  {/* STOCK MÍNIMO FÍSICO */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className={`text-base font-black ${item.stockActual === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>{item.stockActual}</span>
                      {item.isBajoStockMinimo && (
                        <span className="text-[10px] font-black text-rose-500 dark:text-rose-400 flex items-center mt-1 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded border border-transparent dark:border-rose-900/20">
                          <ArrowDown className="w-3 h-3 mr-0.5"/> Mín ({item.stockMinimo})
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 text-center font-bold text-slate-600 dark:text-slate-400">{item.ventasUltimosDias}</td>
                  <td className="px-4 py-4 text-center font-bold text-slate-600 dark:text-slate-400">{item.promedioDiarioVentas}</td>
                  <td className="px-4 py-4 text-center">
                    {item.diasRestantesEstimados === 999 ? (
                      <span className="text-slate-400 dark:text-slate-500 font-black text-xl">∞</span>
                    ) : (
                      <span className={`text-base font-black ${item.diasRestantesEstimados <= 7 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {item.diasRestantesEstimados} <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">días</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">{getAlertBadge(item.estadoAlerta)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-bold">No hay resultados para estos filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};