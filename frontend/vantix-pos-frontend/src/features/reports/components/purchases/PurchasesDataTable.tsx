import { useState, useMemo } from 'react';
import { History, Building2, AlertCircle, FileText, Search, Filter, CreditCard } from 'lucide-react';
import type { DeudaProveedor, HistorialCompra } from '../../types/purchases.types';

interface Props {
  deudas: DeudaProveedor[];
  historial: HistorialCompra[];
}

export const PurchasesDataTable = ({ deudas, historial }: Props) => {
  const [activeTab, setActiveTab] = useState<'HISTORIAL' | 'DEUDAS'>('HISTORIAL');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('TODOS');
  const [metodoFilter, setMetodoFilter] = useState('TODOS');

  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;
  const formatDateTime = (isoString: string) => {
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(isoString));
  };

  const filteredHistorial = useMemo(() => {
    return historial.filter(compra => {
      const matchSearch = compra.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          compra.comprobante.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEstado = estadoFilter === 'TODOS' || compra.estado === estadoFilter;
      const matchMetodo = metodoFilter === 'TODOS' || compra.metodoPago === metodoFilter;
      return matchSearch && matchEstado && matchMetodo;
    });
  }, [historial, searchTerm, estadoFilter, metodoFilter]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col w-full overflow-hidden transition-colors">
      
      {/* NAVEGACIÓN DE PESTAÑAS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 pt-4 gap-2 transition-colors overflow-x-auto custom-scrollbar">
        <button 
          type="button"
          onClick={() => setActiveTab('HISTORIAL')}
          className={`px-4 py-2.5 text-sm font-black rounded-t-lg transition-all flex items-center whitespace-nowrap ${activeTab === 'HISTORIAL' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-800 shadow-[0_4px_0_0_white] dark:shadow-[0_4px_0_0_#0f172a]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <History className="w-4 h-4 mr-2" /> Historial de Compras
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('DEUDAS')}
          className={`px-4 py-2.5 text-sm font-black rounded-t-lg transition-all flex items-center whitespace-nowrap ${activeTab === 'DEUDAS' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border-t border-x border-slate-200 dark:border-slate-800 shadow-[0_4px_0_0_white] dark:shadow-[0_4px_0_0_#0f172a]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Building2 className="w-4 h-4 mr-2" /> Cuentas por Pagar (Deudas)
        </button>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 transition-colors">
        {/* VISTA 1: HISTORIAL */}
        {activeTab === 'HISTORIAL' && (
          <div className="flex flex-col animate-in fade-in duration-300">
            
            {/* BARRA DE FILTROS */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Buscar por comprobante o proveedor..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 text-slate-800 dark:text-slate-100 transition-colors"
                />
              </div>

              <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 transition-colors">
                <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2" />
                <select 
                  value={estadoFilter} 
                  onChange={(e) => setEstadoFilter(e.target.value)} 
                  className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer dark:bg-slate-950"
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="PAGADO">Pagado</option>
                  <option value="POR_PAGAR">Por Pagar</option>
                </select>
              </div>

              <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 transition-colors">
                <CreditCard className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2" />
                <select 
                  value={metodoFilter} 
                  onChange={(e) => setMetodoFilter(e.target.value)} 
                  className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer dark:bg-slate-950"
                >
                  <option value="TODOS">Todos los Métodos</option>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="YAPE">Yape/Plin</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="CREDITO">Crédito</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-auto max-h-[400px] border border-slate-100 dark:border-slate-800 rounded-xl custom-scrollbar transition-colors">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 shadow-sm z-10 border-b border-slate-200 dark:border-slate-800 transition-colors">
                  <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-black">
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Documento</th>
                    <th className="px-4 py-3">Proveedor</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
                  {filteredHistorial.map((compra, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDateTime(compra.fecha)}</td>
                      <td className="px-4 py-3 text-sm font-black text-slate-700 dark:text-slate-200 whitespace-nowrap"><span className="flex items-center"><FileText className="w-3 h-3 mr-1 text-slate-400 dark:text-slate-500"/> {compra.comprobante}</span></td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300">{compra.proveedor}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border border-transparent dark:border-current/10 ${compra.estado === 'PAGADO' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : compra.estado === 'ANULADO' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400'}`}>
                          {compra.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-black text-slate-800 dark:text-slate-100 whitespace-nowrap">{formatCurrency(compra.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredHistorial.length === 0 && (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-bold"><p>No se encontraron compras con los filtros actuales.</p></div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'DEUDAS' && (
          <div className="flex flex-col animate-in fade-in duration-300">
            <div className="overflow-auto max-h-[400px] border border-rose-50 dark:border-rose-950/40 rounded-xl custom-scrollbar transition-colors">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-rose-50 dark:bg-rose-950 shadow-sm border-b border-rose-100 dark:border-rose-900/40 transition-colors">
                  <tr className="text-xs uppercase tracking-wider text-rose-500 dark:text-rose-400 font-black">
                    <th className="px-4 py-3">RUC / Documento</th>
                    <th className="px-4 py-3">Razón Social</th>
                    <th className="px-4 py-3 text-right">Monto Adeudado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50 dark:divide-rose-900/30 bg-white dark:bg-slate-900 transition-colors">
                  {deudas.map((deuda, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap"><span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-transparent dark:border-slate-700">{deuda.documento}</span></td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200">{deuda.proveedorNombre}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap"><span className="flex items-center justify-end text-sm font-black text-rose-600 dark:text-rose-400"><AlertCircle className="w-4 h-4 mr-1" /> {formatCurrency(deuda.montoAdeudado)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {deudas.length === 0 && (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-bold"><p>¡No hay deudas pendientes con proveedores!</p></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};