import { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, History, Search, Filter, CreditCard } from 'lucide-react';
import type { MovimientoDetalle } from '../../types/finances.types';

interface Props {
  movimientos: MovimientoDetalle[];
}

export const FinancesHistoryTable = ({ movimientos }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('TODOS');
  const [metodoFilter, setMetodoFilter] = useState('TODOS');

  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;
  
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-PE', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

  const filteredMovimientos = useMemo(() => {
    return movimientos.filter((mov) => {
      const matchSearch = mov.concepto.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipo = tipoFilter === 'TODOS' || mov.tipoMovimiento === tipoFilter;
      const matchMetodo = metodoFilter === 'TODOS' || mov.metodoPago === metodoFilter;
      return matchSearch && matchTipo && matchMetodo;
    });
  }, [movimientos, searchTerm, tipoFilter, metodoFilter]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden w-full transition-colors">
      
      {/* CABECERA Y FILTROS */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center">
            <History className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 transition-colors">Libro Mayor de Caja</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-lg w-fit transition-colors">
            {filteredMovimientos.length} registros mostrados
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por concepto o cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-blue-500 text-slate-800 dark:text-slate-100 transition-colors"
            />
          </div>

          {/* Filtro de Tipo */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 transition-colors">
            <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2" />
            <select 
              value={tipoFilter} 
              onChange={(e) => setTipoFilter(e.target.value)} 
              className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer dark:bg-slate-950"
            >
              <option value="TODOS">Todos los Movimientos</option>
              <option value="INGRESO">Solo Ingresos (+)</option>
              <option value="EGRESO">Solo Egresos (-)</option>
            </select>
          </div>

          {/* Filtro de Método */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 transition-colors">
            <CreditCard className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2" />
            <select 
              value={metodoFilter} 
              onChange={(e) => setMetodoFilter(e.target.value)} 
              className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer dark:bg-slate-950"
            >
              <option value="TODOS">Todos los Métodos</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="YAPE">Yape</option>
              <option value="PLIN">Plin</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="MIXTO">Mixto</option>
            </select>
          </div>
        </div>
      </div>

      {/* CUERPO DE LA TABLA */}
      <div className="flex-1 overflow-auto max-h-[500px] custom-scrollbar">
        {filteredMovimientos.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10 transition-colors">
              <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-black">
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Concepto del Movimiento</th>
                <th className="px-6 py-4 text-center">Método de Pago</th>
                <th className="px-6 py-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
              {filteredMovimientos.map((mov, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{formatDateTime(mov.fecha)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{mov.concepto}</p>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-transparent dark:border-slate-700">
                      {mov.metodoPago}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {mov.tipoMovimiento === 'INGRESO' ? (
                      <span className="flex items-center justify-end text-base font-black text-emerald-600 dark:text-emerald-400">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        + {formatCurrency(mov.monto)}
                      </span>
                    ) : (
                      <span className="flex items-center justify-end text-base font-black text-rose-600 dark:text-rose-400">
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                        - {formatCurrency(mov.monto)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="h-[250px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-bold p-6 text-center">
            <Filter className="w-8 h-8 mb-3 opacity-30" />
            <p>No se encontraron movimientos con los filtros aplicados.</p>
          </div>
        )}
      </div>
    </div>
  );
};