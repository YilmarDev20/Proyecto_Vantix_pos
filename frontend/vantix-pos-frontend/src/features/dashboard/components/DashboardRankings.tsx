import { Package, Users } from 'lucide-react';
import type { DashboardResumen } from '../types/dashboard.types';

interface Props {
  data: DashboardResumen;
}

export const DashboardRankings = ({ data }: Props) => {
  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      
      {/* TOP PRODUCTOS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full transition-colors duration-200">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center">
            <Package className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" /> Top 5 Productos Hoy
          </h3>
        </div>
        <div className="p-4 flex-1">
          {data.topProductos.length > 0 ? (
            <ul className="space-y-2">
              {data.topProductos.map((prod, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-black text-xs shrink-0">#{idx + 1}</div>
                    <div className="truncate pr-2">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{prod.nombre}</p>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">SKU: {prod.sku}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(prod.montoTotal)}</p>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500">{prod.cantidadVendida} und.</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
             <div className="h-full min-h-[150px] flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-sm">Sin ventas hoy.</div>
          )}
        </div>
      </div>

      {/* TOP CLIENTES */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full transition-colors duration-200">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" /> Clientes VIP
          </h3>
        </div>
        <div className="p-4 flex-1">
          {data.topClientes.length > 0 ? (
            <ul className="space-y-2">
              {data.topClientes.map((cliente, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-black text-xs shrink-0">#{idx + 1}</div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate pr-2">{cliente.nombre}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(cliente.totalComprado)}</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Acumulado</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-full min-h-[150px] flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-sm">No hay clientes frecuentes aún.</div>
          )}
        </div>
      </div>

    </div>
  );
};