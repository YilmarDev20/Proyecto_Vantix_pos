import { X, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { InventarioPredictivo } from '../../types/inventory.types';

interface Props {
  product: InventarioPredictivo;
  onClose: () => void;
}

export const PredictiveModal = ({ product, onClose }: Props) => {
  const generarDatosProyeccion = (item: InventarioPredictivo) => {
    const projection = [];
    let currentStock = item.stockActual;
    const maxDays = Math.min(item.diasRestantesEstimados === 999 ? 30 : item.diasRestantesEstimados + 5, 60);

    for (let i = 0; i <= maxDays; i++) {
      projection.push({
        dia: i === 0 ? 'Hoy' : `Día +${i}`,
        stockEsperado: Math.max(Math.round(currentStock), 0)
      });
      currentStock -= item.promedioDiarioVentas;
      if (currentStock <= 0 && i > item.diasRestantesEstimados) break;
    }
    return projection;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in duration-200 border border-transparent dark:border-slate-800 transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 transition-colors">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 transition-colors">{product.nombreFormateado}</h3>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Proyección de agotamiento de stock</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 transition-colors">
              <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Stock Actual</p>
              <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{product.stockActual}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ritmo de Venta</p>
              <p className="text-2xl font-black text-slate-700 dark:text-slate-200 transition-colors">{product.promedioDiarioVentas} <span className="text-sm font-bold text-slate-400 dark:text-slate-500">/día</span></p>
            </div>
            <div className={`p-4 rounded-xl border transition-colors ${product.estadoAlerta.includes('CRÍTICO') ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40' : product.estadoAlerta === 'ESTANCADO' ? 'bg-slate-100 dark:bg-slate-850 border-slate-200 dark:border-slate-700' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40'}`}>
              <p className={`text-xs font-bold uppercase transition-colors ${product.estadoAlerta.includes('CRÍTICO') ? 'text-rose-500 dark:text-rose-400' : product.estadoAlerta === 'ESTANCADO' ? 'text-slate-500 dark:text-slate-400' : 'text-emerald-500 dark:text-emerald-400'}`}>Agotamiento en</p>
              <p className={`text-2xl font-black transition-colors ${product.estadoAlerta.includes('CRÍTICO') ? 'text-rose-700 dark:text-rose-300' : product.estadoAlerta === 'ESTANCADO' ? 'text-slate-700 dark:text-slate-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                {product.diasRestantesEstimados === 999 ? 'Infinito' : `${product.diasRestantesEstimados} días`}
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            {product.estadoAlerta === 'ESTANCADO' ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-bold bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 transition-colors">
                <TrendingDown className="w-8 h-8 mb-2 opacity-50" />
                El producto no tiene movimiento. La línea es plana.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generarDatosProyeccion(product)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
                    }} 
                    formatter={(value: any) => [`${value} unidades`, 'Stock Proyectado']} 
                  />
                  <Line type="monotone" dataKey="stockEsperado" stroke={product.diasRestantesEstimados <= 7 ? '#e11d48' : '#4f46e5'} strokeWidth={4} dot={{ r: 4, fill: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};